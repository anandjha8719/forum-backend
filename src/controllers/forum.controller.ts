import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, ForumInput } from '../types';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

export const createForum = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { title, description, tags = [] }: ForumInput = req.body;

    const forum = await prisma.forum.create({
      data: {
        title,
        description,
        tags,
        authorId: req.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    return res.status(201).json(forum);
  } catch (error) {
    console.error('Error creating forum:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllForums = async (req: Request, res: Response) => {
  try {
    const forums = await prisma.forum.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json(forums);
  } catch (error) {
    console.error('Error fetching forums:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getForumById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const forum = await prisma.forum.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    return res.status(200).json(forum);
  } catch (error) {
    console.error('Error fetching forum:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateForum = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { title, description, tags }: ForumInput = req.body;

    // Check if forum exists and belongs to the user
    const existingForum = await prisma.forum.findUnique({
      where: { id }
    });

    if (!existingForum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    if (existingForum.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own forums' });
    }

    const updatedForum = await prisma.forum.update({
      where: { id },
      data: {
        title,
        description,
        tags
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    return res.status(200).json(updatedForum);
  } catch (error) {
    console.error('Error updating forum:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteForum = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;

    // Check if forum exists and belongs to the user
    const existingForum = await prisma.forum.findUnique({
      where: { id }
    });

    if (!existingForum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    if (existingForum.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own forums' });
    }

    await prisma.forum.delete({
      where: { id }
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting forum:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};