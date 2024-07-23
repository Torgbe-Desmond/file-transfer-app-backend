const { User, bcryptjs, NotFound, generateAuthToken,asyncHandler,StatusCodes } = require("./auth.configurations");


module.exports.loginUser = asyncHandler(async (req, res) => {

    try {
        const { email, password} = req.body;

        console.log(email,password)
  
        const userExist = await User.findOne({email})
  
        if(!userExist) throw new NotFound('Invalid credentials');
        
        const validPassword = bcryptjs.compare(password, userExist.password)
  
        if(!validPassword) throw new NotFound('Invalid credentials')
  
        const token = generateAuthToken(userExist._id);
  
        res.status(StatusCodes.OK).json({
          token,
          reference_Id:userExist.reference_Id,
          role:userExist.role
        })
        
    } catch (error) {
      throw error;
    }
  });