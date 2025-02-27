const protectRoutes = require("../../middleware/protectRoutes");
const createDirectory = require("./controllers/createDirectory");
const deleteDirectory = require("./controllers/deleteDirectory");
const getAdirectory = require("./controllers/getAdirectory");
const getAllDirectories = require("./controllers/getAllDirectories");
const getAllDirForMoving = require("./controllers/getAllDirForMoving");
const moveDirectories = require("./controllers/moveDirectories");
const receiveSharedFiles = require("./controllers/receiveSharedFiles");
const renameDirectory = require("./controllers/renameDirectory");
const shareDirectory = require("./controllers/shareDirectory");

// console.log("✅ protectRoutes middleware loaded:", protectRoutes);
// console.log("✅ createDirectory controller loaded:", createDirectory);
// console.log("✅ deleteDirectory controller loaded:", deleteDirectory);
// console.log("✅ getAdirectory controller loaded:", getAdirectory);
// console.log("✅ getAllDirectories controller loaded:", getAllDirectories);
// console.log("✅ getAllDirForMoving controller loaded:", getAllDirForMoving);
// console.log("✅ moveDirectories controller loaded:", moveDirectories);
// console.log("✅ receiveSharedFiles controller loaded:", receiveSharedFiles);
// console.log("✅ renameDirectory controller loaded:", renameDirectory);
// console.log("✅ shareDirectory controller loaded:", shareDirectory);

const express = require("express");
const router = express.Router();

// get all directories route
router.get("/:reference_Id/directories", protectRoutes, getAllDirectories);

// create directory route
router.post(
  "/:reference_Id/directories/:directoryId",
  protectRoutes,
  createDirectory
);

// get list of directories for moving route
router.get("/:reference_Id/directories/all", protectRoutes, getAllDirForMoving);

// delete directory route
router.delete("/delete-directory", protectRoutes, deleteDirectory);

// fetch a particular directory route
router.get(
  "/:reference_Id/directories/:directoryId",
  protectRoutes,
  getAdirectory
);

// move directories route
router.post("/:reference_Id/moveDirectories", protectRoutes, moveDirectories);

// rename directory route
router.post("/:reference_Id/renameDirectory", protectRoutes, renameDirectory);

// receive shared files route
router.post("/:reference_Id/share", protectRoutes, receiveSharedFiles);

// share directory route
router.post("/:reference_Id/share/files", protectRoutes, shareDirectory);

module.exports = router;
