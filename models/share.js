const mongoose = require('mongoose');
const { Schema } = mongoose;

const shareSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    secretCode:{type:String},
    files: [{ type: Schema.Types.ObjectId, ref: 'File' }],
});


module.exports = mongoose.model('Share', shareSchema);


