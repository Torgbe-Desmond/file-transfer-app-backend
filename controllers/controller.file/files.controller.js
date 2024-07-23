const expressAsyncHandler = require("express-async-handler");
const multer = require('multer');
const Directory = require('../../models/directory.model');
const File = require('../../models/files.model');
const { StatusCodes } = require("http-status-codes");
const mongoose = require('mongoose');
const payDesmondUtils = require('../../utils/index');
const { uploadFileToGroup, uploadFileToStorage } = require("../../utils/FirebaseInteractions");
const { NotFound } = require("../../Errors");
const handleFileCreation = require("../../utils/utils.file/handleFileCreation");

// Multer storage configuration
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

// Middleware to get all files
const getAllFiles = expressAsyncHandler(async (req, res) => {

    const user_id = req.user; // Assuming req.user holds the user ID

    const allFiles = await File.find({ user_id });

    if (!allFiles.length) {

        throw new NotFound('No files found for the user');

    }

    const filenames = allFiles.map(item => {

    const {_id, directoryId, originalname, url } = item;
     
        return {
            name: originalname,
            _id,
            mimetype,
            size,
            lastUpdated,
            url
        };
        
    });

    res.status(StatusCodes.OK).json(filenames);
});

// Middleware to get files in a directory
const getFilesInDirectory = expressAsyncHandler(async (req, res) => {
    const directoryId = req.params.directoryId;
    const parentDirectory = req.params.directoryId;

    try {
        // Find the directory by its ID
        const directory = await Directory.findById(parentDirectory);

        if (!directory) {
            // If directory is not found, return a 404 Not Found response
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Directory not found' });
        }

        let editedAllFiles;

        if (directory.mimetype === 'Subscribed_v1') {
            // Handle subscribed directories
            if (directory.subscribedToGroup && directory.subscribedToGroup.length > 0) {
                // Find the group user is subscribed to
                const groupUserIsSubscribedTo = await Group.findById(directory.subscribedToGroup);

                if (!groupUserIsSubscribedTo) {
                    // If group is not found, handle accordingly (return an empty array or another appropriate response)
                    editedAllFiles = [];
                } else {
                    // Find files in folders linked to the subscribed group
                    const folderIds = groupUserIsSubscribedTo.foldersLinkedToGroup;
                    editedAllFiles = await File.find({ _id: { $in: folderIds } });
                }
            } else {
                // Handle case where directory is subscribed but no group is linked
                editedAllFiles = [];
            }
        } else {
            // Handle non-subscribed directories
            const directoryFiles = await File.find({ directoryId });

            if (!directoryFiles || directoryFiles.length === 0) {
                // If no files found, return an empty array
                editedAllFiles = [];
            } else {
                // Map directoryFiles to editedAllFiles with required fields
                editedAllFiles = directoryFiles.map(file => ({
                    _id: file._id,
                    parentDirectory: file.directoryId,
                    name: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    lastUpdated: file.lastUpdated
                }));
            }
        }

        // Return the editedAllFiles array as JSON response
        res.status(StatusCodes.OK).json(editedAllFiles);
    } catch (error) {
        // Handle any errors that occur during the try block
        console.error('Error in getFilesInDirectory:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    } 
});




/*
function createFile(req, res) {
    // Extract necessary data from request
    const { user_id } = req.user;
    const { directoryId } = req.params;
    const { originalname, mimetype } = req.file;

    // Start MongoDB session and begin transaction
    start MongoDB session
    begin transaction

    try {
        // Find directory by directoryId
        const isDirectorySubscription = await Directory.findById(directoryId);

        // Initialize an empty array to store created file objects
        let fileObject = [];

        // Check if the directory is a subscription type
        if (isDirectorySubscription.mimetype === 'Subscription') {
            // Handle files when directory is a subscription

            // Loop through each file in req.files
            for (each file in req.files) {
                // Check if file with same originalname exists in Database
                const fileExists = await File.find({ originalname: file.originalname });

                // Logic to handle filename collisions
                if (fileExists && fileExists.length > 0) {
                    // Generate edited originalname to resolve collisions
                    const editedOriginalName = generateEditedOriginalName(fileExists);

                    // Upload file to storage and get URL
                    const url = await payDesmondUtils.uploadFileToStorage(user_id, file, editedOriginalName);

                    // Create new file document
                    let newFileObject;
                    if (url) {
                        const newFile = await File.create({
                            originalname: editedOriginalName,
                            mimetype,
                            url,
                            directoryId,
                            user_id
                        });

                        // Prepare newFileObject with required fields
                        newFileObject = prepareFileObject(newFile);

                        // Add new file _id to isDirectorySubscription.files
                        isDirectorySubscription.files.push(newFile._id);
                        await isDirectorySubscription.save();
                    }

                    // Push newFileObject to fileObject array
                    fileObject.push(newFileObject);
                } else {
                    // Handle scenario when no file with same originalname exists
                    // Upload file to storage and get URL
                    const url = await payDesmondUtils.uploadFileToStorage(user_id, file, originalname);

                    // Create new file document
                    let newFileObject;
                    if (url) {
                        const newFile = await File.create({
                            originalname,
                            mimetype,
                            url,
                            directoryId,
                            user_id
                        });

                        // Prepare newFileObject with required fields
                        newFileObject = prepareFileObject(newFile);

                        // Add new file _id to isDirectorySubscription.files
                        isDirectorySubscription.files.push(newFile._id);
                        await isDirectorySubscription.save();
                    }

                    // Push newFileObject to fileObject array
                    fileObject.push(newFileObject);
                }
            }
        } else {
            // Handle files when directory is not a subscription

            // Loop through each file in req.files
            for (each file in req.files) {
                // Check if file with same originalname exists in Database
                const fileExists = await File.find({ originalname });

                // Logic to handle filename collisions
                if (fileExists && fileExists.length > 0) {
                    // Generate edited originalname to resolve collisions
                    const editedOriginalName = generateEditedOriginalName(fileExists);

                    // Upload file to storage and get URL
                    const url = await payDesmondUtils.uploadFileToStorage(user_id, file, editedOriginalName);

                    // Create new file document
                    let newFileObject;
                    if (url) {
                        const newFile = await File.create({
                            originalname: editedOriginalName,
                            mimetype,
                            url,
                            directoryId,
                            user_id
                        });

                        // Prepare newFileObject with required fields
                        newFileObject = prepareFileObject(newFile);

                        // Add new file _id to isDirectorySubscription.files
                        isDirectorySubscription.files.push(newFile._id);
                        await isDirectorySubscription.save();
                    }

                    // Push newFileObject to fileObject array
                    fileObject.push(newFileObject);
                } else {
                    // Handle scenario when no file with same originalname exists
                    // Upload file to storage and get URL
                    const url = await payDesmondUtils.uploadFileToStorage(user_id, file, originalname);

                    // Create new file document
                    let newFileObject;
                    if (url) {
                        const newFile = await File.create({
                            originalname,
                            mimetype,
                            url,
                            directoryId,
                            user_id
                        });

                        // Prepare newFileObject with required fields
                        newFileObject = prepareFileObject(newFile);

                        // Add new file _id to isDirectorySubscription.files
                        isDirectorySubscription.files.push(newFile._id);
                        await isDirectorySubscription.save();
                    }

                    // Push newFileObject to fileObject array
                    fileObject.push(newFileObject);
                }
            }
        }

        // Commit transaction if all operations are successful
        commit transaction

        // Respond with status 201 Created and fileObject array in JSON format
        respond with status 201 Created and fileObject array in JSON format

    } catch (error) {
        // Handle errors
        // Delete uploaded file from storage if an error occurs
        await payDesmondUtils.deleteFileFromStorage(user_id, originalname);

        // Abort transaction and throw error to be handled by Express error handler
        abort transaction
        throw error
    } finally {
        // End MongoDB session
        end MongoDB session
    }
}


*/


// Middleware to create a file
const createFile = expressAsyncHandler(async (req, res) => {
    const { user: user_id } = req;
    const { directoryId } = req.params;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const directoryExist = await Directory.findById(directoryId);

        if (!directoryExist) {
            throw new NotFound(`Directory with ID ${directoryId} not found.`);
        }

        let fileObject = [];

        for (const file of req.files) {
            let uploadFunction = directoryExist.mimetype === 'Subscription' ? uploadFileToGroup : uploadFileToStorage;
            const newFile = await handleFileCreation(file, File, user_id, uploadFunction, session, directoryId);

            directoryExist.files.push(newFile._id);
            fileObject.push(newFile);
        }

        await directoryExist.save();
        await session.commitTransaction();
        res.status(201).json(fileObject);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});





// Middleware to delete a file
const deleteFile = expressAsyncHandler(async (req, res) => {
    const { fileIds, directoryId } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const userDetails = await File.findById(fileIds[0]).session(session)
        const { user_id } = userDetails;

        let deletedFiles = [];

        for (const fileId of fileIds) {
            const fileExist = await File.findOne({ _id: fileId }).session(session);
            if (fileExist===null) continue;
            const fileExisted = await File.findByIdAndDelete(fileId,{session});
            deletedFiles.push(fileExisted._id)
            if (fileExisted) await payDesmondUtils.deleteFileFromStorage(user_id,fileExisted.originalname);
        }

        const fileDirectory = await Directory.findById(directoryId).session(session);
        fileDirectory.files.pull(...deletedFiles);  
        await fileDirectory.save();

        await session.commitTransaction();

        res.status(StatusCodes.OK).json(deletedFiles);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});


// Middleware to download a file
const downloadFile = expressAsyncHandler(async (req, res) => {
    const { fileId } = req.params;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const file = await File.findById(fileId).session(session);
        if (!file) {
            throw new NotFound('File not found');
        }
        const { url, originalname, name } = file;       
        const imageObject = { url, originalname };
        await session.commitTransaction(); 
        res.send(imageObject);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});


// Middleware to move files to another directory
const moveFiles = expressAsyncHandler(async (req, res) => {
    const { DirectoriesToMoveFileTo, FileIds, DirectoryFileIsMoveFrom } = req.body;
    const _id = DirectoryFileIsMoveFrom;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const sourceDirectory = await Directory.findById(_id).session(session);
        if (!sourceDirectory) {
            throw new NotFound(`Source directory with ID ${_id} does not exist`);
        }

        for (const targetId of DirectoriesToMoveFileTo) {
            const targetDirectory = await Directory.findById(targetId).session(session);
            if (!targetDirectory) {
                throw new NotFound(`Target directory with ID ${targetId} does not exist`);
            }
            
            // Move each individual file ID from sourceDirectory to targetDirectory
            for (const fileId of FileIds) {
                // Remove from sourceDirectory.files and add to targetDirectory.files
                sourceDirectory.files.pull(fileId);
                targetDirectory.files.push(fileId);

                // Update parentDirectory for the file being moved
                const file = await File.findById(fileId).session(session);
                if (file) {
                    file.directoryId = targetId;
                    await file.save();
                } else {
                    throw new NotFound(`File with ID ${fileId} not found.`)
                }
            }

            await targetDirectory.save();
        } 

        await sourceDirectory.save();

        await session.commitTransaction();
        res.status(StatusCodes.OK).json({ message: 'Move was successful' });
    } catch (error) {
        await session.abortTransaction();
        throw error; // Throw the error to be caught by the express error handler
    } finally {
        session.endSession();
    }
});


const moveFilesFromSubscriptionsToDownload = expressAsyncHandler(async (req, res) => {

    const {fileIDs} = req.body;
    const user_id = req.user;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const getDownloadsParentIdByUserId = await Directory.findOne({
            user_id,
            name: 'Downloads'
        }).session(session);

        if (!getDownloadsParentIdByUserId) {
            // Handle case where Downloads directory doesn't exist for the user
            throw new NotFound("Downloads directory not found for the user");
        }


        for (const fileId of fileIDs) {
            const file = await File.findById(fileId).session(session);
            if (file===null) {
                // Handle case where file doesn't exist
                continue; // Skip to the next iteration
            }

            let {originalname,user_id:subscriptionOwnerId} = file;
            let newFileId;
            if(originalname){
                 newFileId = await payDesmondUtils.downloadFileFromStorage(
                    subscriptionOwnerId,
                    originalname,
                    getDownloadsParentIdByUserId._id,
                    user_id,
                    session
                );
                    
            }


            getDownloadsParentIdByUserId.files.push(newFileId);
            await getDownloadsParentIdByUserId.save()
        }


        await session.commitTransaction();

        res.status(StatusCodes.OK).json({
            message:'files have been succesfully moved to your download folder'
        })

    } catch (error) {
        // Handle errors
      await session.abortTransaction();
      throw error;
    } finally {
        session.endSession();
    }
});


module.exports = {
    // getAllFiles,
    // getFilesInDirectory,
    // createFile,
    // deleteFile,
    // downloadFile,
    // moveFiles,
    // upload,
    // moveFilesFromSubscriptionsToDownload
};
