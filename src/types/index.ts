import { Request } from 'express';

export interface UserData {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface ForumInput {
  title: string;
  description: string;
  tags?: string[];
}

export interface CommentInput {
  content: string;
}

export interface AuthRequest extends Request {
  user?: UserData;
}

declare global {
    namespace Express {
      interface User extends UserData {}
      interface Request {
        user?: UserData;
      }
    }
  }