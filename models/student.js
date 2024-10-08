const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentSchema = new Schema({
  studentName: { type: String, required: true },
  indexNumber: { type: String, required: true, unique: true },
  studentNumber: { type: String, required: true },
  reference_Id: { type: String, required: true },
  studentLink: {type:Schema.Types.ObjectId, ref:'Directory',required:true},
  interfaceId:{type:Schema.Types.ObjectId, ref:'PrivateInterface'},
  role:{ type: String , default: 'Student' },
}, {
  timestamps: true 
});

studentSchema.index({ studentName: 1 });
studentSchema.index({ referenceId: 1 });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
