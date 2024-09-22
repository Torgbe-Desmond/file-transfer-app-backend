const mongoose = require("mongoose");
const Student = require("../../models/student");
const { createPrivateStudent } = require("./createPrivateUsers");
const { createDirectory: createNewDirectory } = require('../../utils/directory/createDirectory');


module.exports.createSubscription = async ({
    name,
    session,
    Directory,
    user_id,
    parentDirectory,
    excelFile,
    courses,
    directoryExist
}) => {
        let room;
        if(excelFile){
             room = await createNewDirectory({
                name,
                user_id,
                parentDirectory,
                session,
                directoryExist,
                mimetype: 'Subscription',
            })

            createPrivateStudent(excelFile, room[0]._id, courses, session);

        } else {        

            room = await createNewDirectory({
                name,
                user_id,
                parentDirectory,
                session,
                directoryExist,
                mimetype: 'Subscription',
            })

        }
        
        return room;
}
