// API Service Layer - Connects Frontend to Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function to handle fetch requests
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Get auth token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Handle non-JSON responses (like HTML error pages)
      const text = await response.text();
      console.error('Non-JSON response:', text);
      
      if (!response.ok) {
        return {
          success: false,
          error: `Server error: ${response.status} ${response.statusText}. Please ensure the backend server is running.`,
        };
      }
      
      return {
        success: false,
        error: 'Server returned an unexpected response format.',
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || `Error: ${response.status} ${response.statusText}`,
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Unable to connect to server. Please ensure the backend is running on ' + API_BASE_URL,
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

// Auth API
export const authApi = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    return fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(credentials: RegisterCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    return fetchApi('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async logout(): Promise<ApiResponse<void>> {
    return fetchApi('/api/auth/logout', {
      method: 'POST',
    });
  },

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return fetchApi('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return fetchApi('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
};

// Settings API
export const settingsApi = {
  async getProfile(): Promise<ApiResponse<User>> {
    return fetchApi('/api/settings/profile');
  },

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return fetchApi('/api/settings/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return fetchApi('/api/settings/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async getPaymentDetails(): Promise<ApiResponse<any>> {
    return fetchApi('/api/settings/payment');
  },

  async updatePaymentDetails(data: any): Promise<ApiResponse<any>> {
    return fetchApi('/api/settings/payment', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getIntegrations(): Promise<ApiResponse<any>> {
    return fetchApi('/api/settings/integrations');
  },

  async connectIntegration(type: 'jira' | 'gitlab' | 'slack', credentials: any): Promise<ApiResponse<any>> {
    return fetchApi(`/api/settings/integrations/${type}`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async disconnectIntegration(type: 'jira' | 'gitlab' | 'slack'): Promise<ApiResponse<void>> {
    return fetchApi(`/api/settings/integrations/${type}`, {
      method: 'DELETE',
    });
  },
};

// Projects API
export const projectsApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return fetchApi('/api/projects');
  },

  async getById(id: string): Promise<ApiResponse<any>> {
    return fetchApi(`/api/projects/${id}`);
  },

  async create(data: any): Promise<ApiResponse<any>> {
    return fetchApi('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any): Promise<ApiResponse<any>> {
    return fetchApi(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return fetchApi(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

// Test Cases API
export const testCasesApi = {
  async getAll(projectId?: string): Promise<ApiResponse<any[]>> {
    const query = projectId ? `?projectId=${projectId}` : '';
    return fetchApi(`/api/test-cases${query}`);
  },

  async getById(id: string): Promise<ApiResponse<any>> {
    return fetchApi(`/api/test-cases/${id}`);
  },

  async create(data: any): Promise<ApiResponse<any>> {
    return fetchApi('/api/test-cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any): Promise<ApiResponse<any>> {
    return fetchApi(`/api/test-cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return fetchApi(`/api/test-cases/${id}`, {
      method: 'DELETE',
    });
  },
};

// Executions API
export const executionsApi = {
  async getAll(testCaseId?: string): Promise<ApiResponse<any[]>> {
    const query = testCaseId ? `?testCaseId=${testCaseId}` : '';
    return fetchApi(`/api/executions${query}`);
  },

  async getById(id: string): Promise<ApiResponse<any>> {
    return fetchApi(`/api/executions/${id}`);
  },

  async execute(testCaseId: string): Promise<ApiResponse<any>> {
    return fetchApi('/api/executions', {
      method: 'POST',
      body: JSON.stringify({ testCaseId }),
    });
  },
};

// Dashboard API
export const dashboardApi = {
  async getStats(): Promise<ApiResponse<any>> {
    return fetchApi('/api/dashboard/stats');
  },

  async getRecentActivity(): Promise<ApiResponse<any[]>> {
    return fetchApi('/api/dashboard/recent-activity');
  },
};

// Chat API
export const chatApi = {
  async sendMessage(
    content: string, 
    conversationId?: string, 
    projectId?: string, 
    branchId?: string
  ): Promise<ApiResponse<any>> {
    return fetchApi('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify({ content, conversationId, projectId, branchId }),
    });
  },

  async getConversation(id: string): Promise<ApiResponse<any>> {
    return fetchApi(`/api/chat/${id}`);
  },

  async getHistory(): Promise<ApiResponse<any[]>> {
    return fetchApi('/api/chat/history');
  },

  async createChat(title: string): Promise<ApiResponse<any>> {
    return fetchApi('/api/chat/new', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  async deleteChat(id: string): Promise<ApiResponse<void>> {
    return fetchApi(`/api/chat/${id}`, {
      method: 'DELETE',
    });
  },
};

// Intent Parser API
export interface ParsedIntent {
  id: string;
  action: string;
  target: string;
  url?: string;
  constraints?: string[];
  expectedOutcome?: string;
  confidence: number;
  aiUsed: boolean;
  createdAt: string;
}

export const intentApi = {
  async parseIntent(prompt: string, projectId?: string): Promise<ApiResponse<{ intent: ParsedIntent; message: string }>> {
    return fetchApi('/api/intent/parse', {
      method: 'POST',
      body: JSON.stringify({ prompt, projectId }),
    });
  },

  async getHistory(projectId?: string, limit?: number): Promise<ApiResponse<{ intents: ParsedIntent[] }>> {
    const query = new URLSearchParams();
    if (projectId) query.append('projectId', projectId);
    if (limit) query.append('limit', limit.toString());
    const queryString = query.toString();
    return fetchApi(`/api/intent/history${queryString ? `?${queryString}` : ''}`);
  },
};

// Configuration API
export const configApi = {
  async get(): Promise<ApiResponse<any>> {
    return fetchApi('/api/config');
  },

  async update(data: any): Promise<ApiResponse<any>> {
    return fetchApi('/api/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Health Check API
export const healthApi = {
  async check(): Promise<ApiResponse<any>> {
    return fetchApi('/api/health');
  },
};

// Export all APIs
export const api = {
  auth: authApi,
  settings: settingsApi,
  projects: projectsApi,
  testCases: testCasesApi,
  executions: executionsApi,
  dashboard: dashboardApi,
  chat: chatApi,
  intent: intentApi,
  config: configApi,
  health: healthApi,
};

export default api;
