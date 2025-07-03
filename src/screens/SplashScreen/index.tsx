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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackNavigationProp} from '@react-navigation/stack';
import {useThemeStore} from '../../theme/useThemeStore';
import {RootStackParamList} from '../../navigation';
import {getLocationPermission, getCurrentLocation} from '../../utils/location';
import {useUserStore} from '../../store/userStore';

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

const SplashScreen: React.FC<Props> = ({navigation}) => {
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const progress = useRef(new Animated.Value(0)).current;
  const segmentAnims = useRef(
    ONBOARDING_STEPS.map(() => new Animated.Value(0)),
  ).current;
  const DURATION = 7000;
  const setUserLocation = useUserStore(state => state.setLocation);
  const [locationAsked, setLocationAsked] = useState(false);

  useEffect(() => {
    const checkLocation = async () => {
      const isLocationAsked = await AsyncStorage.getItem('isLocationAsked');
      if (isLocationAsked === 'yes') {
        setLocationAsked(true);
        return;
      }
      const granted = await getLocationPermission();
      if (granted) {
        try {
          const loc = await getCurrentLocation();
          setUserLocation(loc); // <-- ini aja cukup
          await AsyncStorage.setItem('isLocationAsked', 'yes');
          setLocationAsked(true);
        } catch (err) {
          setLocationAsked(false);
        }
      } else {
        setLocationAsked(false);
      }
    };
    checkLocation();
  }, []);

  useEffect(() => {
    // Cek status login dari storage
    const checkLogin = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        setTimeout(() => {
          if (isLoggedIn === 'yes') {
            navigation.replace('Main');
          } else {
            setShowOnboarding(true);
            setLoading(false);
          }
        }, 1200); // Splash screen tampil sebentar
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
              onPress={() => {
                if (step === ONBOARDING_STEPS.length - 1) {
                  // Jangan set login di sini!
                  navigation.replace('Login');
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
