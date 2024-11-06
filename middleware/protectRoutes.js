const jwt = require('jsonwebtoken');
const { Unauthorized } = require('../Errors/index');
const User = require('../models/user')

const protectRoutes = async (req, res, next) => {

    try {

        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')){
            console.log(1)
            throw new Unauthorized('Unauthorized');
        }

        const token = JSON.parse(header.split(' ')[1]);
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        if (!decoded._id){
            throw new Unauthorized('Unauthorized');
        }

        const user = await User.findOne({_id:decoded._id})
          
        if (!user){
            console.log(3)
            throw new Unauthorized('Unauthorized');
        }

        const _id = user._id
        req.user = _id

        next();
    }
     
    catch (error){
        throw new Unauthorized('Unauthorized');
    }
};

module.exports = protectRoutes;
