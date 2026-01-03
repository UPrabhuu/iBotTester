// Chat routes
import { Router } from 'express';
import {
  getChatHistory,
  getChat,
  createChat,
  sendMessage,
  deleteChat,
  streamExecutionUpdates,
} from '../controllers/chatController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

router.get('/history', getChatHistory);
router.get('/:id', getChat);
router.post('/new', createChat);
router.post('/message', sendMessage);
router.get('/:conversationId/execution-stream', streamExecutionUpdates);
router.delete('/:id', deleteChat);

export default router;
