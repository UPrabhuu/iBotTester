// Dashboard controller
import { Request, Response } from 'express';
import {
  successResponse,
  errorResponse,
} from '../utils/response';
import prisma from '../utils/prisma';

// GET /api/dashboard/metrics
export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    // Get user's projects
    const projects = await prisma.project.findMany({
      where: { userId },
      select: { id: true },
    });

    const projectIds = projects.map(p => p.id);

    // Get total test cases
    const totalTests = await prisma.testCase.count({
      where: { projectId: { in: projectIds } },
    });

    // Get recent executions
    const recentExecutions = await prisma.execution.findMany({
      where: {
        testCase: {
          projectId: { in: projectIds },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: 100,
    });

    // Calculate metrics
    const passedExecutions = recentExecutions.filter(e => e.status === 'passed').length;
    const totalExecutions = recentExecutions.length;
    const passRate = totalExecutions > 0 ? (passedExecutions / totalExecutions) * 100 : 0;

    // Calculate average duration
    const completedExecutions = recentExecutions.filter(e => e.duration !== null);
    const avgDuration = completedExecutions.length > 0
      ? completedExecutions.reduce((sum, e) => sum + (e.duration || 0), 0) / completedExecutions.length
      : 0;

    // Active test cases
    const activeTests = await prisma.testCase.count({
      where: {
        projectId: { in: projectIds },
        status: 'active',
      },
    });

    res.json(successResponse({
      totalTests,
      passRate: Math.round(passRate),
      avgDuration: Math.round(avgDuration),
      activeSuites: activeTests,
    }));
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// GET /api/dashboard/activity
export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { limit = '10' } = req.query;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    // Get user's projects
    const projects = await prisma.project.findMany({
      where: { userId },
      select: { id: true },
    });

    const projectIds = projects.map(p => p.id);

    // Get recent executions
    const executions = await prisma.execution.findMany({
      where: {
        testCase: {
          projectId: { in: projectIds },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: parseInt(limit as string),
      include: {
        testCase: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const activity = executions.map(exec => ({
      id: exec.id,
      testName: exec.testCase.name,
      status: exec.status,
      timestamp: exec.startedAt,
      duration: exec.duration,
    }));

    res.json(successResponse(activity));
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// GET /api/dashboard/trends
export const getExecutionTrends = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { days = '7' } = req.query;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    // Get user's projects
    const projects = await prisma.project.findMany({
      where: { userId },
      select: { id: true },
    });

    const projectIds = projects.map(p => p.id);

    // Get executions from last N days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));

    const executions = await prisma.execution.findMany({
      where: {
        testCase: {
          projectId: { in: projectIds },
        },
        startedAt: {
          gte: daysAgo,
        },
      },
      orderBy: { startedAt: 'asc' },
    });

    // Group by date
    const trendsByDate: { [key: string]: { passed: number; failed: number; total: number } } = {};

    executions.forEach(exec => {
      if (!exec.startedAt) return;
      
      const date = exec.startedAt.toISOString().split('T')[0];
      if (!trendsByDate[date]) {
        trendsByDate[date] = { passed: 0, failed: 0, total: 0 };
      }
      trendsByDate[date].total++;
      if (exec.status === 'passed') {
        trendsByDate[date].passed++;
      } else if (exec.status === 'failed') {
        trendsByDate[date].failed++;
      }
    });

    const trends = Object.keys(trendsByDate).map(date => ({
      date,
      ...trendsByDate[date],
    }));

    res.json(successResponse(trends));
  } catch (error) {
    console.error('Get execution trends error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};
