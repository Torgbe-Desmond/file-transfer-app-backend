const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define user schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    reference_Id: { type: String , required: true },
    role:{ type: String , default: 'Representation' },
});


const User = mongoose.model('User', userSchema);

module.exports = User;
