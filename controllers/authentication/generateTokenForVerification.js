const { 
    User, 
    NotFound, 
    asyncHandler, 
    StatusCodes 
  } = require("./configurations");
  const jwt = require('jsonwebtoken'); 
  
  module.exports.generateTokenForVerification = asyncHandler(async (req, res) => {
    const { reference_Id } = req.params;
    
    if (!reference_Id) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Reference ID is required" });
    }
  
    const userExist = await User.findOne({ reference_Id });
  
    if (!userExist) {
      throw new NotFound('User does not exist.');
    }
  
    const token = jwt.sign(
      { _id: userExist._id }, 
      process.env.JWT_KEY, 
      { expiresIn: '10m' }
    );
  
    res.status(StatusCodes.OK).json({
      token
    });
  });
  