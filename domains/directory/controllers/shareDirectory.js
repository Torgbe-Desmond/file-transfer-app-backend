const expressAsyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const { default: mongoose } = require("mongoose");
const Directory = require("../model");
const generateRandomString = require("../../../utils/generateRandomString");
const File = require("../../file/model");
const SuccessResponse = require("../../../utils/successResponse");
const Handler = new ErrorHandler();

const shareDirectory = expressAsyncHandler(async (req, res) => {
  const { fileIds, name } = req.body;
  const user = req.user;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let duplicatedFiles = [];
    let rejectedFiles = [];

    for (const file of fileIds) {
      const fileExist = await File.findById(file);
      if (!fileExist) {
        rejectedFiles.push(file);
        continue;
      }
      duplicatedFiles.push(fileExist);
    }

    const userSharedFilesDirectory = await Directory.findOne({
      user_id: user,
      name: "SharedFiles",
    });

    const sharedFilesList = duplicatedFiles.map((file) => ({
      name: `${file.name}`,
      shared: true,
      user_id: user,
      url: file.url,
      mimetype: file.mimetype,
      directoryId: userSharedFilesDirectory._id,
      size: file.size,
    }));

    const createdDuplicatedFiles = await File.insertMany(sharedFilesList, {
      session,
    });

    const idsOfDuplicatedFiles = createdDuplicatedFiles.map((file) => file._id);

    const randomString = `${generateRandomString(8)}@sr`;

    const [sharedReference] = await Directory.create(
      [
        {
          name: name,
          user_id: user,
          parentDirectory: userSharedFilesDirectory._id,
          files: idsOfDuplicatedFiles,
          mimetype: "Shared",
          secreteCode: randomString,
        },
      ],
      { session }
    );

    userSharedFilesDirectory.subDirectories.push(sharedReference._id);

    await userSharedFilesDirectory.save({ session });

    await session.commitTransaction();

    const data = { secreteCode: randomString, rejectedFiles };

    const responsObject = new SuccessResponse(
      true,
      "Folder shared Succesfully",
      data
    );

    res.status(StatusCodes.OK).json(responsObject);
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

module.exports = { shareDirectory };





// app.get('/user/:id', (req, res, next) => {
//   console.log('ID:', req.params.id)
//   next()
// }, 




// (req, res, next) => {
//   res.send('User Info')
// })
