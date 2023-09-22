const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');

// Importing Router
const productsRouter = require('./routers/product');

// Environment Variables
require('dotenv/config');
const api = process.env.API_URL;
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(morgan('tiny'));

// APIs
app.use(`${api}/products`, productsRouter);


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
app.listen(port, process.env.WHITELISTED_IP , ()=>{
  console.log(`Server started. Go to http://localhost:${port}${api}`);
});