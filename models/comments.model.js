const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    folderId: { type: Schema.Types.ObjectId, ref: 'Directory' },
    comment: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);
