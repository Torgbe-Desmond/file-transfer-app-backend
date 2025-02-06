const jwt = require('jsonwebtoken');
require('dotenv').config()

const generatePasswordVerificationToken = (_id) => {
        const token = jwt.sign({ _id }, process.env.JWT_KEY, { expiresIn: '5m' });
        return token;
}

module.exports = generatePasswordVerificationToken
