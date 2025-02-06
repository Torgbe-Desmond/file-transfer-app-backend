class custom_error_handler extends Error {
  constructor(message) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.message = message;

    Error.captureStackTrace(this)
  }
}

module.exports = custom_error_handler;
