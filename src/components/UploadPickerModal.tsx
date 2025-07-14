import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const UploadPickerModal = ({visible, onClose, onCamera, onFile}) => (
  <Modal
    transparent
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}>
    <View style={modalStyles.overlay}>
      <View style={modalStyles.content}>
        <Text style={modalStyles.title}>Unggah Foto</Text>
        <View style={{flexDirection: 'row', marginTop: 12}}>
          <TouchableOpacity style={modalStyles.option} onPress={onCamera}>
            {/* Bisa ganti jadi icon */}
            <Text style={modalStyles.icon}>📷</Text>
            <Text>Buka Kamera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={modalStyles.option} onPress={onFile}>
            <Text style={modalStyles.icon}>📄</Text>
            <Text>Pilih dari file</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
          <Text style={{fontSize: 24, color: '#999'}}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: 310,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 16,
    elevation: 5,
    position: 'relative',
  },
  title: {fontSize: 18, fontWeight: '600', marginBottom: 7},
  option: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {fontSize: 32, marginBottom: 5},
  closeBtn: {position: 'absolute', top: 12, right: 14},
});

export default UploadPickerModal;
