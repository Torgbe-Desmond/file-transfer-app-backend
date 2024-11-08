const { uploadMultipleFilesToGroup } = require("../FirebaseInteractions");
const extractFileNameFromUrl = require("./extractFileFromUrl");

const _handleFileCreation = async (user_id, files,directoryId) => {
    console.log('user_id',user_id)
    try {

        const filesWithoutBuffer = files.map(({ buffer, ...file }) => file);
        console.log('before upload')
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

        return {
            files: filesWithoutOriginalname,
        };
    } catch (error) {
        throw error;
    }
};

module.exports = _handleFileCreation;
