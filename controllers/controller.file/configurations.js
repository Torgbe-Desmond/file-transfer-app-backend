const expressAsyncHandler = require("express-async-handler");
const multer = require('multer');
const Directory = require('../../models/directory.model');
const File = require('../../models/files.model');
const { StatusCodes } = require("http-status-codes");
const mongoose = require('mongoose');
const payDesmondUtils = require('../../utils/index');
const { uploadFileToGroup, uploadFileToStorage } = require("../../utils/FirebaseInteractions");
const { NotFound } = require("../../Errors");
const handleFileCreation = require("../../utils/utils.file/handleFileCreation");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const transformFileData = require('../../utils/utils.file/mapFiles')

module.exports = {
    expressAsyncHandler,
    multer,
    Directory,
    File,
    StatusCodes,
    mongoose,
    payDesmondUtils,
    uploadFileToGroup,
    uploadFileToStorage,
    NotFound,
    handleFileCreation,
    upload,
    transformFileData
};
