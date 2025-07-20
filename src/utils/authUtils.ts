import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuthStore} from '../store/authStore';
import {refreshTokenAPI} from '../services/apiServices';

export const autoRefreshTokenIfNeeded = async (): Promise<boolean> => {
  const expiresAt = await AsyncStorage.getItem('expires_at');
  const refreshToken = await AsyncStorage.getItem('refresh_token');
  const now = Date.now();

  if (!expiresAt || !refreshToken) return false;
  if (now < Number(expiresAt) - 5000) return true; // masih valid

  // Token expired, coba refresh
  try {
    const res = await refreshTokenAPI(refreshToken);
    await useAuthStore.getState().setAuth({
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
      expires: res.data.expires,
      user: res.data.user || null, // atau null jika tidak ada
    });
    return true;
  } catch {
    await useAuthStore.getState().clearAuth();
    return false;
  }
};
