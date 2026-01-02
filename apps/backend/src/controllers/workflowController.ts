// Workflow controller - handles workflow execution and storage
import { Request, Response } from 'express';
import {
  successResponse,
  errorResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
} from '../utils/response';
import prisma from '../utils/prisma';
import { AgentWorkflow } from '../agents/AgentWorkflow';
import { ParsedIntent } from '../agents/IntentParserAgent';
import { DiscoveredPage } from '../agents/PlaywrightDiscoveryAgent';
import { TestModel } from '../agents/TestModelGenerator';

/**
 * POST /api/workflows/execute
 * Execute complete workflow and save to database
 */
export const executeWorkflow = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { prompt, url, projectId, options } = req.body;

    // Validation
    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    if (!prompt) {
      return res.status(400).json(errorResponse('Prompt is required'));
    }

    // Create workflow execution record
    const workflowExecution = await prisma.workflowExecution.create({
      data: {
        userId,
        projectId: projectId || null,
        userPrompt: prompt,
        url: url || null,
        status: 'running',
      },
    });

    try {
      // Initialize AgentWorkflow
      const workflow = new AgentWorkflow({
        openaiApiKey: process.env.OPENAI_API_KEY,
        verbose: options?.verbose || false,
        discoveryOptions: options?.discoveryOptions,
        generatorOptions: options?.generatorOptions,
      });

      const startTime = Date.now();

      // Execute workflow
      const result = await workflow.execute(prompt, url);

      const totalTime = Date.now() - startTime;

      if (result.success) {
        // Save ParsedIntent if not already saved
        let parsedIntentId: string | null = null;
        if (result.intent) {
          const parsedIntent = await prisma.parsedIntent.create({
            data: {
              userId,
              projectId: projectId || null,
              prompt: result.userPrompt,
              action: result.intent.primaryAction,
              target: result.intent.args.testName || 'Unknown',
              url: url || null,
              constraintsJson: [],
              expectedOutcome: null,
              confidence: result.intent.confidence,
              aiUsed: true,
            },
          });
          parsedIntentId = parsedIntent.id;
        }

        // Save Intent Activity
        const intentActivity = await prisma.workflowActivity.create({
          data: {
            workflowExecutionId: workflowExecution.id,
            activityType: 'intent',
            status: 'completed',
            dataJson: result.intent as any,
            duration: result.metadata.intentParseTime || 0,
            completedAt: new Date(),
          },
        });

        // Save Discovery Activity and Snapshot
        let discoveryActivityId: string | null = null;
        if (result.discoveredPage) {
          const discoveryActivity = await prisma.workflowActivity.create({
            data: {
              workflowExecutionId: workflowExecution.id,
              activityType: 'discovery',
              status: 'completed',
              dataJson: result.discoveredPage as any,
              duration: result.metadata.discoveryTime || 0,
              completedAt: new Date(),
            },
          });
          discoveryActivityId = discoveryActivity.id;

          await prisma.discoveredPageSnapshot.create({
            data: {
              workflowActivityId: discoveryActivity.id,
              projectId: projectId || null,
              url: result.discoveredPage.url,
              title: result.discoveredPage.title || null,
              viewportJson: result.discoveredPage.viewport as any,
              elementsJson: result.discoveredPage.elements as any,
              metadataJson: result.discoveredPage.metadata as any,
              screenshotsJson: result.discoveredPage.metadata.screenshots as any || null,
            },
          });
        }

        // Save Test Model Generation Activity and Model
        if (result.testModel) {
          const generationActivity = await prisma.workflowActivity.create({
            data: {
              workflowExecutionId: workflowExecution.id,
              activityType: 'generation',
              status: 'completed',
              dataJson: result.testModel as any,
              duration: result.metadata.generationTime || 0,
              completedAt: new Date(),
            },
          });

          await prisma.generatedTestModel.create({
            data: {
              workflowActivityId: generationActivity.id,
              projectId: projectId || null,
              modelVersion: result.testModel.modelVersion,
              modelJson: result.testModel as any,
              testCaseCount: result.testModel.testCases?.length || 0,
              totalSteps: result.testModel.testCases?.reduce((sum, tc) => sum + (tc.steps?.length || 0), 0) || 0,
              configurationJson: result.testModel.configuration as any,
            },
          });
        }

        // Update workflow execution as completed
        const updatedWorkflow = await prisma.workflowExecution.update({
          where: { id: workflowExecution.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            totalTime,
            parsedIntentId,
          },
          include: {
            activities: {
              orderBy: { createdAt: 'asc' },
              include: {
                discoveredPageSnapshot: true,
                generatedTestModel: true,
              },
            },
            parsedIntent: true,
          },
        });

        res.status(201).json(createdResponse({
          workflow: updatedWorkflow,
          result: {
            success: result.success,
            testModel: result.testModel,
            metadata: result.metadata,
          },
        }));
      } else {
        // Workflow failed - update status and save error
        await prisma.workflowExecution.update({
          where: { id: workflowExecution.id },
          data: {
            status: 'failed',
            completedAt: new Date(),
            totalTime,
            errorMessage: result.error || 'Unknown error',
          },
        });

        res.status(500).json({
          success: false,
          error: result.error || 'Workflow execution failed',
          data: {
            workflowId: workflowExecution.id,
            intent: result.intent,
          },
        });
      }
    } catch (workflowError: any) {
      // Handle workflow execution error
      await prisma.workflowExecution.update({
        where: { id: workflowExecution.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          errorMessage: workflowError.message,
        },
      });

      throw workflowError;
    }
  } catch (error: any) {
    console.error('Execute workflow error:', error);
    res.status(500).json(errorResponse(error.message || 'Internal server error'));
  }
};

/**
 * GET /api/workflows
 * List user's workflow executions
 */
export const listWorkflows = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { projectId, status, limit = 20, offset = 0 } = req.query;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const where: any = { userId };
    if (projectId) where.projectId = projectId as string;
    if (status) where.status = status as string;

    const workflows = await prisma.workflowExecution.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
      include: {
        parsedIntent: true,
        _count: {
          select: { activities: true },
        },
      },
    });

    const total = await prisma.workflowExecution.count({ where });

    res.json(successResponse({
      workflows,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    }));
  } catch (error) {
    console.error('List workflows error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

/**
 * GET /api/workflows/:id
 * Get workflow execution details
 */
export const getWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const workflow = await prisma.workflowExecution.findFirst({
      where: { id, userId },
      include: {
        parsedIntent: true,
        activities: {
          orderBy: { createdAt: 'asc' },
          include: {
            discoveredPageSnapshot: true,
            generatedTestModel: true,
          },
        },
      },
    });

    if (!workflow) {
      return res.status(404).json(errorResponse('Workflow not found'));
    }

    res.json(successResponse(workflow));
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

/**
 * GET /api/workflows/:id/activities
 * Get workflow activities
 */
export const getWorkflowActivities = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    // Verify workflow belongs to user
    const workflow = await prisma.workflowExecution.findFirst({
      where: { id, userId },
    });

    if (!workflow) {
      return res.status(404).json(errorResponse('Workflow not found'));
    }

    const activities = await prisma.workflowActivity.findMany({
      where: { workflowExecutionId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        discoveredPageSnapshot: true,
        generatedTestModel: true,
      },
    });

    res.json(successResponse(activities));
  } catch (error) {
    console.error('Get workflow activities error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

/**
 * DELETE /api/workflows/:id
 * Delete workflow execution
 */
export const deleteWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    // Verify workflow belongs to user
    const workflow = await prisma.workflowExecution.findFirst({
      where: { id, userId },
    });

    if (!workflow) {
      return res.status(404).json(errorResponse('Workflow not found'));
    }

    // Delete workflow (cascade will delete activities, snapshots, and models)
    await prisma.workflowExecution.delete({
      where: { id },
    });

    res.json(deletedResponse('Workflow deleted successfully'));
  } catch (error) {
    console.error('Delete workflow error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

/**
 * GET /api/workflows/:id/test-model
 * Get generated test model from workflow
 */
export const getWorkflowTestModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    // Verify workflow belongs to user
    const workflow = await prisma.workflowExecution.findFirst({
      where: { id, userId },
    });

    if (!workflow) {
      return res.status(404).json(errorResponse('Workflow not found'));
    }

    // Get the generation activity with test model
    const generationActivity = await prisma.workflowActivity.findFirst({
      where: {
        workflowExecutionId: id,
        activityType: 'generation',
      },
      include: {
        generatedTestModel: true,
      },
    });

    if (!generationActivity?.generatedTestModel) {
      return res.status(404).json(errorResponse('Test model not found for this workflow'));
    }

    res.json(successResponse(generationActivity.generatedTestModel.modelJson));
  } catch (error) {
    console.error('Get workflow test model error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

/**
 * GET /api/workflows/:id/discovery
 * Get discovered page snapshot from workflow
 */
export const getWorkflowDiscovery = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    // Verify workflow belongs to user
    const workflow = await prisma.workflowExecution.findFirst({
      where: { id, userId },
    });

    if (!workflow) {
      return res.status(404).json(errorResponse('Workflow not found'));
    }

    // Get the discovery activity with snapshot
    const discoveryActivity = await prisma.workflowActivity.findFirst({
      where: {
        workflowExecutionId: id,
        activityType: 'discovery',
      },
      include: {
        discoveredPageSnapshot: true,
      },
    });

    if (!discoveryActivity?.discoveredPageSnapshot) {
      return res.status(404).json(errorResponse('Page discovery not found for this workflow'));
    }

    res.json(successResponse(discoveryActivity.discoveredPageSnapshot));
  } catch (error) {
    console.error('Get workflow discovery error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};
