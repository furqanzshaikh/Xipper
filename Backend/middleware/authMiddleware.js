const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // Check if the Authorization header exists and starts with 'Bearer'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'No token provided or incorrect format' });
    }

    // Extract the token part from the 'Bearer' string
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized access' });
        
        // Attach decoded user information to the request object
        req.user = decoded;  
        next();
    });
};

module.exports = {
    verifyToken
};
