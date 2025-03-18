const Directory = require("../domains/directory/model");
const { default: mongoose } = require("mongoose");

async function getBreadCrumbTree(
  directoryId,
  listOfDirectories = [],
  order = 0
) {
  if (!mongoose.isValidObjectId(directoryId)) {
    return listOfDirectories;
  }

  const currentDirectory = await Directory.findById(directoryId)
    .select("name")
    .select("_id")
    .select("parentDirectory")
    .lean();

  if (!currentDirectory) {
    return listOfDirectories;
  }

  listOfDirectories.push({
    name: currentDirectory.name,
    directoryId: currentDirectory._id.toString(),
    order,
  });

  return await getBreadCrumbTree(
    currentDirectory.parentDirectory,
    listOfDirectories,
    (order = order + 1)
  );
}

module.exports = getBreadCrumbTree;
