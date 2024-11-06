const mongoose = require('mongoose');
const { hashedPassword } = require('../authentication/hashPassword');
const Student = require('../../models/student');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');

 const privateStudentDir = asyncHandler(async ({excelFile, parentDirectory,session}) => {
    let privateStudent = [];

    try {
        for (const { studentNumber, indexNumber, studentName } of excelFile) {
            if (!indexNumber && !studentNumber && !studentName) {
                continue;
            }
            // Create student object
            const newStudentObject =  {
                studentName: studentName.split(' ')[1],
                indexNumber: await hashedPassword(indexNumber.toString()),        
                studentNumber: studentNumber.toString(),
                reference_Id : uuidv4(),                          
                studentLink: parentDirectory            
            }

            const newStudent = await Student.create([newStudentObject], { session });      

            privateStudent.push(newStudent);
        }

        await session.commitTransaction();

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});


module.exports = privateStudentDir;