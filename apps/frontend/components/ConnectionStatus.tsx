import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

interface ConnectionStatus {
  backend: 'connected' | 'disconnected' | 'checking';
  backendUrl: string;
  apiVersion?: string;
  features?: {
    playwright: boolean;
    openai: boolean;
  };
  error?: string;
}

export default function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    backend: 'checking',
    backendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  });

  const checkConnection = async () => {
    setStatus(prev => ({ ...prev, backend: 'checking', error: undefined }));

    try {
      // Check backend health
      const healthResponse = await api.health.check();

      if (healthResponse.success && healthResponse.data) {
        setStatus({
          backend: 'connected',
          backendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
          apiVersion: healthResponse.data.version,
          features: healthResponse.data.services,
        });
      } else {
        setStatus(prev => ({
          ...prev,
          backend: 'disconnected',
          error: healthResponse.error || 'Failed to connect to backend',
        }));
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        backend: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  };

  useEffect(() => {
    checkConnection();
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-neutral-900">Connection Status</h2>
        <button
          onClick={checkConnection}
          disabled={status.backend === 'checking'}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh connection status"
        >
          <RefreshCw
            size={18}
            className={`text-neutral-600 ${status.backend === 'checking' ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      <div className="space-y-4">
        {/* Backend Status */}
        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
          <div className="flex items-center gap-3">
            {status.backend === 'connected' && (
              <CheckCircle2 size={24} className="text-green-500" />
            )}
            {status.backend === 'disconnected' && (
              <XCircle size={24} className="text-red-500" />
            )}
            {status.backend === 'checking' && (
              <AlertCircle size={24} className="text-yellow-500 animate-pulse" />
            )}
            <div>
              <h3 className="font-medium text-neutral-900">Backend API</h3>
              <p className="text-sm text-neutral-600">{status.backendUrl}</p>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                status.backend === 'connected'
                  ? 'bg-green-100 text-green-700'
                  : status.backend === 'disconnected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {status.backend === 'connected'
                ? 'Connected'
                : status.backend === 'disconnected'
                ? 'Disconnected'
                : 'Checking...'}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {status.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              <strong>Error:</strong> {status.error}
            </p>
            <p className="text-xs text-red-600 mt-2">
              Make sure the backend server is running at {status.backendUrl}
            </p>
          </div>
        )}

        {/* Backend Features */}
        {status.backend === 'connected' && status.features && (
          <div className="p-4 bg-neutral-50 rounded-lg">
            <h4 className="font-medium text-neutral-900 mb-3">Backend Features</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Playwright</span>
                {status.features.playwright ? (
                  <CheckCircle2 size={16} className="text-green-500" />
                ) : (
                  <XCircle size={16} className="text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">OpenAI</span>
                {status.features.openai ? (
                  <CheckCircle2 size={16} className="text-green-500" />
                ) : (
                  <XCircle size={16} className="text-neutral-400" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Connection Instructions */}
        {status.backend === 'disconnected' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How to start the backend:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Open a terminal in the backend directory</li>
              <li>
                Run: <code className="bg-blue-100 px-2 py-1 rounded">npm run dev</code>
              </li>
              <li>The backend should start on port 3001</li>
              <li>Click the refresh button above to check again</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
