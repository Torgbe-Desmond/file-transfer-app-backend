function ErrorResponse(error) {
  this.name = error?.name;
  this.sucess = false
  this.error = {
    code: error.statusCodes || externalLibrariesErrorObject[error.name] || 500,
    message: error.message || 'INTERNAL SERVER ERROR',
  };
}

const externalLibrariesErrorObject = {
  JsonWebTokenError: 401,
  TokenExpiredError: 401,
  ValidationError: 500,
};

module.exports = ErrorResponse;
