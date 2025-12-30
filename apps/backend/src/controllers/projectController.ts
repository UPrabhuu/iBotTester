// Project controller
import { Request, Response } from 'express';
import {
  successResponse,
  errorResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
} from '../utils/response';
import prisma from '../utils/prisma';

// GET /api/projects
export const listProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    // Get all projects for the user
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { testCases: true },
        },
      },
    });

    res.json(successResponse(projects));
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// GET /api/projects/:id
export const getProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const project = await prisma.project.findFirst({
      where: { id, userId },
      include: {
        testCases: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        configurations: true,
        _count: {
          select: { testCases: true },
        },
      },
    });

    if (!project) {
      return res.status(404).json(errorResponse('Project not found'));
    }

    res.json(successResponse(project));
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// POST /api/projects
export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description, baseUrl } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    if (!name) {
      return res.status(400).json(errorResponse('Project name is required'));
    }

    const newProject = await prisma.project.create({
      data: {
        name,
        description: description || null,
        baseUrl: baseUrl || null,
        userId,
      },
    });

    res.status(201).json(createdResponse(newProject));
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// PUT /api/projects/:id
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, baseUrl } = req.body;
    const userId = req.user?.id;

    // Verify ownership
    const existingProject = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existingProject) {
      return res.status(404).json(errorResponse('Project not found'));
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(baseUrl !== undefined && { baseUrl }),
      },
    });

    res.json(updatedResponse(updatedProject));
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// DELETE /api/projects/:id
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Verify ownership
    const existingProject = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existingProject) {
      return res.status(404).json(errorResponse('Project not found'));
    }

    // Delete project (cascades to test cases, steps, etc.)
    await prisma.project.delete({
      where: { id },
    });

    res.json(deletedResponse('Project deleted successfully'));
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// Stub methods for branches (for backward compatibility)
// These can be removed if not needed
export const listBranches = (req: Request, res: Response) => {
  res.json(successResponse([{ id: 'main', name: 'main', isDefault: true }]));
};

export const createBranch = (req: Request, res: Response) => {
  res.status(501).json(errorResponse('Branches not implemented in database version'));
};

export const updateBranch = (req: Request, res: Response) => {
  res.status(501).json(errorResponse('Branches not implemented in database version'));
};
