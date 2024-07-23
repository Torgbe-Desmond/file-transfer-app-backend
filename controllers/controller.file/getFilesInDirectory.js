const {
    expressAsyncHandler,
    Directory,
    File,
    StatusCodes,
} = require('./configurations');


module.exports.getFilesInDirectory = expressAsyncHandler(async (req, res) => {
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
