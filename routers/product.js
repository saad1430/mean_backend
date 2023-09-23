const express = require('express')
const router = express.Router()
const { Product } = require('../models/product')
const { Category } = require('../models/category')
const mongoose = require('mongoose')

router.get(`/`, async (req, res) => {
  let filter = {}
  if(req.query.categories)
  filter = { category: req.query.categories.split(',') }  
  const productList = await Product.find(filter).populate('category')
  if (!productList) {
    res.status(500).json({ success: false })
  }
  res.send(productList)
})

router.get(`/one/:id`, async (req, res) => {
  try{
    if (!mongoose.isValidObjectId(req.params.id))
      return res
        .status(404)
        .json({ success: false, message: 'Product ID is not valid' })
    const product = await Product.findById(req.params.id).populate('category')
    if (!product) {
      res.status(404).json({ success: false, message:'No product found' })
    }
    res.status(200).json({ success: true, product:product })
  }catch(err){
    res.json({success:false,error:err})
  }
  
})

router.post(`/create`, async (req, res) => {
  const category = await Category.findById(req.body.category)
  if (!category)
    return res
      .status(400)
      .json({ success: false, message: 'Category could not be found!' })
  else {
    const newProduct = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    })
    newProduct.save()
    if (!newProduct) {
      return res
        .status(500)
        .json({ success: false, message: 'Product creation failed' })
    }
    return res.status(200).json({
      success: true,
      newProduct,
    })
  }
})

router.put('/update/:id', (req, res) => {
  Category.findById(req.body.category)
    .then((category) => {
      if (category) {
        Product.findByIdAndUpdate(
          req.params.id,
          {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
          },
          { new: true }
        )
          .then((product) => {
            if (product) return res.status(200).json({ success: true, product })
            else return res.status(200).json({ success: false, message: 'Product does not exist!' })
          })
          .catch((err) => {
            return res.status(400).json({
              success: false,
              error: err,
              message: 'Product cannot be found!',
            })
          })
      } else {
        return res
          .status(400)
          .json({ success: false, message: 'Category not found!' })
      }
    })
    .catch((err) => {
      return res
        .status(400)
        .json({ success: false, error: err, message: 'Category not found!' })
    })
})

router.delete('/delete/:id', (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: 'Product deleted Successfully' })
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'Product not found' })
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: true, error: err })
    })
})

// Additional APIs

router.get(`/count`, async (req, res) => {
  try{
    const productCount = await Product.countDocuments()
    if (!productCount) {
      res.status(500).json({ success: false })
    }
    res.status(200).json({success:true,productCount:productCount})
  }
  catch(err){
    return res.json({success:false, error:err})
  }
})

router.get(`/featured/:count?`, async (req, res) => {
  try{
    const count = req.params.count ? req.params.count : 4;
    const featuredProducts = await Product.find({isFeatured:true}).populate('category').limit(parseInt(count));
    if (!featuredProducts) {
      res.status(500).json({ success: false })
    }
    res.json({success:true,featuredProducts:featuredProducts})
  }
  catch(err){
    return res.json({success:false, error:err})
  }
})

// router.get(`/:category`, async (req, res) => {
//   try{
//     const filteredProducts = await Product.find({category:req.params.category}).populate('category');
//     if (!filteredProducts) {
//       res.status(500).json({ success: false })
//     }
//     res.json({success:true,filteredProducts:filteredProducts})
//   }
//   catch(err){
//     return res.json({success:false, error:err})
//   }
// })

module.exports = router
