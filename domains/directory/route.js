const protectRoutes = require("../../middleware/protectRoutes");
const { createDirectory } = require("./controllers/createDirectory");
const { deleteDirectory } = require("./controllers/deleteDirectory");
const { getAdirectory } = require("./controllers/getAdirectory");
const { getAllDirectories } = require("./controllers/getAllDirectories");
const { getAllDirForMoving } = require("./controllers/getAllDirForMoving");
const { moveDirectories } = require("./controllers/moveDirectories");
const { receiveSharedFiles } = require("./controllers/receiveSharedFiles");
const { renameDirectory } = require("./controllers/renameDirectory");
const { shareDirectory } = require("./controllers/shareDirectory");

const router = require("express").Router();

router.get("/:reference_Id/directories", protectRoutes, getAllDirectories);

router.post(
  "/:reference_Id/directories/:directoryId",
  protectRoutes,
  createDirectory
);

router.get("/:reference_Id/directories/all", protectRoutes, getAllDirForMoving);

router.delete("/delete-directory", protectRoutes, deleteDirectory);

router.get(
  "/:reference_Id/directories/:directoryId",
  protectRoutes,
  getAdirectory
);

router.post("/:reference_Id/moveDirectories", protectRoutes, moveDirectories);

router.post("/:reference_Id/renameDirectory", protectRoutes, renameDirectory);

router.post("/:reference_Id/share", protectRoutes, receiveSharedFiles);

router.post("/:reference_Id/share/files", protectRoutes, shareDirectory);

module.exports = router;
