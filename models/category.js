const mongoose = require('mongoose')
const { Schema } = mongoose

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
  },
  color: {
    type: String,
    default: '#fff',
  },
  image: {
    type: String,
    default: '',
  },
});

categorySchema.virtual('id').get(function () {
  return this._id.toHexString()
})
categorySchema.set('toJSON', {
  virtuals: true,
})


exports.Category = mongoose.model('Category', categorySchema)