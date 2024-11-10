// fileUploadWorker.js

const { parentPort, workerData } = require('worker_threads');
const { uploadFileToStorage } = require('../FirebaseInteractions');

// Extract data passed from the main thread
const { userId, file } = workerData;

// Function to handle the file upload
async function uploadFile() {
    try {
        // Upload file to Firebase (or any other storage service)
        const fileUrl = await uploadFileToStorage(userId, file );

        // Notify the main thread of a successful upload
        parentPort.postMessage({
            success: true,
            url: fileUrl,
        });

    } catch (error) {
        // Notify the main thread if there's an error
        parentPort.postMessage({
            success: false,
            error: error.message,
        });
    }
}

// Execute the upload function
uploadFile();
