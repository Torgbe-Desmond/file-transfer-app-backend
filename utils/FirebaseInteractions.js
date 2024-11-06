// Import required modules and configurations
const firebase = require('firebase/app'); // Firebase app initialization
const File = require('../models/files'); // File model for database interactions
const admin = require("firebase-admin"); // Firebase Admin SDK for server-side operations
const fs = require('fs'); // File system module for handling file operations
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

const { NotFound } = require('../Errors'); // Custom error handling for NotFound errors
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
const uploadFileToStorage = async (user_id, file, originalname) => {
    try {
        const { mimetype, buffer } = file; // Destructure the file to get its mimetype and buffer
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

// Function to upload a file to a group in Firebase Storage
const uploadFileToGroup = async (user_id, file, originalname) => {
    try {
        const { mimetype, buffer } = file; // Destructure the file to get its mimetype and buffer
        const storageRef = ref(storage, `groups/${user_id}/${originalname}`); // Create a reference for group upload
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

// Function to delete a file from Firebase Storage
const deleteFileFromStorage = async (user_id, filename) => {
    try {
        const storageRef = ref(storage, `users/${user_id}/${filename}`); // Create a reference to the file to delete
        await deleteObject(storageRef); // Delete the file
    } catch (error) {
        throw error; // Throw error if deletion fails
    }
};

// Function to update an image for a user
async function updateImage(user_id, file, originalname) {
    try {
        let updateImageData; // Variable to hold the updated image data
        const storageRef = ref(storage, `images/${user_id}/${originalname}`); // Reference to the existing image

        // Delete the existing file before uploading the new one
        await deleteObject(storageRef);

        // Upload the new file and get the response (download URL)
        const uploadResponse = await uploadFileToStorage(user_id, file, originalname);

        return uploadResponse; // Return the new file's download URL
    } catch (error) {
        throw error; // Throw error if update fails
    }
};

// Function to download a file from Firebase Storage
const downloadFileFromStorage = async (user_id, originalname, getDownloadsParentIdByUserId, loggedInUserId = null, session) => {
    try {
        // Check if the original file exists in the database
        const originalFileExist = await File.find({ originalname, user_id }).session(session);
        if (!originalFileExist || originalFileExist.length === 0) {
            throw new NotFound('The file you are trying to copy does not exist'); // Throw error if not found
        }

        const destinationPath = path.join(__dirname, `../files/${originalname}`); // Define the path to save the downloaded file
        const storageRef = ref(storage, `users/${user_id}/${originalname}`); // Reference to the file in storage
        const fileBytes = await getBytes(storageRef); // Get the bytes of the file
        const buffer = Buffer.from(fileBytes); // Convert bytes to a Buffer
        fs.writeFileSync(destinationPath, buffer); // Write the Buffer to a file

        // Prepare a new file object with the updated directory ID
        const newOwnerFileObject = { ...originalFileExist[0] };
        newOwnerFileObject.directoryId = getDownloadsParentIdByUserId;

        // Create a new file entry in the database
        const createNewFile = await File.create(newOwnerFileObject, { session });
        // Upload the downloaded file back to storage for the logged-in user, if applicable
        if (createNewFile && createNewFile.length > 0 && loggedInUserId) {
            await uploadFileToStorage(loggedInUserId, destinationPath, originalname);
        }
        // If no logged-in user, upload the file back to the original user
        if (loggedInUserId === null) {
            await uploadFileToStorage(user_id, destinationPath, originalname);
        }

        fs.unlinkSync(destinationPath); // Remove the local file after upload

        return createNewFile[0]._id; // Return the ID of the newly created file
    } catch (error) {
        throw error; // Throw error if download fails
    }
};

// Function to delete multiple files in a directory
const deleteFilesInDirectory = async (user_id, fileIds, session) => {
    console.log('user_id, fileIds', user_id, fileIds); // Log the user ID and file IDs to delete
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
    downloadFileFromStorage,
    deleteFilesInDirectory,
    deleteFileFromStorage,
    updateImage,
    uploadFileToGroup,
    admin
};
