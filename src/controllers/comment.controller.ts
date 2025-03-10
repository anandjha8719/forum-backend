import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, CommentInput } from '../types';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { forumId } = req.params;
    const { content }: CommentInput = req.body;

    // Check if forum exists
    const forum = await prisma.forum.findUnique({
      where: { id: forumId }
    });

    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.user.id,
        forumId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    return res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;

    const existingComment = await prisma.comment.findUnique({
      where: { id }
    });

    if (!existingComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (existingComment.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own comments' });
    }

    await prisma.comment.delete({
      where: { id }
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};