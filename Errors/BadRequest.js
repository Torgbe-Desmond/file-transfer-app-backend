const custom_error_handler = require("./custom-error-handler");
const { StatusCodes } = require("http-status-codes");

class BadRequest extends custom_error_handler {
  constructor(message, isOperational = false) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = 'BadRequest'
    this.messaeg = message;
    this.statusCodes = StatusCodes.BAD_REQUEST;
    this.isOperational = isOperational

    Error.captureStackTrace(this)

  }
}

module.exports = BadRequest;
