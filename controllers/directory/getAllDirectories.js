const {
    expressAsyncHandler,
    Directory,
    StatusCodes,
  } = require('./configurations');
  
  module.exports.getAllDirectories = expressAsyncHandler(async (req, res) => { 
    const parentDirectory = req.params.reference_Id; 
    try {
      const allDirectories = await Directory.findOne({ parentDirectory });
    
      const editedAllDirectories = allDirectories.map(({ _id, parentDirectory, name, mimetype, lastUpdated, subDirectories, files,  privateDirectory,
      }) => {
        let totalSize = (subDirectories.length + files.length) || 0;
        return {
          _id,
          parentDirectory,
          privateDirectory,
          name,
          mimetype,
          size: totalSize,
          lastUpdated, 
          subDirectories,
          files
        };
      });
  
      res.status(StatusCodes.OK).json(editedAllDirectories);
    } catch (error) { 
      throw error;
    }
  });
  