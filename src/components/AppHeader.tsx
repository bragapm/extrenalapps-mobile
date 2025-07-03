import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  StatusBar,
  Image,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  FlatList,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useThemeStore} from '../theme/useThemeStore';
import {RootStackParamList} from '../navigation';
import {StackNavigationProp} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUserStore} from '../store/userStore';

const {width, height} = Dimensions.get('window');
type AppHeaderProps = {
  home?: boolean;
  liveTeam?: boolean;
  menu?: boolean;
  location?: string;
  label?: string;
};

const AppHeader: React.FC<AppHeaderProps> = ({
  home = true,
  liveTeam = false,
  menu = false,
  location = '',
  label = '',
}) => {
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [showConfirm, setShowConfirm] = useState(false);

  const clearUserStore = useUserStore(state => state.clear);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('userRole');
    clearUserStore(); // <-- reset location & state
    navigation.replace('Login');
  };

  return (
    <>
      {home === true && liveTeam === false && (
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: '12%',
            paddingHorizontal: '5%',
            backgroundColor: '#FFF',
            paddingVertical: '3%',
          }}>
          <View
            style={{
              width: '50%',
              alignItems: 'flex-start',
              // paddingHorizontal: "2%",
              justifyContent: 'center',
            }}>
            <Image
              source={require('../assets/images/LogoBIB.png')}
              style={{width: 160, height: 54}}
              resizeMode="contain"
            />
          </View>
          <View
            style={{
              width: '50%',
              alignItems: 'flex-end',
              // paddingHorizontal: "2%",
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.red,
                borderRadius: 10,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: '5%',
                paddingVertical: '5%',
                marginHorizontal: '2%',
              }}
              onPress={() => setShowConfirm(true)}>
              <Image
                source={require('../assets/icons/logoutIcon.png')}
                style={{width: 15, height: 30}}
                resizeMode="contain"
              />
              <Text
                style={{
                  color: colors.background,
                  fontWeight: '400',
                  fontSize: 16,
                  marginLeft: '5%',
                }}>
                Logout
              </Text>
            </TouchableOpacity>
            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: 10,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: '5%',
                paddingVertical: '5%',
                borderWidth: 2,
                borderColor: colors.green,
              }}>
              <Image
                source={require('../assets/icons/iconSignal.png')}
                style={{width: 15, height: 30}}
                resizeMode="contain"
              />
              <Text
                style={{
                  color: colors.green,
                  fontWeight: '400',
                  fontSize: 16,
                  marginLeft: '5%',
                }}>
                Online
              </Text>
            </View>
          </View>
        </View>
      )}

      {liveTeam === true && home === false && (
        <View
          style={{
            width: '95%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: '12%',
            paddingHorizontal: '5%',
            backgroundColor: '#FFF',
            paddingVertical: '3%',
            position: 'absolute',
            top: 0,
            left: 10,
            right: 10,
            zIndex: 20,
            elevation: 4,
            shadowColor: '#222',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 6,
            borderRadius: 10,
          }}>
          <View
            style={{
              width: '70%',
              alignItems: 'center',
              // paddingHorizontal: "2%",
              justifyContent: 'flex-start',
              flexDirection: 'row',
            }}>
            <Image
              source={require('../assets/icons/BIB-ICON.png')}
              style={{width: width * 0.1, height: 30}}
              resizeMode="contain"
            />
            <Text
              style={{
                fontWeight: '600',
                color: '#161414',
                fontSize: 13,
              }}
              numberOfLines={1}
              ellipsizeMode="tail">
              {`Maps - ${
                location && location.length > 23
                  ? location.substring(0, 23) + '...'
                  : location
              }`}
            </Text>
          </View>
          <View
            style={{
              // width: '50%',
              alignItems: 'flex-end',
              // paddingHorizontal: "2%",
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: 10,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: '5%',
                paddingVertical: '5%',
                borderWidth: 2,
                borderColor: colors.green,
              }}>
              <Image
                source={require('../assets/images/dot.png')}
                style={{width: 15, height: 30}}
                resizeMode="contain"
              />
              <Text
                style={{
                  color: colors.green,
                  fontWeight: '400',
                  fontSize: 16,
                  marginLeft: '5%',
                }}>
                Online
              </Text>
            </View>
          </View>
        </View>
      )}

      {menu === true && liveTeam === false && home === false && (
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: '12%',
            paddingHorizontal: '5%',
            backgroundColor: '#FFF',
            paddingVertical: '3%',
          }}>
          <View
            style={{
              width: '60%',
              alignItems: 'flex-start',
              // paddingHorizontal: "2%",
              justifyContent: 'center',
            }}>
            <Text
              style={{
                color: colors.red,
                fontWeight: '600',
                fontSize: 18,
                marginLeft: '5%',
              }}>
              {label}
            </Text>
          </View>
          <View
            style={{
              width: '50%',
              alignItems: 'flex-end',
              // paddingHorizontal: "2%",
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: 10,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: '5%',
                paddingVertical: '5%',
                borderWidth: 2,
                borderColor: colors.green,
              }}>
              <Image
                source={require('../assets/icons/iconSignal.png')}
                style={{width: 15, height: 30}}
                resizeMode="contain"
              />
              <Text
                style={{
                  color: colors.green,
                  fontWeight: '400',
                  fontSize: 16,
                  marginLeft: '5%',
                }}>
                Online
              </Text>
            </View>
          </View>
        </View>
      )}
      <Modal
        transparent
        visible={showConfirm}
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 14}}>
              Konfirmasi Logout
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#222',
                marginBottom: 24,
                textAlign: 'center',
              }}>
              Apakah Anda yakin ingin logout?
            </Text>
            <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
              <TouchableOpacity
                onPress={() => setShowConfirm(false)}
                style={[styles.modalBtn, {backgroundColor: '#f3f3f3'}]}>
                <Text style={{color: '#222', fontWeight: '500'}}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={[
                  styles.modalBtn,
                  {backgroundColor: '#E24B3B', marginLeft: 10},
                ]}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>
                  Ya, Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    elevation: 8,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
});
export default AppHeader;
