const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(morgan('tiny'));

// Environment Variables
require('dotenv/config');
const api = process.env.API_URL;

app.get(`${api}/`, (req, res)=>{
  res.send('Hello API');
});

app.get(`${api}/products`, (req, res)=>{
  const product = {
    id: 1,
    name: 'Poco x3 pro',
    image: 'http://abc.xyz/123',
  };
  res.send(product);
});

app.post(`${api}/products`, (req, res)=>{
  const newProduct = req.body;
  console.log(newProduct);
  res.send(newProduct);
});


mongoose.connect(process.env.DB)
.then(()=>{
  console.log('Database connection is ready...!');
})
.catch((err)=>{
  console.error('Error: ' + err);
})

app.listen(port, '0.0.0.0', ()=>{
  console.log(`Server started. Go to http://localhost:${port}${api}`);
});