const {
    expressAsyncHandler,
    Directory,
    StatusCodes,
} = require('./configurations');


module.exports.getAllDirForMoving = expressAsyncHandler(async (req, res) => {
    const parentDirectory = req.params.reference_Id;

    console.log('reference_Id',parentDirectory)

    try {
        const directoriesOfUser = await Directory.find({parentDirectory});
        
        let user_id = directoriesOfUser[0].user_id;
  
        let allDirectories = await Directory.find({user_id})

        let editedAllDirectories = allDirectories.reduce((acc,value)=>{
                const { _id,name,mimetype,subDirectories} = value;

                acc.push({ _id,name,mimetype,subDirectories})

                return acc;
        },[])

        res.status(StatusCodes.OK).json( editedAllDirectories );

    } catch (error) {
        throw error;
    }
});