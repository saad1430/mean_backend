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
  const api = process.env.API_URL
  const requestedRoute = req.originalUrl
  const allowedRoutes = [{ url: /\/api\/v1\/order\/public(.*)/ }]
  console.log(token)
  if (token.payload.isAdmin == false) {
    console.log('Not Admin')
    // Check if the requested route matches any of the allowed routes
    const isAllowed = allowedRoutes.some((route) =>
      route.url.test(requestedRoute)
    )
    if (isAllowed) {
      console.log('Allowed Route')
      return false // User is not revoked for allowed routes
    } else {
      console.log('Revoked for this route')
      return true // User is revoked for routes not in the allowed list
    }
  } else if (token.payload.isAdmin == true) {
    console.log('Admin')
    return false
  }
}

module.exports = authJwt
