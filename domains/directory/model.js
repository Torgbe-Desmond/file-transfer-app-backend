const { default: mongoose } = require("mongoose");
const { Schema } = mongoose;

const directorySchema = new Schema(
  {
    name: { type: String, default: "main", required: true },
    parentDirectory: { type: String, default: "main" },
    files: [{ type: Schema.Types.ObjectId, ref: "File" }],
    subDirectories: [{ type: Schema.Types.ObjectId, ref: "Directory" }],
    mimetype: { type: String, default: "Folder" },
    user_id: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now },
    size: { type: Number, default: 0 },
    status: { type: Boolean, default: false },
    secreteCode: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Directory", directorySchema);
