import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export interface UserInfo {
  role: string;
  email: string;
}

type LoginSaved = 'Saved' | null;

type RefreshPayload = {
  access_token: string;
  refresh_token: string;
  expires: number; // ms
};

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  user: UserInfo | null;
  loginSaved: LoginSaved;

  // internal
  refreshTimerId: ReturnType<typeof setTimeout> | null;
  isRefreshing: boolean;
  refreshingPromise: Promise<void> | null;

  // actions
  setFromRefresh: (p: RefreshPayload) => Promise<void>;
  setUserAndSaved: (u: UserInfo, saved: LoginSaved) => Promise<void>;
  refreshNow: (force?: boolean) => Promise<void>;
  scheduleRefresh: () => void;
  stopRefreshSchedule: () => void;
  clearAuth: () => Promise<void>;
  loadAuthFromStorage: () => Promise<void>;
}

const BASE_URL = 'https://externalapps.braga.co.id/panel';
const REFRESH_LEEWAY_MS = 60_000; // refresh 1 menit sebelum expire

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  user: null,
  loginSaved: null,

  refreshTimerId: null,
  isRefreshing: false,
  refreshingPromise: null,

  setFromRefresh: async ({access_token, refresh_token, expires}) => {
    const expiresAt = Date.now() + Number(expires);
    await AsyncStorage.multiSet([
      ['token', access_token],
      ['refresh_token', refresh_token],
      ['expires_at', String(expiresAt)],
    ]);
    set({accessToken: access_token, refreshToken: refresh_token, expiresAt});
    get().scheduleRefresh();
  },

  setUserAndSaved: async (user, saved) => {
    await AsyncStorage.multiSet([
      ['user', JSON.stringify(user ?? null)],
      ['login_saved', saved ?? ''],
    ]);
    set({user, loginSaved: saved});
  },

  refreshNow: async (force = false) => {
    const state = get();

    // jika sedang refresh, tunggu yang sedang berjalan
    if (state.isRefreshing && state.refreshingPromise) {
      await state.refreshingPromise;
      return;
    }

    const {refreshToken, expiresAt} = state;
    if (!refreshToken) return;

    const stillValid =
      typeof expiresAt === 'number' &&
      Date.now() < expiresAt - REFRESH_LEEWAY_MS;

    if (!force && stillValid) {
      // belum perlu refresh
      return;
    }

    const p = (async () => {
      try {
        const res = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {refresh_token: refreshToken, mode: 'json'},
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        );
        const d = res?.data?.data;
        if (!d?.access_token) {
          throw new Error('Refresh token gagal');
        }
        await get().setFromRefresh({
          access_token: d.access_token,
          refresh_token: d.refresh_token,
          expires: d.expires,
        });
      } catch (e) {
        // Optional: bersihkan auth jika mau paksa logout saat gagal refresh
        // await get().clearAuth();
        throw e;
      }
    })();

    set({isRefreshing: true, refreshingPromise: p});
    try {
      await p;
    } finally {
      set({isRefreshing: false, refreshingPromise: null});
    }
  },

  scheduleRefresh: () => {
    const state = get();
    if (!state.expiresAt || !state.refreshToken) return;

    const ms = Math.max(1000, state.expiresAt - Date.now() - REFRESH_LEEWAY_MS);
    if (state.refreshTimerId) clearTimeout(state.refreshTimerId);

    const id = setTimeout(() => {
      // Jalankan proaktif
      get()
        .refreshNow(true)
        .catch(() => {
          // biarkan interceptor yang menangani pada request berikutnya
        });
    }, ms);

    set({refreshTimerId: id});
  },

  stopRefreshSchedule: () => {
    const id = get().refreshTimerId;
    if (id) clearTimeout(id);
    set({refreshTimerId: null});
  },

  clearAuth: async () => {
    const id = get().refreshTimerId;
    if (id) clearTimeout(id);
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
      refreshTimerId: null,
      isRefreshing: false,
      refreshingPromise: null,
    });
  },

  loadAuthFromStorage: async () => {
    const [
      [, accessToken],
      [, refreshToken],
      [, expiresAtStr],
      [, userStr],
      [, loginSaved],
    ] = await AsyncStorage.multiGet([
      'token',
      'refresh_token',
      'expires_at',
      'user',
      'login_saved',
    ]);

    const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : null;

    set({
      accessToken: accessToken || null,
      refreshToken: refreshToken || null,
      expiresAt,
      user: userStr ? JSON.parse(userStr) : null,
      loginSaved: loginSaved === 'Saved' ? 'Saved' : null,
    });

    if (
      accessToken &&
      refreshToken &&
      expiresAt &&
      expiresAt > Date.now() + 5000
    ) {
      get().scheduleRefresh();
    }
  },
}));
