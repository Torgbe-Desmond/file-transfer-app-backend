const Directory = require('../../models/directory')

const getDirectoryTree = async (directoryId, session) => {
    const directoryTree = {
        filesToDelete:[],
        directoriesToDelete:[]
    };

    // Check if there directory exist
    const directory = await Directory.findById(directoryId).session(session);
    
    // destructure the directory to get the subDirectories
    const { subDirectories, files } = directory; 

    // add the files to be deleted to the filesToDelete in the directoryTree object
    if(files && files.length > 0 ){
        directoryTree.filesToDelete.push(...files)
    }

    // loop through each subdirectories recurively to the the subdirectory tree
    if (subDirectories && subDirectories.length > 0) {
        for (const subDirId of subDirectories) {
            directoryTree.directoriesToDelete.push(subDirId); 
            const childSubdirectoryIds = await getDirectoryTree(subDirId, session);
            directoryTree.directoriesToDelete.push(...childSubdirectoryIds); 
        }
    }

    return directoryTree;
};


module.exports = getDirectoryTree