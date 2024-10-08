const mongoose = require('mongoose');

const connectMongoDB = async (url) => {
    await mongoose.connect(url);
};

module.exports = {
    connectMongoDB,
};
