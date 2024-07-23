const router = require('express').Router()
const { deleteDirectory } = require('../controllers/controller.directory/deleteDirectory')
const { getAdirectory } = require('../controllers/controller.directory/getAdirectory')
const { getAllDirForMoving } = require('../controllers/controller.directory/getAllDirForMoving')
const { getAllDirectories } = require('../controllers/controller.directory/getAllDirectories')
const { getAllSubscrptions } = require('../controllers/controller.directory/getAllSubscrptions')
const { getSubscriptionsByDirectoryId } = require('../controllers/controller.directory/getSubscriptionsByDirectoryId')
const { moveDirectories } = require('../controllers/controller.directory/moveDirectories')
const { renameDirectory } = require('../controllers/controller.directory/renameDirectory')
const protectRoutes = require('../middleware/protectRoutes')
const { subscribeToSubscription } = require('../controllers/controller.directory/subscribeToSubscription')
const { createDirectory } = require('../controllers/controller.directory/createDirectory')
const { getStudentDirectory } = require('../controllers/controller.directory/getStudentDirectory')
const { getStudentMainDirectory } = require('../controllers/controller.directory/getStudentMainDirectory')
const { studentProtectRoutes } = require('../middleware/studentProtectRoute')


router.get('/:reference_Id/directories',protectRoutes,getAllDirectories)

router.get('/student/:reference_Id/directories',studentProtectRoutes,getStudentMainDirectory)

router.post('/:reference_Id/directories/:directoryId',protectRoutes,createDirectory)

router.get('/:reference_Id/directories/all',protectRoutes,getAllDirForMoving)

router.delete('/delete-directory',protectRoutes,deleteDirectory)

router.get('/:reference_Id/directories/:directoryId',protectRoutes,getAdirectory)

router.get('/student/:reference_Id/directories/:directoryId',studentProtectRoutes,getStudentDirectory)

router.post('/:reference_Id/moveDirectories',protectRoutes,moveDirectories )

router.get('/:reference_Id/sharing',protectRoutes,getAllSubscrptions)

router.get('/:reference_Id/sharing/:directoryId/sub',protectRoutes,getSubscriptionsByDirectoryId)

router.post('/:reference_Id/renameDirectory',protectRoutes,renameDirectory)

router.post('/subscribe',protectRoutes,subscribeToSubscription)

module.exports = router;