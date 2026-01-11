const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const {
  getUploadConfig,
  uploadFiles,
  handleUpload,
  getFiles,
  deleteFile,
  downloadFile,
  getFileById,
  updateFileMetadata
} = require('../controllers/upload.controller');

// Public config endpoint
router.get('/config', getUploadConfig);

// Upload files by type
router.post('/:type', auth, uploadFiles, handleUpload);

// Get files
router.get('/', auth, getFiles);

// Get file by ID
router.get('/:fileId', auth, getFileById);

// Update file metadata
router.put('/:fileId', auth, updateFileMetadata);

// Download file
router.get('/download/:fileId', auth, downloadFile);

// Delete file
router.delete('/:fileId', auth, deleteFile);

module.exports = router;