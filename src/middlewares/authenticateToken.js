const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if(err) return res.sendStatus(403);
        req.userId = payload.userId;
        next();
    });
}

module.exports = authenticateToken;