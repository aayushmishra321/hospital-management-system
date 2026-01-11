const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { 
  getProfile, 
  updateProfile, 
  changePassword, 
  getSettings, 
  updateSettings, 
  uploadAvatar, 
  updateAvatar, 
  deleteAccount,
  updateFCMToken
} = require('../controllers/user.controller');

// Profile routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, changePassword);
router.delete('/account', auth, deleteAccount);

// Settings routes
router.get('/settings', auth, getSettings);
router.put('/settings', auth, updateSettings);

// Avatar upload routes
router.post('/avatar', auth, uploadAvatar, updateAvatar);

// FCM token route
router.post('/update-fcm-token', auth, updateFCMToken);

module.exports = router;