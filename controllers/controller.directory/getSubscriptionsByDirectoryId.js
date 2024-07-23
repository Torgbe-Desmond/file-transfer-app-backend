const {
    expressAsyncHandler,
    Directory,
    StatusCodes,
} = require('./configurations');


module.exports.getSubscriptionsByDirectoryId = expressAsyncHandler(async (req,res)=>{ 
    
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