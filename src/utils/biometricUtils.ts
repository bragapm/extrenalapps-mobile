import ReactNativeBiometrics from 'react-native-biometrics';

export const promptBiometric = async () => {
  try {
    const {available} = await ReactNativeBiometrics.isSensorAvailable();
    if (!available) return false;
    const {success} = await ReactNativeBiometrics.simplePrompt({
      promptMessage: 'Konfirmasi identitas dengan biometric',
    });
    return !!success;
  } catch (err) {
    return false;
  }
};
