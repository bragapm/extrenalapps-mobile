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
  loginSaved: 'Saved' | null;

  setAuth: (params: {
    accessToken: string;
    refreshToken: string;
    expires: number;
    user: UserInfo;
    loginSaved: 'Saved';
  }) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadAuthFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  user: null,
  loginSaved: null,

  setAuth: async ({accessToken, refreshToken, expires, user, loginSaved}) => {
    const expiresAt = Date.now() + Number(expires);
    await AsyncStorage.multiSet([
      ['token', accessToken],
      ['refresh_token', refreshToken],
      ['expires_at', expiresAt.toString()],
      ['user', JSON.stringify(user)],
      ['login_saved', loginSaved ?? ''],
    ]);
    set({accessToken, refreshToken, expiresAt, user, loginSaved});
  },
  clearAuth: async () => {
    await AsyncStorage.multiRemove([
      'token',
      'refresh_token',
      'expires_at',
      'user',
      'login_saved',
    ]);
    set({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      user: null,
      loginSaved: null,
    });
  },
  loadAuthFromStorage: async () => {
    const [
      [, accessToken],
      [, refreshToken],
      [, expiresAt],
      [, user],
      [, loginSaved],
    ] = await AsyncStorage.multiGet([
      'token',
      'refresh_token',
      'expires_at',
      'user',
      'login_saved',
    ]);
    set({
      accessToken: accessToken ? accessToken : null,
      refreshToken: refreshToken ? refreshToken : null,
      expiresAt: expiresAt ? parseInt(expiresAt, 10) : null,
      user: user ? JSON.parse(user) : null,
      loginSaved: loginSaved === 'Saved' ? 'Saved' : null,
    });
  },
}));
