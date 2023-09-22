const mongoose = require('mongoose')
const { Schema } = mongoose

const categorySchema = new Schema({
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

exports.Category = mongoose.model('Category', categorySchema)