const {
    expressAsyncHandler,
    Directory,
    StatusCodes,
    mongoose,
    List,
    UserSubscritpions,
} = require('./configurations');



module.exports.subscribeToSubscription = expressAsyncHandler(async (req, res) => {
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