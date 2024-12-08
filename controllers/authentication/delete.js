const { deleteDirectoryTree } = require('../../utils/directory/deleteDirectoryRecursive');
const getDirectoryTree = require('../../utils/directory/getDirectoryTree');
const { deleteFileFromStorage } = require('../../utils/FirebaseInteractions');
const { Directory, mongoose, asyncHandler, NotFound, StatusCodes } = require('./configurations');

 const deleteUser = asyncHandler(async (req, res) => {
  const user_id = req.user; 
  const parentDirectory = req.params.reference_Id; 

  const session = await mongoose.startSession();
  session.startTransaction();  

  try {

    const userExist = await User.findById(user_id);

    if(!userExist){
      throw new NotFound('User not found.')
    }

    const mainDirectories = await Directory.find({ parentDirectory });

    if (mainDirectories.length === 0) {
      throw new NotFound('No directories found for the user.');
    }

    let directoryIds = mainDirectories.map((dir)=>dir._id);
    
    let rootDirectoriesInParentDirectory = [];
    let deletedFiles = [];

    for (const directoryId of directoryIds) {
        console.info('Deletiong started..')
        const directoryExist = await Directory.findById(directoryId).session(session);

        if (!directoryExist) {
            throw new NotFound(`Directory with ID ${directoryId} not found.`);
        }

        const directoryTreeObject = await getDirectoryTree(directoryExist._id, session);

        if (directoryTreeObject) {

            const parentDir = directoryTreeObject.directoriesToDelete.shift();
            rootDirectoriesInParentDirectory.push(parentDir);

            const deletedResults = await deleteDirectoryTree(directoryTreeObject, session);
            deletedFiles.push(...deletedResults);
        }

        const { directoriesToDelete, filesToDelete } = directoryTreeObject;

        if (directoriesToDelete.length > 0) {
            directoryExist.subDirectories.pull(...directoriesToDelete);
        }
        if (filesToDelete.length > 0) {
            directoryExist.files.pull(...filesToDelete); 
        }

        await directoryExist.save({ session });
    }

    console.info('Done with schema deletion..')

    for (const { name, user_id } of deletedFiles) {
        await deleteFileFromStorage(user_id, name);
    }

    Directory.deleteMany({ _id: { $in: rootDirectoriesInParentDirectory } }, { session });

    await User.findByIdAndDelete(user_id);

    await session.commitTransaction();

    res.status(StatusCodes.OK).json({message:'Account was deleted succesfully'});

  } catch (error) {
    session.abortTransaction();
    throw error;  
  } finally {
    session.endSession();
  }
});


module.exports = deleteUser