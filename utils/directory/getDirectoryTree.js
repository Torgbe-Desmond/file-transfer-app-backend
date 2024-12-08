const Directory = require('../../models/directory');

async function getDirectoryTree(directoryId, session) {
    console.info('Creating directory tree..')

    const directoryTree = {
        filesToDelete: [],
        directoriesToDelete: [],
    };

    const directory = await Directory.findById(directoryId).session(session);

    if (directory) {
        const { subDirectories, files } = directory;

        if (files && files.length > 0) {
            directoryTree.filesToDelete.push(...files);
        }
        
        directoryTree.directoriesToDelete.push(directoryId);

        if (subDirectories && subDirectories.length > 0) {
            for (const subDirId of subDirectories) {

                const childTree = await getDirectoryTree(subDirId, session);
                
                directoryTree.filesToDelete.push(...childTree.filesToDelete);

                directoryTree.directoriesToDelete.push(...childTree.directoriesToDelete);
            }
        }
    }

    return directoryTree;
}

module.exports = getDirectoryTree;
