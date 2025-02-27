const AppError  = require("./custom-error-handler");
const sendMailToAdminIfCritical = require("../utils/sendMailToAdminIfCritical");

class ErrorHandler {
  async handleError(err) {
    // await sendMailToAdminIfCritical(err);
     console.log(err)
  }

  isTrustedError(error) {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }
}

module.exports =  ErrorHandler;
