const expressAsyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const SuccessResponse = require("../../../utils/SuccessResponse");
const getBreadCrumbTree = require("../../../utils/getBreadCrumbTree");

const getBreadCrumb = expressAsyncHandler(async (req, res) => {
  try {
    const breadCrumbs = await getBreadCrumbTree(req.params.directoryId);
    const sortedBreadCrumbs = breadCrumbs.sort((a, b) => b.order - a.order)
    const responsObject = new SuccessResponse(true, null, sortedBreadCrumbs);
    res.status(StatusCodes.OK).json(responsObject);
  } catch (error) {
    throw error;
  }
});

module.exports = getBreadCrumb;
