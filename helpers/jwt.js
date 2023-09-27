var { expressjwt: jwt } = require('express-jwt')

function authJwt() {
  console.log('authJwt middleware called')
  const secret = process.env.SECRET
  const api = process.env.API_URL
  return jwt({
    secret,
    algorithms: ['HS256'],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/api\/v1\/product(.*)/, methods: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/category(.*)/, methods: ['GET', 'OPTIONS'] },
      `${api}/user/login`,
      `${api}/user/register`,
    ],
  })
}

async function isRevoked(req, token) {
  console.log(token)
  if (token.payload.isAdmin == false) {
    console.log('Not Admin')
    return true
  }
  else if (token.payload.isAdmin == true) {
    console.log('Admin')
    return false
  }
}

module.exports = authJwt
