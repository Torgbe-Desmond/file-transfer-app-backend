const bcryptjs = require('bcryptjs');
const { BadRequest, NotFound } = require('../Errors/index.js');
const { StatusCodes } = require('http-status-codes');
const generateAuthToken = require('../utils/jwt.js');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose')
const Directory = require('../models/directory.model.js');
const { deleteDirectoryRecursive } = require('../utils/index.js');
const User = require('../models/user.model.js')
const UserSubscritpions  = require('../models/subscriptionsOfUser.model.js')

const getAll = asyncHandler(async (req, res) => {
       const allUsers = await User.find({})
       res.status(StatusCodes.OK).json(allUsers)
})


const loginUser = asyncHandler(async (req, res) => {

  try {
      const { email, password} = req.body;

      const userExist = await User.findOne({email})

      if(!userExist) throw new NotFound('Invalid credentials');
      
      const validPassword = bcryptjs.compare(password, userExist.password)

      if(!validPassword) throw new NotFound('Invalid credentials')

      
      const token = generateAuthToken(userExist._id);

      res.status(StatusCodes.OK).json({
        token,
        reference_Id:userExist.reference_Id
      })
      
  } catch (error) {
    throw error
  }
});


const registerUser = asyncHandler(async (req, res) => {
  
  const session = await mongoose.startSession();
  session.startTransaction()

  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      throw new BadRequest('Please provide email, password, and username');
    }

    const userExist = await User.findOne({email})

    if (userExist) throw new BadRequest('Account already exists');

    const hashedPassword = await bcryptjs.hash(password, 10);

    const reference_Id = uuidv4();

    const newUser = await User.create([{ 
      username,
      email,
      password: hashedPassword,
      reference_Id,
    }], { session })



    await UserSubscritpions.create([{userId:newUser[0]._d}],{session})

    const defaultFolders = ["My Workspace","Downloads","Subscriptions","Subscribed"];

    for( const name of defaultFolders){
         await Directory.create([{name,parentDirectory:reference_Id,user_id:newUser[0]._id}])
    }

    const token = generateAuthToken(newUser[0]._id);

    await session.commitTransaction();


    res.status(StatusCodes.CREATED).json({
      token,
      reference_Id
    });
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally { 
    session.endSession()
  }

  
  
});




const deleteUSer = asyncHandler(async(req,res)=>{
  const user_id = req.user
  const session = await mongoose.startSession();
  session.startTransaction()

  try {

    const mainDirectories  = ['My Workspace','Subscriptions','Subscribed','Downloads']

    let idsofMaindDirectoreis = []
    for(const folderNames of mainDirectories){
        const folder = await Directory.findOne({user_id,name:folderNames})
        idsofMaindDirectoreis.push(folder._id)
    }

    for (const dirId of idsofMaindDirectoreis) {
      const directory = await Directory.findById(dirId).session(session);
      if (!directory) {
          // Directory doesn't exist, respond with an error
          // throw new NotFound(`Directory with ID ${dirId} not found.`);
          continue;
      }

      // Use await with deleteDirectoryRecursive if it's asynchronous
      await deleteDirectoryRecursive(
        user_id, 
        dirId, 
        directory.parentDirectory, 
        session
      );
  }
  await session.commitTransaction();

  } catch (error) {
    session.abortTransaction();
    throw error;
  } finally { 
    session.endSession();
  }


});

const forgotPassword = asyncHandler(async (req,res)=>{
  const user_id = req.user
  const session = await mongoose.startSession();
  session.startTransaction()
  
  try {
    
    const _id = req.user;

    const {password} = req.body;
  
    const userExist = await User.findById(_id)

    if(!userExist) throw new BadRequest('No such user');

    const hashedPassword = await bcryptjs.hash(password, 10);
    await User.findBydIdAndUpdate(_id,{password:hashedPassword},{session})

    const updateInfo = {message:'Update was successful'}

    await session.commitTransaction();

    res.status(StatusCodes.OK).json(updateInfo)

  } catch (error) {
    session.abortTransaction();
    throw error;
  } finally {
    session.endSession();

  }
       
});

const sendRecoveryLink = asyncHandler(async(req,res)=>{
    
});

module.exports = {
    getAll,
    loginUser,
    registerUser,
    deleteUSer,
    forgotPassword,
    sendRecoveryLink
}