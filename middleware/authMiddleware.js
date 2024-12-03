const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateJWT = async (req, res, next) => {
  try {
    // Get the JWT from cookies
    const cookie = req.cookies['jwt'];
    
    // If no token is provided, deny access
    if (!cookie) {
      return res.status(401).json({ message: 'No token provided, access denied' });
    }

    // Verify the token using the secret key stored in .env
    const decoded = jwt.verify(cookie, process.env.SIKRIT);
    
    // Attach the decoded user information (e.g., user id) to the request
    req.user = decoded;

    // Now proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle token verification errors
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token or token expired' });
  }
};

module.exports = authenticateJWT;
