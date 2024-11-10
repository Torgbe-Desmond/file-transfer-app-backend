const { Worker } = require('worker_threads');
const path = require('path');
const { io, getUserSocket } = require('../../socket/socket');
const { File } = require('../../controllers/file/configurations');

async function handleFileUploadWorker(userId, file) {
  const worker = new Worker(path.resolve(__dirname, 'fileUploadWorker.js'), {
    workerData: { userId, file },
  });

  // Helper function to emit socket events safely
  function emitToUser(userId, event, data) {
    const userSocket = getUserSocket(userId);
    if (userSocket) {
      io.to(userSocket).emit(event, data);
    } else {
      console.warn(`No active socket for user ${userId}`);
    }
  }

  worker.on('message', async (result) => {
    if (result.success) {
      const fileUrl = result.url;

      try {
        const fileRecord = await File.findOneAndUpdate(
          { name: file.originalname, user_id: userId },
          { url: fileUrl.toString() },
          { new: true } 
        );

        if (!fileRecord) {
          console.error(`File not found for name: ${file.originalname} and user_id: ${userId}`);
          emitToUser(userId, 'fileUploadError', {
            name: file.originalname,
            message: 'Error: file record not found in the database.',
          });
          return;
        }
        // Notify client of successful upload
        emitToUser(userId, 'fileUploadComplete', {
          name: file.originalname,
          url: fileUrl,
          message: 'File uploaded successfully',
        });
      } catch (dbError) {
        console.error('Database update failed:', dbError);
        emitToUser(userId, 'fileUploadError', {
          name: file.originalname,
          message: 'Error updating file record in database.',
        });
      }
    } else {
      emitToUser(userId, 'fileUploadError', {
        name: file.originalname,
        message: `Error uploading file: ${result.error}`,
      });

      try {
        await File.findOneAndDelete({
          name: file.originalname,
          user_id: userId,
        });
      } catch (deleteError) {
        console.error('Failed to delete file record:', deleteError);
      }
    }
  });

  worker.on('error', (error) => {
    emitToUser(userId, 'fileUploadError', {
      name: file.originalname,
      message: `Worker error: ${error.message}`,
    });
  });

  worker.on('exit', (code) => {
    if (code !== 0) {
      emitToUser(userId, 'fileUploadError', {
        name: file.originalname,
        message: `Worker stopped with exit code ${code}`,
      });
    }
  });
}

module.exports = {
  handleFileUploadWorker,
};
