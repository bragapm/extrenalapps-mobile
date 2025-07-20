import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  ScrollView,
  useColorScheme,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';
import {useThemeStore} from '../../theme/useThemeStore';
import AppHeader from '../../components/AppHeader';
import {RootStackParamList} from '../../navigation';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  getUserById,
  getUsers,
  postData,
  updateLeaveRequest,
} from '../../services/apiServices';

const CUTI_TYPE_OPTIONS = [
  {label: 'Paid Leave', value: 'Paid Leave'}, // Cuti Tahunan/Cuti Dibayar
  {label: 'Unpaid Leave', value: 'Unpaid Leave'}, // Cuti di Luar Tanggungan/Diambil di luar kuota
  {label: 'Sick Leave', value: 'Sick Leave'}, // Cuti Sakit
  {label: 'Maternity Leave', value: 'Maternity Leave'}, // Cuti Melahirkan
  {label: 'Paternity Leave', value: 'Paternity Leave'}, // Cuti Ayah
  {label: 'Bereavement Leave', value: 'Bereavement Leave'}, // Cuti Duka
  {label: 'Marriage Leave', value: 'Marriage Leave'}, // Cuti Pernikahan
  {label: 'Special Leave', value: 'Special Leave'}, // Cuti Khusus
  {label: 'Annual Leave', value: 'Annual Leave'}, // Cuti Tahunan (jika mau dipisah dari Paid Leave)
  {label: 'Study Leave', value: 'Study Leave'}, // Cuti untuk Studi
  {label: 'Hajj Leave', value: 'Hajj Leave'}, // Cuti Ibadah Haji
  {label: 'Child Care Leave', value: 'Child Care Leave'}, // Cuti Anak
];

const approverList = ['Jerry Anwar Halim', 'Putri Maulani', 'Dewi Marlina'];

const formatDateISO = date => {
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

function countDays(start, end) {
  if (!start || !end) return 1;
  const d1 = new Date(start);
  const d2 = new Date(end);
  // Tambahkan 1 hari agar inklusif (misal 15-16 = 2 hari)
  return Math.abs(Math.round((d2 - d1) / (1000 * 60 * 60 * 24))) + 1;
}
function formatDate(d) {
  if (!d) return '';
  const tgl = new Date(d);
  return `${tgl.getDate()} ${tgl.toLocaleString('id-ID', {
    month: 'short',
  })} ${tgl.getFullYear()}`;
}
const DetailCuti = () => {
  const route = useRoute();
  const {showForm = false, data} = route.params || {};
  console.log('dataparams', showForm);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();
  const [userName, setUserName] = useState('-');
  // console.log('showForm', showForm);
  const [cutiType, setCutiType] = useState(CUTI_TYPE_OPTIONS[0].value);
  const [tanggalMulai, setTanggalMulai] = useState(new Date());
  const [tanggalAkhir, setTanggalAkhir] = useState(new Date());
  const [tipeCuti, setTipeCuti] = useState('lebih');
  const [jenisCuti, setJenisCuti] = useState(CUTI_TYPE_OPTIONS[0].value);
  const [approver, setApprover] = useState('');
  const [approverName, setApproverName] = useState('-');

  const [note, setNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDatePickerMulai, setShowDatePickerMulai] = useState(false);
  const [showDatePickerAkhir, setShowDatePickerAkhir] = useState(false);
  const USER_ID = 'a464a937-bb6c-4f6c-b0b4-27d98485a559';
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserById(USER_ID);
        if (userData?.first_name && userData?.last_name) {
          setUserName(`${userData.first_name} ${userData.last_name}`);
        } else if (userData?.first_name) {
          setUserName(userData.first_name);
        } else {
          setUserName('-');
        }
      } catch (e) {
        setUserName('-');
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (showForm && data) {
      // Set value form sesuai data params yang dilempar dari detail
      setTipeCuti('lebih'); // atau sesuaikan data?.type kalau mau
      setTanggalMulai(data.start_date ? new Date(data.start_date) : new Date());
      setTanggalAkhir(data.end_date ? new Date(data.end_date) : new Date());
      setCutiType(data.leave_type || CUTI_TYPE_OPTIONS[0].value);
      setApprover(data?.user || '');
      setNote(data.reason || '');
    } else if (showForm && !data) {
      // Form kosong untuk tambah baru
      setTipeCuti('lebih');
      setTanggalMulai(new Date());
      setTanggalAkhir(new Date());
      setCutiType(CUTI_TYPE_OPTIONS[0].value);
      setApprover(USER_ID);
      setNote('');
    }
  }, [showForm, data]);

  useEffect(() => {
    if (!approver) return setApproverName('-');
    if (approver.length > 24) {
      getUserById(approver)
        .then(u => {
          setApproverName(
            [u?.first_name, u?.last_name].filter(Boolean).join(' ') || '-',
          );
        })
        .catch(() => setApproverName('-'));
    } else {
      setApproverName(approver);
    }
  }, [approver]);

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const handleSubmit = async () => {
    if (!cutiType) return Alert.alert('Error', 'Pilih jenis cuti!');
    if (!tanggalMulai) return Alert.alert('Error', 'Pilih tanggal mulai!');
    if (tipeCuti === 'lebih' && !tanggalAkhir)
      return Alert.alert('Error', 'Pilih tanggal akhir!');
    if (!note) return Alert.alert('Error', 'Isi alasan cuti!');
    setLoadingSubmit(true);
    try {
      const start_date = tanggalMulai
        ? tanggalMulai.toISOString().slice(0, 10)
        : null;
      const end_date =
        tipeCuti === 'lebih' && tanggalAkhir
          ? tanggalAkhir.toISOString().slice(0, 10)
          : start_date;

      const payload = {
        leave_type: cutiType,
        start_date: start_date,
        end_date: end_date,
        reason: note,
        user: USER_ID,
        status: 'waiting',
      };
      // console.log('Body:', payload);

      if (showForm && data && data.id) {
        // **EDIT MODE**
        await updateLeaveRequest(data.id, payload);
        Alert.alert('Sukses', 'Pengajuan cuti berhasil diupdate!', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      } else {
        // **TAMBAH BARU**
        await postData('/items/leave_requests', payload);
        Alert.alert('Sukses', 'Pengajuan cuti berhasil dikirim!', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      }

      Alert.alert('Sukses', 'Pengajuan cuti berhasil dikirim!', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (err) {
      Alert.alert(
        'Gagal',
        err?.message || 'Pengajuan cuti gagal, cek data dan koneksi!',
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const displayDate =
    tanggalMulai && tanggalAkhir
      ? `${formatDate(tanggalMulai)} - ${formatDate(tanggalAkhir)}`
      : 'Pilih tanggal';

  // Buka picker tanggal
  const openDatePicker = type => {
    setDateType(type);
    setShowDatePicker(true);
    console.log('SHOW DATE PICKER:', type);
  };

  const reviewStyles = StyleSheet.create({
    formCard: {
      backgroundColor: 'transparent',
      borderRadius: 13,
      padding: 16,
      width: '100%',
      marginTop: 18,
      marginBottom: 32,
      elevation: 1.5,
      shadowColor: '#EEE',
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    fieldWrap: {
      marginBottom: 14,
      borderBottomColor: '#B4B4AF',
      borderBottomWidth: 1,
      paddingBottom: 7,
    },
    label: {
      fontSize: 13,
      color: '#777674',
      fontWeight: '400',
      marginBottom: 2,
    },
    value: {
      fontSize: 16,
      color: '#161414',
      fontWeight: '400',
      marginBottom: 2,
    },
    btnEdit: {
      marginTop: 10,
      backgroundColor: 'transparent',
      borderRadius: 8,
      paddingVertical: 13,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      // shadowColor: '#2186EB',
      shadowOpacity: 0.09,
      shadowRadius: 6,
      // elevation: 2,
      borderWidth: 1,
      borderColor: '#B4272C',
    },
    btnEditText: {
      color: '#B4272C',
      fontWeight: '500',
      fontSize: 17,
      letterSpacing: 0.2,
    },
  });

  const [userCreatedName, setUserCreatedName] = useState('-');

  // Dapatkan nama user berdasarkan ID (asumsi data.user & data.user_created adalah ID)
  useEffect(() => {
    const fetchFullName = async (userId, setter) => {
      if (!userId) return setter('-');
      try {
        const userData = await getUserById(userId);
        if (userData && (userData?.first_name || userData?.last_name)) {
          setter(
            [userData?.first_name, userData?.last_name]
              .filter(Boolean)
              .join(' '),
          );
        } else {
          setter('-');
        }
      } catch {
        setter('-');
      }
    };

    fetchFullName(data?.user, setUserName);
    fetchFullName(data?.user_created, setUserCreatedName);
  }, [data]);

  const mapStatus = status => {
    if (!status) return 'Waiting';
    if (status.toLowerCase() === 'waiting') return 'Waiting';
    if (
      status.toLowerCase() === 'ditolak' ||
      status.toLowerCase() === 'rejected'
    )
      return 'Ditolak';
    if (
      status.toLowerCase() === 'disetujui' ||
      status.toLowerCase() === 'approved'
    )
      return 'Disetujui';
    return status;
  };
  const StatusBadge = ({status}) => {
    let color, bg, border, icon, text;
    if (status === 'Ditolak') {
      color = '#EA684A';
      bg = '#FFF1ED';
      border = '#EA684A';
      icon = require('../../assets/icons/ic-close.png');
      text = 'Ditolak';
    } else if (status === 'Waiting') {
      color = '#BDA800';
      bg = '#FFF9E4';
      border = '#FFEEA5';
      icon = require('../../assets/icons/ic-time.png');
      text = 'Waiting';
    } else if (status === 'Disetujui') {
      color = '#2CC066';
      bg = '#EEFCF4';
      border = '#2CC066';
      icon = require('../../assets/icons/ic-check.png');
      text = 'Disetujui';
    }

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: bg,
          borderColor: border,
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: '2%',
          gap: 6,
          width: '35%',
          justifyContent: 'center',
        }}>
        <Image
          source={icon}
          style={{width: 16, height: 16, marginRight: 6}}
          resizeMode="contain"
        />
        <Text style={{fontWeight: '400', fontSize: 13, color: '#232221'}}>
          {text}
        </Text>
      </View>
    );
  };
  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      {showForm ? (
        <View style={[styles.container, {backgroundColor: colors.bgHome}]}>
          <AppHeader detail={true} home={false} label="Plan Cuti " />

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Pilihan radio */}
            <View style={styles.radioRow}>
              <TouchableOpacity
                style={styles.radioItem}
                onPress={() => setTipeCuti('lebih')}
                activeOpacity={0.7}>
                <View style={styles.radioCircle}>
                  {tipeCuti === 'lebih' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioText}>Lebih dari satu hari</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioItem}
                onPress={() => setTipeCuti('satu')}
                activeOpacity={0.7}>
                <View style={styles.radioCircle}>
                  {tipeCuti === 'satu' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioText}>Satu hari atau kurang</Text>
              </TouchableOpacity>
            </View>

            {/* Tanggal */}

            {/* Jenis Cuti */}
            {/* Modal date picker */}

            {/* <DateTimePickerModal
              isVisible={showDatePicker}
              mode="date"
              onConfirm={date => {
                setShowDatePicker(false);
                if (dateType === 'mulai') setTanggalMulai(date);
                if (dateType === 'akhir') setTanggalAkhir(date);
              }}
              onCancel={() => setShowDatePicker(false)}
              minimumDate={
                dateType === 'akhir' && tanggalMulai ? tanggalMulai : undefined
              }
              date={
                dateType === 'mulai'
                  ? tanggalMulai || new Date()
                  : tanggalAkhir || tanggalMulai || new Date()
              }
            /> */}
            <Text style={styles.label}>Tanggal Mulai/akhir</Text>
            <View style={{flexDirection: 'row', gap: 8}}>
              <TouchableOpacity
                style={[styles.inputRow, {flex: 1}]}
                onPress={() => setShowDatePickerMulai(true)}>
                <Text style={styles.inputText}>
                  {tanggalMulai ? formatDate(tanggalMulai) : 'Tanggal Mulai'}
                </Text>
                <Text style={{fontSize: 20}}>📅</Text>
              </TouchableOpacity>
              {showDatePickerMulai && (
                <DateTimePicker
                  value={tanggalMulai}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={new Date(2000, 0, 1)}
                  maximumDate={tanggalAkhir || undefined}
                  onChange={(event, date) => {
                    setShowDatePickerMulai(Platform.OS === 'ios');
                    if (date) setTanggalMulai(date);
                    if (Platform.OS === 'android')
                      setShowDatePickerMulai(false);
                  }}
                />
              )}
              {tipeCuti === 'lebih' && (
                <TouchableOpacity
                  style={[styles.inputRow, {flex: 1}]}
                  onPress={() => setShowDatePickerAkhir(true)}>
                  <Text style={styles.inputText}>
                    {tanggalAkhir ? formatDate(tanggalAkhir) : 'Tanggal Akhir'}
                  </Text>
                  <Text style={{fontSize: 20}}>📅</Text>
                </TouchableOpacity>
              )}
              {showDatePickerAkhir && (
                <DateTimePicker
                  value={tanggalAkhir}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={tanggalMulai}
                  onChange={(event, date) => {
                    setShowDatePickerAkhir(Platform.OS === 'ios');
                    if (date) setTanggalAkhir(date);
                    if (Platform.OS === 'android')
                      setShowDatePickerAkhir(false);
                  }}
                />
              )}
            </View>

            <Text style={styles.inputLabel}>Status Report</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                // enabled={!loadingSubmit}
                selectedValue={cutiType}
                onValueChange={setCutiType}
                style={styles.picker}>
                {CUTI_TYPE_OPTIONS.map(opt => (
                  <Picker.Item
                    key={opt.value}
                    label={opt.label}
                    value={opt.value}
                  />
                ))}
              </Picker>
            </View>

            {/* Approver */}
            <Text style={styles.label}>Approver</Text>
            <View style={styles.approverBox}>
              <Text style={styles.approverText}>{approverName}</Text>
            </View>

            {/* Note */}
            <Text style={styles.label}>New Note</Text>
            <TextInput
              style={styles.textArea}
              value={note}
              onChangeText={setNote}
              placeholder="Input Text or Placeholder"
              multiline
            />

            {/* Tombol Submit & Cancel */}
            <View style={{height: 50}} />
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.btnSubmit} onPress={handleSubmit}>
              {loadingSubmit ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitText}>Simpan</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnCancel} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.container, {backgroundColor: colors.bgHome}]}>
          <AppHeader detail={true} home={false} label="Review Plan Cuti" />
          <ScrollView
            style={{width: '100%'}}
            contentContainerStyle={{padding: 20}}>
            <View style={reviewStyles.formCard}>
              {/* Nama Personil */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Nama Personil</Text>
                <Text style={reviewStyles.value}>{userCreatedName}</Text>
              </View>
              {/* iSafe ID */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>iSafe ID</Text>
                <Text style={reviewStyles.value}>{data?.isafeId || '-'}</Text>
              </View>
              {/* NIK */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>NIK</Text>
                <Text style={reviewStyles.value}>{data?.nik || '-'}</Text>
              </View>
              {/* Tanggal Mulai */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Tanggal Mulai</Text>
                <Text style={reviewStyles.value}>
                  {formatDate(data.start_date)}
                </Text>
              </View>
              {/* Tanggal Selesai */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Tanggal Selesai</Text>
                <Text style={reviewStyles.value}>
                  {formatDate(data.end_date)}
                </Text>
              </View>
              {/* Total Cuti */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Total Cuti</Text>
                <Text style={reviewStyles.value}>
                  {countDays(data.start_date, data.end_date)} Hari
                </Text>
              </View>
              {/* Jenis Cuti */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Jenis Cuti</Text>
                <Text style={reviewStyles.value}>{data?.leave_type || ''}</Text>
              </View>
              {/* Alasan Cuti */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Alasan Cuti</Text>
                <Text style={reviewStyles.value}>{data?.reason || ''}</Text>
              </View>
              {/* Approver */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Approver</Text>
                <Text style={reviewStyles.value}>{userName}</Text>
              </View>
              {/* Status */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Status</Text>
                <View style={{marginTop: 4, width: 'auto'}}>
                  <StatusBadge status={mapStatus(data.status)} />
                </View>
              </View>
              {/* Alasan Penolakan */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Alasan Penolakan</Text>
                <Text style={reviewStyles.value}>{data?.reason || ''}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={reviewStyles.btnEdit}
              onPress={() =>
                navigation.replace('DetailCuti', {showForm: true, data})
              }
              activeOpacity={0.8}>
              <Text style={reviewStyles.btnEditText}>Edit</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center'},
  scrollContent: {padding: 20, paddingBottom: 40},
  radioRow: {flexDirection: 'row', marginBottom: 10},
  radioItem: {flexDirection: 'row', alignItems: 'center', marginRight: 18},
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D22C32',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#D22C32',
  },
  radioActive: {
    borderColor: '#D22C32',
    backgroundColor: '#fff',
    shadowColor: '#D22C32',
    shadowOpacity: 0.2,
  },
  radioText: {fontSize: 15, color: '#222'},
  label: {fontSize: 14, marginTop: 12, marginBottom: 4, color: '#444'},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#BDBDBD',
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  inputText: {fontSize: 16, color: '#222'},
  pickerWrapper: {
    borderWidth: 1.5,
    borderColor: '#BDBDBD',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 8,
    width: '100%', // <--- WAJIB
  },
  picker: {
    height: 52, // tinggi yang lebih besar
    width: '100%', // <--- WAJIB
  },
  pickerItem: {
    fontSize: 17, // lebih kecil biar ga terpotong
    height: 52,
  },
  approverBox: {
    backgroundColor: '#D2D1CC',
    borderRadius: 6,
    paddingVertical: 13,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  approverText: {fontSize: 17, color: '#333'},
  textArea: {
    borderWidth: 1.5,
    borderColor: '#BDBDBD',
    borderRadius: 6,
    padding: 12,
    minHeight: 80,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: '5%',
    borderTopWidth: 1,
    borderColor: '#eee',
    width: '100%',
  },
  btnSubmit: {
    backgroundColor: '#D22C32',
    paddingVertical: 15,
    borderRadius: 7,
    marginBottom: 10,
    alignItems: 'center',
  },
  submitText: {color: '#fff', fontSize: 18, fontWeight: '500'},
  btnCancel: {
    borderWidth: 1.5,
    borderColor: '#D22C32',
    backgroundColor: '#fff',
    paddingVertical: 13,
    borderRadius: 7,
    alignItems: 'center',
  },
  cancelText: {color: '#D22C32', fontSize: 18, fontWeight: '500'},
  inputLabel: {
    fontSize: 14,
    color: '#4B4749',
    fontWeight: '400',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1.2,
    borderColor: '#D2D2D2',
    borderRadius: 7,
    fontSize: 16,
    color: '#181818',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 11,
    backgroundColor: '#fff',
  },
});

export default DetailCuti;
