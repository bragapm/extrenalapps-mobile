import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Linking,
  Dimensions,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useNavigation, useRoute} from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {Picker} from '@react-native-picker/picker';
import UploadPickerModal from '../../components/UploadPickerModal';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import {
  BASE_URL,
  createDailyActivity,
  createWeeklyActivity,
  getDailyActivities,
  getDailyActivityDetail,
  getImageWithAuth,
  getUsers,
  getWeeklyActivityDetail,
  updateDailyActivity,
  updateFileMetaDirectus,
  uploadFileDirectus,
} from '../../services/apiServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InputMultiSelect from '../../components/InputMultiSelect';
import {WebView} from 'react-native-webview';

const {width} = Dimensions.get('window');
const IMAGE_ASPECT = 1.85; // 16:9

function parseTimeToDate(str) {
  if (!str) return new Date();
  // format: "HH:mm WIB"
  const [time] = str.split(' ');
  const [hour, minute] = time.split(':');
  const now = new Date();
  now.setHours(Number(hour), Number(minute), 0, 0);
  return new Date(now); // harus new Date supaya re-render
}
function formatRangeDate(start, end) {
  if (!start || !end) return '';
  const s = new Date(start);
  const e = new Date(end);
  const opts = {month: 'short'};
  return `${s.getDate()} ${s.toLocaleString(
    'id-ID',
    opts,
  )} ${s.getFullYear()} - ${e.getDate()} ${e.toLocaleString(
    'id-ID',
    opts,
  )} ${e.getFullYear()}`;
}

function formatTime(dt) {
  if (!dt) return '';
  const jam = dt.getHours().toString().padStart(2, '0');
  const menit = dt.getMinutes().toString().padStart(2, '0');
  return `${jam}:${menit}`;
}
function formatDateShort(date) {
  if (!date) return '';
  // Kalau date masih string “2025-07-20”
  const d = new Date(date);
  // Biar 2 digit hari, 3 huruf bulan, 4 digit tahun
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('id-ID', {month: 'short'}); // contoh: "Feb"
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}
const StatusMiniBadge = ({status = 'Open'}) => {
  const color =
    status === 'Open'
      ? '#258CFB'
      : status === 'Waiting'
      ? '#FFD600'
      : '#EA684A';
  const border = color;
  const bg =
    status === 'Open'
      ? '#E7F3FF'
      : status === 'Waiting'
      ? '#FFF9E4'
      : '#FFF1ED';
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: 'flex-start',
        marginBottom: 7,
      }}>
      <Text style={{fontSize: 13, color, fontWeight: '500'}}>{status}</Text>
    </View>
  );
};

const STATUS_LABEL = {
  approved: 'Approved',
  in_progress: 'In Progress',
  open: 'Open',
  reject: 'Rejected',
  closed: 'Closed',
  waiting: 'Waiting',
  draft: 'Draft',
};

const FieldItem = ({label, value, bold, isLink}) => (
  <View style={styles1.fieldRow}>
    <Text style={styles1.fieldLabel}>{label}</Text>
    {isLink ? (
      <Text
        style={styles1.fieldLink}
        onPress={() => Linking.openURL(value.url)}>
        {value?.text}
      </Text>
    ) : (
      <Text style={[styles1.fieldValue]}>{value}</Text>
    )}
  </View>
);

const OverlayImageInfo = ({
  leftTop,
  leftBot,
  rightTop,
  rightBot,
  align = 'both',
}) => (
  <>
    {/* Kiri Bawah */}
    {/* <View style={styles1.imgOverlayLeft}>
      <Text style={styles1.overlayText}>{leftTop}</Text>
      <Text style={styles1.overlaySubText}>{leftBot}</Text>
    </View> */}
    {/* Kanan Bawah */}
    {/* <View style={styles1.imgOverlayRight}>
      <Text style={styles1.overlayTextRight}>{rightTop}</Text>
      <Text style={styles1.overlaySubTextRight}>{rightBot}</Text>
    </View> */}
  </>
);
const STATUS_OPTIONS = [
  {label: 'Approved', value: 'approved'},
  {label: 'In Progress', value: 'in_progress'},
  {label: 'Draft', value: 'draft'},
  {label: 'Reject', value: 'reject'},
  {label: 'Open', value: 'open'},
  {label: 'Waiting', value: 'waiting'},
  {label: 'Closed', value: 'closed'},
];
const JENIS_REPORT_OPTIONS = [
  {label: 'Report Urgent', value: 1},
  {label: 'Warning Report', value: 2},
  {label: 'Weekly Report', value: 3},
];

const DetailWeeklyActivity = () => {
  const navigation = useNavigation();
  // const data = dummyData;
  const route = useRoute();
  const {showForm = false, data} = route.params || {};
  const id = data?.id;
  console?.log('CEKK DATA', JSON.stringify(data));
  const [media, setMedia] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [tanggal, setTanggal] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value);
  const [lokasi, setLokasi] = useState('');
  const [showPicPicker, setShowPicPicker] = useState(false);
  const [pic, setPIC] = useState([]);
  const [judul, setJudul] = useState('-');
  const [jenis, setJenis] = useState(JENIS_REPORT_OPTIONS[0].value);
  const [deskripsi, setDeskripsi] = useState('');
  const [dateRange, setDateRange] = useState({start: null, end: null});
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [picName, setPicName] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [startTimeZone, setStartTimeZone] = useState('WIB');

  const [endTime, setEndTime] = useState(new Date());
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [endTimeZone, setEndTimeZone] = useState('WIB');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  const [rekapan, setRekapan] = useState([
    '5 Jul 2025 - Report A | Judul Report',
    '5 Jul 2025 - Report A | Judul Report',
    '5 Jul 2025 - Report A | Judul Report',
    '5 Jul 2025 - Report A | Judul Report',
    '5 Jul 2025 - Report A | Judul Report',
  ]);
  const [kesimpulan, setKesimpulan] = useState('');

  const [allDaily, setAllDaily] = useState([]); // Semua data dari API
  const [filteredDaily, setFilteredDaily] = useState([]); // Yang match range
  const [selectedDaily, setSelectedDaily] = useState([]); // Id yang dipilih (multi)

  useEffect(() => {
    getDailyActivities().then(setAllDaily);
  }, []);

  function getWeekOfMonth(date) {
    // Dapatkan minggu ke berapa dalam bulan
    // date = Date object
    const tanggal = new Date(date);
    const startOfMonth = new Date(tanggal.getFullYear(), tanggal.getMonth(), 1);
    // index hari mulai dari Senin (1) biar sesuai kalender Indo
    const dayOfWeekStart = startOfMonth.getDay() || 7; // 0: Minggu, 1: Senin, dst
    const dayOfMonth = tanggal.getDate();
    return Math.ceil((dayOfMonth + dayOfWeekStart - 1) / 7);
  }

  function autoGenerateTitle(dateStart) {
    if (!dateStart) return '-';
    const date = new Date(dateStart);
    const mingguKe = getWeekOfMonth(date);
    const month = date.toLocaleString('id-ID', {month: 'long'}); // e.g. "Juli"
    const year = date.getFullYear();
    const tgl = date.getDate();
    // Format tgl: 21 Juli 2025
    const tglStr = `${tgl} ${month} ${year}`;
    return `W${mingguKe} ${month} ${year}: ${tglStr}`;
  }
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      // Filter hanya daily activity dalam range tanggal
      const start = new Date(dateRange.start).setHours(0, 0, 0, 0);
      const end = new Date(dateRange.end).setHours(23, 59, 59, 999);
      const filtered = allDaily.filter(item => {
        if (!item.date) return false;
        const dt = new Date(item.date).getTime();
        return dt >= start && dt <= end;
      });
      setFilteredDaily(filtered);
      setSelectedDaily(filtered.map(item => item.id)); // default: semua
    } else {
      setFilteredDaily([]);
      setSelectedDaily([]);
    }
  }, [dateRange, allDaily]);
  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      setLoadingDetail(true);
      try {
        console.log(
          '[getWeeklyActivityDetail] getWeeklyActivityDetail id:',
          id,
        ); // <--- tambahkan disini
        const res = await getWeeklyActivityDetail(id);
        console.log('[getWeeklyActivityDetail] Response:', res); // <--- tambahkan disini
        if (isMounted) setDetail(res);
      } catch (e) {
        console.log('[getWeeklyActivityDetail] ERROR:', e); // <--- tambahkan disini
        setDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    };
    if (id) fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddMedia = () => setModalVisible(true);

  const handleCamera = async () => {
    setModalVisible(false);
    try {
      const img = await ImagePicker.openCamera({
        width: 800,
        height: 800,
        cropping: true,
        cropperToolbarTitle: 'Crop Foto',
        includeBase64: false,
      });
      if (img) setMedia(m => [...m, {id: String(Date.now()), uri: img.path}]); // <-- ADA id
    } catch (e) {
      console.log('Camera error:', e);
      alert('Gagal buka kamera: ' + (e.message || e));
    }
  };

  const handleFile = async () => {
    setModalVisible(false);
    try {
      const img = await ImagePicker.openPicker({
        width: 800,
        height: 800,
        cropping: true,
        cropperToolbarTitle: 'Crop Foto',
        includeBase64: false,
        mediaType: 'photo',
      });
      if (img) setMedia(m => [...m, {id: String(Date.now()), uri: img.path}]); // <-- ADA id
    } catch (e) {}
  };

  const handleDocument = async () => {
    setModalVisible(false);
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      setMedia(m => [
        ...m,
        {
          id: String(Date.now()), // <-- ADA id
          uri: res.uri,
          name: res.name,
          type: res.type,
          isFile: true,
        },
      ]);
    } catch (e) {
      // cancel, do nothing
    }
  };

  const handleRemoveMedia = idx => setMedia(media.filter((_, i) => i !== idx));

  function formatDate(d) {
    if (!d) return '';
    const tgl = new Date(d);
    return `${tgl.getDate()} ${tgl.toLocaleString('id-ID', {
      month: 'short',
    })} ${tgl.getFullYear()}`;
  }

  const handleSubmit = async () => {
    setLoadingSubmit(true);
    try {
      // Upload file dokumen, sama persis
      const uploadedIds = [];
      for (const file of media) {
        if (!file.isServerFile) {
          const id = await uploadFileDirectus({
            uri: file.uri,
            name: file.name || 'photo.jpg',
            type:
              file.type ||
              (file.isFile ? 'application/octet-stream' : 'image/jpeg'),
          });
          await updateFileMetaDirectus([id], {
            filename_download: file.name || 'Lampiran_Weekly_Activity.jpg',
          });
          uploadedIds.push(id);
        } else {
          uploadedIds.push(file.id);
        }
      }
      const documents = uploadedIds.map(id => ({directus_files_id: id}));
      const autoTitle = autoGenerateTitle(dateRange.start);
      // Body yang sesuai dengan permintaan
      const body = {
        summary: kesimpulan, // Diambil dari input textarea kesimpulan
        documents,
        title: autoTitle,
        daily_activities: selectedDaily, // Array id daily yang udah ke filter/selected
        date_start: dateRange.start
          ? dateRange.start.toISOString().slice(0, 10)
          : null,
        date_end: dateRange.end
          ? dateRange.end.toISOString().slice(0, 10)
          : null,
      };

      console.log('POST WEEKLY BODY:', JSON.stringify(body, null, 2));
      // Lanjut POST ke API lo (ganti createDailyActivity ke endpoint weekly_activities jika beda)
      await createWeeklyActivity(body);

      // sukses
      Alert.alert('Sukses', 'Berhasil create data weekly activity', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (err) {
      Alert.alert('Error', err?.message || 'Unknown error');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const [userList, setUserList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    setLoadingUsers(true);
    getUsers()
      .then(users => setUserList(users))
      .catch(() => setUserList([]))
      .finally(() => setLoadingUsers(false));
  }, []);

  // Biar support single atau array
  const [assetUrls, setAssetUrls] = useState([]); // [data:image/jpeg;base64,...]
  const documentList = Array.isArray(detail?.documents)
    ? detail.documents.map(doc => doc.directus_files_id)
    : [];

  useEffect(() => {
    if (!detail || !detail.documents || detail.documents.length === 0) return;
    let isMounted = true;
    const fetchAllImages = async () => {
      try {
        const token = await AsyncStorage.getItem('token'); // HARUS token
        const promises = detail.documents.map(doc => {
          // PDF gausah fetch, return null aja biar slotnya tetep
          if (
            typeof doc.directus_files_id === 'string' &&
            doc.directus_files_id.endsWith('.pdf')
          ) {
            return null;
          }
          return getImageWithAuth(doc.directus_files_id, token);
        });
        const results = await Promise.all(promises);
        if (isMounted) setAssetUrls(results);
      } catch (e) {
        if (isMounted) setAssetUrls([]);
        console.log('Error fetching asset images:', e);
      }
    };
    fetchAllImages();
    return () => {
      isMounted = false;
    };
  }, [detail]);

  useEffect(() => {
    if (!showForm && userList?.length && detail?.pics) {
      // Ambil nama-nama PIC (bisa array)
      const names = (detail.pics || [])
        .map(picObj => {
          const user = userList.find(u => u?.id === picObj.directus_users_id);
          return user
            ? `${user?.first_name} ${user.last_name}`
            : picObj.directus_users_id; // fallback ke id
        })
        .filter(Boolean);
      setPicName(names.join(', '));
    }
  }, [showForm, userList, detail?.pics]);

  useEffect(() => {
    if (showForm && detail) {
      // GUNAKAN detail, BUKAN data!
      setTanggal(detail.date ? new Date(detail.date) : new Date());
      setStatus(detail.status || STATUS_OPTIONS[0].value);
      setLokasi(detail.location || '');
      setPIC(
        Array.isArray(detail.pics) && detail.pics.length > 0
          ? detail.pics.map(x => x.directus_users_id) // kalau multi
          : '',
      );
      setJudul(detail.title || '-');
      setJenis(detail.report_type || JENIS_REPORT_OPTIONS[0].value);
      setDeskripsi(detail.description || '');

      setStartTime(detail.start_time ? new Date() : new Date()); // <- Kalau ada, parse sesuai format backend (di sini null)
      setStartTimeZone('WIB');
      setEndTime(detail.end_time ? new Date() : new Date()); // <- Kalau ada, parse sesuai format backend (di sini null)
      setEndTimeZone('WIB');

      // Lampiran/media dari detail.documents
      if (detail.documents && Array.isArray(detail.documents)) {
        setMedia(
          detail.documents.map(doc => ({
            id: doc.directus_files_id,
            uri: doc.directus_files_id,
            isServerFile: true,
          })),
        );
      } else {
        setMedia([]);
      }
    }
  }, [showForm, detail]);

  if (!showForm) {
    if (loadingDetail) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator color="#D22C32" size="large" />
          <Text style={{marginTop: 16}}>Memuat detail...</Text>
        </View>
      );
    }
    if (!detail) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Data tidak ditemukan</Text>
        </View>
      );
    }
    if (!detail) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Data tidak ditemukan</Text>
        </View>
      );
    }
  }

  function getUploaderName() {
    if (!userList?.length || !detail?.user_created) return '-';
    const user = userList.find(u => u.id === detail.user_created);
    if (!user) return detail.user_created || '-';
    // Handle kalau first_name/last_name kosong/null
    return [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F6F6" />
      <View style={{flex: 1, backgroundColor: '#F6F6F6'}}>
        {showForm ? (
          <>
            <AppHeader
              detail={true}
              home={false}
              label="Buat Weekly Activity"
            />

            <ScrollView
              contentContainerStyle={{padding: 20, paddingBottom: 120}}>
              {/* ======= Tanggal Kerja (Date Range) ======= */}
              <Text style={styles.inputLabel}>Tanggal kerja</Text>
              <View style={{flexDirection: 'row', gap: 8, marginBottom: 12}}>
                <TouchableOpacity
                  style={[styles.rangeInput, {flex: 1}]}
                  onPress={() => setShowStartPicker(true)}>
                  <Text style={styles.inputText}>
                    {dateRange.start ? formatDate(dateRange.start) : 'Mulai'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rangeInput, {flex: 1}]}
                  onPress={() => setShowEndPicker(true)}>
                  <Text style={styles.inputText}>
                    {dateRange.end ? formatDate(dateRange.end) : 'Selesai'}
                  </Text>
                </TouchableOpacity>
              </View>
              {showStartPicker && (
                <DateTimePicker
                  value={dateRange.start || new Date()}
                  mode="date"
                  display="default"
                  onChange={(e, d) => {
                    setShowStartPicker(false);
                    if (d) setDateRange(r => ({...r, start: d}));
                  }}
                />
              )}
              {showEndPicker && (
                <DateTimePicker
                  value={dateRange.end || new Date()}
                  mode="date"
                  display="default"
                  onChange={(e, d) => {
                    setShowEndPicker(false);
                    if (d) setDateRange(r => ({...r, end: d}));
                  }}
                />
              )}

              {/* ======= Rekapan Daily Activity ======= */}
              <Text style={styles.inputLabel}>Rekapan Daily Activity</Text>
              <View style={styles.recapBox}>
                <ScrollView style={{maxHeight: 120}}>
                  {filteredDaily.length ? (
                    filteredDaily.map((item, idx) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => {
                          // Toggle select/unselect
                          setSelectedDaily(sel =>
                            sel.includes(item.id)
                              ? sel.filter(id => id !== item.id)
                              : [...sel, item.id],
                          );
                        }}
                        style={{
                          paddingVertical: 6,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <View
                          style={{
                            width: 18,
                            height: 18,
                            borderWidth: 1,
                            borderColor: '#555',
                            borderRadius: 4,
                            marginRight: 10,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: selectedDaily.includes(item.id)
                              ? '#D22C32'
                              : '#FFF',
                          }}>
                          {selectedDaily.includes(item.id) && (
                            <Text style={{color: '#fff', fontSize: 14}}>✓</Text>
                          )}
                        </View>
                        <Text style={styles.recapItem}>
                          {formatDate(item.date)} -{' '}
                          {item.title || '(tanpa judul)'}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.recapEmpty}>
                      Tidak ada daily activity di range ini
                    </Text>
                  )}
                </ScrollView>
              </View>

              {/* ======= Kesimpulan Weekly ======= */}
              <Text style={styles.inputLabel}>Kesimpulan Weekly</Text>
              <TextInput
                style={styles.textArea}
                value={kesimpulan}
                onChangeText={setKesimpulan}
                placeholder="Input Text or Placeholder"
                multiline
              />

              {/* ======= Lampiran ======= */}
              <Text style={styles.inputLabel}>Lampiran</Text>
              <View style={styles.mediaBox}>
                <Text style={styles.mediaLabel}>Media</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{alignItems: 'center'}}>
                  {media.map((item, idx) => (
                    <View key={item.id} style={styles.mediaItemWrap}>
                      {item.isFile ? (
                        <TouchableOpacity
                          onPress={() => Linking.openURL(item.uri)}
                          style={styles.mediaThumb}>
                          <Text>📎</Text>
                          <Text numberOfLines={1} style={{fontSize: 11}}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Image
                          source={{uri: item.uri}}
                          style={styles.mediaThumb}
                        />
                      )}
                      <TouchableOpacity
                        style={styles.mediaRemoveBtn}
                        onPress={() => handleRemoveMedia(idx)}>
                        <Text style={{color: '#fff', fontWeight: 'bold'}}>
                          ×
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {/* Tombol tambah */}
                  <TouchableOpacity
                    style={styles.mediaAddBtn}
                    onPress={handleAddMedia}>
                    <Text style={{color: '#D22C32', fontWeight: '500'}}>
                      Tambah
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
              <UploadPickerModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onCamera={handleCamera}
                onFile={handleFile}
                onDocument={handleDocument}
              />
            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.bottomBtnGroup}>
              <TouchableOpacity
                style={[styles.btnSubmit, loadingSubmit && {opacity: 0.6}]}
                onPress={handleSubmit}
                disabled={loadingSubmit}>
                {loadingSubmit ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitText}>Simpan</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                disabled={loadingSubmit}
                style={styles.btnCancel}
                onPress={() => navigation.goBack()}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <AppHeader
              detail={true}
              home={false}
              label="Review Weekly Activity"
            />
            <ScrollView
              style={{flex: 1}}
              contentContainerStyle={{padding: 0, paddingBottom: 60}}>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 18,
                  marginHorizontal: 18,
                  marginTop: 20,
                  marginBottom: 4,
                  color: '#272727',
                }}>
                {detail?.title || '-'}
              </Text>

              {Array.isArray(detail?.documents) &&
                detail.documents.length > 0 && (
                  <View style={{marginHorizontal: 18, marginTop: 10}}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}>
                      {detail.documents.map((doc, idx) => {
                        const fileId = doc.directus_files_id;
                        const isPdf =
                          typeof fileId === 'string' && fileId.endsWith('.pdf');
                        // Untuk gambar: pakai assetUrls (hasil base64), untuk PDF: tetap pakai URL
                        if (!isPdf && !assetUrls[idx]) {
                          // Kasus: error saat fetch image atau index assetUrls kosong/null
                          return (
                            <View
                              key={fileId}
                              style={{
                                width: width * 0.92,
                                height: width * 0.92 * 0.7,
                                marginRight: 16,
                                borderWidth: 1,
                                borderColor: '#e1e1e1',
                                borderRadius: 8,
                                overflow: 'hidden',
                                backgroundColor: '#f4f4f4',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <Text style={{color: '#d22c32', fontSize: 15}}>
                                File tidak bisa ditampilkan
                              </Text>
                            </View>
                          );
                        }

                        return (
                          <View
                            key={fileId}
                            style={{
                              width: width * 0.92,
                              height: width * 0.92 * 0.7,
                              marginRight: 16,
                              borderWidth: 1,
                              borderColor: '#e1e1e1',
                              borderRadius: 8,
                              overflow: 'hidden',
                              backgroundColor: '#f4f4f4',
                            }}>
                            {isPdf ? (
                              <WebView
                                source={{uri: `${BASE_URL}/assets/${fileId}`}}
                                style={{flex: 1, borderRadius: 8}}
                                originWhitelist={['*']}
                                startInLoadingState
                                renderLoading={() => (
                                  <View
                                    style={{
                                      flex: 1,
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      backgroundColor: '#f4f4f4',
                                    }}>
                                    <ActivityIndicator
                                      color="#D22C32"
                                      size="large"
                                    />
                                  </View>
                                )}
                              />
                            ) : (
                              <Image
                                source={{uri: assetUrls[idx]}}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  resizeMode: 'contain',
                                }}
                              />
                            )}
                          </View>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

              {/* Info Pengunggah & Tanggal */}
              <View style={{marginHorizontal: 18, marginBottom: 4}}>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#333',
                    marginBottom: 1,
                    fontWeight: '500',
                  }}>
                  Diunggah Oleh
                </Text>
                <Text
                  style={{
                    fontWeight: '400',
                    color: '#242424',
                    marginBottom: 2,
                  }}>
                  {getUploaderName()}
                </Text>
              </View>

              <View style={{marginHorizontal: 18, marginBottom: 4}}>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#333',
                    marginBottom: 1,
                    fontWeight: '500',
                  }}>
                  Last Update
                </Text>
                <Text
                  style={{
                    fontWeight: '400',
                    color: '#242424',
                    marginBottom: 1,
                  }}>
                  {detail?.date_updated
                    ? `${formatDateShort(detail?.date_updated)}`
                    : `${formatDateShort(detail?.date_created)}`}
                </Text>
              </View>

              <View style={{marginHorizontal: 18, marginBottom: 4}}>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#333',
                    marginBottom: 1,
                    fontWeight: '500',
                  }}>
                  Kesimpulan
                </Text>
                <Text
                  style={{
                    fontWeight: '400',
                    color: '#242424',
                    marginBottom: 2,
                  }}>
                  {detail?.summary || '-'}
                </Text>
              </View>
            </ScrollView>
          </>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  rangeInput: {
    borderWidth: 1.2,
    borderColor: '#D2D2D2',
    borderRadius: 7,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  recapBox: {
    backgroundColor: '#B7B7B7',
    borderRadius: 9,
    padding: 15,
    marginBottom: 18,
    minHeight: 80,
  },
  recapItem: {
    color: '#232323',
    fontSize: 16,
    marginBottom: 10,
  },
  recapEmpty: {
    color: '#777',
    fontStyle: 'italic',
  },
  textArea: {
    borderWidth: 1.2,
    borderColor: '#D2D2D2',
    borderRadius: 7,
    backgroundColor: '#fff',
    minHeight: 74,
    padding: 14,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 18,
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.2,
    borderColor: '#D2D2D2',
    borderRadius: 7,
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 22,
    minHeight: 55,
  },
  uploadText: {
    fontSize: 17,
    color: '#A4A4A4',
    fontWeight: '500',
  },
  uploadIcon: {
    width: 28,
    height: 28,
    tintColor: '#B7B7B7',
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
  bottomBtnGroup: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 9,
    borderTopColor: '#eee',
    borderTopWidth: 1,
  },
  inputText: {
    fontSize: 16,
    color: '#181818',
  },
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

  pickerWrapper: {
    borderWidth: 1.2,
    borderColor: '#D2D2D2',
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 11,
    width: '100%',
  },
  picker: {
    height: 52, // tinggi yang lebih besar
    width: '100%', // <--- WAJIB
  },

  mediaBox: {
    borderWidth: 1.5,
    borderColor: '#E54449',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  mediaLabel: {
    color: '#59595A',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 7,
    marginLeft: 5,
  },
  mediaItemWrap: {
    marginRight: 9,
    position: 'relative',
    marginVertical: '10%',
  },
  mediaThumb: {
    width: 54,
    height: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    backgroundColor: '#eee',
  },
  mediaRemoveBtn: {
    position: 'absolute',
    top: -7,
    right: -7,
    backgroundColor: '#D22C32',
    borderRadius: 99,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9,
  },
  mediaAddBtn: {
    width: 54,
    height: 54,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: '#E54449',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    backgroundColor: '#FAF4F4',
    borderStyle: 'dashed',
  },
  bottomBtnGroup: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 9,
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

const styles1 = StyleSheet.create({
  titleText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#23262F',
    marginLeft: 18,
    marginTop: 6,
    marginBottom: 6,
  },
  imageWrap: {
    width: width - 24,
    height: (width - 24) / IMAGE_ASPECT,
    marginHorizontal: 12,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 3,
    backgroundColor: '#EEE',
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  imgOverlayLeft: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    backgroundColor: 'rgba(0,0,0,0.39)',
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
    maxWidth: '53%',
  },
  imgOverlayRight: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(0,0,0,0.39)',
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
    maxWidth: '38%',
    alignItems: 'flex-end',
  },
  overlayText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 1,
  },
  overlaySubText: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.89,
  },
  overlayTextRight: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 1,
  },
  overlaySubTextRight: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.89,
    textAlign: 'right',
  },
  thumbBox: {
    width: 113,
    height: 80,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#EEE',
    position: 'relative',
  },
  smallImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#222',
    shadowOpacity: 0.07,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 1},
  },
  fieldRow: {
    // flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderBottomColor: '#E2E2E2',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  fieldLabel: {
    color: '#787878',
    fontSize: 14,
    flex: 1,
  },
  fieldValue: {
    fontSize: 14,
    color: '#363636',
    flex: 1,
    textAlign: 'right',
  },
  fieldLink: {
    fontSize: 14,
    color: '#1976D2',
    flex: 1,
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  btnEdit: {
    borderWidth: 2,
    borderColor: '#D22C32',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 30,
    elevation: 1,
  },
  btnEditText: {
    color: '#D22C32',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.1,
  },
});

export default DetailWeeklyActivity;
