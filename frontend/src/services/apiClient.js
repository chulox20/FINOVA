/**
 * Centralized REST API Client for FINOVA
 * Handles JWT injection, JSON serialization, errors, and standard responses.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getToken() {
    try {
      return localStorage.getItem('finova_jwt_token');
    } catch {
      return null;
    }
  }

  setToken(token) {
    try {
      if (token) {
        localStorage.setItem('finova_jwt_token', token);
      } else {
        localStorage.removeItem('finova_jwt_token');
      }
    } catch (err) {
      console.warn('LocalStorage error saving token:', err);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Handle non-JSON responses (e.g. CSV file download)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/csv')) {
        if (!response.ok) throw new Error('Error al descargar archivo CSV');
        return await response.text();
      }

      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          // Token expired or invalid
          this.setToken(null);
          window.dispatchEvent(new CustomEvent('finova_auth_expired'));
        }

        const errorMessage = data?.message || `Error del servidor (${response.status})`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data?.data !== undefined ? data.data : data;
    } catch (error) {
      console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, error.message);
      throw error;
    }
  }

  get(endpoint, params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request(`${endpoint}${queryString}`, { method: 'GET' });
  }

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
