const expressAsyncHandler = require("express-async-handler");
const multer = require('multer');
const Directory = require('../../models/directory');
const File = require('../../models/files');
const { StatusCodes } = require("http-status-codes");
const mongoose = require('mongoose');
const { uploadFileToGroup, uploadFileToStorage } = require("../../utils/FirebaseInteractions");
const { NotFound } = require("../../Errors");
const handleFileCreation = require("../../utils/file/handleFileCreation");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const transformFileData = require('../../utils/file/mapFiles')
const { downloadFileFromStorage } = require('../../utils/FirebaseInteractions');

module.exports = {
    expressAsyncHandler,
    multer,
    Directory,
    File,
    StatusCodes,
    mongoose,
    downloadFileFromStorage,
    uploadFileToGroup,
    uploadFileToStorage,
    NotFound,
    handleFileCreation,
    upload,
    transformFileData
};


