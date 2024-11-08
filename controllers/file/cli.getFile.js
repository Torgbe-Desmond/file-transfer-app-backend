const User = require('../../models/user');
const File = require('../../models/files');
const { StatusCodes } = require('http-status-codes');
const { NotFound } = require('./configurations');

const getFile = async (req, res) => {
  const { fileId } = req.params;
  console.log('fileId:', fileId);

  try {
    const fileExist = await File.findById(fileId);

    if (!fileExist) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'File not found.' });
    }
    
    const responseObject = {
      name: fileExist.name,
      mimetype: fileExist.mimetype,
      value:fileExist._id
    };

    const responseArray = [responseObject];

    res.status(StatusCodes.OK).json(responseArray);

  } catch (error) {
    throw error;
  }
};

module.exports = getFile;
