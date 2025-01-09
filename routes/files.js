const router = require('express').Router();
const getFile = require('../controllers/file/cli.getFile');
const { createFile } = require('../controllers/file/createFile');
// const { createFile } = require('../utils/file/test');
const { deleteFile } = require('../controllers/file/deleteFile');
const { downloadFile } = require('../controllers/file/downloadFile');
const { getAllFiles } = require('../controllers/file/getAllFiles');
const { moveFiles } = require('../controllers/file/moveFiles');
const protectRoutes = require('../middleware/protectRoutes');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(protectRoutes);

router.post('/:reference_Id/directories/:directoryId/files', upload.array('files'), createFile);

// router.post('/:reference_Id/directories/:directoryId/files/subscription', upload.array('files'), createFile);

router.delete('/delete-files', deleteFile);

router.get('/:reference_Id/files/:fileId', getFile);

router.get('/:reference_Id/files', getAllFiles);

router.post('/:reference_Id/movefiles', moveFiles);

router.get('/download/:fileId', downloadFile);

module.exports = router;
