const expressAsyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const { default: mongoose } = require("mongoose");
const Directory = require("../../directory/model");
const File = require("../model");
const NotFound = require("../../../Errors/Notfound");
const { uploadFileToStorage } = require("../../../utils/FirebaseInteractions");
const BadRequest = require("../../../Errors/BadRequest");
const SuccessResponse = require("../../../utils/successResponse");
const Handler = new ErrorHandler();

const createFile = expressAsyncHandler(async (req, res) => {
  const { user: user_id } = req;
  const { directoryId: _id } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const directoryExist = await Directory.findById(_id);

    if (!directoryExist) {
      throw new NotFound(`Directory with ID ${_id} not found.`, true);
    }

    if (!req.files || req.files.length === 0) {
      throw new BadRequest("No files provided for upload.", true);
    }

    let filesToInsert = [];

    for (const file of req.files) {
      const fileUrl = await uploadFileToStorage(user_id, file);
      filesToInsert.push({
        name: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        directoryId: _id,
        user_id,
        url: fileUrl,
      });
    }

    if (filesToInsert.length === 0) {
      throw new BadRequest("No files were uploaded successfully.", true);
    }

    const data = await File.insertMany(filesToInsert, { session });
    const newFileIds = data.map((file) => file._id);

    directoryExist.files = directoryExist.files || [];
    directoryExist.files.push(...newFileIds);

    await directoryExist.save({ session });
    await session.commitTransaction();

    const responseObject = new SuccessResponse(
      true,
      "File(s) created successfully",
      data
    );

    res.status(StatusCodes.CREATED).json(responseObject);
  } catch (error) {
    await session.abortTransaction();
    if (!Handler.isTrustedError(error)) {
      Handler.handleError(error);
    }
    throw error;
  } finally {
    session.endSession();
  }
});

module.exports = createFile;
