const express = require('express')
const router = express.Router()
const { Product } = require('../models/product')
const { Category } = require('../models/category')
const mongoose = require('mongoose')
const multer = require('multer')

// allowed file types
const FILE_TYPES_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
}
// uploaded file naming system and destination
const imagePath = '/public/uploads/product/'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPES_MAP[file.mimetype]
    let uploadError = new Error('Invalid Image Type')
    if (isValid) {
      uploadError = null
    }
    cb(uploadError, `.${imagePath}`)
  },
  filename: function (req, file, cb) {
    const extension = FILE_TYPES_MAP[file.mimetype]
    const fileName = file.originalname
      .replace(/\s+/g, '-') // replacing spaces with hyphen (-)
      .split('.') // making filename to array by spliting every dot (.)
      .slice(0, -1) // removing the last part from array
      .join('-') // joining array back to string with hyphens (-)
    cb(null, `${fileName}-${Date.now()}.${extension}`)
  },
})
const upload = multer({ storage: storage })

// APIs
router.get(`/`, async (req, res) => {
  let filter = {}
  if (req.query.categories)
    filter = { category: req.query.categories.split(',') }
  const productList = await Product.find(filter).populate(
    'category',
    'name color'
  )
  if (!productList) {
    return res.status(500).json({ success: false })
  }
  return res.send(productList)
})

router.get(`/one/:id`, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res
        .status(404)
        .json({ success: false, message: 'Product ID is not valid' })
    const product = await Product.findById(req.params.id).populate(
      'category',
      'name color'
    )
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'No product found' })
    }
    return res.status(200).json({ success: true, product: product })
  } catch (err) {
    return res.json({ success: false, error: err })
  }
})

router.post(`/create`, upload.single('image'), async (req, res) => {
  const category = await Category.findById(req.body.category)
  const file = req.file
  if (!category)
    return res
      .status(400)
      .json({ success: false, message: 'Category could not be found!' })
  else if (!file)
    return res
      .status(400)
      .json({ success: false, message: 'No Image Selected!' })
  else {
    const fileName = req.file.filename
    // const basePath = `${req.protocol}://${req.get('host')}/public/uploads`
    const newProduct = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagePath + fileName,
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

router.put('/update/:id', upload.single('image'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)){
    return res
      .status(404)
      .json({ success: false, message: 'Product ID is not valid' })
  }
  const category = await Category.findById(req.body.category)
  if (!category) {
    return res.status(400).json({
      success: false,
      message: 'Category could not be found',
    })
  } else {
    const productImage = await Product.findById(req.params.id)
    const file = req.file
    let image
    if(file){
      image = `${imagePath}${file.filename}`
    }else{
      image = productImage.image
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: image,
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
    if (product)
      return res.status(200).json({ success: true, product: product })
    else
      return res
        .status(200)
        .json({ success: false, message: 'Product does not exist!' })
  }
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
  try {
    const productCount = await Product.countDocuments()
    if (!productCount) {
      return res.status(500).json({ success: false })
    }
    return res.status(200).json({ success: true, productCount: productCount })
  } catch (err) {
    return res.json({ success: false, error: err })
  }
})

router.get(`/featured/:count?`, async (req, res) => {
  try {
    const count = req.params.count ? req.params.count : 4
    const featuredProducts = await Product.find({ isFeatured: true })
      .populate('category')
      .limit(parseInt(count))
    if (!featuredProducts) {
      return res.status(500).json({ success: false })
    }
    return res.json({ success: true, featuredProducts: featuredProducts })
  } catch (err) {
    return res.json({ success: false, error: err })
  }
})

router.get(`/category/:category`, async (req, res) => {
  try {
    const filteredProducts = await Product.find({
      category: req.params.category,
    }).populate('category')
    if (!filteredProducts) {
      res.status(500).json({ success: false })
    }
    res.json({ success: true, filteredProducts: filteredProducts })
  } catch (err) {
    return res.json({ success: false, error: err })
  }
})

router.put(`/gallery/:id`, upload.array('images'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res
      .status(404)
      .json({ success: false, message: 'Product ID is not valid' })
  const files = req.files
  let imagesPath = []
  if (!files)
    return res
      .status(400)
      .json({ success: false, message: 'No Image Selected!' })
  else {
    files.map((file) => {
      console.log(file)
      imagesPath.push(`${imagePath}${file.filename}`)
    })
    const imageProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { images: imagesPath },
      { new: true }
    )
    if (!imageProduct) {
      return res
        .status(500)
        .json({ success: false, message: 'Product Image Updation failed' })
    }
    return res.status(200).json({
      success: true,
      imageProduct: imageProduct,
    })
  }
})

module.exports = router
