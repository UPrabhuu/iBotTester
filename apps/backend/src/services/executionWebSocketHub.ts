/**
 * Execution WebSocket Hub
 * Manages WebSocket connections and broadcasts execution events
 */

import WebSocket from 'ws';
import { ExecutionEvent, FrameEvent } from '../types/execution-events';
import { createLogger } from '../utils/logger';

const logger = createLogger('WebSocketHub');

interface ClientConnection {
  ws: WebSocket;
  executionId: string;
  connectedAt: number;
}

interface ExecutionSnapshot {
  executionId: string;
  lastFrame: FrameEvent | null;
  steps: Array<{
    stepNumber: number;
    action: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: string;
  }>;
  logs: Array<{
    level: string;
    message: string;
    timestamp: number;
  }>;
}

export class ExecutionWebSocketHub {
  private clients: Map<string, Set<ClientConnection>> = new Map();
  private snapshots: Map<string, ExecutionSnapshot> = new Map();
  private frameBuffers: Map<string, FrameEvent[]> = new Map();
  private maxLogsPerExecution = 100;
  private maxFrameBuffer = 2; // Keep only latest frame to drop slow clients

  /**
   * Broadcast event to all clients listening to an execution
   */
  broadcastEvent(event: ExecutionEvent): void {
    const executionId = event.executionId;
    const clients = this.clients.get(executionId);

    if (!clients || clients.size === 0) {
      return; // No active clients
    }

    const message = JSON.stringify(event);

    // Update snapshots based on event type
    this.updateSnapshot(event);

    // Handle frames specially - drop if clients are slow
    if (event.type === 'frame') {
      this.bufferFrame(event as FrameEvent);
      // Only broadcast latest frame if buffer full
      if (this.frameBuffers.get(executionId)?.length === this.maxFrameBuffer) {
        this.broadcastToClients(clients, message);
      }
    } else {
      this.broadcastToClients(clients, message);
    }
  }

  /**
   * Add a new WebSocket client
   */
  addClient(executionId: string, ws: WebSocket): void {
    if (!this.clients.has(executionId)) {
      this.clients.set(executionId, new Set());
    }

    const connection: ClientConnection = {
      ws,
      executionId,
      connectedAt: Date.now(),
    };

    this.clients.get(executionId)!.add(connection);

    logger.info('Client connected', { executionId });

    // Send snapshot on connect/reconnect
    const snapshot = this.snapshots.get(executionId);
    if (snapshot) {
      this.sendSnapshot(ws, snapshot);
    }

    // Send heartbeat
    this.sendHeartbeat(ws, executionId);

    // Handle disconnect
    ws.on('close', () => {
      this.removeClient(executionId, connection);
    });

    ws.on('error', (error) => {
      logger.error('WebSocket error', { executionId, message: error.message });
      this.removeClient(executionId, connection);
    });
  }

  /**
   * Remove a client connection
   */
  private removeClient(executionId: string, connection: ClientConnection): void {
    const clients = this.clients.get(executionId);
    if (clients) {
      clients.delete(connection);
      console.log(`[WebSocket] Client disconnected from execution ${executionId}, remaining: ${clients.size}`);
      
      if (clients.size === 0) {
        this.clients.delete(executionId);
        // Optionally clean up snapshot after all clients disconnect
        setTimeout(() => {
          if (!this.clients.has(executionId)) {
            this.snapshots.delete(executionId);
            this.frameBuffers.delete(executionId);
            console.log(`[WebSocket] Cleaned up execution ${executionId}`);
          }
        }, 5000); // Keep snapshot for 5s in case of quick reconnect
      }
    }
  }

  /**
   * Update execution snapshot based on event
   */
  private updateSnapshot(event: ExecutionEvent): void {
    let snapshot = this.snapshots.get(event.executionId);

    if (!snapshot) {
      snapshot = {
        executionId: event.executionId,
        lastFrame: null,
        steps: [],
        logs: [],
      };
      this.snapshots.set(event.executionId, snapshot);
    }

    switch (event.type) {
      case 'frame':
        snapshot.lastFrame = event as FrameEvent;
        break;

      case 'step_finished':
        const stepEvent = event as any;
        snapshot.steps.push({
          stepNumber: stepEvent.stepNumber,
          action: stepEvent.action || '',
          status: stepEvent.status,
          duration: stepEvent.duration,
          error: stepEvent.error,
        });
        break;

      case 'log':
      case 'console':
        const logEvent = event as any;
        snapshot.logs.push({
          level: logEvent.level,
          message: logEvent.message || logEvent.text,
          timestamp: event.timestamp,
        });
        // Keep only last N logs
        if (snapshot.logs.length > this.maxLogsPerExecution) {
          snapshot.logs = snapshot.logs.slice(-this.maxLogsPerExecution);
        }
        break;
    }
  }

  /**
   * Buffer frames and keep only latest
   */
  private bufferFrame(frame: FrameEvent): void {
    const executionId = frame.executionId;
    if (!this.frameBuffers.has(executionId)) {
      this.frameBuffers.set(executionId, []);
    }

    const buffer = this.frameBuffers.get(executionId)!;
    buffer.push(frame);

    // Keep only latest frames
    if (buffer.length > this.maxFrameBuffer) {
      buffer.shift();
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  private broadcastToClients(clients: Set<ClientConnection>, message: string): void {
    const deadClients: ClientConnection[] = [];

    clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message, (error) => {
          if (error) {
            console.error('[WebSocket] Error sending to client:', error.message);
            deadClients.push(client);
          }
        });
      } else {
        deadClients.push(client);
      }
    });

    // Clean up dead clients
    deadClients.forEach((client) => {
      clients.delete(client);
    });
  }

  /**
   * Send snapshot to a client (on reconnect)
   */
  private sendSnapshot(ws: WebSocket, snapshot: ExecutionSnapshot): void {
    const snapshotMessage = {
      type: 'snapshot',
      executionId: snapshot.executionId,
      lastFrame: snapshot.lastFrame,
      steps: snapshot.steps,
      logs: snapshot.logs,
      timestamp: Date.now(),
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(snapshotMessage));
    }
  }

  /**
   * Send heartbeat to keep connection alive
   */
  private sendHeartbeat(ws: WebSocket, executionId: string): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'connected',
          executionId,
          timestamp: Date.now(),
        })
      );
    }
  }

  /**
   * Check if execution has active clients
   */
  hasActiveClients(executionId: string): boolean {
    const clients = this.clients.get(executionId);
    return !!clients && clients.size > 0;
  }

  /**
   * Get number of connected clients for an execution
   */
  getClientCount(executionId: string): number {
    return this.clients.get(executionId)?.size || 0;
  }
}

// Singleton instance
export const executionWebSocketHub = new ExecutionWebSocketHub();
