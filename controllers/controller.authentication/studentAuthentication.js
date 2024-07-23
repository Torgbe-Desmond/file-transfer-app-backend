const mongoose = require('mongoose'); // Ensure mongoose is required
const { createDirectory: createNewDirectory } = require('../../utils/utils.directory/createDirectory');
const { 
  User, 
  bcryptjs, 
  NotFound, 
  generateAuthToken,
  asyncHandler,
  StatusCodes,
  Student,
  uuidv4,
  Courses,
  Directory
} = require("./auth.configurations");

module.exports.loginPrivateStudent = asyncHandler(async (req, res) => {
    let session;
    try {
        // Extract credentials from request body
        const { studentNumber, indexNumber } = req.body;
        console.log('studentNumber, indexNumber', studentNumber, indexNumber);

        // Find the student by studentNumber
        const studentExist = await Student.findOne({ studentNumber });
        console.log('studentExist', studentExist);

        // Check if the student exists and has a valid name
        if (!studentExist.studentName) {
            throw new NotFound('Invalid credentials');
        }

        // Verify the indexNumber with the hashed indexNumber stored in the database
        const validIndexNumber = await bcryptjs.compare(indexNumber, studentExist.indexNumber);
        console.log('validIndexNumber', validIndexNumber);

        // Check if the indexNumber is valid
        if (!validIndexNumber) {
            throw new NotFound('Invalid credentials');
        }

        // Start a session for transaction management
        session = await mongoose.startSession();
        session.startTransaction();

        // Check if directories exist for the user
        const studentDirectoriesExist = await Directory.findOne({ 
            user_id: studentExist.user_id,
            name:`${studentExist.studentName}'s room`
        }).session(session);

        // If no directories exist, create a new directory
        if (!studentDirectoriesExist) {
            const newDirectory = await Directory.create([{
                name: `${studentExist.studentName}'s room`,
                user_id: studentExist._id,
                parentDirectory: studentExist.reference_Id,
            }], { session });

            // Add the student link to the subDirectories
            newDirectory[0].subDirectories.push(studentExist.studentLink);
            await newDirectory[0].save({ session }); // Save the updated directory
        }

        // Commit the transaction
        await session.commitTransaction();

        // Generate an authentication token for the student
        const token = generateAuthToken(studentExist._id);

        // Respond with the token and student details
        res.status(StatusCodes.OK).json({
            token,
            reference_Id: studentExist.reference_Id,
            role: studentExist.role
        });

    } catch (error) {
        // Abort the transaction if an error occurs
        await session.abortTransaction();
        throw error;
        
    } finally {
        session.endSession();
    }
});
