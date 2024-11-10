const router = require('express').Router();
const getFile = require('../controllers/file/cli.getFile');
// const { createFile } = require('../controllers/file/createFile');
const { createFile } = require('../utils/file/test');
const { deleteFile } = require('../controllers/file/deleteFile');
const { downloadFile } = require('../controllers/file/downloadFile');
const { getAllFiles } = require('../controllers/file/getAllFiles');
const { moveFiles } = require('../controllers/file/moveFiles');
const protectRoutes = require('../middleware/protectRoutes');
const multer = require('multer');

// Setup in-memory storage for file uploads with multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Apply protection middleware to all routes
router.use(protectRoutes);

// Route for uploading files to a specific directory
router.post('/:reference_Id/directories/:directoryId/files', upload.array('files'), createFile);

// Route for uploading files with a subscription feature
router.post('/:reference_Id/directories/:directoryId/files/subscription', upload.array('files'), createFile);

// Route for deleting multiple files
router.delete('/delete-files', deleteFile);

// Route for retrieving a single file by file ID
router.get('/:reference_Id/files/:fileId', getFile);

// Route for retrieving all files associated with a reference ID
router.get('/:reference_Id/files', getAllFiles);

// Route for moving files to a different directory
router.post('/:reference_Id/movefiles', moveFiles);

// Route for downloading a file by file ID
router.get('/download/:fileId', downloadFile);

module.exports = router;
