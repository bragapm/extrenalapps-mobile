// src/components/ModalToast.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import FastImage from 'react-native-fast-image';

type ToastProps = {
  visible: boolean;
  type?: 'success' | 'error';
  title?: string;
  message?: string;
  onClose?: () => void;
};

const icons = {
  error: require('../assets/icons/Failed.png'),
  success: require('../assets/icons/success.png'),
};

const Toast: React.FC<ToastProps> = ({
  visible,
  type = 'error',
  title = 'Error',
  message = '',
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            type === 'error' ? styles.borderError : styles.borderSuccess,
          ]}>
          <FastImage
            source={icons[type]}
            style={styles.icon}
            resizeMode={FastImage.resizeMode.contain}
          />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity
            style={[
              styles.button,
              type === 'error' ? styles.btnError : styles.btnSuccess,
            ]}
            onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    minWidth: 300,
    maxWidth: 340,
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 8},
  },
  borderError: {
    borderLeftWidth: 8,
    borderLeftColor: '#E74C3C',
  },
  borderSuccess: {
    borderLeftWidth: 8,
    borderLeftColor: '#27ae60',
  },
  btnError: {
    // borderLeftWidth: 8,
    backgroundColor: '#E74C3C',
  },
  btnSuccess: {
    // borderLeftWidth: 8,
    backgroundColor: '#27ae60',
  },
  icon: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#A80000',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default Toast;
