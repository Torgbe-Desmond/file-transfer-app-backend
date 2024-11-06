const { StatusCodes } = require('http-status-codes')

const errorMiddleware = (err,req,res,next)=>{
  
       
        createCustomError = {
            message : err.message || 'INTERNAL SERVER ERROR',
            statusCode : err.statusCodes || StatusCodes.INTERNAL_SERVER_ERROR
        }
    
        if(err.name =='TokenExpiredError'){
            createCustomError.message = 'Your Session has expired'
        }
        
        if(err.name=="JsonWebTokenError"){
            createCustomError.message = 'Your token is invalid'
        }

        let errorDetails
        if (err.name === 'ValidationError') {
            const errors = err.errors;
             errorDetails = Object.keys(errors).map(key => ({
                field: key,
                message: errors[key].message,
                type: errors[key].kind 
          }));

          createCustomError.message = errorDetails[0].message
          createCustomError.statusCode = StatusCodes.BAD_REQUEST;    
    
        }

        res.status(createCustomError.statusCode).json({message:err.message})

}


module.exports = errorMiddleware;