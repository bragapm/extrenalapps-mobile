import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';

const InputMultiSelect = ({
  visible,
  onClose,
  data = [],
  selected = [],
  onSelect,
  labelExtractor = item => item.label || item.name || item,
  valueExtractor = item => item.value || item.id || item,
  title = 'Pilih Item',
  maxHeight = 350,
}) => {
  const handleToggle = value => {
    if (selected.includes(value)) {
      onSelect(selected.filter(v => v !== value));
    } else {
      onSelect([...selected, value]);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalContainer, {maxHeight}]}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView>
            {data.map((item, idx) => {
              const value = valueExtractor(item);
              const label = labelExtractor(item);
              const checked = selected.includes(value);
              return (
                <TouchableOpacity
                  key={value}
                  style={styles.itemRow}
                  onPress={() => handleToggle(value)}>
                  <View
                    style={[styles.checkbox, checked && styles.checkboxActive]}>
                    {checked ? <Text style={styles.checkText}>✓</Text> : null}
                  </View>
                  <Text style={{fontSize: 16}}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity style={styles.btnDone} onPress={onClose}>
            <Text style={{color: '#fff', fontWeight: 'bold'}}>Selesai</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.19)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    alignSelf: 'center',
    elevation: 6,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 10,
    alignSelf: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.4,
    borderBottomColor: '#ececec',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#d22c32',
    marginRight: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#d22c32',
  },
  checkText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: -2,
  },
  btnDone: {
    backgroundColor: '#d22c32',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 15,
  },
});

export default InputMultiSelect;
