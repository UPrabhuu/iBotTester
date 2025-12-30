// Chat controller
import { Request, Response } from 'express';
import {
  successResponse,
  errorResponse,
  createdResponse,
  deletedResponse,
} from '../utils/response';
import prisma from '../utils/prisma';

// GET /api/chat/history
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const conversations = await prisma.chatConversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    res.json(successResponse(conversations));
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// GET /api/chat/:id
export const getChat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const conversation = await prisma.chatConversation.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json(errorResponse('Conversation not found'));
    }

    res.json(successResponse(conversation));
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// POST /api/chat/new
export const createChat = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const conversation = await prisma.chatConversation.create({
      data: {
        userId,
        title: title || 'New Conversation',
      },
    });

    res.status(201).json(createdResponse(conversation));
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// POST /api/chat/message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, content, role = 'user' } = req.body;
    const userId = req.user?.id;

    if (!conversationId || !content) {
      return res.status(400).json(errorResponse('conversationId and content are required'));
    }

    // Verify user owns conversation
    const conversation = await prisma.chatConversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      return res.status(404).json(errorResponse('Conversation not found'));
    }

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        role,
        content,
      },
    });

    res.status(201).json(createdResponse(message));
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// DELETE /api/chat/:id
export const deleteChat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Verify user owns conversation
    const conversation = await prisma.chatConversation.findFirst({
      where: { id, userId },
    });

    if (!conversation) {
      return res.status(404).json(errorResponse('Conversation not found'));
    }

    // Delete conversation (cascades to messages)
    await prisma.chatConversation.delete({
      where: { id },
    });

    res.json(deletedResponse('Conversation deleted successfully'));
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};
