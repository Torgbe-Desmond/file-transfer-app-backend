
const { NotFound } = require('../../Errors');
const Directory = require('../../models/directory');
const File = require('../../models/files');
const { deleteFilesInDirectory } = require('../FirebaseInteractions');


// const  deleteDirectoryRecursive = async (user_id, directoryId, parentDirectoryId, session) => {
//     try {
//         const directory = await Directory.findById(directoryId).session(session);
//         if (!directory) {
//             throw new NotFound(`Directory with ID ${directoryId} not found.`);
//         }

//         const { subDirectories, files } = directory;

//         if(subDirectories.length > 0) {
//             for (const subDirId of subDirectories) {
//                 await deleteDirectoryRecursive(user_id, subDirId, directoryId, session);
//             }
//         }
    
//         if (files.length > 0) {
//             await File.deleteMany({ _id: { $in: files } }).session(session);
//             await deleteFilesInDirectory(user_id, files, session);
//         }
      
//         await Directory.deleteOne({ _id: directoryId }).session(session);

//         if (parentDirectoryId) {
//             const parentDirectoryExist = await Directory.findById(parentDirectoryId).session(session);
//             if (parentDirectoryExist) {
//                 parentDirectoryExist.subDirectories.pull(directoryId);
//                 await parentDirectoryExist.save();
//             }
//         }
//     } catch (error) {
//         throw error;
//     }
// };

async function deleteDirectoryTree({ filesToDelete, directoriesToDelete }, session) {
    // Delete directories if any
    if (directoriesToDelete && directoriesToDelete.length > 0) {
        await Directory.deleteMany({ _id: { $in: directoriesToDelete } }).session(session);
    }

    // Delete files if any
    if (filesToDelete && filesToDelete.length > 0) {
        await File.deleteMany({ _id: { $in: filesToDelete } }).session(session);
    }
}



module.exports = {
    deleteDirectoryTree
}