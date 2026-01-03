/**
 * WebSocket Routes for Live Execution Streaming
 * Handles WebSocket connections for real-time execution event streaming
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { executionWebSocketHub } from '../services/executionWebSocketHub';
import prisma from '../utils/prisma';

/**
 * Setup WebSocket routes for execution streaming
 */
export function setupWebSocketRoutes(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  // Handle HTTP upgrade to WebSocket
  server.on('upgrade', async (request, socket, head) => {
    const url = request.url || '';

    // Match /ws/executions/:executionId
    const match = url.match(/^\/ws\/executions\/([a-zA-Z0-9-_]+)$/);

    if (match) {
      const executionId = match[1];

      // TODO: Add authentication check here if needed
      // const token = new URL(request.url!, `http://${request.headers.host}`).searchParams.get('token');
      // if (!token) {
      //   socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      //   socket.destroy();
      //   return;
      // }

      // Verify execution exists
      try {
        const execution = await prisma.execution.findUnique({
          where: { id: executionId },
        });

        if (!execution) {
          socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
          socket.destroy();
          return;
        }
      } catch (error) {
        console.error('[WebSocket] Error verifying execution:', error);
        socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
        socket.destroy();
        return;
      }

      // Accept WebSocket connection
      wss.handleUpgrade(request, socket, head, (ws) => {
        executionWebSocketHub.addClient(executionId, ws);
        console.log(`[WebSocket] Connection established for execution ${executionId}`);
      });
    } else {
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
      socket.destroy();
    }
  });

  return wss;
}

/**
 * Check if WebSocket has active listeners
 */
export function hasExecutionListeners(executionId: string): boolean {
  return executionWebSocketHub.hasActiveClients(executionId);
}

/**
 * Get number of listeners for an execution
 */
export function getExecutionListenerCount(executionId: string): number {
  return executionWebSocketHub.getClientCount(executionId);
}
