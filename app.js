const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
const { Schema } = mongoose;

// Middlewares
app.use(express.json());
app.use(morgan('tiny'));

// Environment Variables
require('dotenv/config');
const api = process.env.API_URL;

// Schemas / Models / Collection
const productSchema = new Schema({
	name: {
    type: String,
    required: true
  },
	image: String,
	countInStock: {
    type: Number,
    required: true
  },
});


const Product = mongoose.model('Product', productSchema);

// APIs
app.get(`${api}/`, (req, res)=>{
  res.send('Hello API');
});

app.get(`${api}/products`, async (req, res)=>{
  const productList = await Product.find();
  if (!productList) {
    res.status(500).json({success:false});
  }
  res.send(productList);
});

app.post(`${api}/products`, (req, res)=>{
  const newProduct = new Product({
    name: req.body.name,
    image: req.body.image,
    countInStock: req.body.countInStock,
  })
  newProduct.save().then((createdProduct=>{
    res.status(201).json(createdProduct)
  })).catch((err=>{
    res.status(500).json({
      error: err,
      success: false,
    })
  }))
});

// Connection string
mongoose.connect(process.env.DB,{
  dbName: 'ecommerce'
})
.then(()=>{
  console.log('Database connection is ready...!');
})
.catch((err)=>{
  console.error('Error: ' + err);
})

// App starter config
app.listen(port, '0.0.0.0', ()=>{
  console.log(`Server started. Go to http://localhost:${port}${api}`);
});