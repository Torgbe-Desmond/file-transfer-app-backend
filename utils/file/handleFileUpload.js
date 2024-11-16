const { Worker } = require('worker_threads');
const path = require('path');
const mongoose = require('mongoose');
const { File, Directory } = require('../../controllers/file/configurations');

async function handleFileUploadWorker(userId, file) {
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
          console.error(`File not found for name: ${file.originalname} and user_id: ${userId}`);
          await session.abortTransaction();
          return;
        }

        console.log(`File upload complete: ${fileUrl}`);
        await session.commitTransaction(); 

      } catch (dbError) {
        console.error('Database update failed:', dbError);
        await session.abortTransaction(); 
      } finally {
        session.endSession(); 
      }

    } else {
      console.error(`File upload failed: ${result.error}`);

      try {
        const file = await File.findOneAndDelete(
          { name: file.originalname, user_id: userId },
          { session }
        );

        if (file) {
          const fileDirectory = await Directory.findById(file.directoryId).session(session);
          if (fileDirectory) {
            fileDirectory.files.pull(file._id);
            await fileDirectory.save({ session });
          }
        }

        await session.commitTransaction(); 

      } catch (deleteError) {
        console.error('Failed to delete file record:', deleteError);
        await session.abortTransaction(); 
      } finally {
        session.endSession();
      }
    }
  });

  worker.on('error', async (error) => {
    console.error('Worker encountered an error:', error);

    try {

      const file = await File.findOneAndDelete(
        { name: file.originalname, user_id: userId },
        { session }
      );

      if (file) {
        const fileDirectory = await Directory.findById(file.directoryId).session(session);
        if (fileDirectory) {
          fileDirectory.files.pull(file._id);
          await fileDirectory.save({ session });
        }
      }

      await session.abortTransaction(); 

    } catch (deleteError) {
      console.error('Failed to delete file record on worker error:', deleteError);
    } finally {
      session.endSession(); 
    }
  });

  worker.on('exit', async (code) => {
    if (code !== 0) {
      console.error(`Worker stopped with exit code ${code}`);

      try {
        const file = await File.findOneAndDelete(
          { name: file.originalname, user_id: userId },
          { session }
        );

        if (file) {
          const fileDirectory = await Directory.findById(file.directoryId).session(session);
          if (fileDirectory) {
            fileDirectory.files.pull(file._id);
            await fileDirectory.save({ session });
          }
        }

        await session.abortTransaction();

      } catch (deleteError) {
        console.error('Failed to delete file record on worker exit:', deleteError);
      } finally {
        session.endSession(); 
      }
    }
  });
}

module.exports = {
  handleFileUploadWorker,
};
