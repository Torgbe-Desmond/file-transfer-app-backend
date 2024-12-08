// Import necessary modules and configurations
const {
    expressAsyncHandler,
    File,
    NotFound,
} = require('./configurations');

module.exports.downloadFile = expressAsyncHandler(async (req, res) => {
    const { fileId } = req.params;

    try {
        const file = await File.findById(fileId).session(session);
        
        if (!file) {
            throw new NotFound('File not found');
        }

        const { url, name, size } = file;
        
        const fileObject = { url, name, size };
        
        res.send(fileObject);
    } catch (error) {
        throw error;
    }
});
