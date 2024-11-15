const router = require('express').Router()
const { deleteDirectory } = require('../controllers/directory/deleteDirectory')
const { getAdirectory } = require('../controllers/directory/getAdirectory')
const { getAllDirForMoving } = require('../controllers/directory/getAllDirForMoving')
const { getAllDirectories } = require('../controllers/directory/getAllDirectories')
const { moveDirectories } = require('../controllers/directory/moveDirectories')
const { renameDirectory } = require('../controllers/directory/renameDirectory')
const protectRoutes = require('../middleware/protectRoutes')
const { createDirectory } = require('../controllers/directory/createDirectory')
const { shareDirectory } = require('../controllers/directory/shareDirectory')
const { receiveSharedFiles } = require('../controllers/directory/receiveSharedFiles')


router.get('/:reference_Id/directories',protectRoutes,getAllDirectories)

router.post('/:reference_Id/directories/:directoryId',protectRoutes,createDirectory)

router.get('/:reference_Id/directories/all',protectRoutes,getAllDirForMoving)

router.delete('/delete-directory',protectRoutes,deleteDirectory)

router.get('/:reference_Id/directories/:directoryId',protectRoutes,getAdirectory)

router.post('/:reference_Id/moveDirectories',protectRoutes,moveDirectories )

router.post('/:reference_Id/renameDirectory',protectRoutes,renameDirectory)

router.post('/:reference_Id/share',protectRoutes,receiveSharedFiles)

router.post('/:reference_Id/share/files',protectRoutes,shareDirectory)



module.exports = router;