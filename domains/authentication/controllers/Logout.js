const { StatusCodes } = require("http-status-codes");
const { addToBlacklist } = require("../../../utils/blackList");
const SuccessResponse = require("../../../utils/SuccessResponse");

const logout = async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      const token = header.split(" ")[1];
      addToBlacklist(token);
    }

    const responsObject = new SuccessResponse(
      true,
      "Logout was succesfully",
      null
    );
    res.status(StatusCodes.OK).json(responsObject);
  } catch (error) {
    throw error;
  }
};

module.exports = logout;
