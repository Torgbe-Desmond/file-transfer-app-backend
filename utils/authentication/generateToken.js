const jwt = require('jsonwebtoken');
require('dotenv').config()

const generateToken = (_id) => {
        const token = jwt.sign({ _id }, process.env.JWT_KEY, { expiresIn: '1h' });
        return token;
}



module.exports = generateToken
