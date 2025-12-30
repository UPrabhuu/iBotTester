// Settings controller
import { Request, Response } from 'express';
import { successResponse, errorResponse, updatedResponse } from '../utils/response';
import { users, integrations as mockIntegrations } from '../data/mockData';
import { User } from '../models/types';

// GET /api/settings/profile
export const getProfile = (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json(errorResponse('Unauthorized'));
  }

  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json(errorResponse('User not found'));
  }

  // Remove password from response
  const { password, ...profile } = user;

  res.json(successResponse(profile));
};

// PUT /api/settings/profile
export const updateProfile = (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { firstName, lastName, phone, company, role } = req.body;

  if (!userId) {
    return res.status(401).json(errorResponse('Unauthorized'));
  }

  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json(errorResponse('User not found'));
  }

  // Update fields
  if (firstName) users[userIndex].firstName = firstName;
  if (lastName) users[userIndex].lastName = lastName;
  if (phone !== undefined) users[userIndex].phone = phone;
  if (company !== undefined) users[userIndex].company = company;
  if (role !== undefined) users[userIndex].role = role;
  users[userIndex].updatedAt = new Date();

  // Remove password from response
  const { password, ...profile } = users[userIndex];

  res.json(updatedResponse(profile));
};

// PUT /api/settings/password
export const changePassword = (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    return res.status(401).json(errorResponse('Unauthorized'));
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json(errorResponse('Current password and new password are required'));
  }

  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json(errorResponse('User not found'));
  }

  // Verify current password
  if (users[userIndex].password !== currentPassword) {
    return res.status(401).json(errorResponse('Current password is incorrect'));
  }

  // Update password
  users[userIndex].password = newPassword;
  users[userIndex].updatedAt = new Date();

  res.json(successResponse({ message: 'Password updated successfully' }));
};

// GET /api/settings/integrations
export const getIntegrations = (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json(errorResponse('Unauthorized'));
  }

  res.json(successResponse(mockIntegrations));
};

// POST /api/settings/integrations
export const connectIntegration = (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { name, config } = req.body;

  if (!userId) {
    return res.status(401).json(errorResponse('Unauthorized'));
  }

  if (!name) {
    return res.status(400).json(errorResponse('Integration name is required'));
  }

  const integrationIndex = mockIntegrations.findIndex((i) => i.name === name);

  if (integrationIndex === -1) {
    return res.status(404).json(errorResponse('Integration not found'));
  }

  // Update integration
  mockIntegrations[integrationIndex].connected = true;
  if (config) {
    mockIntegrations[integrationIndex].config = {
      ...mockIntegrations[integrationIndex].config,
      ...config,
    };
  }

  res.json(updatedResponse(mockIntegrations[integrationIndex]));
};

// DELETE /api/settings/integrations/:name
export const disconnectIntegration = (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { name } = req.params;

  if (!userId) {
    return res.status(401).json(errorResponse('Unauthorized'));
  }

  const integrationIndex = mockIntegrations.findIndex((i) => i.name === name);

  if (integrationIndex === -1) {
    return res.status(404).json(errorResponse('Integration not found'));
  }

  // Disconnect integration
  mockIntegrations[integrationIndex].connected = false;
  mockIntegrations[integrationIndex].config = {};

  res.json(successResponse({ message: `${name} disconnected successfully` }));
};
