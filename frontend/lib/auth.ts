'use client';

import Cookies from 'js-cookie';

export const TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  
  Cookies.set(TOKEN_KEY, access, { 
    expires: 7, 
    path: '/',
    sameSite: 'lax',
  });
  Cookies.set(REFRESH_TOKEN_KEY, refresh, { 
    expires: 7, 
    path: '/',
    sameSite: 'lax',
  });
};

export const getAccessToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  console.log('🔑 Token from localStorage:', token ? 'exists' : 'null');
  
  if (token) return token;
  return Cookies.get(TOKEN_KEY) || null;
};

export const getRefreshToken = (): string | null => {
  const token = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (token) return token;
  return Cookies.get(REFRESH_TOKEN_KEY) || null;
};

export const removeTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  Cookies.remove(TOKEN_KEY, { path: '/' });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export const logout = () => {
  removeTokens();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

export const refreshToken = async (): Promise<string | null> => {
  try {
    const refresh = getRefreshToken();
    if (!refresh) {
      logout();
      return null;
    }

    const response = await fetch('http://localhost:8000/api/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });

    if (response.ok) {
      const data = await response.json();
      setTokens(data.access, refresh);
      return data.access;
    } else {
      logout();
      return null;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    logout();
    return null;
  }
};
