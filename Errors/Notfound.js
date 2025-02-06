const custom_error_handler = require("./custom-error-handler");
const { StatusCodes } = require("http-status-codes");

class NotFound extends custom_error_handler {
  constructor(message,isOperational) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = 'NotFound'
    this.messaeg = message;
    this.statusCodes = StatusCodes.NOT_FOUND;
    this.isOperational = isOperational

    Error.captureStackTrace(this)

  }
}

module.exports = NotFound;
