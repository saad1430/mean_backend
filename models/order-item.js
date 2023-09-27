const mongoose = require('mongoose')
const { Schema } = mongoose

const orderItemSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
})

exports.OrderItem = mongoose.model('OrderItem', orderItemSchema)