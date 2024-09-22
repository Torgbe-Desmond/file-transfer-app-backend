const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSubscriptionsSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User' },
    allSubscriptions:[{ type: Schema.Types.ObjectId, ref: 'Directory' }],
},{
    timestamps:true
});

module.exports = mongoose.model('UserSubscritpions', userSubscriptionsSchema);
