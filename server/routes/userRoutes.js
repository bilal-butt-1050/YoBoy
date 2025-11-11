import express from 'express';
import {
  getUsers,
  getUserById,
  updateProfile,
  updateStatus,
  searchUsers,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js'; // middleware to check logged in user
import fileUpload from 'express-fileupload';


const router = express.Router();

// All routes protected except search (optional)
router.use(protect);

router.get('/', getUsers);             // Get all users
router.get('/search', searchUsers);    // Search users
router.get('/:id', getUserById);       // Get user by ID
router.put('/profile', updateProfile); // Update profile
router.put('/status', updateStatus);   // Update online/offline status


export default router;
