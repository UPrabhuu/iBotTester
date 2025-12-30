// Configuration controller
import { Request, Response } from 'express';
import {
  successResponse,
  errorResponse,
  updatedResponse,
} from '../utils/response';
import prisma from '../utils/prisma';

// GET /api/config/:projectId
export const getConfiguration = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    // Verify user has access to project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return res.status(404).json(errorResponse('Project not found'));
    }

    // Get configuration
    let config = await prisma.configuration.findUnique({
      where: { projectId },
    });

    // If no configuration exists, create default one
    if (!config) {
      config = await prisma.configuration.create({
        data: {
          projectId,
          environmentJson: {
            baseUrl: project.baseUrl || '',
          },
          browserJson: {
            type: 'chromium',
            headless: true,
            viewport: { width: 1920, height: 1080 },
          },
          executionJson: {
            timeout: 30000,
            retries: 2,
            screenshots: true,
            video: false,
          },
        },
      });
    }

    res.json(successResponse(config));
  } catch (error) {
    console.error('Get configuration error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// PUT /api/config/:projectId
export const updateConfiguration = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { environmentJson, browserJson, executionJson } = req.body;
    const userId = req.user?.id;

    // Verify user has access to project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return res.status(404).json(errorResponse('Project not found'));
    }

    // Update or create configuration
    const config = await prisma.configuration.upsert({
      where: { projectId },
      update: {
        ...(environmentJson !== undefined && { environmentJson }),
        ...(browserJson !== undefined && { browserJson }),
        ...(executionJson !== undefined && { executionJson }),
      },
      create: {
        projectId,
        environmentJson: environmentJson || null,
        browserJson: browserJson || null,
        executionJson: executionJson || null,
      },
    });

    res.json(updatedResponse(config));
  } catch (error) {
    console.error('Update configuration error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};
