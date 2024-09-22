const mongoose = require('mongoose');
const { Schema } = mongoose;

const subscriptionList = new Schema({
    subscriptionId: {type: Schema.Types.ObjectId, ref: 'Directory' },
    subscribedUsers:[{ type: Schema.Types.ObjectId, ref: 'User' }],
},{
    timestamps:true
});

module.exports = mongoose.model('List', subscriptionList);
