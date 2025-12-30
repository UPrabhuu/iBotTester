// Dashboard controller
import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/response';
import { testExecutions, testCases, projects } from '../data/mockData';
import { DashboardMetrics } from '../models/types';

// GET /api/dashboard/metrics
export const getDashboardMetrics = (req: Request, res: Response) => {
  const { projectId } = req.query;
  const userId = req.user?.id;

  // Verify user has access to project
  if (projectId) {
    const project = projects.find((p) => p.id === projectId && p.userId === userId);
    if (!project) {
      return res.status(403).json(errorResponse('Access denied to this project'));
    }
  }

  // Filter executions by project if specified
  const filteredExecutions = projectId
    ? testExecutions.filter((ex) => ex.projectId === projectId)
    : testExecutions;

  // Calculate metrics
  const totalTests = filteredExecutions.length;
  const passedTests = filteredExecutions.filter((ex) => ex.status === 'passed').length;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  const completedExecutions = filteredExecutions.filter((ex) => ex.duration > 0);
  const avgDuration =
    completedExecutions.length > 0
      ? completedExecutions.reduce((sum, ex) => sum + ex.duration, 0) / completedExecutions.length
      : 0;

  const activeSuites = testCases.filter((tc) => tc.status === 'active').length;

  // Generate execution trends (last 7 days)
  const trends = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

    const dayExecutions = filteredExecutions.filter((ex) => {
      const exDate = new Date(ex.timestamp);
      return exDate.toDateString() === date.toDateString();
    });

    trends.push({
      date: dateStr,
      passed: dayExecutions.filter((ex) => ex.status === 'passed').length,
      failed: dayExecutions.filter((ex) => ex.status === 'failed').length,
      total: dayExecutions.length,
    });
  }

  // Recent activity (last 10 executions)
  const recentActivity = filteredExecutions
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10)
    .map((ex) => ({
      id: ex.id,
      testName: ex.suiteName,
      status: ex.status,
      timestamp: ex.timestamp,
      duration: ex.duration,
    }));

  // Slowest tests
  const slowestTests = completedExecutions
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5)
    .map((ex) => ({
      id: ex.id,
      name: ex.suiteName,
      duration: ex.duration,
    }));

  // Test distribution
  const testDistribution = {
    passed: filteredExecutions.filter((ex) => ex.status === 'passed').length,
    failed: filteredExecutions.filter((ex) => ex.status === 'failed').length,
    skipped: 0,
    running: filteredExecutions.filter((ex) => ex.status === 'running').length,
  };

  const metrics: DashboardMetrics = {
    totalTests,
    passRate: Math.round(passRate * 10) / 10,
    avgDuration: Math.round(avgDuration),
    activeSuites,
    executionTrends: trends,
    recentActivity,
    slowestTests,
    testDistribution,
  };

  res.json(successResponse(metrics));
};

// GET /api/dashboard/activity
export const getRecentActivity = (req: Request, res: Response) => {
  const { projectId, limit = 20 } = req.query;
  const userId = req.user?.id;

  // Verify user has access to project
  if (projectId) {
    const project = projects.find((p) => p.id === projectId && p.userId === userId);
    if (!project) {
      return res.status(403).json(errorResponse('Access denied to this project'));
    }
  }

  // Filter executions by project if specified
  const filteredExecutions = projectId
    ? testExecutions.filter((ex) => ex.projectId === projectId)
    : testExecutions;

  const activity = filteredExecutions
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, Number(limit))
    .map((ex) => ({
      id: ex.id,
      testName: ex.suiteName,
      status: ex.status,
      timestamp: ex.timestamp,
      duration: ex.duration,
      triggeredBy: ex.triggeredBy,
    }));

  res.json(successResponse(activity));
};

// GET /api/dashboard/trends
export const getExecutionTrends = (req: Request, res: Response) => {
  const { projectId, days = 7 } = req.query;
  const userId = req.user?.id;

  // Verify user has access to project
  if (projectId) {
    const project = projects.find((p) => p.id === projectId && p.userId === userId);
    if (!project) {
      return res.status(403).json(errorResponse('Access denied to this project'));
    }
  }

  // Filter executions by project if specified
  const filteredExecutions = projectId
    ? testExecutions.filter((ex) => ex.projectId === projectId)
    : testExecutions;

  const numDays = Number(days);
  const trends = [];

  for (let i = numDays - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

    const dayExecutions = filteredExecutions.filter((ex) => {
      const exDate = new Date(ex.timestamp);
      return exDate.toDateString() === date.toDateString();
    });

    trends.push({
      date: dateStr,
      passed: dayExecutions.filter((ex) => ex.status === 'passed').length,
      failed: dayExecutions.filter((ex) => ex.status === 'failed').length,
      running: dayExecutions.filter((ex) => ex.status === 'running').length,
      total: dayExecutions.length,
    });
  }

  res.json(successResponse(trends));
};
