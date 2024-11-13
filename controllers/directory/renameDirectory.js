const {
  expressAsyncHandler,
  Directory,
  BadRequest,
  NotFound,
  StatusCodes,
  mongoose,
} = require('./configurations');

module.exports.renameDirectory = expressAsyncHandler(async (req, res) => {
  const { _id, name } = req.body;

  if (!_id || !name) {
      throw new BadRequest('Directory ID and new name must be provided.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

      const directoryExist = await Directory.findById(_id).session(session);
      if (!directoryExist) {
          throw new NotFound('No such directory found.');
      }

      const nameExist = await Directory.findOne({ name }).session(session);
      if (nameExist && nameExist._id.toString() !== _id) {
          throw new BadRequest('Name already exists.');
      }

      const updatedDirectory = await Directory.findByIdAndUpdate(
          _id,
          { name },
          { new: true, session }
      );

      if (!updatedDirectory) {
           throw new BadRequest('Failed to update directory name.');
      }

      const { _id: updatedId, name: updatedName } = updatedDirectory;
      const newUpdatedDirectory = { _id: updatedId, name: updatedName };

      await session.commitTransaction();
      res.status(StatusCodes.OK).json(newUpdatedDirectory); 

  } catch (error) {
      await session.abortTransaction();
      throw error;
  } finally {
      session.endSession();
  }
});
