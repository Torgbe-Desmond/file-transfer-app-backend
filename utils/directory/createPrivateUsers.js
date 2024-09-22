const mongoose = require('mongoose');
const { hashedPassword } = require('../authentication/hashPassword');
const Student = require('../../models/student');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');

module.exports.createPrivateStudent = asyncHandler(async (excelFile, parentDirectory, courses, session) => {
    let privateStudent = [];
    let transactionSession;

    try {
        // Start a new session
        transactionSession = await mongoose.startSession();
        // Start a transaction within the session
        transactionSession.startTransaction();

        for (const { studentNumber, indexNumber, studentName } of excelFile) {
            // Skip iteration if all fields are missing
            if (!indexNumber && !studentNumber && !studentName) {
                continue;
            }

            // Ensure indexNumber is a string
            const indexNumberStr = indexNumber.toString();
            // Hash the index number
            const hashedIndexNumber = await hashedPassword(indexNumberStr);
            // Generate a unique reference ID
            const reference_Id = uuidv4();

            // Create a new student document within the transaction
            const newStudent = await Student.create([{
                studentName: studentName.split(' ')[1], // Process and set the studentName
                indexNumber: hashedIndexNumber,         // Set the hashed index number
                studentNumber: studentNumber.toString(),// Ensure studentNumber is a string
                reference_Id,                           // Set the unique reference ID
                studentLink: parentDirectory            // Link the student to the parent directory
            }], { session: transactionSession });       // Use the transaction session for this operation

            privateStudent.push(newStudent);
        }

        // Commit the transaction
        await transactionSession.commitTransaction();
        // End the session
        transactionSession.endSession();

        console.log('privateStudent', privateStudent);
        // return privateStudent;

    } catch (error) {
        // Abort the transaction in case of error
        await transactionSession.abortTransaction();
        throw error;
    } finally {
        transactionSession.endSession();
    }
});
