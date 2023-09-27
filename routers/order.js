const express = require('express')
const router = express.Router()
const { Order } = require('../models/order')
const { OrderItem } = require('../models/order-item')

router.get(`/`, async (req, res) => {
  const orderList = await Order.find().populate('orderItem user')
  if (!orderList) {
    res.status(500).json({ success: false })
  }
  res.send(orderList)
})

router.post(`/create`, async (req, res) => {
  // creating order item first
  const orderItems = Promise.all(req.body.orderItem.map(async (orderItem) => {
    let newOrderItem = new OrderItem({
      quantity: orderItem.quantity,
      product: orderItem.product,
    })
    newOrderItem = await newOrderItem.save()
    return newOrderItem._id
  }))
  const orderItemIds = await orderItems
  console.log(orderItemIds)
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
    totalPrice: req.body.totalPrice,
    user: req.body.user,
    dateOrdered: req.body.dateOrdered,
  })
  createdOrder = await newOrder.save()
  if (!createdOrder) {
    return res.status(404).send('Order cannot be created!')
  }
  return res.send(createdOrder)
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