// Chat routes
import { Router } from 'express';
import {
  getChatHistory,
  getChat,
  createChat,
  sendMessage,
  deleteChat,
} from '../controllers/chatController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

router.get('/history', getChatHistory);
router.get('/:id', getChat);
router.post('/new', createChat);
router.post('/message', sendMessage);
router.delete('/:id', deleteChat);

export default router;
