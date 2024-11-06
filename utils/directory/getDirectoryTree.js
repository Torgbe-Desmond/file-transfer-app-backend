const Directory = require('../../models/directory');

async function getDirectoryTree(directoryId, session) {
    const directoryTree = {
        filesToDelete: [],
        directoriesToDelete: [],
    };

    // Retrieve the directory with session
    const directory = await Directory.findById(directoryId).session(session);

    console.log('directory',directory)

    // Extract subdirectories and files if directory exists
    if (directory) {
        const { subDirectories, files } = directory;

        // Add current directory's files to filesToDelete
        if (files && files.length > 0) {
            directoryTree.filesToDelete.push(...files);
        }

        // Add the current directory ID to directoriesToDelete
        directoryTree.directoriesToDelete.push(directoryId);

        // Recursively process each subdirectory    
        if (subDirectories && subDirectories.length > 0) {
            for (const subDirId of subDirectories) {
                // Recursively get the tree for each subdirectory
                const childTree = await getDirectoryTree(subDirId, session);
                
                // Append each child tree’s directories and files to the main directoryTree
                directoryTree.filesToDelete.push(...childTree.filesToDelete);
                directoryTree.directoriesToDelete.push(...childTree.directoriesToDelete);
            }
        }
    }

    return directoryTree;
}

module.exports = getDirectoryTree;
