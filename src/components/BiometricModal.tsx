import React, {useEffect} from 'react';
import {Modal, View, Text, ActivityIndicator} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';

export default function BiometricModal({visible, onSuccess, onFail}) {
  useEffect(() => {
    if (visible) {
      (async () => {
        try {
          const rnBiometrics = new ReactNativeBiometrics();
          const {available} = await rnBiometrics.isSensorAvailable();
          if (!available) {
            onFail && onFail();
            return;
          }
          const {success} = await rnBiometrics.simplePrompt({
            promptMessage: 'Login ulang dengan biometric',
          });
          if (success) {
            onSuccess && onSuccess();
          } else {
            onFail && onFail();
          }
        } catch (err) {
          onFail && onFail();
        }
      })();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0007',
        }}>
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 24,
            alignItems: 'center',
          }}>
          <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 18}}>
            Autentikasi Biometric
          </Text>
          <ActivityIndicator size="large" color="#E53935" />
        </View>
      </View>
    </Modal>
  );
}
