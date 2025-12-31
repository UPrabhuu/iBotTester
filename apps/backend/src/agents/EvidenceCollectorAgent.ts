// Evidence Collector Agent
// Collects and organizes test execution evidence (screenshots, logs, videos)
import { TestEvidence } from '../models/agentTypes';

export interface EvidenceItem {
  type: 'screenshot' | 'log' | 'video' | 'network' | 'console';
  timestamp: string;
  data: string;
  metadata?: Record<string, any>;
}

export class EvidenceCollectorAgent {
  private screenshots: string[] = [];
  private logs: string[] = [];
  private videos: string[] = [];
  private networkLogs: any[] = [];
  private consoleLogs: any[] = [];
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
  }

  /**
   * Add a screenshot to evidence
   */
  addScreenshot(screenshot: string, metadata?: Record<string, any>): void {
    this.screenshots.push(screenshot);
    this.log(`Screenshot captured at step ${this.screenshots.length}`, metadata);
  }

  /**
   * Add a log entry
   */
  log(message: string, metadata?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.logs.push(logEntry);
    
    if (metadata) {
      this.logs.push(`  Metadata: ${JSON.stringify(metadata)}`);
    }
  }

  /**
   * Add video path
   */
  addVideo(videoPath: string): void {
    this.videos.push(videoPath);
    this.log(`Video recorded: ${videoPath}`);
  }

  /**
   * Add network request log
   */
  addNetworkLog(request: any): void {
    this.networkLogs.push({
      timestamp: new Date().toISOString(),
      ...request,
    });
  }

  /**
   * Add console log from browser
   */
  addConsoleLog(logType: string, message: string): void {
    this.consoleLogs.push({
      timestamp: new Date().toISOString(),
      type: logType,
      message,
    });
    this.log(`Browser ${logType}: ${message}`);
  }

  /**
   * Get all collected evidence
   */
  getEvidence(): TestEvidence {
    return {
      screenshots: this.screenshots,
      video: this.videos.length > 0 ? this.videos[0] : undefined,
      logs: this.logs,
    };
  }

  /**
   * Get detailed evidence report
   */
  getDetailedEvidence(): {
    screenshots: string[];
    videos: string[];
    logs: string[];
    networkLogs: any[];
    consoleLogs: any[];
    duration: number;
  } {
    const duration = Date.now() - this.startTime.getTime();
    
    return {
      screenshots: this.screenshots,
      videos: this.videos,
      logs: this.logs,
      networkLogs: this.networkLogs,
      consoleLogs: this.consoleLogs,
      duration,
    };
  }

  /**
   * Clear all evidence
   */
  clear(): void {
    this.screenshots = [];
    this.logs = [];
    this.videos = [];
    this.networkLogs = [];
    this.consoleLogs = [];
    this.startTime = new Date();
  }

  /**
   * Export evidence summary
   */
  exportSummary(): string {
    const evidence = this.getDetailedEvidence();
    
    return `
Evidence Summary:
- Screenshots: ${evidence.screenshots.length}
- Videos: ${evidence.videos.length}
- Log entries: ${evidence.logs.length}
- Network requests: ${evidence.networkLogs.length}
- Console logs: ${evidence.consoleLogs.length}
- Duration: ${(evidence.duration / 1000).toFixed(2)}s
    `.trim();
  }
}
