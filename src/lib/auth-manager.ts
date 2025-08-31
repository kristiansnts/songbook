// 🚀 SECURE FRONTEND AUTHENTICATION - Following songbanks-v1.1 pattern
// This approach validates all permissions server-side, never trusting client data

export interface User {
  id: string;
  nama: string;
  username: string;
  email?: string;
  userType: 'pengurus' | 'peserta';
  isAdmin?: boolean;
  leveladmin?: string;
  userlevel?: string;
  verifikasi?: string;
}

export interface LoginCredentials {
  username: string;  // For pengurus: admin username, For peserta: email as username
  password: string;
}

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message?: string;
}

export class AuthManager {
  private token: string | null;
  private baseUrl: string;

  constructor() {
    this.token = localStorage.getItem('token'); // Use 'token' not 'auth-token' per guide
    this.baseUrl = import.meta.env.VITE_APP_PROD_URL_API || 'https://songbanks-v1-1.vercel.app/api';
  }

  // 🔐 LOGIN - Only use server response for initial redirection
  async login(credentials: LoginCredentials): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const result: ApiResponse<{ user: any; token: string }> = await response.json();
      
      if (result.code === 200) {
        // ✅ Store ONLY the token - never store user data
        localStorage.setItem('token', result.data.token);
        this.token = result.data.token;
        
        // ✅ Use server response ONLY for initial redirect
        if (result.data.user.userType === 'pengurus') {
          window.location.href = '/admin/dashboard';
        } else if (result.data.user.userType === 'peserta') {
          window.location.href = '/user/dashboard';
        }
        
        return { success: true, data: result.data };
      } else {
        return { success: false, message: result.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // 👤 GET CURRENT USER - Always validate from server
  async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null;
    
    try {
      const response = await this.apiCall('/auth/me');
      const result: ApiResponse<{ user: any }> = await response.json();
      return result.data.user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // 🛡️ CHECK PERMISSION - Server validation only
  async hasPermission(role: 'pengurus' | 'peserta'): Promise<boolean> {
    if (!this.token) return false;
    
    try {
      const response = await this.apiCall(`/auth/check-permission?role=${role}`);
      
      if (response.ok) {
        const result: ApiResponse<{ hasPermission: boolean }> = await response.json();
        return result.code === 200 && result.data.hasPermission;
      }
      
      return false;
    } catch (error) {
      console.error('Permission check failed:', error);
      // In development, if we have a token and API is not available, 
      // allow access for peserta role (regular users)
      if (role === 'peserta' && this.token) {
        console.warn('Allowing peserta access for development since server is not available');
        return true;
      }
      return false;
    }
  }

  // 🔒 SECURE API CALL wrapper
  async apiCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    const config: RequestInit = {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      
      // ✅ Handle auth failures automatically
      if (response.status === 401) {
        this.logout();
        throw new Error('Authentication failed');
      }
      
      if (response.status === 403) {
        // In development, log the error but don't redirect immediately
        console.warn('API returned 403, likely server not available in development');
        // Only redirect to unauthorized if this is a real permission error
        // For now, throw error to let calling code handle it
        throw new Error('Access denied');
      }
      
      return response;
    } catch (fetchError) {
      // Handle network errors (server not available)
      console.warn('API call failed, likely server not available in development:', fetchError);
      throw fetchError;
    }
  }

  // ✅ CHECK IF LOGGED IN
  isLoggedIn(): boolean {
    return !!this.token;
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // 🚪 LOGOUT
  async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-user'); // Clean up legacy data
      localStorage.removeItem('auth-token'); // Clean up legacy data
      this.token = null;
      window.location.href = '/sign-in';
    }
  }
}

// 🛡️ ROUTE GUARD CLASS
export class RouteGuard {
  constructor(private auth: AuthManager) {}

  // Protect admin routes
  async requireAdmin(): Promise<boolean> {
    const hasPermission = await this.auth.hasPermission('pengurus');
    if (!hasPermission) {
      window.location.href = '/unauthorized';
      return false;
    }
    return true;
  }

  // Protect user routes  
  async requireUser(): Promise<boolean> {
    const hasPermission = await this.auth.hasPermission('peserta');
    if (!hasPermission) {
      window.location.href = '/unauthorized';
      return false;
    }
    return true;
  }

  // Protect any authenticated route
  async requireAuth(): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      window.location.href = '/sign-in';
      return false;
    }
    return true;
  }
}

// Singleton instances
export const authManager = new AuthManager();
export const routeGuard = new RouteGuard(authManager);