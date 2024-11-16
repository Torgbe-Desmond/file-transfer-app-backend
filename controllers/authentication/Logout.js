const { StatusCodes } = require('http-status-codes');
const { addToBlacklist } = require('./blackList');

const logout = async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {

        const token = JSON.parse(header.split(' ')[1]); 
        addToBlacklist(token)
      } 

    res.status(StatusCodes.OK).json({
      message: 'Logout successful',
    });

  } catch (error) {
    throw error;
  }
};

module.exports = logout;
