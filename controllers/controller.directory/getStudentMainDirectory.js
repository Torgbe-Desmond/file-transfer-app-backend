const {
    expressAsyncHandler,
    Directory,
    StatusCodes,
  } = require('./configurations');
  
  module.exports.getStudentMainDirectory = expressAsyncHandler(async (req, res) => { 
    const parentDirectory = req.params.reference_Id; // Use req.params to get reference_Id
    console.log('parentDirectory inside get all directories', parentDirectory)
    try {
      const allDirectories = await Directory.find({ parentDirectory });
    
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
      console.error('Error retrieving directories:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error retrieving directories' });
    }
  });
  