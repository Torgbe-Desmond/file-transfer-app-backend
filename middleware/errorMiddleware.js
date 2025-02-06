const ErrorResponse = require("../utils/ErrorResponse");
const errorMiddleware = (err, req, res, next) => {
  // {
  //     "success": false,
  //     "message": "File upload failed.",
  //     "error": {
  //       "code": "UPLOAD_ERROR",
  //       "details": "The file size exceeds the allowed limit."
  //     }
  //   }

  console.log(err)
  const errorObject = new ErrorResponse(err);
  console.log('errorObject',errorObject)
  res.status(errorObject.error.code).json(errorObject);
};

module.exports = errorMiddleware;
