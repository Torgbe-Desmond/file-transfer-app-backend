const Unauthorized = require("../Errors/Unauthorized");
const { isTokenBlacklisted } = require("../utils/blackList");
const jwt = require('jsonwebtoken');
const User = require('../domains/authentication/model');
const ErrorHandler = require('../Errors/ErrorHandler');
const Handler = new ErrorHandler();

const protectRoutes = async (req, res, next) => {
  try {
    const header = req.headers?.authorization || req.headers?.Authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new Unauthorized("Unauthorized");
    }

    // Remove JSON.parse() since the token is not JSON-encoded
    const token = header.split(" ")[1];

    if (isTokenBlacklisted(token)) {
      throw new Unauthorized("Invalid or expired token");
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);

    if (!decoded._id) {
      throw new Unauthorized("Unauthorized");
    }

    const user = await User.findOne({ _id: decoded._id });
    if (!user) {
      throw new Unauthorized("Unauthorized");
    }

    req.user = user._id;
    next();
  } catch (error) {
    if (!Handler.isTrustedError(error)) {
      Handler.handleError(error);
    }
    throw error;
  }
};

module.exports = protectRoutes;
