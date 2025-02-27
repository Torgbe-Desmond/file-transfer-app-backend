function CreateFileObject(
  file,
  user_id,
  fileUrl = null,
  directoryId,
  size = null,
  shared = null,
) {
  this.name = file.originalname;
  this.mimetype = file.mimetype;
  this.shared = shared;
  this.size = file.size;
  this.directoryId = directoryId;
  this.user_id = user_id;
  this.url = fileUrl || file.url;
  this.size = size || file.url;
  this.shared = shared
}

module.exports = CreateFileObject;
