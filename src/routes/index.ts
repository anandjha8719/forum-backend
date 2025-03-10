import { Router } from 'express';
import forumRoutes from './forum.routes';
import commentRoutes from './comment.routes';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/forums', forumRoutes);
router.use('/comments', commentRoutes);
router.use('/users', userRoutes);

export default router;