
import { Router } from 'express';
import { body } from 'express-validator';
import { 
  createComment,
  deleteComment
} from '../controllers/comment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post(
  '/forums/:forumId/comments',
  authenticate,
  [
    body('content').notEmpty().withMessage('Comment content is required')
  ],
  createComment
);

router.delete('/comments/:id', authenticate, deleteComment);

export default router;