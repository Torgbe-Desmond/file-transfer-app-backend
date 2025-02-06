function SuccessResponse(status, message = null, data = null) {
  this.status = status;
  this.message = message;
  this.data = data;
}

module.exports = SuccessResponse;
  