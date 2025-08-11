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
  Alert,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {Picker} from '@react-native-picker/picker';
import {useThemeStore} from '../../theme/useThemeStore';
import AppHeader from '../../components/AppHeader';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  getBusinessTripDetail,
  getUsers,
  patchData,
  postData,
  putData,
  updateFileMetaDirectus,
  uploadFileDirectus,
} from '../../services/apiServices';

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

function mapStatus(status) {
  // Mapping value dari status Directus ke label UI
  switch (status) {
    case 'in_progress':
      return 'Waiting'; // atau "Sedang Berjalan"
    case 'approved':
      return 'Disetujui';
    case 'rejected':
      return 'Ditolak';
    default:
      return status || '-';
  }
}

const DetailPerdin = () => {
  const route = useRoute();
  const {showForm = false, data} = route.params || {};
  const id = data?.id;
  const navigation = useNavigation();
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userMap, setUserMap] = useState({});

  // Form states
  const [tujuan, setTujuan] = useState('');
  const [jenisPerdin, setJenisPerdin] = useState(jenisPerdinList[0].value);
  const [tanggalMulai, setTanggalMulai] = useState(null);
  const [tanggalAkhir, setTanggalAkhir] = useState(null);
  const [negara, setNegara] = useState('Indonesia');
  const [kota, setKota] = useState('');
  const [transportasi, setTransportasi] = useState([]);
  const [approver, setApprover] = useState('');
  const [note, setNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateType, setDateType] = useState('mulai');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [media, setMedia] = useState([]);

  // Simulasi detail personnel
  const personnel = {
    name: data?.name || 'Priya Nair',
    isafeId: data?.isafeId || '121HGF',
    nik: data?.nik || 'IDT01A5JWADPKZA999',
  };

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const [detailData, users] = await Promise.all([
          getBusinessTripDetail(id),
          getUsers(),
        ]);
        // Map user id to name
        const userMapping = {};
        users.forEach(u => {
          userMapping[u.id] = `${u.first_name || ''} ${
            u.last_name || ''
          }`.trim();
        });
        setUserMap(userMapping);
        setDetail(detailData);
      } catch (e) {
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  useEffect(() => {
    if (data && showForm) {
      setTujuan(data.destination || ''); // DARI destination
      setJenisPerdin(data.purpose || jenisPerdinList[0].value); // DARI purpose
      setTanggalMulai(data.start_date ? new Date(data.start_date) : null); // DARI start_date
      setTanggalAkhir(data.end_date ? new Date(data.end_date) : null); // DARI end_date
      setNegara(data.country || 'Indonesia'); // DARI country
      setKota(data.city || ''); // DARI city
      // Handle multi/array transportation
      setTransportasi(
        data.transportation
          ? typeof data.transportation === 'string'
            ? data.transportation.split(',').map(x => x.trim())
            : Array.isArray(data.transportation)
            ? data.transportation
            : []
          : [],
      );
      setApprover(data.approved_by || 'Jerry Anwar Halim');
      setNote(data.note || '');
      // File dsb (kalau kamu mau handle file upload)
      // setMedia(...);
    } else if (showForm) {
      // Reset form (sudah ok)
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

  const handleSubmit = async () => {
    setLoadingSubmit(true);
    try {
      // === UPLOAD DOKUMEN (JIKA ADA FILE) ===
      let documentId = null;
      if (media.length > 0) {
        const file = media[0];
        // uploadFileDirectus harus return ID file dari Directus
        documentId = await uploadFileDirectus({
          uri: file.uri,
          name: file.name || 'document.pdf',
          type: file.type || 'application/pdf',
        });
        // Optional: update filename di Directus jika mau
        await updateFileMetaDirectus([documentId], {
          filename_download: file.name || 'document.pdf',
        });
      }

      // === BANGUN BODY SESUAI DOKUMEN API ===
      // Untuk format: https://externalapps.braga.co.id/panel/items/business_trips
      // Kalo ada update, pakai putData('/items/business_trips/{id}', body)
      const body = {
        start_date: tanggalMulai
          ? new Date(tanggalMulai).toISOString().slice(0, 10)
          : '',
        end_date: tanggalAkhir
          ? new Date(tanggalAkhir).toISOString().slice(0, 10)
          : '',
        status: 'in_progress', // GANTI sesuai kebutuhan, misal status flow dari UI
        destination: tujuan,
        purpose: jenisPerdin,
        transportation: transportasi.join(','), // <--- DIJOIN jadi string kalau multi
        user: 'a464a937-bb6c-4f6c-b0b4-27d98485a559', // id user, GANTI sesuai id user yang sedang login (atau personnel.id)
        document: documentId, // id dokumen hasil upload
        // Tambahkan field lain sesuai kebutuhan API (misal note, kota, negara, dsb)
        note,
        city: kota,
        country: negara,
        approved_by: approver, // opsional jika field ini memang ada di directus
      };

      // DEBUG
      console.log('[PERDIN] BODY:', JSON.stringify(body, null, 2));

      // === CREATE / UPDATE ===
      if (data && data.id) {
        await patchData(`/items/business_trips/${data.id}`, body);
        Alert.alert('Sukses', 'Perjalanan dinas berhasil diupdate');
      } else {
        await postData('/items/business_trips', body);
        Alert.alert('Sukses', 'Perjalanan dinas berhasil dibuat');
      }
      navigation.goBack();
    } catch (err) {
      console.log('[PERDIN] ERROR:', err);
      Alert.alert('Error', err?.message || 'Gagal submit');
    } finally {
      setLoadingSubmit(false);
    }
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
                  style={{
                    height: 52, // tinggi yang lebih besar
                    width: '100%',
                    backgroundColor: colorScheme === 'dark' ? '#FFFF' : '#FFFF',
                    color: colorScheme === 'dark' ? '#000' : '#000',
                  }}>
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
              <DetailField
                label="Nama Personil"
                value={userMap[detail?.user_created] || '-'}
              />
              <DetailField label="iSafe ID" value={personnel.isafeId} />
              <DetailField label="NIK" value={personnel.nik} />

              <Text style={[styles.sectionTitle, {marginTop: 22}]}>
                Detail Perjalanan Dinas
              </Text>
              <DetailField label="Tujuan" value={detail?.destination || '-'} />
              <DetailField
                label="Jenis Perjalanan Dinas"
                value={detail?.purpose || '-'}
              />
              <DetailField
                label="Tanggal Mulai"
                value={
                  detail?.start_date ? formatDate(detail?.start_date) : '-'
                }
              />
              <DetailField
                label="Tanggal Selesai"
                value={detail?.end_date ? formatDate(detail?.end_date) : '-'}
              />
              <DetailField label="Negara" value={'Indonesia'} />
              <DetailField label="Kota" value={detail?.destination || '-'} />
              {/* Transportasi */}
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Transportasi</Text>
                {transportasiList.map(opt => (
                  <View key={opt.value} style={styles.transportReadRow}>
                    <Text style={styles.checkBoxRead}>
                      {detail?.transportation === opt.value ? '☑' : '☐'}
                    </Text>
                    <Text style={styles.transportLabel}>{opt?.label}</Text>
                  </View>
                ))}
              </View>
              <DetailField
                label="Approver"
                value={userMap[detail?.user] || '-'}
              />
              <DetailField label="Alasan untuk Approver" value={'-'} />
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Status</Text>
                <StatusBadge status={mapStatus(detail?.status)} />
              </View>
              {/* Bottom Edit Button */}
              <TouchableOpacity
                style={styles.btnEdit}
                onPress={() =>
                  navigation.replace('DetailPerdin', {
                    showForm: true,
                    data: detail,
                  })
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
            <TouchableOpacity
              style={[styles.btnSubmit, loadingSubmit && {opacity: 0.6}]}
              onPress={handleSubmit}
              disabled={loadingSubmit}>
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
