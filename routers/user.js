const express = require('express')
const router = express.Router()
const { User } = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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
    return res.send('User created')
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

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    const secret = process.env.SECRET
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User with this email does not exist' })
    } else {
      if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign({
          userId: user.id,
          isAdmin: user.isAdmin
        }, secret,
        { expiresIn: '1d' }
        )
        return res
          .status(200)
          .json({ success: true, email: user.email, token:token })
      } else {
        return res
          .status(400)
          .json({ success: false, message: 'Incorrect Password!' })
      }
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err })
  }
})

router.post(`/register`, async (req, res) => {
  try {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
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

router.delete('/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
  if(user){
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)){
      const deletedUser = await User.findByIdAndRemove(req.params.id)
      return res.status(200).json({ success:true, deletedUser, message: 'User has been deleted successfully' })
    }
    else{
      return res.status(400).json({ success: false, message: 'Incorrect Password' })
    }
  }
  else{
    return res.status(404).json({ sucess:false, message: 'User not found' })
  }
})

// Additional APIs

router.get(`/count`, async (req, res) => {
  try{
    const userCount = await User.countDocuments()
    if (!userCount) {
      return res.status(500).json({ success: false })
    }
    return res.status(200).json({ success: true, userCount: userCount })
  }
  catch(err){
    return res.json({success:false, error:err})
  }
})

module.exports = router
