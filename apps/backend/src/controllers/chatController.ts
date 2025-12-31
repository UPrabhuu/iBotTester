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
    const { conversationId, content, role = 'user', projectId, branchId } = req.body;
    const userId = req.user?.id;

    if (!content) {
      return res.status(400).json(errorResponse('content is required'));
    }

    let currentConversationId = conversationId;

    // If no conversationId, create a new conversation
    if (!currentConversationId) {
      const newConversation = await prisma.chatConversation.create({
        data: {
          userId: userId!,
          title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
          projectId,
          branchId,
        },
      });
      currentConversationId = newConversation.id;
    } else {
      // Verify user owns conversation
      const conversation = await prisma.chatConversation.findFirst({
        where: { id: currentConversationId, userId },
      });

      if (!conversation) {
        return res.status(404).json(errorResponse('Conversation not found'));
      }
    }

    // Create user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        conversationId: currentConversationId,
        role: 'user',
        content,
      },
    });

    // Process with Planner LLM if user message
    if (role === 'user') {
      // Import orchestrator dynamically to avoid circular dependencies
      const { OrchestratorAgent } = await import('../agents/OrchestratorAgent');
      const { IntentParserAgent } = await import('../agents/IntentParserAgent');
      
      const intentParser = new IntentParserAgent(process.env.OPENAI_API_KEY);
      
      try {
        // Parse intent
        const intent = await intentParser.parseIntent(content);
        
        // Create thinking/planning message
        const thinkingMessage = await prisma.chatMessage.create({
          data: {
            conversationId: currentConversationId,
            role: 'assistant',
            content: `🤔 Analyzing your request...`,
            metadata: JSON.stringify({ type: 'thinking', intent }),
          },
        });

        // Generate response based on intent
        let responseContent = '';
        let metadata: any = { intent };

        if (intent.action === 'purchase' || intent.action === 'test' || intent.action === 'create') {
          // Generate test plan
          responseContent = `I understand you want to ${intent.action} "${intent.target}"`;
          if (intent.url) {
            responseContent += ` on ${intent.url}`;
          }
          if (intent.constraints && intent.constraints.length > 0) {
            responseContent += `\n\nConstraints: ${intent.constraints.join(', ')}`;
          }
          
          responseContent += `\n\n📋 I'll create a test plan for this. Here's what I'll do:\n\n`;
          responseContent += `1. Navigate to ${intent.url || 'the target website'}\n`;
          responseContent += `2. Search for "${intent.target}"\n`;
          responseContent += `3. Apply filters and constraints\n`;
          responseContent += `4. Complete the ${intent.action} action\n`;
          responseContent += `5. Verify the outcome\n\n`;
          responseContent += `Would you like me to execute this test plan?`;
          
          metadata.testPlan = {
            action: intent.action,
            target: intent.target,
            url: intent.url,
            constraints: intent.constraints,
          };
        } else {
          // Generic response
          responseContent = `I can help you with ${intent.action} "${intent.target}". `;
          responseContent += `\n\nWhat would you like me to do specifically?`;
        }

        // Create assistant response message
        const assistantMessage = await prisma.chatMessage.create({
          data: {
            conversationId: currentConversationId,
            role: 'assistant',
            content: responseContent,
            metadata: JSON.stringify(metadata),
          },
        });

        // Return conversation with all messages
        const fullConversation = await prisma.chatConversation.findFirst({
          where: { id: currentConversationId },
          include: {
            messages: {
              orderBy: { timestamp: 'asc' },
            },
          },
        });

        res.status(201).json(createdResponse({
          conversation: fullConversation,
          userMessage,
          assistantMessage,
        }));
      } catch (llmError) {
        console.error('LLM processing error:', llmError);
        
        // Create fallback response
        const fallbackMessage = await prisma.chatMessage.create({
          data: {
            conversationId: currentConversationId,
            role: 'assistant',
            content: 'I received your message. However, I encountered an issue processing it with AI. Please try again or rephrase your request.',
          },
        });

        const fullConversation = await prisma.chatConversation.findFirst({
          where: { id: currentConversationId },
          include: {
            messages: {
              orderBy: { timestamp: 'asc' },
            },
          },
        });

        res.status(201).json(createdResponse({
          conversation: fullConversation,
          userMessage,
          assistantMessage: fallbackMessage,
        }));
      }
    } else {
      // Just return the message if it's not a user message
      res.status(201).json(createdResponse(userMessage));
    }
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
