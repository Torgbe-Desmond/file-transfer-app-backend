const { parentPort, workerData } = require('worker_threads');
const { moveFileToUserGroup } = require('../FirebaseInteractions');


const {  userId, filename } = workerData;

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadFile(retries = MAX_RETRIES) {
    try {
        console.log(`Starting upload of file for user ${userId} with filename ${filename} attempt 3 out of ${retries}`)
        const fileUrl = await moveFileToUserGroup(userId, filename);
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
