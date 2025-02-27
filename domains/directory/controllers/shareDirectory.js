const expressAsyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const { default: mongoose } = require("mongoose");
const Directory = require("../model");
const generateRandomString = require("../../../utils/generateRandomString");
const File = require("../../file/model");
const SuccessResponse = require("../../../utils/successResponse");
const CreateFileObject = require("../../../utils/createFileObject");
const CreateDirectoryObject = require("../../../utils/createDirectoryObject");
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

    const sharedFilesList = duplicatedFiles.map(
      (file) =>
        new CreateFileObject(
          file, // file object
          user, //  user id
          null, // fileUrl
          userSharedFilesDirectory._id, // directory id
          null, // file size
          true // shared status
        )
    );

    const createdDuplicatedFiles = await File.insertMany(sharedFilesList, {
      session,
    });

    const idsOfDuplicatedFiles = createdDuplicatedFiles.map((file) => file._id);

    const newDirectory = new CreateDirectoryObject(
      name,
      user,
      userSharedFilesDirectory._id,
      idsOfDuplicatedFiles,
      "shared"
    );

    const [sharedReference] = await Directory.create([newDirectory], {
      session,
    });

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

module.exports =  shareDirectory ;

// app.get('/user/:id', (req, res, next) => {
//   console.log('ID:', req.params.id)
//   next()
// },

// (req, res, next) => {
//   res.send('User Info')
// })
