const mongoose = require('mongoose');
const { Schema } = mongoose;

const courseSchema = new Schema({
    parentDirectory: {
        type: Schema.Types.ObjectId,
        ref: 'Directory',
        required: true
    },
    courses: {
        type: [String],
        required: true
    },
    students: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Student' 
    }],
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Indexing for frequently queried fields
courseSchema.index({ parentDirectory: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
