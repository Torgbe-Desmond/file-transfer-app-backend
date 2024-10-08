const {
  expressAsyncHandler,
  Directory,
  StatusCodes,
  NotFound,
} = require('./configurations');

module.exports.getStudentMainDirectory = expressAsyncHandler(async (req, res) => {
  const parentDirectory = req.params.reference_Id;

  try {
      // Fetch all directories under the specified parent directory
      const allDirectories = await Directory.find({ parentDirectory });

      // If no directories are found, return an appropriate message
      if (allDirectories.length === 0) {
        throw new NotFound('No directories found under this parent directory.');
      }

      // Format the directories and files information
      const editedAllDirectories = allDirectories.map(({ _id, parentDirectory, name, mimetype, lastUpdated, subDirectories, files, privateDirectory }) => {
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

      // Respond with the formatted directories
      res.status(StatusCodes.OK).json(editedAllDirectories);
  } catch (error) {
     // Handle unexpected errors
    throw error;
  }
});
