const mongoose = require('mongoose');
const { hashedPassword } = require('../authentication/hashPassword');
const Student = require('../../models/student');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');

module.exports.createPrivateStudent = asyncHandler(async ({excelFile, parentDirectory,session}) => {
    let privateStudent = [];

    try {
        for (const { studentNumber, indexNumber, studentName } of excelFile) {
            if (!indexNumber && !studentNumber && !studentName) {
                continue;
            }

            const indexNumberStr = indexNumber.toString();
            const hashedIndexNumber = await hashedPassword(indexNumberStr);
            const reference_Id = uuidv4();

            const newStudent = await Student.create([{
                studentName: studentName.split(' ')[1],
                indexNumber: hashedIndexNumber,        
                studentNumber: studentNumber.toString(),
                reference_Id,                          
                studentLink: parentDirectory            
            }], { session: transactionSession });      

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
