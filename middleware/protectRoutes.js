const jwt = require('jsonwebtoken');
const { Unauthorized } = require('../Errors/index');
const User = require('../models/user');
const { isTokenBlacklisted } = require('../controllers/authentication/blackList');

const protectRoutes = async (req, res, next) => {
    try {
        const header = req.headers?.authorization || req.headers?.Authorization;
        if (!header || !header.startsWith('Bearer ')) {
            throw new Unauthorized('Unauthorized');
        }

        const token = JSON.parse(header.split(' ')[1]);
        
        if (isTokenBlacklisted(token)) {
            throw new Unauthorized('Invalid or expired token');
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);

        if (!decoded._id) {
            throw new Unauthorized('Unauthorized');
        }

        const user = await User.findOne({ _id: decoded._id });
        if (!user) {
            throw new Unauthorized('Unauthorized');
        }

        req.user = user._id;
        next();
    } catch (error) {
        next(new Unauthorized('Unauthorized'));
    }
};

module.exports = protectRoutes;
