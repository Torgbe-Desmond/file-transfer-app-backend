const protectRoutes = require("../../middleware/protectRoutes");
const createDirectory = require("./controllers/createDirectory");
const deleteDirectory = require("./controllers/deleteDirectory");
const getAdirectory = require("./controllers/getAdirectory");
const getAllDirectories = require("./controllers/getAllDirectories");
const getAllDirForMoving = require("./controllers/getAllDirForMoving");
const getBreadCrumb = require("./controllers/handleBreadCrumb");
const moveDirectories = require("./controllers/moveDirectories");
const receiveSharedFiles = require("./controllers/receiveSharedFiles");
const renameDirectory = require("./controllers/renameDirectory");
const shareDirectory = require("./controllers/shareDirectory");

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

// breadcrumb route
router.get(
  "/:reference_Id/bread-crumb/:directoryId",
  protectRoutes,
  getBreadCrumb
);

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
