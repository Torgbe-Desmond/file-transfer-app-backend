const deleteDirectoryRecursive = require('./directory/deleteDirectoryRecursive')
const generateToken = require('./authentication/generateToken')
const checkIfTwoArraysAreEqual = require('./checkIfTwoArraysAreEqual')

const {
    uploadFileToStorage,
    deleteFileFromStorage,
    downloadFileFromStorage,
    deleteFilesInDirectory
} = require('./FirebaseInteractions');


const payDesmondUtils = {
    deleteDirectoryRecursive,
    generateToken,  
    checkIfTwoArraysAreEqual,

    //Firebase 
    uploadFileToStorage,
    deleteFileFromStorage,
    downloadFileFromStorage,
    deleteFilesInDirectory
}

module.exports = payDesmondUtils