


class handleFileCreationHandler {
    constructor(){
        this.fileObject = {};
    }

     // Here is the method to handle file creation
     handleFileCreation = async function handleFileCreation(file, File, user_id, uploadFile, session, directoryId) {
        const { originalname, mimetype } = file;
        const fileNameWithoutExtension = originalname.split('.').slice(0, -1).join('.');
        const fileExists = await File.find({
             originalname: {
                 $regex: `^${fileNameWithoutExtension}`, 
                 $options: 'i' } 
                })
    
        let newFileObject;

        try {
            if (fileExists && fileExists.length > 0) {
                // get the last file in  the file document that belongs to the user 
                const splitedOrgininalname = fileExists[fileExists.length - 1].originalname.split('.');
                const editedOriginalName = this.generateFileName(splitedOrgininalname);
                const url = await uploadFile(user_id, file, editedOriginalName);
                if (url) {
                    this.fileObject = {
                        originalname:editedOriginalName,
                        mimetype, 
                        url, 
                        directoryId, 
                        user_id
                    }
                    const newFile = await File.create([this.fileObject], { session });
                    newFileObject = this.extractFileObject(newFile);
                }
            } else {
                const url = await uploadFile(user_id, file, originalname);
                if (url) {
                    this.fileObject ={
                        originalname, 
                        mimetype, 
                        url, 
                        directoryId, 
                        user_id,
                    }
                    const newFile = await File.create([this.fileObject], { session });
                    newFileObject = this.extractFileObject(newFile);
                }
            }
        } catch (error) {
            throw error;
        }
    
        return newFileObject;
    }


    extractFileObject = function extractFileObject(file) {
        return fileObject = file[0];
    }
    
    generateFileName =  function generateFileName(splitedOrgininalname) {
        let name, extension, editedOriginalName;
        if (splitedOrgininalname && splitedOrgininalname.length === 2) {
            let number = 1;
            name = splitedOrgininalname[0];
            extension = splitedOrgininalname[1];
            editedOriginalName = `${name}.${number}.${extension}`;
        } else if (splitedOrgininalname && splitedOrgininalname.length > 2) {
            name = splitedOrgininalname[0];
            let currentNumberOfFilesWithSimilarName = splitedOrgininalname[1];
            let updateCurrentNumberOfFilesWithSimilarName = parseInt(currentNumberOfFilesWithSimilarName) + 1;
            extension = splitedOrgininalname[2];
            editedOriginalName = `${name}.${updateCurrentNumberOfFilesWithSimilarName}.${extension}`;
        }
    
        return editedOriginalName;
    }
}

 
module.exports = handleFileCreationHandler; 