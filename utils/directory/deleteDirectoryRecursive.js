
const Directory = require('../../models/directory');
const File = require('../../models/files');

async function deleteDirectoryTree({ filesToDelete, directoriesToDelete }, session) {
    console.info('Deletiong directory tree..')

    let fileArrayWithFileObjects = [];
    let filesToBeDeletedImmediately = []

    // Because the deleteMany API in mongoose does not bring back the items that where deleted
    // i need to store the name and user_id in the fileArrayWithFileObjects object so that i can
    // delete them from the storage which is firebase storage
    for(const file of filesToDelete){
        const fileExist = await File.findById(file);
        if(!fileExist){
            continue;
        } else if(fileExist?.shared===true){
            filesToBeDeletedImmediately.push(file);
            continue;
        }

        fileArrayWithFileObjects.push({
            name:fileExist.name,
            user_id:fileExist.user_id
        })   
    }

    if(filesToBeDeletedImmediately && filesToBeDeletedImmediately.length > 0 ){
        await File.deleteMany({ _id: { $in: filesToBeDeletedImmediately } }).session(session);
    }

    if (directoriesToDelete && directoriesToDelete.length > 0) {
        await Directory.deleteMany({ _id: { $in: directoriesToDelete } }).session(session);
    }

    if (filesToDelete && filesToDelete.length > 0) {
        await File.deleteMany({ _id: { $in: filesToDelete } }).session(session);
    }


    return fileArrayWithFileObjects;

}



module.exports = {
    deleteDirectoryTree
}