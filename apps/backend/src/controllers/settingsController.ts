// Settings controller
import { Request, Response } from 'express';
import {
  successResponse,
  errorResponse,
  updatedResponse,
} from '../utils/response';
import { sanitizeUser, hashPassword, comparePassword } from '../utils/auth';
import prisma from '../utils/prisma';

// GET /api/settings/profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    res.json(successResponse(sanitizeUser(user)));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// PUT /api/settings/profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, phone, company, role, avatar } = req.body;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(company !== undefined && { company }),
        ...(role !== undefined && { role }),
        ...(avatar !== undefined && { avatar }),
      },
    });

    res.json(updatedResponse(sanitizeUser(updatedUser)));
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// PUT /api/settings/password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json(errorResponse('Current and new password are required'));
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, user.password);

    if (!isValid) {
      return res.status(401).json(errorResponse('Current password is incorrect'));
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json(successResponse({ message: 'Password updated successfully' }));
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// GET /api/settings/integrations
export const getIntegrations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    // Get or create user settings
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
          integrationsJson: {},
        },
      });
    }

    res.json(successResponse(settings.integrationsJson || {}));
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// POST /api/settings/integrations
export const connectIntegration = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, config } = req.body;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    if (!name) {
      return res.status(400).json(errorResponse('Integration name is required'));
    }

    // Get or create user settings
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
          integrationsJson: {},
        },
      });
    }

    // Update integrations
    const integrations = (settings.integrationsJson as any) || {};
    integrations[name] = {
      connected: true,
      ...config,
    };

    const updated = await prisma.userSettings.update({
      where: { userId },
      data: { integrationsJson: integrations },
    });

    res.json(updatedResponse(updated.integrationsJson));
  } catch (error) {
    console.error('Connect integration error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// DELETE /api/settings/integrations/:name
export const disconnectIntegration = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name } = req.params;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      return res.status(404).json(errorResponse('Settings not found'));
    }

    // Update integrations
    const integrations = (settings.integrationsJson as any) || {};
    delete integrations[name];

    const updated = await prisma.userSettings.update({
      where: { userId },
      data: { integrationsJson: integrations },
    });

    res.json(successResponse(updated.integrationsJson));
  } catch (error) {
    console.error('Disconnect integration error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};
