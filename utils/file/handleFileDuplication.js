const { Worker } = require('worker_threads');
const path = require('path');
const { File, Directory } = require('../../controllers/file/configurations');
const mongoose = require('mongoose');

async function handleFileDuplication({ userId, filename, fileId }) {
    console.log('Starting file duplication process');
    const session = await mongoose.startSession();
    session.startTransaction();

    let transactionCommitted = false;

    try {
        const worker = new Worker(path.resolve(__dirname, 'uploadFileToGroupWorker.js'), {
            workerData: { userId: userId.toString(), filename, fileId },
        });

        worker.on('message', async (result) => {
            if (result.success) {
                try {
                    const fileUrl = result.url;
                    await File.findOneAndUpdate(
                        { _id: fileId, name: filename, user_id: userId },
                        { url: fileUrl.toString() },
                        { new: true, session }
                    );

                    await session.commitTransaction();
                    transactionCommitted = true;
                    console.log('Transaction committed successfully');

                } catch (error) {
                    console.error('Error in transaction update:', error);

                    const file = await File.findOneAndDelete({ _id: fileId, name: filename, user_id: userId }, { session });
                    const fileDirectory = await Directory.findById(file.directoryId).session(session);
                    if (fileDirectory) {
                        fileDirectory.files.pull(fileId);
                        await fileDirectory.save({ session });
                    }

                    await session.abortTransaction();
                    console.error('Transaction aborted due to error');
                } finally {
                    session.endSession();
                }
            } else {
                await session.abortTransaction();
                console.error('Worker reported failure:', result.error);
                session.endSession();
            }
        });

        worker.on('error', async (error) => {
            console.error('Worker encountered an error:', error);
            if (!transactionCommitted) {
                await session.abortTransaction();
            }
            session.endSession();
        });

        worker.on('exit', async (code) => {
            if (code !== 0 && !transactionCommitted) {
                console.error(`Worker exited with code ${code}. Aborting transaction.`);
                await session.abortTransaction();
                session.endSession();
            }
        });

    } catch (error) {
        console.error('Error during file duplication process:', error);
        if (!transactionCommitted) {
            await session.abortTransaction();
        }
        session.endSession();
        throw error;
    }
}

module.exports = {
    handleFileDuplication,
};
