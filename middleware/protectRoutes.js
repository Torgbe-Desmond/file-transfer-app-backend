const Unauthorized = require("../Errors/Unauthorized");
const { isTokenBlacklisted } = require("../utils/blackList");
const jwt = require("jsonwebtoken");
const User = require("../domains/authentication/model");
const ErrorHandler = require("../Errors/ErrorHandler");
const Handler = new ErrorHandler();

const protectRoutes = async (req, res, next) => {
  try {
    const header = req.headers?.authorization || req.headers?.Authorization;
    // console.log("header", header);
    if (!header || !header.startsWith("Bearer ")) {
      throw new Unauthorized("Unauthorized", true);
    }

    const token = header.split(" ")[1];

    if (isTokenBlacklisted(token)) {
      throw new Unauthorized("Invalid or expired token", true);
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);

    if (!decoded._id) {
      throw new Unauthorized("Unauthorized", true);
    }

    const user = await User.findOne({ _id: decoded._id });
    if (!user) {
      throw new Unauthorized("Unauthorized", true);
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
