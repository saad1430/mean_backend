const express = require('express')
const router = express.Router()
const { Category } = require('../models/category')

router.get(`/`, async (req, res) => {
  const categoryList = await Category.find()
  if (!categoryList) {
    res.status(500).json({ success: false })
  }
  res.status(200).send(categoryList)
})

router.get(`/:id`, (req, res) => {
  Category.findById(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .send(category);
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'Category not found' })
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: true, error: err })
    })
})

router.post(`/`, async (req, res) => {
  const newCategory = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
    image: req.body.image,
  })
  createdCategory = await newCategory.save()
  if (!createdCategory) {
    return res.status(404).send('Category cannot be created!')
  }
  res.send(createdCategory)
})

router.put('/:id', async (req,res)=>{
  const updateCategory = await Category.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
    image: req.body.image,
  },
  { new:true }
  );
  if (!updateCategory) {
    return res.status(404).send('Category cannot be updated!');
  }
  res.send(updateCategory);
});

router.delete('/:id', (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: 'Category deleted Successfully' })
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'Category not found' })
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: true, error: err })
    })
})

module.exports = router
