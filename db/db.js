const mongoose = require('mongoose');

const connectMongoDB = async (url) => {
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 5000,
    });
};

module.exports = { connectMongoDB };
