const mongoose = require('mongoose');
const { Schema } = mongoose;

const SecreteSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    secrete: [{ type:String }],
});


module.exports = mongoose.model('Secrete', SecreteSchema);

