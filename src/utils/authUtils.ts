import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuthStore} from '../store/authStore';
import {refreshTokenAPI} from '../services/apiServices';

/** ===== Types dari API ===== */
type User = {
  id: string | number;
  name?: string;
  email?: string;
};

type RefreshTokenApiData = {
  access_token: string;
  refresh_token: string;
  /**
   * Asumsi BE mengirim "expires" sebagai DURASI (detik dari sekarang).
   * Jika ternyata timestamp (ms epoch), ubah helper toExpiryMs di bawah.
   */
  expires: number;
  user?: User | null;
};

type RefreshTokenApiResponse = {
  data: RefreshTokenApiData;
};

/** ===== Types untuk Auth Store ===== */
type AuthPayload = {
  accessToken: string;
  refreshToken: string;
  /** Timestamp expiry absolut dalam milidetik (ms since epoch) */
  expiresAt: number;
  user: User | null;
};

/** ===== Key Storage ===== */
const EXPIRES_AT_KEY = 'expires_at';
const REFRESH_TOKEN_KEY = 'refresh_token';

/** ===== Helpers ===== */

/** Konversi durasi detik → expiry absolut (ms). */
const toExpiryMs = (expiresSeconds: number): number => {
  return Date.now() + expiresSeconds * 1000;
};

/**
 * Type guard untuk menghindari assertion:
 * Memastikan object memiliki setAuth & clearAuth dengan signature yang kita harapkan.
 */
function hasAuthActions(s: unknown): s is {
  setAuth: (p: AuthPayload) => void | Promise<void>;
  clearAuth: () => void | Promise<void>;
} {
  if (!s || typeof s !== 'object') return false;
  const maybe = s as Record<string, unknown>;
  return (
    typeof maybe.setAuth === 'function' && typeof maybe.clearAuth === 'function'
  );
}

/** Ambil action store dengan aman (tanpa `as ...`). */
const getAuthActions = () => {
  const state = useAuthStore.getState();
  if (!hasAuthActions(state)) {
    // Bila sampai sini, berarti definisi store tidak sesuai dengan ekspektasi
    throw new Error('Auth store actions are not available or mistyped.');
  }
  const {setAuth, clearAuth} = state;
  return {setAuth, clearAuth};
};

/** ===== Main ===== */
/**
 * Auto refresh token kalau hampir/terlanjur kedaluwarsa.
 * Return:
 *  - true  => token valid (masih valid atau berhasil refresh)
 *  - false => tidak valid dan gagal refresh (sudah di-clear dari store)
 */
export const autoRefreshTokenIfNeeded = async (): Promise<boolean> => {
  const [expiresAtStr, refreshTokenStored] = await Promise.all([
    AsyncStorage.getItem(EXPIRES_AT_KEY),
    AsyncStorage.getItem(REFRESH_TOKEN_KEY),
  ]);

  if (!expiresAtStr || !refreshTokenStored) return false;

  const now = Date.now();
  const expiresAtNum = Number(expiresAtStr);
  if (Number.isNaN(expiresAtNum)) return false;

  // Skew 5 detik agar tidak mepet
  const SKEW_MS = 5000;
  if (now < expiresAtNum - SKEW_MS) {
    // Masih valid
    return true;
  }

  // Sudah kedaluwarsa / hampir habis → refresh
  try {
    const res: RefreshTokenApiResponse = await refreshTokenAPI(
      refreshTokenStored,
    );

    // Alias snake_case → camelCase agar lolos camelcase lint
    const {
      access_token: accessTokenRaw,
      refresh_token: refreshTokenRaw,
      expires: expiresRaw,
      user,
    } = res.data;

    // Hitung expiry absolut (ms)
    const newExpiresAt = toExpiryMs(expiresRaw);

    // Sinkronkan ke storage
    await Promise.all([
      AsyncStorage.setItem(EXPIRES_AT_KEY, String(newExpiresAt)),
      AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshTokenRaw),
    ]);

    // Update auth store tanpa assertion & tanpa “payload” jadi sumber masalah
    const {setAuth} = getAuthActions();
    await setAuth({
      accessToken: accessTokenRaw,
      refreshToken: refreshTokenRaw,
      expiresAt: newExpiresAt,
      user: user ?? null,
    });

    return true;
  } catch {
    // Refresh gagal → bersihkan auth
    const {clearAuth} = getAuthActions();
    await clearAuth();
    return false;
  }
};
