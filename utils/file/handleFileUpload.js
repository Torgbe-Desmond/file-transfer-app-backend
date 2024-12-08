const { Worker } = require('worker_threads');
const path = require('path');
const mongoose = require('mongoose');
const { File, Directory } = require('../../controllers/file/configurations');

async function handleFileUploadWorker(userId, file) {
  console.info('🔰 Starting upload process [0/5]');

  return new Promise(async (resolve, reject) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const worker = new Worker(path.resolve(__dirname, 'fileUploadWorker.js'), {
      workerData: { userId, file },
    });

    worker.on('message', async (result) => {
      if (result.success) {
        const fileUrl = result.url;

        try {
          const fileRecord = await File.findOneAndUpdate(
            { name: file.originalname, user_id: userId },
            { url: fileUrl.toString() },
            { new: true, session }
          );

          if (!fileRecord) {
            const err = `File not found for name: ${file.originalname} and user_id: ${userId}`;
            console.error(err);
            await session.abortTransaction();
            session.endSession();
            return reject({ process: 'Error', error: err, file: null });
          }

          await session.commitTransaction();
          session.endSession();

          const uploadedFile = {
            id: fileRecord._id,
            name: fileRecord.name,
            url: fileRecord.url,
          };

          resolve({
            process: 'Upload Complete',
            file: uploadedFile,
            error: null,
          });
        } catch (dbError) {
          const err = `Database update failed: ${dbError}`;
          console.error(err);
          await session.abortTransaction();
          session.endSession();
          reject({ process: 'Error', error: err, file: null });
        }
      } else {
        const err = `😢 File upload failed: ${result.error}`;
        console.error(err);

        try {
          const fileExist = await File.findOneAndDelete(
            { name: file.originalname, user_id: userId },
            { session }
          );

          if (fileExist) {
            const fileDirectory = await Directory.findById(fileExist.directoryId).session(session);
            if (fileDirectory) {
              fileDirectory.files.pull(fileExist._id);
              await fileDirectory.save({ session });
            }
          }

          await session.commitTransaction();
        } catch (deleteError) {
          const err = `Failed to delete file record: ${deleteError}`;
          console.error(err);
        } finally {
          await session.abortTransaction();
          session.endSession();
        }

        reject({ process: 'Error', error: err, file: null });
      }
    });

    worker.on('error', async (error) => {
      const err = `Worker encountered an error: ${error}`;
      console.error(err);

      try {
        const fileExist = await File.findOneAndDelete(
          { name: file.originalname, user_id: userId },
          { session }
        );

        if (fileExist) {
          const fileDirectory = await Directory.findById(fileExist.directoryId).session(session);
          if (fileDirectory) {
            fileDirectory.files.pull(fileExist._id);
            await fileDirectory.save({ session });
          }
        }

        await session.abortTransaction();
      } catch (deleteError) {
        console.error(`Failed to delete file record on worker error: ${deleteError}`);
      } finally {
        session.endSession();
      }

      reject({ process: 'Error', error: err, file: null });
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        const err = `Worker stopped with exit code ${code}`;
        console.error(err);
        reject({ process: 'Error', error: err, file: null });
      }
    });
  });
}

module.exports = {
  handleFileUploadWorker,
};
