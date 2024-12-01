const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

function authenticateToken(req, res, next) {
    
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'No token provided. Access denied.' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

       
        req.user = decoded; 
        next();  
    });
}


module.exports = authenticateToken;