
const Directory = require('../../models/directory');
const File = require('../../models/files');
const { deleteFilesInDirectory } = require('../FirebaseInteractions');


const   deleteDirectoryRecursive = async (user_id, directoryId, parentDirectoryId, session) => {
    try {

        console.log('inside inside',user_id, directoryId, parentDirectoryId)
        // Find the directory by ID
        const directory = await Directory.findById(directoryId).session(session);
        if (!directory) {
            throw new Error(`Directory with ID ${directoryId} not found.`);
        }

        // Retrieve subdirectories of the current directory
        const { subDirectories, files } = directory;

        console.log('subDirectories, files',subDirectories, files)

        // Recursively delete subdirectories
        if(subDirectories.length > 0) {
            for (const subDirId of subDirectories) {
                await deleteDirectoryRecursive(user_id, subDirId, directoryId, session);
            }
        }
    
        // Delete files associated with the directory
        if (files.length > 0) {
            await File.deleteMany({ _id: { $in: files } }).session(session);
            await deleteFilesInDirectory(user_id, files, session);
        }
      
        // Delete the current directory
        await Directory.deleteOne({ _id: directoryId }).session(session);

 
        // Remove directoryId from parentDirectory's subDirectories
        if (parentDirectoryId) {
            const parentDirectoryExist = await Directory.findById(parentDirectoryId).session(session);
            if (parentDirectoryExist) {
                parentDirectoryExist.subDirectories.pull(directoryId);
                await parentDirectoryExist.save();
            }
        }
    } catch (error) {
        throw error;
    }
};




// inserts, updates, deletes, and other modifications to the data.

module.exports = {
    deleteDirectoryRecursive
}