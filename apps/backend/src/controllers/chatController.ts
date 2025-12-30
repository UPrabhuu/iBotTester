// Chat controller
import { Request, Response } from 'express';
import {
  successResponse,
  errorResponse,
  createdResponse,
  deletedResponse,
} from '../utils/response';
import { chatHistory, chatMessages, generateId } from '../data/mockData';
import { ChatHistory, ChatMessage, ExecutionStep } from '../models/types';

// GET /api/chat/history
export const getChatHistory = (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json(errorResponse('Unauthorized'));
  }

  const userChats = chatHistory.filter((ch) => ch.userId === userId);

  // Sort by last message time descending
  userChats.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

  res.json(successResponse(userChats));
};

// GET /api/chat/:id
export const getChat = (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const chat = chatHistory.find((ch) => ch.id === id && ch.userId === userId);

  if (!chat) {
    return res.status(404).json(errorResponse('Chat not found'));
  }

  // Get messages for this chat
  const messages = chatMessages
    .filter((m) => m.chatId === id)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  res.json(
    successResponse({
      chat,
      messages,
    })
  );
};

// POST /api/chat/new
export const createChat = (req: Request, res: Response) => {
  const { title, projectId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json(errorResponse('Unauthorized'));
  }

  const newChat: ChatHistory = {
    id: generateId('chat'),
    title: title || 'New Chat',
    userId,
    projectId,
    timestamp: new Date(),
    lastMessageAt: new Date(),
  };

  chatHistory.push(newChat);

  res.status(201).json(createdResponse(newChat));
};

// POST /api/chat/message
export const sendMessage = async (req: Request, res: Response) => {
  const { chatId, content, type = 'user' } = req.body;
  const userId = req.user?.id;

  if (!content) {
    return res.status(400).json(errorResponse('Message content is required'));
  }

  // If chatId is provided, verify user has access
  if (chatId) {
    const chat = chatHistory.find((ch) => ch.id === chatId && ch.userId === userId);
    if (!chat) {
      return res.status(404).json(errorResponse('Chat not found'));
    }
  }

  // Create or use existing chat
  let activeChatId = chatId;
  if (!activeChatId) {
    const newChat: ChatHistory = {
      id: generateId('chat'),
      title: content.substring(0, 50),
      userId: userId!,
      timestamp: new Date(),
      lastMessageAt: new Date(),
    };
    chatHistory.push(newChat);
    activeChatId = newChat.id;
  }

  // Create user message
  const userMessage: ChatMessage = {
    id: generateId('msg'),
    chatId: activeChatId,
    type: 'user',
    content,
    timestamp: new Date(),
  };

  chatMessages.push(userMessage);

  // Update chat last message time
  const chatIndex = chatHistory.findIndex((ch) => ch.id === activeChatId);
  if (chatIndex > -1) {
    chatHistory[chatIndex].lastMessageAt = new Date();
  }

  // Simulate AI response
  const agentSteps: ExecutionStep[] = [
    { id: generateId('step'), description: 'Analyzing test requirements', status: 'success' },
    { id: generateId('step'), description: 'Generating test script', status: 'success' },
    { id: generateId('step'), description: 'Validating test configuration', status: 'done' },
  ];

  const agentMessage: ChatMessage = {
    id: generateId('msg'),
    chatId: activeChatId,
    type: 'agent',
    content: `I understand you want to: "${content}"\n\nI've created a test plan for you. The test will include comprehensive steps to validate your requirements.`,
    timestamp: new Date(Date.now() + 1000),
    steps: agentSteps,
    status: 'completed',
  };

  chatMessages.push(agentMessage);

  res.json(
    successResponse({
      chatId: activeChatId,
      userMessage,
      agentMessage,
    })
  );
};

// DELETE /api/chat/:id
export const deleteChat = (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const chatIndex = chatHistory.findIndex((ch) => ch.id === id && ch.userId === userId);

  if (chatIndex === -1) {
    return res.status(404).json(errorResponse('Chat not found'));
  }

  // Delete all messages in this chat
  const messagesToDelete = chatMessages.filter((m) => m.chatId === id);
  messagesToDelete.forEach((msg) => {
    const msgIndex = chatMessages.findIndex((m) => m.id === msg.id);
    if (msgIndex > -1) chatMessages.splice(msgIndex, 1);
  });

  chatHistory.splice(chatIndex, 1);

  res.json(deletedResponse('Chat deleted successfully'));
};
