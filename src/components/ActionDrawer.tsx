import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const ActionDrawer = ({visible, onClose, onEdit, onDelete}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onClose}
        activeOpacity={1}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.menuItem} onPress={onEdit}>
            <Text style={[styles.icon, {color: '#F2831E'}]}>✏️</Text>
            <Text style={styles.menuText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={onDelete}>
            <Text style={[styles.icon, {color: '#888'}]}>🗑️</Text>
            <Text style={styles.menuText}>Hapus</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    minHeight: 160,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
  },
  menuText: {fontSize: 18, marginLeft: 13, color: '#232323'},
  icon: {fontSize: 23, marginLeft: 3},
});
export default ActionDrawer;
