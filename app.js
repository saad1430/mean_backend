const express = require('express')
const app = express()
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')

// Should be on top otherwise API will not respond to frontend
app.use(cors())
app.options('*', cors())

// Environment Variables
require('dotenv/config')
const api = process.env.API_URL
const port = process.env.PORT || 3000

// Middlewares
app.use(express.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use(errorHandler)

// Importing Router
const categoryRouter = require('./routers/category')
const orderRouter = require('./routers/order')
const productRouter = require('./routers/product')
const userRouter = require('./routers/user')

// APIs
app.use(`${api}/category`, categoryRouter)
app.use(`${api}/order`, orderRouter)
app.use(`${api}/product`, productRouter)
app.use(`${api}/user`, userRouter)

// Connection string
mongoose
  .connect(process.env.DB, {
    dbName: 'ecommerce',
  })
  .then(() => {
    console.log('Database connection is ready...!')
  })
  .catch((err) => {
    console.error('Error: ' + err)
  })

// App starter config
app.listen(port, process.env.WHITELISTED_IP, () => {
  console.log(`Server started. Go to http://localhost:${port}${api}`)
})
