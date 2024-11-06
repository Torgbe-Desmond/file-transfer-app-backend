const mongoose = require("mongoose");
const Student = require("../../models/student");
const { createPrivateStudent } = require("./createPrivateUsers");
const { createDirectory: createNewDirectory } = require('../../utils/directory/createDirectory');


module.exports.createSubscription = async ({
    name,
    session,
    user_id,
    parentDirectory,
    excelFile,
    directoryExist,
    session
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

            createPrivateStudent({excelFile,parentDirectory:room[0]._id});

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
