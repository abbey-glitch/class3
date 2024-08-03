const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Extract token from cookies
    const token = req.cookies.token;
    // If no token, return an unauthorized response
    if (!token) return res.status(401).json({ error: 'Access Denied' });
    // Verify the token
    jwt.verify(token, 'secretkey', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid Token' });
        req.user = user; // Add the user info to the request
        next(); // Proceed to the next middleware/route handler
    });
};

module.exports = authenticateToken;
