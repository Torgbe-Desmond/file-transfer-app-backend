const mongoose = require('mongoose');
const { Schema } = mongoose;

const shareSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver:[{
        type: Schema.Types.ObjectId, ref: 'User'
    }],
    files: [{ type: Schema.Types.ObjectId, ref: 'File' }],
});


module.exports = mongoose.model('Share', shareSchema);


