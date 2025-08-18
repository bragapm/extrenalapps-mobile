import {Platform, Alert} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  check,
  request,
  RESULTS,
  PERMISSIONS,
  openSettings,
} from 'react-native-permissions';

export type Location = {latitude: number; longitude: number};

// Helper pilih constant permission
const ANDROID_FINE = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
const ANDROID_COARSE = PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION;
const IOS_WHEN_IN_USE = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

/**
 * Cek izin lokasi TANPA memunculkan dialog.
 * Dipakai di Splash supaya flow tidak ke-block.
 * return: 'granted' | 'denied' | 'blocked'
 */
export async function getLocationPermission(): Promise<
  'granted' | 'denied' | 'blocked'
> {
  if (Platform.OS === 'android') {
    const stFine = await check(ANDROID_FINE);
    if (stFine === RESULTS.GRANTED) return 'granted';
    if (stFine === RESULTS.BLOCKED) return 'blocked';

    const stCoarse = await check(ANDROID_COARSE);
    if (stCoarse === RESULTS.GRANTED) return 'granted';
    if (stCoarse === RESULTS.BLOCKED) return 'blocked';

    return 'denied';
  } else {
    const st = await check(IOS_WHEN_IN_USE);
    if (st === RESULTS.GRANTED || st === RESULTS.LIMITED) return 'granted';
    if (st === RESULTS.BLOCKED) return 'blocked';
    return 'denied';
  }
}

/**
 * Meminta izin lokasi secara interaktif.
 * Dipanggil saat user tekan tombol “user location”.
 * return: true jika izin ada; false kalau ditolak/blocked.
 */
export async function ensureLocationPermissionInteractive(): Promise<boolean> {
  // kalau sudah granted, langsung true
  const current = await getLocationPermission();
  if (current === 'granted') return true;

  if (Platform.OS === 'android') {
    // minta FINE dulu
    const rFine = await request(ANDROID_FINE);
    if (rFine === RESULTS.GRANTED) return true;
    if (rFine === RESULTS.BLOCKED) return promptOpenSettings();

    // coba COARSE
    const rCoarse = await request(ANDROID_COARSE);
    if (rCoarse === RESULTS.GRANTED) return true;
    if (rCoarse === RESULTS.BLOCKED) return promptOpenSettings();

    return false;
  } else {
    const r = await request(IOS_WHEN_IN_USE);
    if (r === RESULTS.GRANTED || r === RESULTS.LIMITED) return true;
    if (r === RESULTS.BLOCKED) return promptOpenSettings();
    return false;
  }
}

function promptOpenSettings(): false {
  Alert.alert(
    'Izin Lokasi Diblokir',
    'Aktifkan izin lokasi di Pengaturan agar posisi Anda dapat ditampilkan.',
    [
      {text: 'Batal', style: 'cancel'},
      {text: 'Buka Pengaturan', onPress: () => openSettings()},
    ],
    {cancelable: true},
  );
  return false;
}

export function getCurrentLocation(
  timeoutMs = 15000,
  maximumAgeMs = 10000,
): Promise<Location> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      err => reject(err),
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: maximumAgeMs,
      },
    );
  });
}
