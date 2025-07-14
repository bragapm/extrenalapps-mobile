import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Image,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {Picker} from '@react-native-picker/picker';
import {useThemeStore} from '../../theme/useThemeStore';
import AppHeader from '../../components/AppHeader';
import {useNavigation, useRoute} from '@react-navigation/native';

const transportasiList = [
  {label: 'Air Transportation', value: 'air'},
  {label: 'Hotel', value: 'hotel'},
  {label: 'Land Transportation', value: 'land'},
  {label: 'Visa/Paspor', value: 'visa'},
];

const jenisPerdinList = [
  {label: 'Seminar', value: 'Seminar'},
  {label: 'Dinas', value: 'Dinas'},
  {label: 'Meeting', value: 'Meeting'},
];

function formatDate(date) {
  if (!date) return '-';
  // Support format "15 April, 2025" or JS Date
  if (typeof date === 'string' && !date.includes('-')) return date;
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const DetailPerdin = () => {
  const route = useRoute();
  const {showForm = false, data} = route.params || {};
  const navigation = useNavigation();
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();

  // Form states
  const [tujuan, setTujuan] = useState('');
  const [jenisPerdin, setJenisPerdin] = useState(jenisPerdinList[0].value);
  const [tanggalMulai, setTanggalMulai] = useState(null);
  const [tanggalAkhir, setTanggalAkhir] = useState(null);
  const [negara, setNegara] = useState('Indonesia');
  const [kota, setKota] = useState('');
  const [transportasi, setTransportasi] = useState([]);
  const [approver, setApprover] = useState('Jerry Anwar Halim');
  const [note, setNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateType, setDateType] = useState('mulai');

  // Simulasi detail personnel
  const personnel = {
    name: data?.name || 'Priya Nair',
    isafeId: data?.isafeId || '121HGF',
    nik: data?.nik || 'IDT01A5JWADPKZA999',
  };

  useEffect(() => {
    if (data && showForm) {
      setTujuan(data?.tujuan || '');
      setJenisPerdin(data?.jenisPerdin || jenisPerdinList[0].value);
      setTanggalMulai(data?.from ? new Date(data.from) : null);
      setTanggalAkhir(data?.to ? new Date(data.to) : null);
      setNegara(data?.negara || 'Indonesia');
      setKota(data?.kota || '');
      setTransportasi(data?.transportasi || []);
      setApprover(data?.approvedBy || 'Jerry Anwar Halim');
      setNote(data?.note || '');
    } else if (showForm) {
      // Reset form
      setTujuan('');
      setJenisPerdin(jenisPerdinList[0].value);
      setTanggalMulai(null);
      setTanggalAkhir(null);
      setNegara('Indonesia');
      setKota('');
      setTransportasi([]);
      setApprover('Jerry Anwar Halim');
      setNote('');
    }
  }, [showForm, data]);

  // Handle transportasi checkbox
  const toggleTransport = val => {
    if (transportasi.includes(val)) {
      setTransportasi(transportasi.filter(t => t !== val));
    } else {
      setTransportasi([...transportasi, val]);
    }
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
    } else {
      color = '#BDA800';
      bg = '#FFF9E4';
      border = '#FFEEA5';
      icon = require('../../assets/icons/ic-time.png');
      text = status || 'Waiting';
    }
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: bg,
          borderColor: border,
          borderWidth: 1,
          borderRadius: 6,
          paddingHorizontal: 9,
          paddingVertical: 4,
          alignSelf: 'flex-start',
          marginTop: 3,
        }}>
        <Image
          source={icon}
          style={{width: 16, height: 16, marginRight: 5}}
          resizeMode="contain"
        />
        <Text style={{fontSize: 14, color}}>{text}</Text>
      </View>
    );
  };

  // ===== RENDER UI =====
  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={[styles.container, {backgroundColor: colors.bgHome}]}>
        {showForm ? (
          <>
            <AppHeader
              detail={true}
              home={false}
              label="Plan Perjalanan Dinas"
            />
            // ---------- FORM INPUT (EDIT/CREATE) ----------
            <ScrollView
              style={{width: '100%', marginBottom: '20%'}}
              contentContainerStyle={{padding: 20, paddingBottom: 60}}>
              <Text style={styles.sectionTitle}>Detail Perjalanan Dinas</Text>
              {/* Tujuan */}
              <Text style={styles.inputLabel}>Tujuan</Text>
              <TextInput
                style={styles.input}
                value={tujuan}
                onChangeText={setTujuan}
                placeholder="Tujuan"
                placeholderTextColor="#BBB"
              />

              {/* Jenis Perjalanan Dinas */}
              <Text style={styles.inputLabel}>Jenis Perjalanan Dinas</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={jenisPerdin}
                  onValueChange={setJenisPerdin}
                  style={styles.picker}>
                  {jenisPerdinList.map(opt => (
                    <Picker.Item
                      key={opt.value}
                      label={opt.label}
                      value={opt.value}
                    />
                  ))}
                </Picker>
              </View>

              {/* Tanggal Mulai / Selesai */}
              <View style={{flexDirection: 'row', gap: 10, marginTop: 7}}>
                <View style={{flex: 1}}>
                  <Text style={styles.inputLabel}>Tanggal Mulai</Text>
                  <TouchableOpacity
                    style={styles.inputDateRow}
                    onPress={() => {
                      setDateType('mulai');
                      setShowDatePicker(true);
                    }}>
                    <Text style={styles.inputDateText}>
                      {tanggalMulai
                        ? formatDate(tanggalMulai)
                        : 'Tanggal Mulai'}
                    </Text>
                    <Text style={{fontSize: 20, color: '#B4272C'}}>📅</Text>
                  </TouchableOpacity>
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.inputLabel}>Tanggal Selesai</Text>
                  <TouchableOpacity
                    style={styles.inputDateRow}
                    onPress={() => {
                      setDateType('akhir');
                      setShowDatePicker(true);
                    }}>
                    <Text style={styles.inputDateText}>
                      {tanggalAkhir
                        ? formatDate(tanggalAkhir)
                        : 'Tanggal Selesai'}
                    </Text>
                    <Text style={{fontSize: 20, color: '#B4272C'}}>📅</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
                  dateType === 'akhir' && tanggalMulai
                    ? tanggalMulai
                    : undefined
                }
                date={
                  dateType === 'mulai'
                    ? tanggalMulai || new Date()
                    : tanggalAkhir || tanggalMulai || new Date()
                }
              />

              {/* Negara */}
              <Text style={styles.inputLabel}>Negara</Text>
              <TextInput
                style={styles.input}
                value={negara}
                onChangeText={setNegara}
                placeholder="Negara"
              />
              {/* Kota */}
              <Text style={styles.inputLabel}>Kota</Text>
              <TextInput
                style={styles.input}
                value={kota}
                onChangeText={setKota}
                placeholder="Kota"
              />

              {/* Transportasi */}
              <Text style={styles.inputLabel}>Transportasi</Text>
              <View style={{marginBottom: 8}}>
                {transportasiList.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={styles.transportRow}
                    onPress={() => toggleTransport(opt.value)}
                    activeOpacity={0.7}>
                    <Text style={styles.checkBox}>
                      {transportasi.includes(opt.value) ? '☑' : '☐'}
                    </Text>
                    <Text style={styles.transportLabel}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Approver */}
              <Text style={styles.inputLabel}>Approver</Text>
              <View style={styles.disabledInput}>
                <Text style={styles.disabledText}>{approver}</Text>
              </View>
              {/* Note */}
              <Text style={styles.inputLabel}>Note to Approver</Text>
              <TextInput
                style={styles.textArea}
                value={note}
                onChangeText={setNote}
                placeholder="note"
                multiline
              />

              {/* Bottom Button */}
              <View style={{height: 50}} />
            </ScrollView>
          </>
        ) : (
          <>
            <AppHeader
              detail={true}
              home={false}
              label="Review Perjalanan Dinas"
            />
            // ----------- DETAIL REVIEW (READONLY) -----------
            <ScrollView
              style={{width: '100%'}}
              contentContainerStyle={{padding: 20, paddingBottom: 60}}>
              <Text style={styles.sectionTitle}>Detail Personil</Text>
              <DetailField label="Nama Personil" value={personnel.name} />
              <DetailField label="iSafe ID" value={personnel.isafeId} />
              <DetailField label="NIK" value={personnel.nik} />

              <Text style={[styles.sectionTitle, {marginTop: 22}]}>
                Detail Perjalanan Dinas
              </Text>
              <DetailField label="Tujuan" value={data?.tujuan || 'Cirebon'} />
              <DetailField
                label="Jenis Perjalanan Dinas"
                value={data?.jenisPerdin || 'Seminar'}
              />
              <DetailField
                label="Tanggal Mulai"
                value={data?.from ? formatDate(data.from) : '5 Jul 2025'}
              />
              <DetailField
                label="Tanggal Selesai"
                value={data?.to ? formatDate(data.to) : '7 Jul 2025'}
              />
              <DetailField label="Negara" value={data?.negara || 'Indonesia'} />
              <DetailField label="Kota" value={data?.kota || 'Cirebon'} />
              {/* Transportasi */}
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Transportasi</Text>
                {transportasiList.map(opt => (
                  <View key={opt.value} style={styles.transportReadRow}>
                    <Text style={styles.checkBoxRead}>
                      {Array.isArray(data?.transportasi) &&
                      data.transportasi.includes(opt.value)
                        ? '☑'
                        : '☐'}
                    </Text>
                    <Text style={styles.transportLabel}>{opt.label}</Text>
                  </View>
                ))}
              </View>
              <DetailField
                label="Approver"
                value={data?.approvedBy || 'Jerry Anwar Halim'}
              />
              <DetailField
                label="Alasan untuk Approver"
                value={data?.note || 'Perjalanan dinas penting'}
              />
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Status</Text>
                <StatusBadge status={data?.status || 'Waiting'} />
              </View>
              {/* Bottom Edit Button */}
              <TouchableOpacity
                style={styles.btnEdit}
                onPress={() =>
                  navigation.replace('DetailPerdin', {showForm: true, data})
                }
                activeOpacity={0.85}>
                <Text style={styles.btnEditText}>Edit</Text>
              </TouchableOpacity>
            </ScrollView>
          </>
        )}
        {/* Bottom Button (showForm only) */}
        {showForm && (
          <View style={styles.bottomBtnGroup}>
            <TouchableOpacity style={styles.btnSubmit}>
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnCancel}
              onPress={navigation.goBack}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};

// FIELD COMPONENT FOR DETAIL READ-ONLY
const DetailField = ({label, value}) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', backgroundColor: '#fff'},
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#181818',
    marginBottom: 6,
  },
  fieldWrap: {
    marginBottom: 14,
    borderBottomColor: '#B4B4AF',
    borderBottomWidth: 1,
    paddingBottom: 7,
  },
  label: {fontSize: 13, color: '#777674', fontWeight: '400', marginBottom: 2},
  value: {fontSize: 16, color: '#161414', fontWeight: '400', marginBottom: 2},

  // --- FORM INPUT ---
  inputLabel: {
    fontSize: 13,
    color: '#777674',
    fontWeight: '400',
    marginBottom: 3,
  },
  input: {
    borderWidth: 1.2,
    borderColor: '#BDBDBD',
    borderRadius: 7,
    fontSize: 16,
    color: '#181818',
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 11,
    backgroundColor: '#fff',
  },
  inputDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#BDBDBD',
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputDateText: {fontSize: 16, color: '#181818'},
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
  textArea: {
    borderWidth: 1.2,
    borderColor: '#BDBDBD',
    borderRadius: 7,
    padding: 11,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    minHeight: 60,
    marginBottom: 18,
  },
  // --- CHECKBOX ---
  transportRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 5},
  checkBox: {fontSize: 22, color: '#B4272C', marginRight: 7},
  transportLabel: {fontSize: 16, color: '#181818'},
  disabledInput: {
    borderWidth: 1.2,
    borderColor: '#ccc',
    borderRadius: 7,
    backgroundColor: '#E3E3E3',
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 11,
  },
  disabledText: {fontSize: 16, color: '#4C4C4C'},
  // --- READONLY CHECKBOX ---
  transportReadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  checkBoxRead: {fontSize: 22, color: '#B4272C', marginRight: 7},
  // --- BOTTOM BUTTONS ---
  btnEdit: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#B4272C',
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    marginBottom: 30,
  },
  btnEditText: {
    color: '#B4272C',
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 0.1,
  },
  bottomBtnGroup: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: 10,
    borderTopColor: '#eee',
    borderTopWidth: 1,
  },
  btnSubmit: {
    backgroundColor: '#D22C32',
    paddingVertical: 15,
    borderRadius: 7,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitText: {color: '#fff', fontSize: 18, fontWeight: '600'},
  btnCancel: {
    borderWidth: 1.5,
    borderColor: '#D22C32',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 7,
    alignItems: 'center',
  },
  cancelText: {color: '#D22C32', fontSize: 18, fontWeight: '600'},
});

export default DetailPerdin;
