const mongoose = require('mongoose')
const { Schema } = mongoose

const productSchema = new Schema({
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

exports.Product = mongoose.model('Product', productSchema)
