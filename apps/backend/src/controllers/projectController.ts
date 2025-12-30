// Project controller
import { Request, Response } from 'express';
import {
  successResponse,
  errorResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
} from '../utils/response';
import { projects, generateId } from '../data/mockData';
import { Project, Branch } from '../models/types';

// GET /api/projects
export const listProjects = (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json(errorResponse('Unauthorized'));
  }

  // Filter projects by user
  const userProjects = projects.filter((p) => p.userId === userId);

  res.json(successResponse(userProjects));
};

// GET /api/projects/:id
export const getProject = (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const project = projects.find((p) => p.id === id && p.userId === userId);

  if (!project) {
    return res.status(404).json(errorResponse('Project not found'));
  }

  res.json(successResponse(project));
};

// POST /api/projects
export const createProject = (req: Request, res: Response) => {
  const { name, description } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json(errorResponse('Unauthorized'));
  }

  if (!name) {
    return res.status(400).json(errorResponse('Project name is required'));
  }

  const newProject: Project = {
    id: generateId('project'),
    name,
    description: description || '',
    branches: [{ id: generateId('branch'), name: 'main', isDefault: true }],
    currentBranch: generateId('branch'),
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  newProject.currentBranch = newProject.branches[0].id;
  projects.push(newProject);

  res.status(201).json(createdResponse(newProject));
};

// PUT /api/projects/:id
export const updateProject = (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.user?.id;

  const projectIndex = projects.findIndex((p) => p.id === id && p.userId === userId);

  if (projectIndex === -1) {
    return res.status(404).json(errorResponse('Project not found'));
  }

  // Update project
  if (name) projects[projectIndex].name = name;
  if (description !== undefined) projects[projectIndex].description = description;
  projects[projectIndex].updatedAt = new Date();

  res.json(updatedResponse(projects[projectIndex]));
};

// DELETE /api/projects/:id
export const deleteProject = (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const projectIndex = projects.findIndex((p) => p.id === id && p.userId === userId);

  if (projectIndex === -1) {
    return res.status(404).json(errorResponse('Project not found'));
  }

  projects.splice(projectIndex, 1);

  res.json(deletedResponse('Project deleted successfully'));
};

// GET /api/projects/:id/branches
export const listBranches = (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const project = projects.find((p) => p.id === id && p.userId === userId);

  if (!project) {
    return res.status(404).json(errorResponse('Project not found'));
  }

  res.json(successResponse(project.branches));
};

// POST /api/projects/:id/branches
export const createBranch = (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, fromBranch } = req.body;
  const userId = req.user?.id;

  if (!name) {
    return res.status(400).json(errorResponse('Branch name is required'));
  }

  const projectIndex = projects.findIndex((p) => p.id === id && p.userId === userId);

  if (projectIndex === -1) {
    return res.status(404).json(errorResponse('Project not found'));
  }

  // Check if branch name already exists
  const branchExists = projects[projectIndex].branches.some((b) => b.name === name);
  if (branchExists) {
    return res.status(400).json(errorResponse('Branch name already exists'));
  }

  const newBranch: Branch = {
    id: generateId('branch'),
    name,
    isDefault: false,
  };

  projects[projectIndex].branches.push(newBranch);
  projects[projectIndex].updatedAt = new Date();

  res.status(201).json(createdResponse(newBranch));
};

// PUT /api/projects/:id/branches/:branchId
export const updateBranch = (req: Request, res: Response) => {
  const { id, branchId } = req.params;
  const { setCurrent } = req.body;
  const userId = req.user?.id;

  const projectIndex = projects.findIndex((p) => p.id === id && p.userId === userId);

  if (projectIndex === -1) {
    return res.status(404).json(errorResponse('Project not found'));
  }

  const branch = projects[projectIndex].branches.find((b) => b.id === branchId);

  if (!branch) {
    return res.status(404).json(errorResponse('Branch not found'));
  }

  // Switch to this branch
  if (setCurrent) {
    projects[projectIndex].currentBranch = branchId;
    projects[projectIndex].updatedAt = new Date();
  }

  res.json(updatedResponse(projects[projectIndex]));
};
