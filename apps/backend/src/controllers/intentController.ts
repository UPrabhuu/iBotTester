// Intent Controller - Handles intent parsing requests
import { Request, Response } from 'express';
import { IntentParserAgent, ParsedIntent } from '../agents/IntentParserAgent';
import prisma from '../utils/prisma';

// Initialize Intent Parser Agent
const intentParser = new IntentParserAgent(process.env.OPENAI_API_KEY);

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Parse user prompt to extract intent
 * POST /api/intent/parse
 */
export const parseIntent = async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, projectId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required and must be a string',
      });
    }

    // Parse intent using the Intent Parser Agent
    const parsedIntent: ParsedIntent = await intentParser.parseIntent(prompt);

    // Map the new ParsedIntent structure to the database schema
    const action = parsedIntent.primaryAction.toLowerCase();
    const target = parsedIntent.args.testName || parsedIntent.args.testPattern || parsedIntent.args.pageName || 'unknown';
    const url = parsedIntent.args.environment || null;
    const constraints = parsedIntent.secondaryActions || [];
    const expectedOutcome = parsedIntent.question || null;

    // Save to database
    const savedIntent = await prisma.parsedIntent.create({
      data: {
        userId,
        projectId: projectId || null,
        prompt,
        action,
        target,
        url,
        constraintsJson: constraints,
        expectedOutcome,
        confidence: parsedIntent.confidence,
        aiUsed: intentParser.isAIAvailable(),
      },
    });

    res.json({
      success: true,
      intent: {
        id: savedIntent.id,
        action: savedIntent.action,
        target: savedIntent.target,
        url: savedIntent.url,
        constraints: savedIntent.constraintsJson as string[],
        expectedOutcome: savedIntent.expectedOutcome,
        confidence: savedIntent.confidence,
        aiUsed: savedIntent.aiUsed,
        createdAt: savedIntent.createdAt,
      },
      message: intentParser.isAIAvailable()
        ? 'Intent parsed successfully using AI'
        : 'Intent parsed successfully using rule-based fallback',
    });
  } catch (error: any) {
    console.error('Error parsing intent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to parse intent',
      details: error.message,
    });
  }
};

/**
 * Get intent history for current user
 * GET /api/intent/history
 */
export const getIntentHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { projectId, limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const whereClause: any = { userId };
    if (projectId) {
      whereClause.projectId = projectId as string;
    }

    const intents = await prisma.parsedIntent.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json({
      success: true,
      intents: intents.map((intent) => ({
        id: intent.id,
        prompt: intent.prompt,
        action: intent.action,
        target: intent.target,
        url: intent.url,
        constraints: intent.constraintsJson as string[],
        expectedOutcome: intent.expectedOutcome,
        confidence: intent.confidence,
        aiUsed: intent.aiUsed,
        createdAt: intent.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching intent history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch intent history',
      details: error.message,
    });
  }
};
