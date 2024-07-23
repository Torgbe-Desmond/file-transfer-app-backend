const {
    expressAsyncHandler,
    Directory,
    StatusCodes,
} = require('./configurations');


module.exports.getAllSubscrptions = expressAsyncHandler(async(req,res)=>{ 

    const allSubscriptions = await Directory.find({mimetype:'Subscription'})

    const filteredSubscriptions = allSubscriptions.filter((subscription) => {
        return subscription.isLinkedToGroup === 0;
    });
    
    res.status(StatusCodes.OK).json(filteredSubscriptions);

})
