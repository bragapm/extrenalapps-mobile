import {Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

export const getLocationPermission = async () => {
  const permission =
    Platform.OS === 'android'
      ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

  // Cek permission
  let status = await check(permission);

  if (status === RESULTS.DENIED || status === RESULTS.BLOCKED) {
    // Minta izin lokasi
    status = await request(permission);
  }

  return status === RESULTS.GRANTED;
};

export const getCurrentLocation = (): Promise<{
  latitude: number;
  longitude: number;
}> =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      err => {
        reject(err);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  });
