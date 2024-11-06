const { uploadMultipleFilesToGroup } = require("../FirebaseInteractions");
const extractFileNameFromUrl = require("./extractFileFromUrl");

const extractFileIds = (files) => {
    return files.map(({ _id }) => _id); 
};

const _handleFileCreation = async (user_id, files,directoryId) => {
    try {

        const filesWithoutBuffer = files.map(({ buffer, ...file }) => file);

        const fileUrls = await uploadMultipleFilesToGroup(user_id, files);
        
        let extractedFilenamesFromUrl = fileUrls.map(url => extractFileNameFromUrl(url));

        const filesWithUrl = filesWithoutBuffer.map(({ originalname, ...file }) => {
            const matchingUrlIndex = extractedFilenamesFromUrl.findIndex(filename => filename === originalname);
            const url = fileUrls[matchingUrlIndex]; 
            return {
                ...file,
                name: originalname, 
                url,
                directoryId,
                user_id
            };
        });

        const filesWithoutOriginalname = filesWithUrl.map(({ encoding, fieldname, originalname, ...file }) => file);

        const fileIds = extractFileIds(filesWithoutOriginalname);

        return {
            files: filesWithoutOriginalname,
            fileIds: fileIds
        };
    } catch (error) {
        throw error;
    }
};

module.exports = _handleFileCreation;
