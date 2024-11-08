// Import required modules and configurations
const firebase = require('firebase/app'); // Firebase app initialization
const File = require('../models/files'); // File model for database interactions
const admin = require("firebase-admin"); // Firebase Admin SDK for server-side operations
require('dotenv').config(); // Load environment variables from .env file
const path = require('path'); // Module for handling file and directory paths
const {
    getStorage, // Function to get the storage service
    ref, // Function to create a reference to a storage location
    getDownloadURL, // Function to get the download URL of a file
    uploadBytesResumable, // Function for uploading files with resumable support
    deleteObject, // Function to delete a file from storage
    getBytes // Function to get the bytes of a file from storage
} = require('firebase/storage');

const Directory = require('../models/directory'); // Directory model for database interactions

// Initialize Firebase with the provided configuration
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
const storage = getStorage(); // Get the storage service

// Function to upload a file to Firebase Storage for a user
const uploadFileToStorage = async (user_id, file) => {
    try {
        const { mimetype, buffer, originalname } = file; // Destructure the file to get its mimetype and buffer
        const storageRef = ref(storage, `users/${user_id}/${originalname}`); // Create a reference to the storage location
        const metadata = {
            contentType: mimetype // Set the content type for the uploaded file
        };
        // Upload the file with resumable upload
        await uploadBytesResumable(storageRef, buffer, metadata);
        // Get the download URL for the uploaded file
        const fileUrl = await getDownloadURL(storageRef);
        return fileUrl; // Return the download URL
    } catch (error) {
        throw error; // Throw error if upload fails
    }
};

const uploadMultipleFilesToGroup = async (user_id, files) => {
    try {
        const fileUrls = []; // Initialize an array to hold all file URLs
        for (const file of files) {
            const { originalname, mimetype, buffer } = file;
            const fileUrl = await uploadFileToStorage(user_id, { originalname, mimetype, buffer });
            fileUrls.push(fileUrl); // Append each file URL to the array
        }
        console.log('fileUrls', fileUrls);
        return fileUrls; // Return the array of all uploaded file URLs
    } catch (error) {
        console.error('Error uploading multiple files:', error);
        throw error;
    }
};



// Function to delete a file from Firebase Storage
const deleteFileFromStorage = async (user_id, filename) => {
    try {
        const storageRef = ref(storage, `users/${user_id}/${filename}`); // Create a reference to the file to delete
        await deleteObject(storageRef); // Delete the file
    } catch (error) {
        throw error; // Throw error if deletion fails
    }
};


// Function to delete multiple files in a directory
const deleteFilesInDirectory = async (user_id, fileIds, session) => {
    try {
        for (const fileId of fileIds) {
            // Attempt to delete each file by ID
            const fileExisted = await File.findByIdAndDelete(fileId, { session });
            if (!fileExisted) {
                continue; // Skip if the file does not exist or has already been deleted
            }

            // Find the directory containing the deleted file
            const fileDirectory = await Directory.findById(fileExisted.directoryId).session(session);
            if (fileDirectory) {
                fileDirectory.files.pull(fileId); // Remove the file ID from the directory's files array
                await fileDirectory.save(); // Save the updated directory
            } 
            // Delete the file from storage
            await deleteFileFromStorage(user_id, fileExisted.originalname);
        }
    } catch (error) {
        throw error; // Throw error if deletion fails
    }
};

// Export the functions for use in other modules
module.exports = {
    uploadFileToStorage,
    deleteFilesInDirectory,
    deleteFileFromStorage,
    uploadMultipleFilesToGroup
};
