const firebase = require('firebase/app');
const File = require('../models/files');
const admin = require("firebase-admin");
const fs = require('fs');
require('dotenv').config();
const path = require('path');
const {
    getStorage,
    ref,
    getDownloadURL, 
    uploadBytesResumable,
    deleteObject,
    getBytes
}= require('firebase/storage');

const { NotFound } = require('../Errors');
const Directory = require('../models/directory');



// Initialize Firebase
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

firebase.initializeApp(firebaseConfig);
const storage = getStorage();


// Function to upload a file to Firebase Storage
const uploadFileToStorage = async (user_id,file,originalname) => {
    try {        
        const {mimetype,buffer} = file;
        const storageRef = ref(storage, `users/${user_id}/${originalname}`);
        const metadata = {
            contentType: mimetype 
        };
        await uploadBytesResumable(storageRef, buffer, metadata);
        const fileUrl = await getDownloadURL(storageRef);
        return fileUrl;
    } catch (error) {
        throw error;    
    }
};


// Upload file to storage
const uploadFileToGroup = async (user_id,file,originalname) => {
    try {        
        const {mimetype,buffer} = file;
        const storageRef = ref(storage, `groups${user_id}/${originalname}`);
        const metadata = {
            contentType: mimetype 
        };
        await uploadBytesResumable(storageRef, buffer, metadata);
        const fileUrl = await getDownloadURL(storageRef);
        return fileUrl;
    } catch (error) {
        throw error;    
    }
};  




//Delete file from storage
const deleteFileFromStorage = async (user_id,filename) => {
    try {
        const storageRef = ref(storage, `users/${user_id}/${filename}`);
        await deleteObject(storageRef);
    } catch (error) {
        throw error; 
    }
};


//Upload file from storage
async function updateImage(user_id, file, originalname) {
    try {
        let updateImageData;
        const storageRef = ref(storage, `images/${user_id}/${originalname}`);

        // Delete the existing file
        await deleteObject(storageRef);

        // Upload the new file and get the response
        const uploadResponse = await uploadFileToStorage(user_id, file, originalname);

        return uploadResponse;
    } catch (error) {
        throw error;
    }
};




//Downlodd File from storage
const downloadFileFromStorage = async (user_id, originalname, getDownloadsParentIdByUserId, loggedInUserId = null, session) => {
    try {
        const originalFileExist = await File.find({ originalname, user_id }).session(session);
        if (!originalFileExist || originalFileExist.length === 0) {
            throw new NotFound('The file you are trying to copy does not exist');
        }

        const destinationPath = path.join(__dirname, `../files/${originalname}`);
        const storageRef = ref(storage, `users/${user_id}/${originalname}`);
        const fileBytes = await getBytes(storageRef);
        const buffer = Buffer.from(fileBytes);
        fs.writeFileSync(destinationPath, buffer);

        const newOwnerFileObject = { ...originalFileExist[0] };
        newOwnerFileObject.directoryId = getDownloadsParentIdByUserId;

        const createNewFile = await File.create(newOwnerFileObject, { session });
        if (createNewFile && createNewFile.length > 0 && loggedInUserId) {
            await uploadFileToStorage(loggedInUserId, destinationPath, originalname);
        }
        if (loggedInUserId === null) {
            await uploadFileToStorage(user_id, destinationPath, originalname);
        }

        fs.unlinkSync(destinationPath);

        return createNewFile[0]._id; 
    } catch (error) {
        throw error;
    }
};

const deleteFilesInDirectory = async (user_id, fileIds, session) => {
    console.log('user_id, fileIds', user_id, fileIds);
    try {
        for (const fileId of fileIds) {
            const fileExisted = await File.findByIdAndDelete(fileId, { session });
            if (!fileExisted) {
                continue; // Skip if file does not exist or already deleted
            }

            const fileDirectory = await Directory.findById(fileExisted.directoryId).session(session);
            if (fileDirectory) {
                fileDirectory.files.pull(fileId); // Remove file ID from directory's files array
                await fileDirectory.save(); // Save the directory
            } 

            await deleteFileFromStorage(user_id, fileExisted.originalname);
        }
    } catch (error) {
        throw error;
    }
};










module.exports = {
    uploadFileToStorage,
    downloadFileFromStorage,
    deleteFilesInDirectory,
    deleteFileFromStorage,
    updateImage,
    uploadFileToGroup,
    admin
}