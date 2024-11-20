const { sendEmaiToRecipient } = require("../../utils/nodemailerConfiguration");
const { User, mongoose, asyncHandler, StatusCodes, BadRequest } = require("./configurations");

module.exports.sendEmailForVerification = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email } = req.body;

    if (!email) throw new BadRequest('Please provide an email');

    const userExist = await User.findOne({ email });
    if (!userExist) throw new BadRequest('No such user');

    const url = [
        'https://student-rep.vercel.app',
        'http://localhost:3000'
    ]

    const verification = {
      username: userExist.username,
      to: [userExist.email],
      subject: 'Student Rep Email Verification',
      verificationLink: `${url[0]}/${userExist.reference_Id}/update-password/`,
    };

    await sendEmaiToRecipient(verification); 

    await session.commitTransaction();

    res.status(StatusCodes.OK).send({ message: 'Email sent successfully!' });

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});
