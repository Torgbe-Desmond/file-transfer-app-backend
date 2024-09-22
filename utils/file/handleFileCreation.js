
async function handleFileCreation(file, File, user_id, uploadFile, session, directoryId) {
    const { originalname, mimetype } = file;
    const fileNameWithoutExtension = originalname.split('.').slice(0, -1).join('.');
    const fileExists = await File.find({ originalname: { $regex: `^${fileNameWithoutExtension}`, $options: 'i' } })
    let newFileObject;
 
    try {
        if (fileExists && fileExists.length > 0) {
            const splitedOrgininalname = fileExists[fileExists.length - 1].originalname.split('.');
            const editedOriginalName = generateFileName(splitedOrgininalname);
            const url = await uploadFile(user_id, file, editedOriginalName);

            if (url) {
                const newFile = await File.create([{ originalname: editedOriginalName, mimetype, url, directoryId, user_id }], { session });
                newFileObject = extractFileObject(newFile);
            }
        } else {
            const url = await uploadFile(user_id, file, originalname);
            if (url) {
                const newFile = await File.create([{ originalname, mimetype, url, directoryId, user_id }], { session });
                newFileObject = extractFileObject(newFile);
            }
        }
    } catch (error) {
        throw error;
    }

    return newFileObject;
}

function extractFileObject(file) {
    const { _id, originalname, mimetype, size, lastUpdated, directoryId, url, user_id } = file[0];
    return {
        _id,
        originalname,
        mimetype,
        size,
        lastUpdated,
        directoryId,
        url,
        user_id
    };
}

function generateFileName(splitedOrgininalname) {
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


 
module.exports = handleFileCreation; 