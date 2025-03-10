import { Router } from 'express';
import { body } from 'express-validator';
import { 
  createForum, 
  getAllForums, 
  getForumById, 
  updateForum, 
  deleteForum 
} from '../controllers/forum.controller';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', optionalAuth, getAllForums);

router.get('/:id', optionalAuth, getForumById);

router.post(
  '/',
  authenticate,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('tags').optional().isArray().withMessage('Tags must be an array')
  ],
  createForum
);

router.put(
  '/:id',
  authenticate,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('tags').optional().isArray().withMessage('Tags must be an array')
  ],
  updateForum
);

router.delete('/:id', authenticate, deleteForum);

export default router;