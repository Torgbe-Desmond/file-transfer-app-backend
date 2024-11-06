// Import necessary modules and configurations
const {
    expressAsyncHandler,
    File,
    NotFound,
} = require('./configurations');

// Middleware to handle file download requests
module.exports.downloadFile = expressAsyncHandler(async (req, res) => {
    // Extract the file ID from the request parameters
    const { fileId } = req.params;

    try {
        // Attempt to find the file in the database using the provided file ID
        const file = await File.findById(fileId).session(session);
        
        // If the file does not exist, throw a NotFound error
        if (!file) {
            throw new NotFound('File not found');
        }

        // Destructure the relevant properties from the found file object
        const { url, name, size } = file;
        
        // Create a new object to hold the file's URL and original name
        const fileObject = { url, name, size };
        
        // Send the file object back to the client as a response
        res.send(fileObject);
    } catch (error) {
        // Rethrow any errors that occur during the execution
        throw error;
    }
});
