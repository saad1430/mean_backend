const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    index:true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
  },
  street: {
    type: String,
    default: '',
  },
  apartment: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  zip: {
    type: Number,
    default: '',
  },
  country: {
    type: String,
    default: '',
  },
})

userSchema.virtual('id').get(function () {
  return this._id.toHexString()
})
userSchema.set('toJSON', {
  virtuals: true,
})

exports.User = mongoose.model('User', userSchema)
// exports.userSchema = userSchema
