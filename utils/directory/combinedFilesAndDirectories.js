module.exports.combinedFilesAndDirectories = ({ data }) => {
  
    let combinedFilesAndDirectories = [];
  
    const specificDirectoryExist = data?.subDirectories?.map((value) => {
      const { _id, parentDirectory, name, mimetype, size, lastUpdated, subDirectories, files, privateDirectory } = value;
  
      // Calculate the total number of subDirectories and files
      let totalSize = (subDirectories?.length || 0) + (files?.length || 0);
  
      // Return a new object with the transformed properties
      return {
        _id,
        parentDirectory,
        privateDirectory,
        name,
        mimetype,
        size: totalSize,
        lastUpdated,
        subDirectories,
        files
      };
    }) || [];
  
    const specificFilesExist = data?.files?.map((value) => {
      const { _id, directoryId, originalname, mimetype, url, size, user_id, lastUpdated } = value;
  
      return {
        _id,
        parentDirectory: directoryId,
        name: originalname,
        url,
        mimetype,
        size,
        user_id,
        lastUpdated
      };
    }) || [];
    
    combinedFilesAndDirectories = [...specificFilesExist, ...specificDirectoryExist];
  
    return combinedFilesAndDirectories;
  }
  