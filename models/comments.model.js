const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
    user_id: { type:Schema.type.ObjectId, required: true, ref:'User' },
    folderId:{type:Schema.type.ObjectId,ref:'Directory'},
    comment:{type:String, required:true}
},{
    timestamps:true
}
);



module.exports = mongoose.model('Comment', commentSchema);



