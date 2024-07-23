
const Directory = require('../../models/directory.model')
module.exports.createDirectory = async ({
    name,
    user_id,
    parentDirectory,
    session,
    directoryExist,
    mimetype,
}) => {
        // Create a new directory
        console.log(name, user_id, parentDirectory)
        const directoryData = { name, user_id, parentDirectory };

        if(mimetype){
            directoryData.mimetype = mimetype;
        }
        const newDirectory = await Directory.create([directoryData], { session });

        // Update the existing directory
        if(directoryExist){
            directoryExist.subDirectories.push(newDirectory[0]._id);
            await directoryExist.save({ session });
        }

      return newDirectory;

}
