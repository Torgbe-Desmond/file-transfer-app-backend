const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
    originalname: { type: String, required: true },
    url: { type: String, required: true },
    directoryId: { type: String, required: true },
    user_id: { type: String, required: true },
    mimetype: { type: String, default: 'File' }, // Set default value to 'file'
    lastUpdated: { type: Date, default: Date.now }, // Adding lastUpdated field
    size: { type: Number, default: 0 } // Adding size field
});

module.exports = mongoose.model('File', fileSchema);
