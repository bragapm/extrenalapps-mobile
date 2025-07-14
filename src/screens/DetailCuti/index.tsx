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
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {Picker} from '@react-native-picker/picker';
import {useThemeStore} from '../../theme/useThemeStore';
import AppHeader from '../../components/AppHeader';
import {RootStackParamList} from '../../navigation';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation, useRoute} from '@react-navigation/native';

const jenisCutiOptions = [
  {label: 'Paid Leave', value: 'Paid Leave'},
  {label: 'Unpaid Leave', value: 'Unpaid Leave'},
  {label: 'Sick Leave', value: 'Sick Leave'},
];

const approverList = ['Jerry Anwar Halim', 'Putri Maulani', 'Dewi Marlina'];
function formatDate(date) {
  if (!date) return '-';
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
const DetailCuti = () => {
  const route = useRoute();
  const {showForm = false, data} = route.params || {};
  console.log('dataparams', showForm);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();

  // console.log('showForm', showForm);

  const [tanggalMulai, setTanggalMulai] = useState(null);
  const [tanggalAkhir, setTanggalAkhir] = useState(null);
  const [tipeCuti, setTipeCuti] = useState('lebih');
  const [tanggal, setTanggal] = useState('05 Jul 2025 - 10 Jul 2025');
  const [jenisCuti, setJenisCuti] = useState(jenisCutiOptions[0].value);
  const [approver, setApprover] = useState(approverList[0]);
  const [note, setNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateType, setDateType] = useState('mulai');

  useEffect(() => {
    if (data && !showForm) {
      // isi dari data cuti
      setTipeCuti('lebih');
      setTanggalMulai(data?.from ? new Date(data.from) : null);
      setTanggalAkhir(data?.to ? new Date(data.to) : null);
      setJenisCuti(data.type || jenisCutiOptions[0].value);
      setApprover(data.approvedBy || approverList[0]);
      setNote(data.note || '');
    } else if (!data && showForm) {
      // reset untuk add baru
      setTipeCuti('lebih');
      setTanggalMulai(null);
      setTanggalAkhir(null);
      setJenisCuti(jenisCutiOptions[0].value);
      setApprover(approverList[0]);
      setNote('');
    }
  }, [data, showForm]);

  const handleSubmit = () => {
    // submit logic
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
            <Text style={styles.label}>Tanggal Mulai/akhir</Text>
            <View style={{flexDirection: 'row', gap: 8}}>
              <TouchableOpacity
                style={[styles.inputRow, {flex: 1}]}
                onPress={() => openDatePicker('mulai')}>
                <Text style={styles.inputText}>
                  {tanggalMulai ? formatDate(tanggalMulai) : 'Tanggal Mulai'}
                </Text>
                <Text style={{fontSize: 20}}>📅</Text>
              </TouchableOpacity>
              {tipeCuti === 'lebih' && (
                <TouchableOpacity
                  style={[styles.inputRow, {flex: 1}]}
                  onPress={() => openDatePicker('akhir')}>
                  <Text style={styles.inputText}>
                    {tanggalAkhir ? formatDate(tanggalAkhir) : 'Tanggal Akhir'}
                  </Text>
                  <Text style={{fontSize: 20}}>📅</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Modal date picker */}
            <DateTimePickerModal
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
            />

            {/* Approver */}
            <Text style={styles.label}>Approver</Text>
            <View style={styles.approverBox}>
              <Text style={styles.approverText}>{approver}</Text>
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
              <Text style={styles.submitText}>Submit</Text>
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
                <Text style={reviewStyles.value}>{data?.name || '-'}</Text>
              </View>
              {/* iSafe ID */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>iSafe ID</Text>
                <Text style={reviewStyles.value}>
                  {data?.isafeId || '121HGF'}
                </Text>
              </View>
              {/* NIK */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>NIK</Text>
                <Text style={reviewStyles.value}>
                  {data?.nik || 'IDT01A5JWADPKZA999'}
                </Text>
              </View>
              {/* Tanggal Mulai */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Tanggal Mulai</Text>
                <Text style={reviewStyles.value}>
                  {data?.from ? formatDate(new Date(data.from)) : '-'}
                </Text>
              </View>
              {/* Tanggal Selesai */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Tanggal Selesai</Text>
                <Text style={reviewStyles.value}>
                  {data?.to ? formatDate(new Date(data.to)) : '-'}
                </Text>
              </View>
              {/* Total Cuti */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Total Cuti</Text>
                <Text style={reviewStyles.value}>
                  {data?.totalDay ? `${data.totalDay} Hari` : '1 Hari'}
                </Text>
              </View>
              {/* Jenis Cuti */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Jenis Cuti</Text>
                <Text style={reviewStyles.value}>
                  {data?.type || 'Paid Leave'}
                </Text>
              </View>
              {/* Alasan Cuti */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Alasan Cuti</Text>
                <Text style={reviewStyles.value}>
                  {data?.alasan || 'Karena Acara Keluarga'}
                </Text>
              </View>
              {/* Approver */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Approver</Text>
                <Text style={reviewStyles.value}>
                  {data?.approvedBy || 'Jerry Anwar Halim'}
                </Text>
              </View>
              {/* Status */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Status</Text>
                <View style={{marginTop: 4, width: 'auto'}}>
                  <StatusBadge status={data?.status || 'Ditolak'} />
                </View>
              </View>
              {/* Alasan Penolakan */}
              <View style={reviewStyles.fieldWrap}>
                <Text style={reviewStyles.label}>Alasan Penolakan</Text>
                <Text style={reviewStyles.value}>
                  {data?.alasanPenolakan ||
                    'Alasan Tidak disetujui karena Lampiran tidak lengkap'}
                </Text>
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
});

export default DetailCuti;
