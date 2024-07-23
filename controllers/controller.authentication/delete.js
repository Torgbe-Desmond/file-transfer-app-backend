const { Directory, mongoose,asyncHandler ,StatusCodes} = require('./auth.configurations')

module.exports.deleteUSer = asyncHandler(async(req,res)=>{
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