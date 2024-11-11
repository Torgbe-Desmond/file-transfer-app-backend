const { parentPort, workerData } = require('worker_threads');
const { uploadFileToStorage } = require('../FirebaseInteractions');

// Extract data passed from the main thread
const { userId, file } = workerData;

// Retry parameters
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000; // Delay in milliseconds (e.g., 2 seconds)

// Function to add a delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to handle the file upload with retry logic and delay
async function uploadFile(retries = MAX_RETRIES) {
    try {
        // Attempt to upload file to Firebase (or any other storage service)
        const fileUrl = await uploadFileToStorage(userId, file);

        // Notify the main thread of a successful upload
        parentPort.postMessage({
            success: true,
            url: fileUrl,
        });
    } catch (error) {
        if (retries > 0) {
            // Wait before retrying
            await delay(RETRY_DELAY_MS);
            uploadFile(retries - 1);
        } else {
            // Notify the main thread if retries are exhausted
            parentPort.postMessage({
                success: false,
                error: error.message,
            });
        }
    }
}

// Execute the upload function
uploadFile();
