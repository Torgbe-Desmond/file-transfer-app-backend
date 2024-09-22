const router = require('express').Router();
const { createFile } = require('../controllers/file/createFile');
const { deleteFile } = require('../controllers/file/deleteFile');
const { downloadFile } = require('../controllers/file/downloadFile');
const { getAllFiles } = require('../controllers/file/getAllFiles');
const { moveFiles } = require('../controllers/file/moveFiles');
const {upload} = require('../controllers/file/configurations')
const protectRoutes = require('../middleware/protectRoutes');

router.post('/:reference_Id/directories/:directoryId/stuff', upload.array('files'), protectRoutes, createFile);

router.post('/:reference_Id/directories/:directoryId/stuff/subscription', upload.array('files'), protectRoutes, createFile);

router.delete('/delete-files', protectRoutes, deleteFile);

router.get('/:reference_Id/stuff', protectRoutes, getAllFiles);

router.post('/:reference_Id/movefiles', protectRoutes, moveFiles);

router.get('/download/:fileId', protectRoutes, downloadFile);

module.exports = router;