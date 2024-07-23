const jwt = require('jsonwebtoken');
const { Unauthorized } = require('../Errors/index');
const Student = require('../models/student.model.js')

module.exports.studentProtectRoutes = async (req, res, next) => {

    try {

        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer')){
            throw new Unauthorized('Unauthorized');
        }

        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        if (!decoded){
            throw new Unauthorized('Unauthorized');
        }

        // const [user] = await db('user').select('_id').where('_id', decoded._id);
        const student = await Student.findOne({_id:decoded._id})
          
        if (!student){
            throw new Unauthorized('Unauthorized');
        }

        const _id = student._id
        req.user = _id

        next();
    }
     
    catch (error){
        next(error); 
    }
};

