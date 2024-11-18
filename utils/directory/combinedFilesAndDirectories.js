module.exports.combinedFilesAndDirectories = ({ data }) => {
  
    let combinedFilesAndDirectories = [];
  
    const specificDirectoryExist = data?.subDirectories?.map((value) => {
      const { _id, parentDirectory, name, mimetype, size, lastUpdated, subDirectories, files, privateDirectory,secreteCode } = value;
  
      let totalSize = (subDirectories?.length || 0) + (files?.length || 0);
  
      return {
        _id,
        parentDirectory,
        privateDirectory,
        name,
        mimetype,
        size: totalSize,
        lastUpdated,
        subDirectories,
        files,
        secreteCode
      };
    }) || [];
  
    const specificFilesExist = data?.files?.map((value) => {
      const { _id, directoryId, name, mimetype,shared, url, size, user_id, lastUpdated } = value;
  
      return {
        _id,
        parentDirectory: directoryId,
        name,
        url,
        mimetype,
        size,
        user_id,
        shared,
        lastUpdated
      };
    }) || [];
    
    combinedFilesAndDirectories = [...specificFilesExist, ...specificDirectoryExist];

  
    return combinedFilesAndDirectories;
  }
  