import { Page, BrowserContext } from 'playwright';
import { prisma } from '../utils/prisma';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface EvidenceMetadata {
  url?: string;
  title?: string;
  viewport?: { width: number; height: number };
  timestamp: Date;
  [key: string]: any;
}

export class EvidenceCollectorService {
  private evidenceDir: string;

  constructor() {
    this.evidenceDir = path.join(process.cwd(), 'evidence');
    this.ensureEvidenceDirectory();
  }

  private async ensureEvidenceDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.evidenceDir, { recursive: true });
    } catch (error) {
      console.error('Error creating evidence directory:', error);
    }
  }

  async captureScreenshot(
    executionId: string,
    page: Page,
    stepNumber: number,
    description: string
  ): Promise<string> {
    try {
      const screenshot = await page.screenshot({ 
        fullPage: true,
        type: 'png'
      });
      
      const base64Screenshot = screenshot.toString('base64');
      const dataUrl = `data:image/png;base64,${base64Screenshot}`;

      const metadata: EvidenceMetadata = {
        url: page.url(),
        title: await page.title(),
        viewport: page.viewportSize() || { width: 1920, height: 1080 },
        timestamp: new Date(),
      };

      const evidence = await prisma.evidenceData.create({
        data: {
          playwrightExecutionId: executionId,
          evidenceType: 'screenshot',
          stepNumber,
          stepDescription: description,
          dataUrl,
          metadataJson: metadata as any,
          fileSize: screenshot.length,
          mimeType: 'image/png',
        },
      });

      return evidence.id;
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      throw error;
    }
  }

  async captureVideo(
    executionId: string,
    page: Page,
    description: string
  ): Promise<string> {
    try {
      const videoPath = await page.video()?.path();
      
      if (!videoPath) {
        throw new Error('Video recording not enabled');
      }

      const metadata: EvidenceMetadata = {
        videoPath,
        timestamp: new Date(),
      };

      const evidence = await prisma.evidenceData.create({
        data: {
          playwrightExecutionId: executionId,
          evidenceType: 'video',
          stepDescription: description,
          dataUrl: videoPath,
          metadataJson: metadata as any,
          mimeType: 'video/webm',
        },
      });

      return evidence.id;
    } catch (error) {
      console.error('Error capturing video:', error);
      throw error;
    }
  }

  async captureTrace(
    executionId: string,
    context: BrowserContext
  ): Promise<string> {
    try {
      const tracePath = path.join(
        this.evidenceDir,
        `trace-${executionId}-${Date.now()}.zip`
      );

      await context.tracing.stop({ path: tracePath });

      const metadata: EvidenceMetadata = {
        tracePath,
        timestamp: new Date(),
      };

      const evidence = await prisma.evidenceData.create({
        data: {
          playwrightExecutionId: executionId,
          evidenceType: 'trace',
          stepDescription: 'Playwright trace',
          dataUrl: tracePath,
          metadataJson: metadata as any,
          mimeType: 'application/zip',
        },
      });

      return evidence.id;
    } catch (error) {
      console.error('Error capturing trace:', error);
      throw error;
    }
  }

  async captureNetworkLog(
    executionId: string,
    page: Page,
    stepNumber: number
  ): Promise<string> {
    try {
      const networkLogs: any[] = [];

      page.on('request', request => {
        networkLogs.push({
          type: 'request',
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          timestamp: new Date(),
        });
      });

      page.on('response', response => {
        networkLogs.push({
          type: 'response',
          url: response.url(),
          status: response.status(),
          headers: response.headers(),
          timestamp: new Date(),
        });
      });

      const metadata: EvidenceMetadata = {
        logCount: networkLogs.length,
        timestamp: new Date(),
      };

      const evidence = await prisma.evidenceData.create({
        data: {
          playwrightExecutionId: executionId,
          evidenceType: 'network',
          stepNumber,
          stepDescription: 'Network activity log',
          dataUrl: JSON.stringify(networkLogs),
          metadataJson: metadata as any,
          mimeType: 'application/json',
        },
      });

      return evidence.id;
    } catch (error) {
      console.error('Error capturing network log:', error);
      throw error;
    }
  }

  async captureConsoleLogs(
    executionId: string,
    page: Page,
    stepNumber: number
  ): Promise<string> {
    try {
      const consoleLogs: any[] = [];

      page.on('console', msg => {
        consoleLogs.push({
          type: msg.type(),
          text: msg.text(),
          timestamp: new Date(),
        });
      });

      const metadata: EvidenceMetadata = {
        logCount: consoleLogs.length,
        timestamp: new Date(),
      };

      const evidence = await prisma.evidenceData.create({
        data: {
          playwrightExecutionId: executionId,
          evidenceType: 'console',
          stepNumber,
          stepDescription: 'Console logs',
          dataUrl: JSON.stringify(consoleLogs),
          metadataJson: metadata as any,
          mimeType: 'application/json',
        },
      });

      return evidence.id;
    } catch (error) {
      console.error('Error capturing console logs:', error);
      throw error;
    }
  }

  async getAllEvidence(executionId: string) {
    return prisma.evidenceData.findMany({
      where: {
        playwrightExecutionId: executionId,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });
  }

  async getEvidenceByType(executionId: string, evidenceType: string) {
    return prisma.evidenceData.findMany({
      where: {
        playwrightExecutionId: executionId,
        evidenceType,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });
  }
}
