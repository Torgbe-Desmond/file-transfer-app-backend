const { StatusCodes } = require("http-status-codes");

function test(req,res){
   res.status(StatusCodes.OK).json({message:'Hello from student rep'})
}

module.exports = test