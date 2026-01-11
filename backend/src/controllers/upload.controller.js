const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FileUpload = require('../models/FileUpload');

/* ================================
   GET UPLOAD CONFIGURATION
   (Public)
================================ */
exports.getUploadConfig = async (req, res) => {
  try {
    const config = {
      maxFileSize: '10MB',
      allowedTypes: {
        'medical-documents': ['jpeg', 'jpg', 'png', 'gif', 'pdf', 'doc', 'docx'],
        'prescriptions': ['jpeg', 'jpg', 'png', 'gif', 'pdf'],
        'lab-reports': ['jpeg', 'jpg', 'png', 'gif', 'pdf', 'doc', 'docx'],
        'avatars': ['jpeg', 'jpg', 'png', 'gif']
      },
      storageType: process.env.CLOUDINARY_CLOUD_NAME ? 'cloudinary' : 'local',
      status: 'available'
    };
    
    res.json(config);
  } catch (err) {
    console.error('Get upload config error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Configure storage for different file types
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { type } = req.params;
    let uploadPath = 'uploads/';
    
    switch (type) {
      case 'medical-documents':
        uploadPath += 'medical-documents/';
        break;
      case 'prescriptions':
        uploadPath += 'prescriptions/';
        break;
      case 'lab-reports':
        uploadPath += 'lab-reports/';
        break;
      case 'avatars':
        uploadPath += 'avatars/';
        break;
      default:
        uploadPath += 'general/';
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter for security
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'medical-documents': /jpeg|jpg|png|gif|pdf|doc|docx/,
    'prescriptions': /jpeg|jpg|png|gif|pdf/,
    'lab-reports': /jpeg|jpg|png|gif|pdf|doc|docx/,
    'avatars': /jpeg|jpg|png|gif/,
    'general': /jpeg|jpg|png|gif|pdf|doc|docx|txt/
  };

  const { type } = req.params;
  const allowedPattern = allowedTypes[type] || allowedTypes.general;
  
  const extname = allowedPattern.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedPattern.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

/* ================================
   UPLOAD FILES
================================ */
exports.uploadFiles = upload.array('files', 5); // Max 5 files

exports.handleUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const { type } = req.params;
    const { entityId, entityType, description, tags } = req.body;

    if (!entityId || !entityType) {
      return res.status(400).json({ message: 'entityId and entityType are required' });
    }

    // Map entityType to model name
    const entityModelMap = {
      'patient': 'Patient',
      'doctor': 'Doctor',
      'appointment': 'Appointment',
      'medical-record': 'MedicalRecord',
      'prescription': 'Prescription',
      'user': 'User'
    };

    const entityModel = entityModelMap[entityType];
    if (!entityModel) {
      return res.status(400).json({ message: 'Invalid entityType' });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const fileUpload = new FileUpload({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/${file.path}`,
        category: type,
        entityType,
        entityId,
        entityModel,
        uploadedBy: req.user.id,
        description: description || '',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : []
      });

      await fileUpload.save();
      uploadedFiles.push({
        id: fileUpload._id,
        name: fileUpload.originalName,
        filename: fileUpload.filename,
        size: fileUpload.size,
        type: fileUpload.mimetype,
        url: fileUpload.url,
        fullUrl: fileUpload.fullUrl,
        uploadedAt: fileUpload.createdAt,
        category: fileUpload.category,
        description: fileUpload.description,
        tags: fileUpload.tags
      });
    }

    res.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET FILES
================================ */
exports.getFiles = async (req, res) => {
  try {
    const { entityId, entityType, category } = req.query;

    let filter = { isActive: true };

    if (entityId && entityType) {
      filter.entityType = entityType;
      filter.entityId = entityId;
    }

    if (category) {
      filter.category = category;
    }

    const files = await FileUpload.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    const formattedFiles = files.map(file => ({
      id: file._id,
      name: file.originalName,
      filename: file.filename,
      size: file.size,
      formattedSize: file.getFormattedSize(),
      type: file.mimetype,
      url: file.url,
      fullUrl: file.fullUrl,
      uploadedAt: file.createdAt,
      uploadedBy: file.uploadedBy,
      category: file.category,
      description: file.description,
      tags: file.tags,
      isImage: file.isImage(),
      isDocument: file.isDocument()
    }));

    res.json({ 
      files: formattedFiles,
      total: formattedFiles.length
    });
  } catch (err) {
    console.error('Get files error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   DELETE FILE
================================ */
exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await FileUpload.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user has permission to delete (owner or admin)
    if (file.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this file' });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '../../', file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Mark as inactive instead of deleting from database (for audit trail)
    file.isActive = false;
    await file.save();

    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error('Delete file error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   DOWNLOAD FILE
================================ */
exports.downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await FileUpload.findById(fileId);
    if (!file || !file.isActive) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(__dirname, '../../', file.path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Physical file not found' });
    }

    res.download(filePath, file.originalName);
  } catch (err) {
    console.error('Download file error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET FILE BY ID
================================ */
exports.getFileById = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await FileUpload.findById(fileId)
      .populate('uploadedBy', 'name email');

    if (!file || !file.isActive) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json({
      id: file._id,
      name: file.originalName,
      filename: file.filename,
      size: file.size,
      formattedSize: file.getFormattedSize(),
      type: file.mimetype,
      url: file.url,
      fullUrl: file.fullUrl,
      uploadedAt: file.createdAt,
      uploadedBy: file.uploadedBy,
      category: file.category,
      description: file.description,
      tags: file.tags,
      entityType: file.entityType,
      entityId: file.entityId,
      isImage: file.isImage(),
      isDocument: file.isDocument()
    });
  } catch (err) {
    console.error('Get file by ID error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   UPDATE FILE METADATA
================================ */
exports.updateFileMetadata = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { description, tags } = req.body;

    const file = await FileUpload.findById(fileId);
    if (!file || !file.isActive) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user has permission to update
    if (file.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this file' });
    }

    if (description !== undefined) {
      file.description = description;
    }

    if (tags !== undefined) {
      file.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    }

    await file.save();

    res.json({
      message: 'File metadata updated successfully',
      file: {
        id: file._id,
        description: file.description,
        tags: file.tags
      }
    });
  } catch (err) {
    console.error('Update file metadata error:', err);
    res.status(500).json({ message: err.message });
  }
};