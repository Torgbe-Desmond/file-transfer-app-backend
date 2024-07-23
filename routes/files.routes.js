const router = require('express').Router();
const { createFile } = require('../controllers/controller.file/createFile');
const { deleteFile } = require('../controllers/controller.file/deleteFile');
const { downloadFile } = require('../controllers/controller.file/downloadFile');
const { getAllFiles } = require('../controllers/controller.file/getAllFiles');
const { getFilesInDirectory } = require('../controllers/controller.file/getFilesInDirectory');
const { moveFiles } = require('../controllers/controller.file/moveFiles');
const {upload} = require('../controllers/controller.file/configurations')
const protectRoutes = require('../middleware/protectRoutes');
const { moveFilesFromSubscriptionsToDownload } = require('../controllers/controller.file/moveFilesFromSubscriptionsToDownload');

// POST /:reference_Id/directories/:directoryId/stuff
router.post('/:reference_Id/directories/:directoryId/stuff', upload.array('files'), protectRoutes, createFile);

// POST /:reference_Id/directories/:directoryId/stuff/subscription
router.post('/:reference_Id/directories/:directoryId/stuff/subscription', upload.array('files'), protectRoutes, createFile);

// GET /:reference_Id/directories/:directoryId/stuff
router.get('/:reference_Id/directories/:directoryId/stuff', protectRoutes, getFilesInDirectory);

// DELETE /delete-files
router.delete('/delete-files', protectRoutes, deleteFile);

// POST /move-to-downloads
router.post('/:reference_Id/move-to-downloads', protectRoutes, moveFilesFromSubscriptionsToDownload);

// GET /:reference_Id/stuff
router.get('/:reference_Id/stuff', protectRoutes, getAllFiles);

// POST /movefiles
router.post('/:reference_Id/movefiles', protectRoutes, moveFiles);

// GET /download/:fileId
router.get('/download/:fileId', protectRoutes, downloadFile);

module.exports = router;