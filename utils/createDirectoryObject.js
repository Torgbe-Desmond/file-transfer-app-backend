function CreateDirectoryObject(
  randomString = null,
  name,
  user,
  _id,
  files = [],
  mimetype = null
) {
  this.name = name;
  this.user_id = user;
  this.parentDirectory = _id;
  this.files = files;
  this.mimetype = mimetype;
  this.secreteCode = randomString;
}

module.exports = CreateDirectoryObject;
