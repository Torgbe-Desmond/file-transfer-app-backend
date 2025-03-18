const expressAsyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const Directory = require("../model");
const {
  combinedFilesAndDirectories,
} = require("../../../utils/combinedFilesAndDirectories");
const NotFound = require("../../../Errors/Notfound");
const SuccessResponse = require("../../../utils/SuccessResponse");
const getBreadCrumbTree = require("../../../utils/getBreadCrumbTree");

const getAdirectory = expressAsyncHandler(async (req, res) => {
  try {
    const _id = req.params.directoryId;

    const directories = await Directory.findOne({ _id })
      .populate("subDirectories")
      .populate("files")
      .lean()
      .exec();

    if (!directories) {
      throw new NotFound("Directory not found", true);
    }

    // const directoryTree = await getBreadCrumbTree(req.params.directoryId);
    // console.log("directoryTree", directoryTree);

    const data = combinedFilesAndDirectories(directories);

    const responsObject = new SuccessResponse(true, null, data);

    res.status(StatusCodes.OK).json(responsObject);
  } catch (error) {
    throw error;
  }
});

module.exports = getAdirectory;
