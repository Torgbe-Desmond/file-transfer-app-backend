const { parentPort, workerData } = require('worker_threads');
const { uploadFileToStorage } = require('../FirebaseInteractions');

const { userId, file} = workerData;

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadFile(retries = MAX_RETRIES) {
    try {
        console.info(`😊 Atempting upload [${retries}/3]`)
        const fileUrl = await uploadFileToStorage(userId, file);
        parentPort.postMessage({
            success: true,
            url: fileUrl,
        });
    } catch (error) {
        if (retries > 0) {
            await delay(RETRY_DELAY_MS);
            uploadFile(retries - 1);
        } else {
            parentPort.postMessage({
                success: false,
                error: error.message,
            });
        }
    }
}

uploadFile();
