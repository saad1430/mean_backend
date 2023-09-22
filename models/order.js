const mongoose = require('mongoose')
const { Schema } = mongoose

const orderSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: String,
  countInStock: {
    type: Number,
    required: true,
  },
})

exports.Order = mongoose.model('Order', orderSchema)