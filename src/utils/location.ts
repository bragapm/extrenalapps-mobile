// utils/location.ts
import {Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  check,
  request,
  RESULTS,
  PERMISSIONS,
  openSettings,
} from 'react-native-permissions';

export type Location = {latitude: number; longitude: number};

const ANDROID_FINE = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
const ANDROID_COARSE = PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION;
const IOS_WHEN_IN_USE = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

// === MODE: NO-BLOCK (paksa gak pernah expose 'blocked' ke caller)
const NO_BLOCK_MODE = true;

function normalize(status: string): 'granted' | 'denied' | 'blocked' {
  if (status === RESULTS.GRANTED) return 'granted';
  if (status === RESULTS.BLOCKED) return NO_BLOCK_MODE ? 'denied' : 'blocked';
  return 'denied';
}

/** Cek izin TANPA popup */
export async function getLocationPermission(): Promise<
  'granted' | 'denied' | 'blocked'
> {
  if (Platform.OS === 'android') {
    const stFine = normalize(await check(ANDROID_FINE));
    const stCoarse = normalize(await check(ANDROID_COARSE));
    // granted kalau salah satu granted
    if (stFine === 'granted' || stCoarse === 'granted') return 'granted';
    // NO_BLOCK_MODE membuat 'blocked' sudah jadi 'denied' di atas
    return 'denied';
  } else {
    const st = await check(IOS_WHEN_IN_USE);
    return st === RESULTS.GRANTED || st === RESULTS.LIMITED
      ? 'granted'
      : 'denied';
  }
}

/** Boolean lama */
export async function ensureLocationPermissionInteractive(): Promise<boolean> {
  return (await ensureLocationPermissionInteractiveWithStatus()) === 'granted';
}

/** Minta izin interaktif (tidak pernah expose 'blocked' bila NO_BLOCK_MODE=true) */
export async function ensureLocationPermissionInteractiveWithStatus(): Promise<
  'granted' | 'denied' | 'blocked'
> {
  const current = await getLocationPermission();
  if (current === 'granted') return 'granted';

  if (Platform.OS === 'android') {
    // rekomendasi: coba COARSE dulu, baru FINE (lebih “ramah”)
    const rCoarse = normalize(await request(ANDROID_COARSE));
    if (rCoarse === 'granted') return 'granted';

    const rFine = normalize(await request(ANDROID_FINE));
    if (rFine === 'granted') return 'granted';

    // keduanya bukan granted → di NO_BLOCK_MODE jatuhnya selalu 'denied'
    return 'denied';
  } else {
    const r = await request(IOS_WHEN_IN_USE);
    return r === RESULTS.GRANTED || r === RESULTS.LIMITED
      ? 'granted'
      : 'denied';
  }
}

export async function openAppSettings(): Promise<void> {
  try {
    await openSettings();
  } catch {}
}

export function getCurrentLocation(
  timeoutMs = 15000,
  maximumAgeMs = 10000,
): Promise<Location> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      err => reject(err),
      {enableHighAccuracy: true, timeout: timeoutMs, maximumAge: maximumAgeMs},
    );
  });
}
