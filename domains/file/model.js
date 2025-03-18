// const {mongoose} = require("../../globalLibraries/globalLibraries");
const { default: mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const fileSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, default: "fileUrl" },
  directoryId: { type: String, required: true, ref: "Directory" },
  user_id: { type: String, required: true },
  mimetype: { type: String, default: "File" },
  lastUpdated: { type: Date, default: Date.now },
  size: { type: Number, default: 0 },
  shared: { type: Boolean, default: false },
  status: { type: Boolean, default: false },
});

module.exports = mongoose.model("File", fileSchema);
