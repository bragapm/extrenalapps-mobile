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

// ====== Helper tanggal ======
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const todayStart = () => startOfDay(new Date());
const tomorrowStart = () => {
  const t = todayStart();
  t.setDate(t.getDate() + 1);
  return t;
};

const CUTI_TYPE_OPTIONS = [
  {label: 'Paid Leave', value: 'Paid Leave'},
  {label: 'Unpaid Leave', value: 'Unpaid Leave'},
  {label: 'Sick Leave', value: 'Sick Leave'},
  {label: 'Maternity Leave', value: 'Maternity Leave'},
  {label: 'Paternity Leave', value: 'Paternity Leave'},
  {label: 'Bereavement Leave', value: 'Bereavement Leave'},
  {label: 'Marriage Leave', value: 'Marriage Leave'},
  {label: 'Special Leave', value: 'Special Leave'},
  {label: 'Annual Leave', value: 'Annual Leave'},
  {label: 'Study Leave', value: 'Study Leave'},
  {label: 'Hajj Leave', value: 'Hajj Leave'},
  {label: 'Child Care Leave', value: 'Child Care Leave'},
];

const approverList = ['Jerry Anwar Halim', 'Putri Maulani', 'Dewi Marlina'];

const formatDateISO = (date: Date | string | null) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

function countDays(start?: Date | string | null, end?: Date | string | null) {
  if (!start || !end) return 1;
  const d1 = startOfDay(new Date(start));
  const d2 = startOfDay(new Date(end));
  return (
    Math.abs(Math.round((Number(d2) - Number(d1)) / (1000 * 60 * 60 * 24))) + 1
  ); // inklusif
}
function formatDate(d?: Date | string | null) {
  if (!d) return '';
  const tgl = new Date(d);
  return `${tgl.getDate()} ${tgl.toLocaleString('id-ID', {
    month: 'short',
  })} ${tgl.getFullYear()}`;
}

const DetailCuti = () => {
  const route = useRoute<any>();
  const {showForm = false, data} = route.params || {};
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();

  const [userName, setUserName] = useState('-');

  const [cutiType, setCutiType] = useState(CUTI_TYPE_OPTIONS[0].value);

  // Default Tanggal Mulai = besok (sesuai aturan "setelah hari ini")
  const [tanggalMulai, setTanggalMulai] = useState<Date>(tomorrowStart());
  const [tanggalAkhir, setTanggalAkhir] = useState<Date>(tomorrowStart());

  const [tipeCuti, setTipeCuti] = useState<'lebih' | 'satu'>('lebih');
  const [jenisCuti, setJenisCuti] = useState(CUTI_TYPE_OPTIONS[0].value);
  const [approver, setApprover] = useState<string>('');
  const [approverName, setApproverName] = useState('-');

  const [note, setNote] = useState('');
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
      } catch {
        setUserName('-');
      }
    };
    fetchUser();
  }, []);

  // Prefill saat edit
  useEffect(() => {
    if (showForm && data) {
      setTipeCuti('lebih');
      const s = data.start_date
        ? startOfDay(new Date(data.start_date))
        : tomorrowStart();
      const e = data.end_date ? startOfDay(new Date(data.end_date)) : s;
      // Enforce rule saat prefill (kalau start < besok, dorong ke besok)
      const minMulai = tomorrowStart();
      const mulai = s < minMulai ? minMulai : s;
      const akhir = e < mulai ? mulai : e;

      setTanggalMulai(mulai);
      setTanggalAkhir(akhir);

      setCutiType(data.leave_type || CUTI_TYPE_OPTIONS[0].value);
      setApprover(data?.user || USER_ID);
      setNote(data.reason || '');
    } else if (showForm && !data) {
      setTipeCuti('lebih');
      const tmr = tomorrowStart();
      setTanggalMulai(tmr);
      setTanggalAkhir(tmr);
      setCutiType(CUTI_TYPE_OPTIONS[0].value);
      setApprover(USER_ID);
      setNote('');
    }
  }, [showForm, data]);

  // Pastikan Tanggal Akhir tidak < Tanggal Mulai
  useEffect(() => {
    if (!tanggalMulai) return;
    if (tanggalAkhir < tanggalMulai) {
      setTanggalAkhir(tanggalMulai);
    }
    // Kalau tipe "satu hari", samakan akhir dengan mulai
    if (
      tipeCuti === 'satu' &&
      tanggalAkhir.getTime() !== tanggalMulai.getTime()
    ) {
      setTanggalAkhir(tanggalMulai);
    }
  }, [tanggalMulai, tipeCuti]);

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

    // Validasi akhir >= mulai (double guard)
    if (tanggalAkhir < tanggalMulai) {
      return Alert.alert(
        'Error',
        'Tanggal akhir tidak boleh sebelum tanggal mulai.',
      );
    }

    setLoadingSubmit(true);
    try {
      const start_date = tanggalMulai ? formatDateISO(tanggalMulai) : null;
      const end_date =
        tipeCuti === 'lebih' && tanggalAkhir
          ? formatDateISO(tanggalAkhir)
          : start_date;

      const payload = {
        leave_type: cutiType,
        start_date,
        end_date,
        reason: note,
        user: USER_ID,
        status: 'waiting',
      };

      if (showForm && data && data.id) {
        await updateLeaveRequest(data.id, payload);
        Alert.alert('Sukses', 'Pengajuan cuti berhasil diupdate!', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      } else {
        await postData('/items/leave_requests', payload);
        Alert.alert('Sukses', 'Pengajuan cuti berhasil dikirim!', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      }
    } catch (err: any) {
      Alert.alert(
        'Gagal',
        err?.message || 'Pengajuan cuti gagal, cek data dan koneksi!',
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleCancel = () => navigation.goBack();

  const [userCreatedName, setUserCreatedName] = useState('-');
  useEffect(() => {
    const fetchFullName = async (
      userId: string,
      setter: (v: string) => void,
    ) => {
      if (!userId) return setter('-');
      try {
        const userData = await getUserById(userId);
        setter(
          [userData?.first_name, userData?.last_name]
            .filter(Boolean)
            .join(' ') || '-',
        );
      } catch {
        setter('-');
      }
    };
    fetchFullName(data?.user, setUserName);
    fetchFullName(data?.user_created, setUserCreatedName);
  }, [data]);

  const mapStatus = (status?: string) => {
    if (!status) return 'Waiting';
    const s = status.toLowerCase();
    if (s === 'waiting') return 'Waiting';
    if (s === 'ditolak' || s === 'rejected') return 'Ditolak';
    if (s === 'disetujui' || s === 'approved') return 'Disetujui';
    return status;
  };

  const StatusBadge = ({status}: {status: string}) => {
    let color = '#2CC066',
      bg = '#EEFCF4',
      border = '#2CC066',
      icon = require('../../assets/icons/ic-check.png'),
      text = 'Disetujui';
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

            {/* ====== Tanggal Mulai/Akhir ====== */}
            <Text style={styles.label}>Tanggal Mulai/Akhir</Text>
            <View style={{flexDirection: 'row', gap: 8}}>
              {/* Mulai */}
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
                  value={tanggalMulai || tomorrowStart()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  // Aturan: Mulai harus setelah hari ini -> minimum besok
                  minimumDate={tomorrowStart()}
                  // gak perlu maximumDate; kalau mau batasi sebelum akhir, boleh tambahkan maximumDate={tanggalAkhir}
                  onChange={(event, date) => {
                    if (Platform.OS === 'android')
                      setShowDatePickerMulai(false);
                    if (event.type === 'dismissed') return;
                    if (date) {
                      const picked = startOfDay(date);
                      // guard ekstra (kalau user main sistem waktu)
                      if (picked < tomorrowStart()) {
                        Alert.alert(
                          'Info',
                          'Tanggal mulai harus setelah hari ini.',
                        );
                        return;
                      }
                      setTanggalMulai(picked);
                      // Jika tipe "satu" atau akhir < mulai, sesuaikan akhir
                      setTanggalAkhir(prev => {
                        if (tipeCuti === 'satu') return picked;
                        if (!prev || prev < picked) return picked;
                        return prev;
                      });
                    }
                  }}
                />
              )}

              {/* Akhir (muncul hanya jika lebih dari satu hari) */}
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
                  value={tanggalAkhir || tanggalMulai || tomorrowStart()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  // Aturan: Akhir tidak boleh sebelum Mulai
                  minimumDate={tanggalMulai || tomorrowStart()}
                  onChange={(event, date) => {
                    if (Platform.OS === 'android')
                      setShowDatePickerAkhir(false);
                    if (event.type === 'dismissed') return;
                    if (date) {
                      const picked = startOfDay(date);
                      if (picked < (tanggalMulai || tomorrowStart())) {
                        Alert.alert(
                          'Info',
                          'Tanggal akhir tidak boleh sebelum tanggal mulai.',
                        );
                        return;
                      }
                      setTanggalAkhir(picked);
                    }
                  }}
                />
              )}
            </View>

            <Text style={styles.inputLabel}>Status Report</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={cutiType}
                onValueChange={setCutiType}
                style={{
                  height: 52,
                  width: '100%',
                  backgroundColor: '#FFFF',
                  color: '#000',
                }}>
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
            <View
              style={{
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
              }}>
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Nama Personil</Text>
                <Text style={reviewStyles.value}>{userCreatedName}</Text>
              </View>
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>iSafe ID</Text>
                <Text style={reviewStyles.value}>{data?.isafeId || '-'}</Text>
              </View>
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>NIK</Text>
                <Text style={reviewStyles.value}>{data?.nik || '-'}</Text>
              </View>
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Tanggal Mulai</Text>
                <Text style={reviewStyles.value}>
                  {formatDate(data.start_date)}
                </Text>
              </View>
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Tanggal Selesai</Text>
                <Text style={reviewStyles.value}>
                  {formatDate(data.end_date)}
                </Text>
              </View>
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Total Cuti</Text>
                <Text style={reviewStyles.value}>
                  {countDays(data.start_date, data.end_date)} Hari
                </Text>
              </View>
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Jenis Cuti</Text>
                <Text style={reviewStyles.value}>{data?.leave_type || ''}</Text>
              </View>
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Alasan Cuti</Text>
                <Text style={reviewStyles.value}>{data?.reason || ''}</Text>
              </View>
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Approver</Text>
                <Text style={reviewStyles.value}>{userName}</Text>
              </View>
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Status</Text>
                <View style={{marginTop: 4, width: 'auto'}}>
                  <StatusBadge status={mapStatus(data.status)} />
                </View>
              </View>
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

const reviewStyles = StyleSheet.create({
  fieldWrap: {
    marginBottom: 14,
    borderBottomColor: '#B4B4AF',
    borderBottomWidth: 1,
    paddingBottom: 7,
  },
  label: {fontSize: 13, color: '#777674', fontWeight: '400', marginBottom: 2},
  value: {fontSize: 16, color: '#161414', fontWeight: '400', marginBottom: 2},
  btnEdit: {
    marginTop: 10,
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowOpacity: 0.09,
    shadowRadius: 6,
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
    width: '100%',
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
