import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  useColorScheme,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackNavigationProp} from '@react-navigation/stack';
import {useThemeStore} from '../../theme/useThemeStore';
import {RootStackParamList} from '../../navigation';
import {getLocationPermission, getCurrentLocation} from '../../utils/location';
import {useUserStore} from '../../store/userStore';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {useFeatureStore} from '../../store/featureStore';
import {autoRefreshTokenIfNeeded} from '../../utils/authUtils';
import ReactNativeBiometrics from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';
import {useAuthStore} from '../../store/authStore';
import {loginAPI} from '../../services/apiServices';
import axios from 'axios';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Splash'>;
};

const ONBOARDING_STEPS = [
  {
    title: 'Selamat Datang di\nExternal Apps Dashboard',
    desc: 'Masuk untuk mengakses dashboard external apps',
  },
  {
    title: 'Selamat Datang di External Apps Dashboard',
    desc: 'Aplikasi dashboard ini bisa kamu pakai untuk monitoring berbagai fitur internal & external.',
  },
  {
    title: 'Selamat Datang di External Apps Dashboard',
    desc: 'Selesaikan login untuk mulai akses dashboard.',
  },
];

const requestCameraPermission = async () => {
  let result;
  if (Platform.OS === 'ios') {
    result = await request(PERMISSIONS.IOS.CAMERA);
  } else {
    result = await request(PERMISSIONS.ANDROID.CAMERA);
  }
  return result;
};

const SplashScreen: React.FC<Props> = ({navigation}) => {
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [step, setStep] = useState(0);
  const [biometricRetryCount, setBiometricRetryCount] = useState(0);
  const MAX_BIOMETRIC_RETRY = 3;
  const [loading, setLoading] = useState(true);
  const progress = useRef(new Animated.Value(0)).current;
  const segmentAnims = useRef(
    ONBOARDING_STEPS.map(() => new Animated.Value(0)),
  ).current;
  const DURATION = 7000;
  const setUserLocation = useUserStore(state => state.setLocation);
  const [locationAsked, setLocationAsked] = useState(false);

  useEffect(() => {
    // Saat SplashScreen dibuka (atau App mount pertama)
    useFeatureStore.getState().clear();
  }, []);

  const handleBiometricLogin = async () => {
    const rnBiometrics = new ReactNativeBiometrics();
    const {available} = await rnBiometrics.isSensorAvailable();
    if (!available) {
      Alert.alert(
        'Biometric tidak tersedia',
        'Perangkat tidak mendukung biometric.',
      );
      navigation.replace('Login');
      return;
    }

    const {success} = await rnBiometrics.simplePrompt({
      promptMessage: 'Otentikasi ulang dengan Biometric',
    });

    if (success) {
      // Hapus token sebelum login ulang
      await useAuthStore.getState().clearAuth();
      await AsyncStorage.multiRemove(['token', 'refresh_token', 'expires_at']);

      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        const {username: savedEmail, password: savedPassword} = credentials;
        try {
          const result = await loginAPI(savedEmail, savedPassword);
          await useAuthStore.getState().setAuth({
            accessToken: result.data.access_token,
            refreshToken: result.data.refresh_token,
            expires: result.data.expires,
            user: {role: 'admin', email: savedEmail},
            loginSaved: 'Saved',
          });
          setBiometricRetryCount(0); // reset counter
          navigation.replace('Main');
        } catch (err) {
          // Jika gagal login, retry biometric max 3x
          if (biometricRetryCount + 1 < MAX_BIOMETRIC_RETRY) {
            setBiometricRetryCount(cnt => cnt + 1);
            setTimeout(() => {
              handleBiometricLogin();
            }, 500); // retry setelah sedikit jeda
          } else {
            Alert.alert(
              'Login Gagal',
              'Gagal login dengan Biometric setelah 3 kali percobaan. Silakan login manual.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    setBiometricRetryCount(0);
                    navigation.replace('Login');
                  },
                },
              ],
              {cancelable: false},
            );
          }
        }
      } else {
        navigation.replace('Login');
      }
    } else {
      // Jika user cancel biometric prompt, langsung ke login manual
      navigation.replace('Login');
    }
  };

  useEffect(() => {
    const checkLocation = async () => {
      try {
        const already = await AsyncStorage.getItem('isLocationAsked');
        if (already === 'yes') {
          setLocationAsked(true);
          return;
        }

        const status = await getLocationPermission(); // 'granted' | 'denied' | 'blocked'
        if (status === 'granted') {
          try {
            const loc = await getCurrentLocation();
            setUserLocation(loc);
            await AsyncStorage.setItem('isLocationAsked', 'yes');
          } catch {
            // abaikan error lokasi, lanjut saja
          }
        }
        // apapun hasil cek, jangan blokir UI
        setLocationAsked(true);
      } catch {
        setLocationAsked(true);
      }
    };
    checkLocation();
  }, []);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        const expiresAt = await AsyncStorage.getItem('expires_at');
        const loginSaved = await AsyncStorage.getItem('login_saved');

        const isExpired = expiresAt
          ? Date.now() > parseInt(expiresAt, 10)
          : true;
        console.log('token', token, 'expired', isExpired);

        // Token masih aktif
        if (token && refreshToken && !isExpired && loginSaved === 'Saved') {
          navigation.replace('Main');
        }
        // Token expired & biometric
        else if (token && refreshToken && isExpired && loginSaved === 'Saved') {
          const rnBiometrics = new ReactNativeBiometrics();
          const {available} = await rnBiometrics.isSensorAvailable();
          if (!available) throw new Error('Biometric not available');

          const {success} = await rnBiometrics.simplePrompt({
            promptMessage: 'Otentikasi ulang dengan Biometric',
          });

          if (success) {
            // Ambil credential dari Keychain
            const credentials = await Keychain.getGenericPassword();
            if (credentials) {
              const {username: savedEmail, password: savedPassword} =
                credentials;
              console.log('[DEBUG][Biometric] Payload login:', {
                email: savedEmail,
                password: savedPassword,
              });
              try {
                const result = await loginAPI(savedEmail, savedPassword);
                console.log('[DEBUG][Biometric] Result loginAPI:', result);
                await useAuthStore.getState().setAuth({
                  accessToken: result.data.access_token,
                  refreshToken: result.data.refresh_token,
                  expires: result.data.expires,
                  user: {role: 'admin', email: savedEmail}, // role bisa dynamic kalau di Keychain sekalian
                  loginSaved: 'Saved',
                });

                navigation.replace('Main');
              } catch (e: unknown) {
                if (axios.isAxiosError(e)) {
                  console.log(
                    '[DEBUG][Biometric] Error saat loginAPI:',
                    e.message,
                    e.response?.status,
                    e.response?.data,
                    e?.response,
                  );
                } else {
                  console.log('[DEBUG][Biometric] Error saat loginAPI:', e);
                }
                navigation.replace('Login');
              }
            } else {
              // Tidak ada credential, ke login manual
              navigation.replace('Login');
            }
          } else {
            // Biometric cancel/gagal
            navigation.replace('Login');
          }
        }
        // Tidak ada session/login
        else {
          setShowOnboarding(true);
          setLoading(false);
        }
      } catch {
        setShowOnboarding(true);
        setLoading(false);
      }
    };

    checkLogin();
  }, [navigation]);

  useEffect(() => {
    if (!showOnboarding) return;
    // Set semua progress sebelumnya full (1), step setelahnya kosong (0)
    segmentAnims.forEach((anim, idx) => {
      if (idx < step) anim.setValue(1);
      else anim.setValue(0);
    });
    Animated.timing(segmentAnims[step], {
      toValue: 1,
      duration: DURATION,
      useNativeDriver: false,
    }).start();
  }, [step, showOnboarding]);

  // if (!locationAsked) {
  //   return (
  //     <View style={styles.background}>
  //       <StatusBar
  //         translucent
  //         backgroundColor="transparent"
  //         barStyle="light-content"
  //       />
  //       <View style={styles.overlay} />

  //     </View>
  //   );
  // }

  // Jika loading (cek status), tampilkan splash doang
  if (loading) {
    return (
      <>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        />
        <ImageBackground
          source={require('../../assets/images/splashScreen.png')}
          style={styles.background}
          resizeMode="cover">
          <View style={styles.overlay} />
          <View style={[styles.logoRow, {marginTop: '10%'}]}>
            <Image
              source={require('../../assets/images/LogoBIB.png')}
              style={{width: 250, height: 54}}
              resizeMode="contain"
            />
          </View>

          <View style={styles.bottomArea}>
            {/* <Text style={styles.desc}>{ONBOARDING_STEPS[step].desc}</Text> */}
            {/* <TouchableOpacity
              style={styles.button}
              onPress={async () => {
                if (step === ONBOARDING_STEPS.length - 1) {
                  await AsyncStorage.setItem("isRegistered", "yes");
                  navigation.replace("Main");
                } else {
                  setStep((s) => s + 1);
                }
              }}
            >
              <Text style={styles.buttonText}>
                {step === ONBOARDING_STEPS.length - 1
                  ? "Masuk melalui UGEMS"
                  : "Lanjut"}
              </Text>
            </TouchableOpacity> */}
          </View>
        </ImageBackground>
      </>
    );
  }

  // Onboarding tampil kalau belum register
  if (showOnboarding) {
    return (
      <>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        />
        <ImageBackground
          source={require('../../assets/images/splashScreen.png')}
          style={styles.background}
          resizeMode="cover">
          <View style={styles.overlay} />

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            {ONBOARDING_STEPS.map((_, idx) => (
              <View key={idx} style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: '#D32E36',
                      width: segmentAnims[idx].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          {/* Logo & Judul */}
          <View style={styles.logoRow}>
            <Image
              source={require('../../assets/images/LogoBIB.png')}
              style={{width: 250, height: 54}}
              resizeMode="contain"
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{ONBOARDING_STEPS[step].title}</Text>
          </View>

          {/* DESC + BUTTON DI BAWAH */}
          <View style={styles.bottomArea}>
            <Text style={styles.desc}>{ONBOARDING_STEPS[step].desc}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={async () => {
                if (step === ONBOARDING_STEPS.length - 1) {
                  // Request permission kamera dulu sebelum Login
                  const cameraStatus = await requestCameraPermission();
                  if (cameraStatus === RESULTS.GRANTED) {
                    navigation.replace('Login');
                  } else {
                    // Gagal / ditolak, munculkan alert/info ke user
                    Alert.alert(
                      'Akses Kamera Diperlukan',
                      'Aplikasi membutuhkan akses kamera untuk fitur tertentu.\nSilakan aktifkan izin kamera di pengaturan perangkat.',
                    );
                  }
                } else {
                  setStep(s => s + 1);
                }
              }}>
              <Text style={styles.buttonText}>
                {step === ONBOARDING_STEPS.length - 1
                  ? 'Masuk melalui UGEMS'
                  : 'Lanjut'}
              </Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </>
    );
  }

  // (Opsional, tidak akan sampai sini)
  return null;
};

const styles = StyleSheet.create({
  background: {flex: 1, width: '100%', height: '100%'},
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 64,
    marginHorizontal: 24,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#fff',
    opacity: 1,
    borderRadius: 8,
    marginHorizontal: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
  },
  progressActive: {backgroundColor: '#D32E36'},
  progressInactive: {backgroundColor: '#fff', opacity: 0.2},
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginLeft: 24,
  },
  logoText: {fontWeight: 'bold', fontSize: 20, color: '#fff'},
  textContainer: {marginTop: 32, marginHorizontal: 24},
  title: {fontSize: 36, fontWeight: 'bold', color: '#fff', lineHeight: 44},

  buttonText: {color: '#fff', fontSize: 18, fontWeight: '500'},
  bottomArea: {
    width: '100%',
    position: 'absolute',
    left: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: 'rgba(0,0,0,0.35)', // biar tetap kontras di atas gambar
  },
  desc: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 16, // sedikit jarak ke button
    textAlign: 'left',
  },
  button: {
    backgroundColor: '#e53935',
    borderRadius: 6,
    paddingVertical: '5%',
    marginBottom: '5%',
    alignItems: 'center',
  },
});

export default SplashScreen;
