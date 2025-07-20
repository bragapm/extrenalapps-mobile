import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserInfo {
  role: string;
  email: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  user: UserInfo | null;

  setAuth: (params: {
    accessToken: string;
    refreshToken: string;
    expires: number;
    user: UserInfo;
  }) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadAuthFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  user: null,

  setAuth: async ({accessToken, refreshToken, expires, user}) => {
    const expiresAt = Date.now() + Number(expires);
    await AsyncStorage.multiSet([
      ['token', accessToken],
      ['refresh_token', refreshToken],
      ['expires_at', expiresAt.toString()],
      ['user', JSON.stringify(user)],
    ]);
    set({accessToken, refreshToken, expiresAt, user});
  },
  clearAuth: async () => {
    await AsyncStorage.multiRemove([
      'token',
      'refresh_token',
      'expires_at',
      'user',
    ]);
    set({accessToken: null, refreshToken: null, expiresAt: null, user: null});
  },
  loadAuthFromStorage: async () => {
    const [[, accessToken], [, refreshToken], [, expiresAt], [, user]] =
      await AsyncStorage.multiGet([
        'token',
        'refresh_token',
        'expires_at',
        'user',
      ]);
    set({
      accessToken: accessToken ?? null,
      refreshToken: refreshToken ?? null,
      expiresAt: expiresAt ? parseInt(expiresAt, 10) : null,
      user: user ? JSON.parse(user) : null,
    });
  },
}));
