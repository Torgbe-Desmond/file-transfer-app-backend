const bcryptjs = require('bcryptjs');
const { BadRequest, NotFound } = require('../../Errors/index.js');
const { StatusCodes } = require('http-status-codes');
const generateAuthToken = require('../../utils/authentication/generateToken.js');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const Directory = require('../../models/directory.js');
const { deleteDirectoryRecursive } = require('../../utils/index.js');
const User = require('../../models/user.js');
const UserSubscriptions = require('../../models/subscriptionsOfUser.js');
const Student = require('../../models/student.js')
const Courses = require('../../models/courses.js')

module.exports = {
    bcryptjs,
    BadRequest,
    NotFound,
    StatusCodes,
    generateAuthToken,
    asyncHandler,
    uuidv4,
    mongoose,
    Directory,
    deleteDirectoryRecursive,
    User,
    UserSubscriptions,
    Student,
    Courses
};

