// Import required modules and configurations
const firebase = require('firebase/app');
const File = require('../models/files'); 
const admin = require("firebase-admin"); 
require('dotenv').config(); 
const path = require('path'); 
const {
    getStorage,
    ref, 
    getDownloadURL,
    uploadBytesResumable,
    deleteObject, 
    getBytes, 
    uploadBytes
} = require('firebase/storage');

const Directory = require('../models/directory'); 
const User = require('../models/user');

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase app
firebase.initializeApp(firebaseConfig);
const storage = getStorage(); 


const uploadFileToStorage = async (user_id, file) => {
    try {

      console.info(`🔃 Starting upload for ${file?.originalname || "Unknown file"}...`);
  
      const { mimetype, buffer, originalname } = file;
      console.info(`🔃 Preparing metadata [1/5]`);
  
      const storageRef = ref(storage, `users/${user_id}/${originalname}`);
      const metadata = {
        contentType: mimetype,
      };
  
      console.info(`🔃 Uploading file to storage [2/5]`);
      await uploadBytesResumable(storageRef, buffer, metadata);
  
      console.info(`🔃 Retrieving download URL [3/5]`);
      const fileUrl = await getDownloadURL(storageRef);
  
      if (!fileUrl) {
        throw new Error(`Failed to retrieve download URL for ${originalname}`);
      }
  
      console.info(`🔃 Upload completed [4/5]`);

      console.info(`✅ Upload successful for ${originalname} [5/5]`);
  
      return fileUrl;
    } catch (error) {
      console.error(`❌ Upload failed for ${file?.originalname || "Unknown file"}: ${error.message}`);
       throw error; 
    }
  };
  

// Function to upload mutiple files to group
const uploadMultipleFilesToGroup = async (user_id, files) => {
    try {
        const fileUrls = []; 
        for (const file of files) {
            const { originalname, mimetype, buffer } = file;
            const fileUrl = await uploadFileToStorage(user_id, { originalname, mimetype, buffer });
            fileUrls.push(fileUrl);
        }
        return fileUrls; 
    } catch (error) {
        console.error('Error uploading multiple files:', error);
        throw error;
    }
};

const uploadMultipleFilesToGroupV2 = async (user_id, file) => {
    try {
        const { originalname, mimetype, buffer } = file;
        const fileUrl = await uploadFileToStorage(user_id, { originalname, mimetype, buffer });
        return fileUrl; 
    } catch (error) {
        console.error('Error uploading multiple files:', error);
        throw error;
    }
};

// Function to delete a file from Firebase Storage
const deleteFileFromStorage = async (user_id, filename) => {
    try {
        const storageRef = ref(storage, `users/${user_id}/${filename}`);
        await deleteObject(storageRef);
        console.log(`File ${filename} deleted successfully for user ${user_id}`);
    } catch (error) {
        if (error.code === 'storage/object-not-found') {
            console.log(`File ${filename} not found for user ${user_id}, skipping deletion.`);
        } else {
            console.error('Error deleting file:', error);
            throw error;
        }
    }
};

 // Function to move files to user group
const moveFileToUserGroup = async (user_id, filename) => {
    try {

        
        console.log('Uploading...')
        const storageRef = ref(storage, `users/${user_id}/${filename}`);

        const destinationRef = ref(storage, `users/${user_id}/shared/${filename}`);

        const url = await getDownloadURL(storageRef);

        const response = await fetch(url);

        const blob = await response.blob();

        await uploadBytes(destinationRef, blob);

        const downloadURL = await getDownloadURL(destinationRef);
        return downloadURL;

    } catch (error) {
        console.error("Error moving file:", error._baseMessage);
        throw error; 
    }
};


 // Function to move files to user group
 const copyFileFromOneUserToAnother = async (from,to, filename) => {
    try {

        const storageRef = ref(storage, `users/${from}/${filename}`);

        const destinationRef = ref(storage, `users/${to}/${filename}`);

        const url = await getDownloadURL(storageRef);

        const response = await fetch(url);
        console.info(`Downloading the file from ${from}`)

        const blob = await response.blob();

        await uploadBytes(destinationRef, blob);
        console.info(`Downloading the file to ${to}`)

        const downloadURL = await getDownloadURL(destinationRef);
        console.info(`Done with the copy from ${from} to ${to}`)

        return downloadURL;

    } catch (error) {
        console.error("Error moving file:", error._baseMessage);
        throw error; 
    }
};


// Function to delete multiple files in a directory
const deleteFilesInDirectory = async (user_id, fileIds, session) => {
    try {
        for (const fileId of fileIds) {

            const fileExisted = await File.findByIdAndDelete(fileId, { session });
            if (!fileExisted) {
                continue; 
            }

            const fileDirectory = await Directory.findById(fileExisted.directoryId).session(session);
            if (fileDirectory) {
                fileDirectory.files.pull(fileId); 
                await fileDirectory.save(); 
            } 

            await deleteFileFromStorage(user_id, fileExisted.originalname);
        }
    } catch (error) {
        throw error; 
    }
};

// Export the functions for use in other modules
module.exports = {
    uploadFileToStorage,
    deleteFilesInDirectory,
    deleteFileFromStorage,
    uploadMultipleFilesToGroupV2,
    uploadMultipleFilesToGroup,
    moveFileToUserGroup,
    copyFileFromOneUserToAnother,
};
