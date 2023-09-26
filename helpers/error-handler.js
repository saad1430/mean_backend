function errorHandler(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    // JsonWebToken invalid/not found (User is not logged in)
    return res
      .status(401)
      .json({ success: false, error: err, message: 'User is not Authorized' })
  } else if (err.name === 'ValidationError') {
    // Uploading data that is not allowed
    return res
      .status(401)
      .json({ success: false, error: err, message: 'Validation Error' })
  } 
  else if(err){
    // General Error
    return res
      .status(500)
      .json({ success: false, error: err.message , message: 'Internal Server Error' })
  }
}

module.exports = errorHandler
