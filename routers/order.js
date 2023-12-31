const express = require('express')
const router = express.Router()
const { Order } = require('../models/order')
const { OrderItem } = require('../models/order-item')

router.get(`/public/userorder/:userid`, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: 'orderItem',
      populate: { path: 'product', populate: 'category' },
    })
    .sort({ dateOrdered: -1 })
  if (!userOrderList) {
    res.status(500).json({ success: false, message: 'No orders found' })
  }
  res.send(userOrderList)
})

router.get(`/public/one/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate({
      path: 'orderItem',
      populate: { path: 'product', populate: 'category' },
    })
    .populate('user', 'name')
    .sort({ dateOrdered: -1 })
  if (!order) {
    res.status(500).json({ success: false, message: 'No orders found' })
  }
  res.send(order)
})

router.post(`/public/create`, async (req, res) => {
  // creating order item first
  const orderItems = Promise.all(
    req.body.orderItem.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      })
      newOrderItem = await newOrderItem.save()
      return newOrderItem._id
    })
  )
  const orderItemIds = await orderItems
  // calculating total price from database
  const totalPrices = await Promise.all(
    orderItemIds.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        'product',
        'price'
      )
      const totalPrice = orderItem.product.price * orderItem.quantity
      return totalPrice
    })
  )
  const totalPrice = await totalPrices.reduce((a, b) => a + b, 0)
  // now creating order
  const newOrder = new Order({
    orderItem: orderItemIds,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
    dateOrdered: req.body.dateOrdered,
  })
  createdOrder = await newOrder.save()
  if (!createdOrder) {
    return res.status(404).send('Order cannot be created!')
  }
  return res.send(createdOrder)
})

router.put('/private/update/:id', async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  )
  if (order) {
    return res.status(200).json({ success: true, data: order })
  } else {
    return res
      .status(400)
      .json({
        success: false,
        message: 'An error occured while updating status',
      })
  }
})

router.delete('/public/cancel/:id', async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Cancelled',
    },
    { new: true }
  )
  if (order) {
    return res.status(200).json({ success: true, data: order })
  } else {
    return res.status(400).json({
      success: false,
      message: 'An error occured while updating status',
    })
  }
})

router.delete('/public/delete/:id', async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (order) {
    await order.orderItem.map(async (orderItem) => {
      await OrderItem.findByIdAndRemove(orderItem)
    })
    await Order.deleteOne(order._id)
    return res
      .status(200)
      .json({ success: true, message: 'Order has been deleted successfully' })
  } else {
    return res.status(400).json({
      success: false,
      message: 'An error occured while updating status',
    })
  }
})

// other routes for admins

router.get('/private/totalsales', async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } },
  ])
  if (!totalSales) {
    return res
      .status(400)
      .json({ success: false, message: 'The order sales cannot be generated' })
  } else {
    return res
      .status(200)
      .json({ success: true, totalsales: totalSales.pop().totalsales })
  }
})

router.get('/private/count', async (req, res) => {
  const orderCount = await Order.countDocuments()
  if (!orderCount) {
    return res.status(500).json({ success: false })
  } else {
    return res.status(200).json({ success: true, orderCount: orderCount })
  }
})

router.get(`/private/all`, async (req, res) => {
  const orderList = await Order.find()
    .populate({
      path: 'orderItem',
      populate: { path: 'product', populate: 'category' },
    })
    .populate('user', 'name')
    .sort({ dateOrdered: -1 })
  if (!orderList) {
    res.status(500).json({ success: false, message: 'No orders found' })
  }
  res.send(orderList)
})

module.exports = router

// {
//     "orderItem" : [
//         {
//             "quantity": 1,
//             "product": "650e84ec5cd8e8ca37555b96"
//         },
//         {
//             "quantity": 5,
//             "product": "650eb9823f94b321a5402e7b"
//         }
//     ],
//     "shippingAddress1" : "gulberg",
//     "city" : "grw",
//     "zip" : 52250,
//     "country" : "pakistan",
//     "phone" : "123456789",
//     "totalPrice" : 120,
//     "user": "65112b5340c9aa2170deb31b"
// }
