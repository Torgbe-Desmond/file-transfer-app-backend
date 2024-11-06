const { Directory, mongoose, asyncHandler, deleteDirectoryRecursive } = require('./auth.configurations');

// Function to delete a user, wrapped with asyncHandler to handle async errors
 const deleteUser = asyncHandler(async (req, res) => {
  const user_id = req.user;  // Get the user's ID from the request

  // Start a new session for transactions
  const session = await mongoose.startSession();
  session.startTransaction();  // Begin the transaction

  try {
    // Define the main directories for the user that should be deleted
    const mainDirectories = ["Home", "Subscriptions"];

    let idsOfMainDirectories = [];

    // Fetch the IDs of the main directories ('Home' and 'Subscriptions') for the user
    for (const folderNames of mainDirectories) {
      const folder = await Directory.findOne({ user_id, name: folderNames });
      idsOfMainDirectories.push(folder._id);  // Push the found folder's ID to the array
    }

    // Loop through the fetched main directory IDs to delete them
    for (const dirId of idsOfMainDirectories) {
      const directory = await Directory.findById(dirId).session(session);  // Fetch directory within the session

      // If directory is not found, skip to the next directory
      if (!directory) {
        // Directory doesn't exist, continue to next iteration
        continue;
      }

      // Delete the directory recursively, passing the user ID, directory ID, parent directory, and session
      await deleteDirectoryRecursive(user_id, dirId, directory.parentDirectory, session);
    }

    // If everything goes well, commit the transaction
    await session.commitTransaction();
  } catch (error) {
    // If any error occurs, abort the transaction
    session.abortTransaction();
    throw error;  // Re-throw the error to be handled by asyncHandler
  } finally {
    // End the session, whether successful or failed
    session.endSession();
  }
});


module.exports = deleteUser