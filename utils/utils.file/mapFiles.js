module.exports.transformFileData =(files)=>{
    return files.map(file => ({
      _id: file._id,
      name: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      lastUpdated: file.lastUpdated,
      directoryId: file.directoryId,
      url: file.url,
      user_id: file.user_id
    }));
  }