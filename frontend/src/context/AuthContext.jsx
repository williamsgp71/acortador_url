import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getMe, logout as apiLogout, refreshToken } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshTokenValue, setRefreshTokenValue] = useState(localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (accessToken) {
        try {
          const userData = await getMe(accessToken);
          setUser({ ...userData, access_token: accessToken });
        } catch {
          // Token might be expired, try refresh
          if (refreshTokenValue) {
            try {
              const tokens = await refreshToken(refreshTokenValue);
              setAccessToken(tokens.access_token);
              setRefreshTokenValue(tokens.refresh_token);
              localStorage.setItem('accessToken', tokens.access_token);
              localStorage.setItem('refreshToken', tokens.refresh_token);
              const userData = await getMe(tokens.access_token);
              setUser({ ...userData, access_token: tokens.access_token });
            } catch {
              // Refresh failed, clear tokens
              logout();
            }
          }
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  async function login(username, password) {
    const tokens = await apiLogin(username, password);
    setAccessToken(tokens.access_token);
    setRefreshTokenValue(tokens.refresh_token);
    localStorage.setItem('accessToken', tokens.access_token);
    localStorage.setItem('refreshToken', tokens.refresh_token);
    const userData = await getMe(tokens.access_token);
    setUser({ ...userData, access_token: tokens.access_token });
    return userData;
  }

  async function register(email, username, password) {
    const tokens = await apiRegister(email, username, password);
    setAccessToken(tokens.access_token);
    setRefreshTokenValue(tokens.refresh_token);
    localStorage.setItem('accessToken', tokens.access_token);
    localStorage.setItem('refreshToken', tokens.refresh_token);
    const userData = await getMe(tokens.access_token);
    setUser({ ...userData, access_token: tokens.access_token });
    return userData;
  }

  async function logout() {
    if (accessToken && refreshTokenValue) {
      try {
        await apiLogout(accessToken, refreshTokenValue);
      } catch {
        // Ignore logout errors
      }
    }
    setUser(null);
    setAccessToken(null);
    setRefreshTokenValue(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}