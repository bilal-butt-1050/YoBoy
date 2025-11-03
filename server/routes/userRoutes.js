import express from 'express';
import { getUsers, getUserById, searchUsers, updateStatus } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', getUsers);
router.get('/search', searchUsers);
router.get('/:id', getUserById);
router.put('/status', updateStatus);

export default router;
