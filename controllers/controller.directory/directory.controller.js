const expressAsyncHandler = require("express-async-handler");
const Directory = require('../models/directory.model');
const { BadRequest, NotFound } = require("../Errors");
const { StatusCodes } = require("http-status-codes");
const mongoose = require('mongoose')
const payDesmondUtils = require("../utils");
const { deleteDirectoryRecursive } = require("../utils/deleteDirectoryRecursive");
const User = require('../models/user.model')
const List = require('../models/subscriptionListOfSubscription.model')
const UserSubscritpions = require('../models/subscriptionsOfUser.model')


const getAllDirForMoving = expressAsyncHandler(async (req, res) => {
    const { reference_Id: parentDirectory } = req.params;

    try {
        const directoriesOfUser = await Directory.find({parentDirectory});
        
        console.log('directoriesOfUser')

        let user_id = directoriesOfUser[0].user_id;
  
        let allDirectories = await Directory.find({user_id})

        let editedAllDirectories = allDirectories.reduce((acc,value)=>{
                const { _id,name,mimetype,subDirectories} = value;

                acc.push({ _id,name,mimetype,subDirectories})

                return acc;
        },[])

        res.status(StatusCodes.OK).json( editedAllDirectories );

    } catch (error) {
        console.error('Error retrieving directories:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to retrieve directories' });
    }
});


const getSubscriptionsByDirectoryId = expressAsyncHandler(async (req,res)=>{ 
    
    const {directoryId:parentDirectory} = req.params;

     try{
        const {user_id} = await Directory.findById(parentDirectory)

        const allSubscriptionsOfUser= await Directory.find({
            user_id,
            mimetype:'Subscription'
        })

        res.status(StatusCodes.OK).json(allSubscriptionsOfUser)

     }catch(error){
        throw error;
     }
   
})


const getAllDirectories = expressAsyncHandler(async (req,res)=>{ 

    const parentDirectory  = req.params.reference_Id;

    const allDirectories = await Directory.find({parentDirectory})


    const editedAllDirectories = allDirectories.map(({_id,parentDirectory,name,mimetype,size,lastUpdated,subDirectories,files})=>{
        let totalSize = (subDirectories.length + files.length) || 0;
        return {
            _id,
            parentDirectory,
            name,
            mimetype,
            size:totalSize,
            lastUpdated,
            subDirectories,
            files
        }
    })

    res.status(StatusCodes.OK).json(editedAllDirectories)
})

const getAllSubscrptions = expressAsyncHandler(async(req,res)=>{ 

    const allSubscriptions = await Directory.find({mimetype:'Subscription'})

    const filteredSubscriptions = allSubscriptions.filter((subscription) => {
        return subscription.isLinkedToGroup === 0;
    });
    
    res.status(StatusCodes.OK).json(filteredSubscriptions);

})


const getAdirectory = expressAsyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const parentDirectory = req.params.directoryId;
        
        const specificDirectoryExist = await Directory.find({ parentDirectory }).session(session);

        const directoryExist = await Directory.findOne({ parentDirectory }).session(session);

        const editedSpecificDirectoryExist = specificDirectoryExist.map((value) => {
        const { _id, parentDirectory, name, mimetype, size, lastUpdated, subDirectories, files } = value;
        
            // Calculate the total number of subDirectories and files
            let totalSize = (subDirectories.length + files.length) || 0;
        
            // Return a new object with the transformed properties
            return {
                _id,
                parentDirectory,
                name,
                mimetype,
                size: totalSize,
                lastUpdated,
                subDirectories,
                files
            };
        });

        session.commitTransaction()

        res.status(StatusCodes.OK).json(editedSpecificDirectoryExist);
        
    } catch (error) {
        await session.abortTransaction()
        throw error;
    } finally {
        session.endSession();
    }
});



const renameDirectory = expressAsyncHandler(async (req, res) => {
    const { _id, name } = req.body;
  
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const directoryExist = await Directory.findById(_id).session(session);
      if (!directoryExist) {
        throw new NotFound('No such directory found');
      }
  
      const nameExist = await Directory.findOne({ name }).session(session);
      if (nameExist && nameExist._id.toString() !== _id) {
        throw new BadRequest('Name already exists');
      }
  
      await Directory.findByIdAndUpdate(_id, { name }, { session });
  
      await session.commitTransaction();
  
      res.status(StatusCodes.OK).json({ message: 'Directory renamed successfully' });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  });
  


  /*
  function createDirectory(req, res) {
    const { user_id, body: { name, mimetype, privateNames } } = req;
    const parentDirectory = req.params.directoryId;

    start MongoDB session
    begin transaction

    try {
        check if parentDirectory exists in Database
        if not, throw NotFound error "Directory does not exist"

        check if directory with same name exists under parentDirectory
        if exists, throw BadRequest error "A directory with the specified name already exists"

        if mimetype exists:
            if privateNames exists and is not empty:
                create new Group
                create main directory with associated group
                add main directory to subDirectories of parentDirectory
                commit transaction

                for each username in privateNames:
                    find user by username
                    if not found, throw BadRequest error "The user {username} does not exist"

                    find user's 'Subscribed' folder
                    create new subscribed directory linked to created group
            else:
                create main directory without group association
                add main directory to subDirectories of parentDirectory
                commit transaction

        else:
            create directory without mimetype
            add directory to subDirectories of parentDirectory
            commit transaction

        format newDirectory to include _id, parentDirectory, name, mimetype, size, lastUpdated
        respond with status 201 Created and formatted newDirectory data

    } catch (error) {
        abort transaction
        throw error
    } finally {
        end MongoDB session
    }
}
  */

 const createDirectory = expressAsyncHandler(async (req, res) => {
    const { user: user_id, body: { name, privateNames } } = req;
    const parentDirectory = req.params.directoryId;
  
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {

      let newDirectory;

      const directoryExist = await Directory.findOne({ _id: parentDirectory }).session(session);
      if (!directoryExist) {
        throw new NotFound('Directory does not exist');
      }
  
      const existingDirectory = await Directory.findOne({ parentDirectory, name }).session(session);
      if (existingDirectory) {
        throw new BadRequest('A directory with the specified name already exists');
      }

      if(directoryExist.name === 'Subscriptions'){

        if(privateNames && privateNames.length > 0){

            const newPrivateGroup = await Group.create([{name}],{session})

            const directoryData = {  name , user_id , parentDirectory , mimetype:'Subscription' , isLinkedToGroup:newPrivateGroup[0]._id  }
            newDirectory = await Directory.create([directoryData], { session }); 
            directoryExist.subDirectories.push(newDirectory[0]._id);
            await directoryExist.save();
            await session.commitTransaction();
            

            for(const username of privateNames){
                const user = await User.findOne({username});
                if(!user) throw new BadRequest(`The user ${username} does not exist`);

                  const usersSubscribedFolder = await Directory.findOne({name:'Subscribed',user_id:user.user_id})
                  const editedName = `${name}_[s]`

                  const newSubscribedFolder = { 
                    name:editedName, 
                    mimetype:'Subscribed_v1', 
                    user_id:user.user_id, 
                    parentDirectory:usersSubscribedFolder._id,
                    subscribedToGroup:newPrivateGroup[0]._id
                  };

                await Directory.create([newSubscribedFolder], { session }); 

            }

        } else {

            
            const directoryData = {  name , user_id , parentDirectory , mimetype:'Subscription'  }
            newDirectory = await Directory.create([directoryData], { session }); 
            directoryExist.subDirectories.push(newDirectory[0]._id);
            await List.create([{subscriptionId:newDirectory[0]._id}],{session})
            await directoryExist.save();
            await session.commitTransaction();
        }
    
      } else {

          const directoryData = { name, user_id, parentDirectory };
          newDirectory = await Directory.create([directoryData], { session }); // Brings back anarray
          directoryExist.subDirectories.push(newDirectory[0]._id);
          await directoryExist.save();
          await session.commitTransaction();
    
      }

        const editedNewDirectory = newDirectory
          .map(({ _id, parentDirectory, name, mimetype, size, lastUpdated }) => ({
            _id,
            parentDirectory,
            name,
            mimetype,
            size,
            lastUpdated,
        }));

  
      res.status(StatusCodes.CREATED).json(editedNewDirectory);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  });
  



  const createDirectoryInMain = expressAsyncHandler(async (req, res) => {
    const { user: user_id } = req;
    const { reference_Id: parentDirectory } = req.params;

    const session = await mongoose.startSession();
    session.startTransaction();

    const defaultFolders = ["My Workspace","Downloads","Subscriptions","Subscribed","Downloads"];

    try {
        // Check if the user already has the default folders
        const existingDirectories = await Directory.find({ user_id })

        const defaultFoldersList = existingDirectories.filter(folder => defaultFolders.includes(folder.name));

        const isEqual = payDesmondUtils.checkIfTwoArraysAreEqual(defaultFolders, defaultFoldersList.map(folder => folder.name));

        if (!isEqual) {
            // Create the default folders for the user
            for (const folderName of defaultFolders) {
                const existingFolder = defaultFoldersList.find(folder => folder.name === folderName);
                if (!existingFolder) {
                    await Directory.create({ name: folderName, parentDirectory, user_id }, { session });
                }
            }
            res.status(StatusCodes.CREATED).send();
        } else {
            res.status(StatusCodes.OK).send();
        }

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});




//Delete Directory Middleware
const deleteDirectory = expressAsyncHandler(async (req, res) => {
    const { directoryId } = req.body;
    const { user: user_id } = req;

    const session = await mongoose.startSession();
    session.startTransaction();

    console.log('user_id', user_id);
    try {
        const deletedDirectories = [];

        for (const dirId of directoryId) {
            const directory = await Directory.findById(dirId).session(session);
            console.log('directory',directory)
            if (!directory) {
                // Directory doesn't exist, respond with an error
                // throw new NotFound(`Directory with ID ${dirId} not found.`);
                continue;
            }

            // Use await with deleteDirectoryRecursive if it's asynchronous
            await deleteDirectoryRecursive(user_id, dirId, directory.parentDirectory, session);
            deletedDirectories.push(dirId);
        }   

        await session.commitTransaction();
        res.status(StatusCodes.OK).json(deletedDirectories);
    } catch (error) {
        await session.abortTransaction();
        console.error(error); // Log the error for debugging
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred.' });
    } finally {
        session.endSession();
    }
});




const moveDirectories = expressAsyncHandler(async (req, res) => {

    const { directoriesToMove, directoryToMoveTo } = req.body;
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const parentDirectoryIds = directoriesToMove;

        for (const directoryId of directoryToMoveTo) {
            for (const parentDirectory of parentDirectoryIds) {
                await Directory.findOneAndUpdate({ _id:parentDirectory },{ parentDirectory: directoryId });
            }}

        const addingToSubDirectories = await Directory.findById({_id:directoryToMoveTo[0]})
        addingToSubDirectories.subDirectories.push(...directoriesToMove)
        await addingToSubDirectories.save()
        res.status(200).json({ message: 'Directories moved successfully' });
        
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }

});


const subscribeToSubscription = expressAsyncHandler(async (req, res) => {
    const { subscriptionIds } = req.body;
    const userId = req.user;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        for (const subscriptionId of subscriptionIds) {
            // Use findOneAndUpdate to perform atomic operations on MongoDB
            const checkSubscriptionList = await List.findOneAndUpdate(
                { subscriptionId },
                { $addToSet: { subscribedUsers: userId } }, // $addToSet ensures uniqueness
                { new: true, session, upsert: true }
            );

            const userSubscriptions = await UserSubscritpions.findOneAndUpdate(
                { userId },
                { $addToSet: { allSubscriptions: subscriptionId } }, // $addToSet ensures uniqueness
                { new: true, session, upsert: true }
            );

            // Determine if user was added or removed from subscribedUsers
            const userAdded = checkSubscriptionList.subscribedUsers.includes(userId);

            // Handle directory creation or deletion based on subscription status
            if (userAdded) {
                const newSubscribedFolder = {
                    name: `${checkSubscriptionList.name}_[s]`,
                    mimetype: 'Subscribed_v1',
                    user_id: userId,
                    parentDirectory: checkSubscriptionList._id,
                };

                await Directory.create([newSubscribedFolder], { session });
            }

            await checkSubscriptionList.save();
            await userSubscriptions.save();
        }

        // Fetch all subscriptions after processing
        const allUserSubscriptions = await UserSubscritpions.find({ userId });

        await session.commitTransaction();
        session.endSession();

        res.status(StatusCodes.OK).json(allUserSubscriptions);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});




module.exports= {
    createDirectory,
    getAllDirectories,
    createDirectoryInMain,
    deleteDirectory,
    getAdirectory,
    moveDirectories,
    getAllDirForMoving,
    getAllSubscrptions,
    renameDirectory,
    getSubscriptionsByDirectoryId,
    subscribeToSubscription
    
}