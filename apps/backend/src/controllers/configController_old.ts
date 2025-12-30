// Configuration controller
import { Request, Response } from 'express';
import { successResponse, errorResponse, updatedResponse } from '../utils/response';
import { configurations, projects } from '../data/mockData';
import { ProjectConfiguration } from '../models/types';

// GET /api/config/:projectId
export const getConfiguration = (req: Request, res: Response) => {
  const { projectId } = req.params;
  const userId = req.user?.id;

  // Verify user has access to project
  const project = projects.find((p) => p.id === projectId && p.userId === userId);
  if (!project) {
    return res.status(403).json(errorResponse('Access denied to this project'));
  }

  const config = configurations.find((c) => c.projectId === projectId);

  if (!config) {
    // Return default configuration
    const defaultConfig: ProjectConfiguration = {
      id: `config-${projectId}`,
      projectId,
      environment: {
        baseUrl: '',
      },
      browser: {
        type: 'chromium',
        headless: true,
        viewport: {
          width: 1280,
          height: 720,
        },
      },
      execution: {
        timeout: 30000,
        retries: 2,
        screenshots: true,
        video: false,
      },
      integrations: {},
      variables: {},
    };

    return res.json(successResponse(defaultConfig));
  }

  res.json(successResponse(config));
};

// PUT /api/config/:projectId
export const updateConfiguration = (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { environment, browser, execution, integrations, variables } = req.body;
  const userId = req.user?.id;

  // Verify user has access to project
  const project = projects.find((p) => p.id === projectId && p.userId === userId);
  if (!project) {
    return res.status(403).json(errorResponse('Access denied to this project'));
  }

  const configIndex = configurations.findIndex((c) => c.projectId === projectId);

  if (configIndex === -1) {
    // Create new configuration
    const newConfig: ProjectConfiguration = {
      id: `config-${projectId}`,
      projectId,
      environment: environment || { baseUrl: '' },
      browser: browser || { type: 'chromium', headless: true },
      execution: execution || { timeout: 30000, retries: 2, screenshots: true, video: false },
      integrations: integrations || {},
      variables: variables || {},
    };

    configurations.push(newConfig);
    return res.json(updatedResponse(newConfig));
  }

  // Update existing configuration
  if (environment) configurations[configIndex].environment = environment;
  if (browser) configurations[configIndex].browser = browser;
  if (execution) configurations[configIndex].execution = execution;
  if (integrations) configurations[configIndex].integrations = integrations;
  if (variables) configurations[configIndex].variables = variables;

  res.json(updatedResponse(configurations[configIndex]));
};
