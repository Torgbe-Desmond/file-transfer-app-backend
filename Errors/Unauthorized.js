const custom_error_handler = require("./custom-error-handler");
const { StatusCodes } = require("http-status-codes");

class Unauthorized extends custom_error_handler {
  constructor(message,isOperational) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = 'Unauthorized'
    this.messaeg = message;
    this.statusCodes = StatusCodes.UNAUTHORIZED;
    this.isOperational = isOperational


    Error.captureStackTrace(this)

  }
}

module.exports = Unauthorized;
