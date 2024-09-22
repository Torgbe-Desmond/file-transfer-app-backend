const { User, mongoose, bcryptjs,asyncHandler,StatusCodes } = require("./auth.configurations");


module.exports.forgotPassword = asyncHandler(async (req,res)=>{
    const user_id = req.user
    const session = await mongoose.startSession();
    session.startTransaction()
    
    try {
      
      const _id = req.user;
  
      const {password} = req.body;
    
      const userExist = await User.findById(_id)
  
      if(!userExist) throw new BadRequest('No such user');
  
      const hashedPassword = await bcryptjs.hash(password, 10);
      
      await User.findBydIdAndUpdate(_id,{password:hashedPassword},{session})
  
      const updateInfo = {message:'Update was successful'}
  
      await session.commitTransaction();
  
      res.status(StatusCodes.OK).json(updateInfo)
  
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
  
    }
         
  });
  