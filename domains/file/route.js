const router = require("express").Router();
const multer = require("multer");
const createFile = require("./controllers/createFile");
const deleteFile = require("./controllers/deleteFile");
const getAllFiles = require("./controllers/getAllFiles");
const moveFiles = require("./controllers/moveFiles");
const downloadFile = require("./controllers/downloadFile");
const protectRoutes = require("../../middleware/protectRoutes");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/:reference_Id/directories/:directoryId/files",
  upload.array("files"),
  protectRoutes,
  createFile
);
router.delete("/delete-files", protectRoutes, deleteFile);
router.get("/:reference_Id/files", protectRoutes, getAllFiles);
router.post(
  "/:reference_Id/movefiles",
  protectRoutes,
  moveFiles,
);
router.get("/download/:fileId", protectRoutes, downloadFile);

module.exports = router;
