import React from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  Platform,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import {useThemeStore} from '../../theme/useThemeStore';
import AppHeader from '../../components/AppHeader';

const LabelValue = ({label, value}) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value]}>{value || '-'}</Text>
  </View>
);

const DetailAttendance = ({route}) => {
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();
  const {data} = route.params;
  //   console.log('ROUT', data);

  const {
    date = '-',
    name = '-',
    isafeNumber = '-',
    nik = '-',
    role = '-',
    status = '-',
  } = {
    ...data,
    isafeNumber: data.isafeNumber || data.iSafeNumber || 'IDT01A5JWADPKZA999', // default dari gambar
    nik: data.nik || data.NIK || '1234567890112', // default dari gambar
    role: data.role === 'Dept.Head' ? 'Geologist' : data.role, // contoh penyesuaian
  };

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={[styles.container, {backgroundColor: colors.bgHome}]}>
        <AppHeader detail={true} home={false} label="Detail Kehadiran " />
        <View style={styles.contentBox}>
          <LabelValue label="Tanggal" value={date} />
          <LabelValue label="Nama" value={name} />
          <LabelValue label="iSafe Number" value={isafeNumber} />
          <LabelValue label="NIK" value={nik} />
          <LabelValue label="Role" value={role} />
          <View style={styles.item}>
            <Text style={styles.label}>Status</Text>
            <TouchableOpacity
              style={{
                marginTop: 4,
                borderWidth: 1,
                borderColor: status === 'Hadir' ? '#1989FA' : '#E35131',
                borderRadius: 6,
                paddingHorizontal: 10,
                paddingVertical: 2,
                alignSelf: 'flex-start',
                backgroundColor: '#F8F9FA',
              }}>
              <Text
                style={{
                  color: status === 'Hadir' ? '#1989FA' : '#E35131',
                  fontSize: 14,
                }}>
                {status}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center'},
  contentBox: {
    marginTop: 18,
    backgroundColor: 'transparent',
    borderRadius: 5,
    marginHorizontal: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    // elevation: 1,
    width: '100%',
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E1DF',
    paddingVertical: 8,
  },
  label: {
    fontSize: 13,
    color: '#838383',
  },
  value: {
    fontSize: 16,
    marginTop: 2,
    color: '#212121',
  },

  statusButton: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#1989FA',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    backgroundColor: '#F8F9FA',
  },
  statusText: {
    color: '#1989FA',
    fontSize: 14,
  },
});

export default DetailAttendance;
