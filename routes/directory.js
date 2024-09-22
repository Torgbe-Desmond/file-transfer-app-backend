const router = require('express').Router()
const { deleteDirectory } = require('../controllers/directory/deleteDirectory')
const { getAdirectory } = require('../controllers/directory/getAdirectory')
const { getAllDirForMoving } = require('../controllers/directory/getAllDirForMoving')
const { getAllDirectories } = require('../controllers/directory/getAllDirectories')
const { getAllSubscrptions } = require('../controllers/directory/getAllSubscrptions')
const { moveDirectories } = require('../controllers/directory/moveDirectories')
const { renameDirectory } = require('../controllers/directory/renameDirectory')
const protectRoutes = require('../middleware/protectRoutes')
const { createDirectory } = require('../controllers/directory/createDirectory')
const { getStudentDirectory } = require('../controllers/directory/getStudentDirectory')
const { getStudentMainDirectory } = require('../controllers/directory/getStudentMainDirectory')
const studentProtectRoutes = require('../middleware/studentProtectRoute')


router.get('/:reference_Id/directories',protectRoutes,getAllDirectories)

router.get('/student/:reference_Id/directories',studentProtectRoutes,getStudentMainDirectory)

router.post('/:reference_Id/directories/:directoryId',protectRoutes,createDirectory)

router.get('/:reference_Id/directories/all',protectRoutes,getAllDirForMoving)

router.delete('/delete-directory',protectRoutes,deleteDirectory)

router.get('/:reference_Id/directories/:directoryId',protectRoutes,getAdirectory)

router.get('/student/:reference_Id/directories/:directoryId',studentProtectRoutes,getStudentDirectory)

router.post('/:reference_Id/moveDirectories',protectRoutes,moveDirectories )


router.post('/:reference_Id/renameDirectory',protectRoutes,renameDirectory)



module.exports = router;