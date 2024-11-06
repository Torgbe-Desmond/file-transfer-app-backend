const {
  expressAsyncHandler,
  Directory,
  StatusCodes,
  NotFound,
} = require('./configurations');
const directoryLayout = '../views/layouts/representative';


module.exports.getAllDirectories = expressAsyncHandler(async (req, res) => { 
  const parentDirectory = req.params.reference_Id; 
  try {
      // Use find() to get all directories under the specified parent
      const allDirectories = await Directory.find({ parentDirectory });

      // Check if any directories were found
      if (!allDirectories.length) {
        throw new NotFound('No directories found f  or this reference ID.')
      }


      // Map over the directories to create a formatted response
      const editedAllDirectories = allDirectories.map(({ _id, parentDirectory, name, mimetype, lastUpdated, subDirectories, files, privateDirectory }) => {
          let totalSize = (subDirectories.length + files.length) || 0; // Calculate total size based on subdirectories and files
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

      // Send the formatted directories in the response
      res.status(StatusCodes.OK).json(editedAllDirectories)
  } catch (error) { 
      // Handle any unexpected errors
      throw error
  }
});
