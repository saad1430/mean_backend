const express = require('express')
const router = express.Router()
const { User } = require('../models/user')
const bcrypt = require('bcryptjs')

router.get(`/`, async (req, res) => {
  const userList = await User.find().select('-passwordHash')
  if (!userList) {
    return res.status(500).json({ success: false })
  }
  return res.send(userList)
})

router.get(`/one/:id`, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash')
    if (!user) {
      return res.status(400).json({ success: false, message: 'No user found' })
    }
    return res.status(200).json({ success: true, user: user })
  } catch (err) {
    return res.json({ success: false, error: err })
  }
})

router.post(`/create`, async (req, res) => {
  try {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
    })
    createdUser = await newUser.save()
    if (!createdUser) {
      return res.status(404).send('User cannot be created!')
    }
    return res.send(createdUser)
  } catch (err) {
    return res.json({ success: false, error: err })
  }
})

router.put('/update/:id', async (req, res) => {
  const existingUser = await User.findById(req.params.id)
  let newPassword
  if (req.body.password) newPassword = bcrypt.hashSync(req.body.password, 10)
  else newPassword = existingUser.passwordHash
  const updateUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
    },
    { new: true }
  )
  if (!updateUser) {
    return res.status(404).send('User cannot be updated!')
  }
  return res.send(updateUser)
})

module.exports = router
