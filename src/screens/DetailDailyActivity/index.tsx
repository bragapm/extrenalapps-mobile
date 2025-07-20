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
import {useNavigation, useRoute} from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {Picker} from '@react-native-picker/picker';
import UploadPickerModal from '../../components/UploadPickerModal';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import {
  createDailyActivity,
  getImageWithAuth,
  getUsers,
  updateDailyActivity,
  updateFileMetaDirectus,
  uploadFileDirectus,
} from '../../services/apiServices';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  {label: 'Approve', value: 'Approve'},
  {label: 'Reject', value: 'Reject'},
  {label: 'Open', value: 'Open'},
  {label: 'Waiting', value: 'Waiting'},
  {label: 'Closed', value: 'Closed'},
];
const JENIS_REPORT_OPTIONS = [
  {label: 'Report Urgent', value: 'Report Urgent'},
  {label: 'Warning Report', value: 'Warning Report'},
  {label: 'Daily Report', value: 'Daily Report'},
];

const DetailDailyActivity = () => {
  const navigation = useNavigation();
  // const data = dummyData;
  const route = useRoute();
  const {showForm = false, data} = route.params || {};

  const [media, setMedia] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [tanggal, setTanggal] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value);
  const [lokasi, setLokasi] = useState('');
  const [pic, setPIC] = useState('');
  const [judul, setJudul] = useState('-');
  const [jenis, setJenis] = useState(JENIS_REPORT_OPTIONS[0].value);
  const [deskripsi, setDeskripsi] = useState('');
  const [kolaborasi, setKolaborasi] = useState('');
  const [waktuMulai, setWaktuMulai] = useState('09:00 WIB');
  const [waktuSelesai, setWaktuSelesai] = useState('09:00 WIB');
  const [picName, setPicName] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [startTimeZone, setStartTimeZone] = useState('WIB');

  const [endTime, setEndTime] = useState(new Date());
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [endTimeZone, setEndTimeZone] = useState('WIB');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
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
      let documentId = null;
      // Cek apakah ada media baru di-upload
      const mediaBaru = media.find(item => !item.isServerFile); // media baru = belum ada di server
      if (mediaBaru) {
        const file = mediaBaru;
        const id = await uploadFileDirectus({
          uri: file.uri,
          name: file.name || 'photo.jpg',
          type:
            file.type ||
            (file.isFile ? 'application/octet-stream' : 'image/jpeg'),
        });
        documentId = id;
        await updateFileMetaDirectus([id], {
          filename_download: file.name || 'Lampiran_Daily_Activity.jpg',
        });
      } else if (media.length && media[0].isServerFile) {
        // Pakai file lama saja (uuid)
        documentId = media[0].id;
      }

      const formatDateISO = date => {
        const d = new Date(date);
        return `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      };

      const body = {
        date: formatDateISO(tanggal),
        status,
        location: lokasi,
        pic,
        title: judul,
        report_type: jenis,
        description: deskripsi,
        collaboration: kolaborasi,
        start_time: `${formatTime(startTime)} ${startTimeZone}`,
        end_time: `${formatTime(endTime)} ${endTimeZone}`,
        document: documentId || null,
      };

      if (data && data.id) {
        // --- MODE EDIT ---
        await updateDailyActivity(data.id, body);
        Alert.alert('Sukses', 'Berhasil update data', [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'Main',
                    params: {
                      screen: 'activity',
                      params: {activeMenu: 'harian', mode: 'daily'},
                    },
                  },
                ],
              });
            },
          },
        ]);
      } else {
        // --- MODE CREATE ---
        await createDailyActivity(body);
        Alert.alert('Sukses', 'Berhasil create data', [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'Main',
                    params: {
                      screen: 'activity',
                      params: {activeMenu: 'harian', mode: 'daily'},
                    },
                  },
                ],
              });
            },
          },
        ]);
      }
    } catch (err) {
      console.log('ERROR:', err);
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
  const documentList = Array.isArray(data?.document)
    ? data?.document
    : data?.document
    ? [data?.document]
    : [];

  useEffect(() => {
    // Fetch semua gambar ketika komponen mount
    if (documentList.length === 0) return;
    let isMounted = true;

    const fetchAllImages = async () => {
      try {
        // Ambil token user (misal simpan di AsyncStorage)
        const token = await AsyncStorage.getItem('access_token'); // atau nama lain

        // Panggil util di atas untuk setiap UUID
        const promises = documentList.map(uuid =>
          getImageWithAuth(uuid, token),
        );
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
  }, [JSON.stringify(documentList)]);

  useEffect(() => {
    // Cari nama PIC berdasarkan ID (hanya di mode review / bukan form)
    if (!showForm && userList?.length && data?.pic) {
      const user = userList.find(u => u?.id === data.pic);
      setPicName(user ? `${user?.first_name} ${user.last_name}` : data.pic); // fallback ke UUID jika ga ketemu
    }
  }, [showForm, userList, data?.pic]);

  useEffect(() => {
    if (showForm && data) {
      setTanggal(data.date ? new Date(data.date) : new Date());
      setStatus(data.status || STATUS_OPTIONS[0].value);
      setLokasi(data.location || '');
      setPIC(data.pic || '');
      setJudul(data.title || '-');
      setJenis(data.report_type || JENIS_REPORT_OPTIONS[0].value);
      setDeskripsi(data.description || '');
      setKolaborasi(data.collaboration || '');
      setStartTime(
        data.start_time ? parseTimeToDate(data.start_time) : new Date(),
      );
      setStartTimeZone(data.start_time?.split(' ')[1] || 'WIB');
      setEndTime(data.end_time ? parseTimeToDate(data.end_time) : new Date());
      setEndTimeZone(data.end_time?.split(' ')[1] || 'WIB');
      // === Tambahan khusus prefill media ===
      if (data.document) {
        // NOTE: asumsi data.document bisa array atau string (uuid)
        const docArr = Array.isArray(data.document)
          ? data.document
          : [data.document];
        setMedia(
          docArr.map(uuid => ({
            id: uuid, // atau pake String(Date.now()) biar unique
            uri: uuid, // simpan UUID aja dulu, untuk tampilkan thumbnail bisa difetch nanti
            isServerFile: true, // flag buat ngebedain mana file lama, mana baru
          })),
        );
      } else {
        setMedia([]); // Kosongin kalau nggak ada dokumen
      }
    }
  }, [showForm, data]);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F6F6" />
      <View style={{flex: 1, backgroundColor: '#F6F6F6'}}>
        {showForm ? (
          <>
            <AppHeader detail={true} home={false} label="Buat Daily Activity" />
            // ---------- FORM INPUT (EDIT/CREATE) ----------
            <ScrollView
              style={{width: '100%', marginBottom: '20%'}}
              contentContainerStyle={{padding: 18, paddingBottom: 80}}>
              {/* Tanggal Kerja */}
              <Text style={styles.inputLabel}>Tanggal kerja</Text>
              <TouchableOpacity
                disabled={loadingSubmit}
                style={styles.input}
                onPress={() => setShowDatePicker(true)}>
                <Text style={styles.inputText}>
                  {formatDate(tanggal) || 'Pilih tanggal'}
                </Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={showDatePicker}
                mode="date"
                date={tanggal}
                onConfirm={date => {
                  setTanggal(date);
                  setShowDatePicker(false);
                }}
                onCancel={() => setShowDatePicker(false)}
              />

              {/* Status Report */}
              <Text style={styles.inputLabel}>Status Report</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  enabled={!loadingSubmit}
                  selectedValue={status}
                  onValueChange={setStatus}
                  style={styles.picker}>
                  {STATUS_OPTIONS.map(opt => (
                    <Picker.Item
                      key={opt.value}
                      label={opt.label}
                      value={opt.value}
                    />
                  ))}
                </Picker>
              </View>

              {/* Lokasi */}
              <Text style={styles.inputLabel}>Lokasi</Text>
              <TextInput
                style={styles.input}
                value={lokasi}
                onChangeText={setLokasi}
                placeholder="Enter Location"
                editable={!loadingSubmit}
              />

              {/* PIC */}
              <Text style={styles.inputLabel}>PIC</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  enabled={!loadingSubmit}
                  selectedValue={pic}
                  onValueChange={setPIC}
                  style={styles.picker}>
                  <Picker.Item
                    label={loadingUsers ? 'Memuat...' : 'Pilih PIC'}
                    value=""
                  />
                  {userList.map(user => (
                    <Picker.Item
                      key={user?.id}
                      label={`${user?.first_name} ${user.last_name}`}
                      value={user?.id} // value adalah UUID, dikirim ke backend
                    />
                  ))}
                </Picker>
              </View>

              {/* Judul Report */}
              <Text style={styles.inputLabel}>Judul Report</Text>
              <TextInput
                style={styles.input}
                value={judul}
                onChangeText={setJudul}
                placeholder="-"
                editable={!loadingSubmit}
              />

              {/* Jenis Report */}
              <Text style={styles.inputLabel}>Jenis Report</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  enabled={!loadingSubmit}
                  selectedValue={jenis}
                  onValueChange={setJenis}
                  style={styles.picker}>
                  {JENIS_REPORT_OPTIONS.map(opt => (
                    <Picker.Item
                      key={opt.value}
                      label={opt.label}
                      value={opt.value}
                    />
                  ))}
                </Picker>
              </View>

              {/* Deskripsi */}
              <Text style={styles.inputLabel}>Deskripsi</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={deskripsi}
                onChangeText={setDeskripsi}
                placeholder="Input Text or Placeholder"
                multiline
                editable={!loadingSubmit}
              />

              {/* Kolaborasi dengan */}
              <Text style={styles.inputLabel}>Kolaborasi dengan</Text>
              <TextInput
                style={styles.input}
                value={kolaborasi}
                onChangeText={setKolaborasi}
                placeholder="Divisi IT"
                editable={!loadingSubmit}
              />

              {/* Waktu Mulai */}
              <Text style={styles.inputLabel}>Waktu mulai</Text>
              <View
                style={{flexDirection: 'row', gap: 8, alignItems: 'center'}}>
                {/* Jam */}
                <TouchableOpacity
                  disabled={loadingSubmit}
                  style={[styles.input, {flex: 1}]}
                  onPress={() => setShowStartTimePicker(true)}>
                  <Text style={styles.inputText}>
                    {formatTime(startTime) || 'Pilih jam'}
                  </Text>
                </TouchableOpacity>
                {/* Zona waktu */}
                <View style={[styles.pickerWrapper, {flex: 1}]}>
                  <Picker
                    enabled={!loadingSubmit}
                    selectedValue={startTimeZone}
                    onValueChange={setStartTimeZone}
                    style={styles.picker}>
                    <Picker.Item label="WIB" value="WIB" />
                    <Picker.Item label="WITA" value="WITA" />
                    <Picker.Item label="WIT" value="WIT" />
                    {/* tambah zona lain kalau perlu */}
                  </Picker>
                </View>
              </View>
              <DateTimePickerModal
                isVisible={showStartTimePicker}
                mode="time"
                date={startTime}
                onConfirm={date => {
                  setStartTime(date);
                  setShowStartTimePicker(false);
                }}
                onCancel={() => setShowStartTimePicker(false)}
              />

              {/* Waktu Selesai */}
              <Text style={styles.inputLabel}>Waktu Selesai</Text>
              <View
                style={{flexDirection: 'row', gap: 8, alignItems: 'center'}}>
                {/* Jam */}
                <TouchableOpacity
                  disabled={loadingSubmit}
                  style={[styles.input, {flex: 1}]}
                  onPress={() => setShowEndTimePicker(true)}>
                  <Text style={styles.inputText}>
                    {formatTime(endTime) || 'Pilih jam'}
                  </Text>
                </TouchableOpacity>
                {/* Zona waktu */}
                <View style={[styles.pickerWrapper, {flex: 1}]}>
                  <Picker
                    enabled={!loadingSubmit}
                    selectedValue={endTimeZone}
                    onValueChange={setEndTimeZone}
                    style={styles.picker}>
                    <Picker.Item label="WIB" value="WIB" />
                    <Picker.Item label="WITA" value="WITA" />
                    <Picker.Item label="WIT" value="WIT" />
                  </Picker>
                </View>
              </View>
              <DateTimePickerModal
                isVisible={showEndTimePicker}
                mode="time"
                date={endTime}
                onConfirm={date => {
                  setEndTime(date);
                  setShowEndTimePicker(false);
                }}
                onCancel={() => setShowEndTimePicker(false)}
              />

              {/* Lampiran / Media */}
              <Text style={[styles.inputLabel, {marginBottom: 4}]}>
                Lampiran
              </Text>
              <View style={styles.mediaBox}>
                <Text style={styles.mediaLabel}>Media</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{alignItems: 'center', gap: 7}}>
                  {media.map((item, idx) => (
                    <View key={item.id} style={styles.mediaItemWrap}>
                      {/* Cek jika item dari server (lampiran lama), fetch thumbnail dari Directus */}
                      {item.isServerFile ? (
                        <Image
                          source={{uri: assetUrls[idx]}}
                          style={styles.mediaThumb}
                        />
                      ) : item.isFile ? (
                        <TouchableOpacity
                          disabled={loadingSubmit}
                          onPress={() => Linking.openURL(item.uri)}
                          style={[
                            styles.mediaThumb,
                            {
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: '#f2f2f2',
                            },
                          ]}>
                          <Text style={{fontSize: 30}}>📎</Text>
                          <Text
                            numberOfLines={1}
                            style={{fontSize: 11, marginTop: 3}}>
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
                        disabled={loadingSubmit}
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
                    disabled={loadingSubmit}
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
              label="Review Daily Activity"
            />
            <ScrollView
              style={{flex: 1}}
              contentContainerStyle={{padding: 0, paddingBottom: 60}}>
              {/* --- STATUS BADGE --- */}
              <View style={{paddingHorizontal: 18, paddingTop: 12}}>
                <StatusMiniBadge status={data.status} />
              </View>
              {/* --- TITLE --- */}
              <Text style={styles1.titleText}>{data.title}</Text>

              {/* --- MAIN IMAGE + overlay info --- */}
              <View style={styles1.imageWrap}>
                {assetUrls[0] ? (
                  <Image
                    source={{uri: assetUrls[0]}}
                    style={styles1.headerImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles1.headerImage,
                      {
                        backgroundColor: '#eee',
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                    ]}>
                    <Text style={{color: '#aaa'}}>No Image</Text>
                  </View>
                )}
                {/* Overlay kiri bawah & kanan bawah */}
                <OverlayImageInfo
                  leftTop={data.lokasi}
                  leftBot={data.koordinat}
                  rightTop={data.tanggalFoto}
                  rightBot={data.jamFoto}
                />
              </View>

              {/* --- LIST THUMBNAILS --- */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{paddingLeft: 18, marginTop: 13, marginBottom: 10}}>
                {assetUrls.map((imgUrl, i) => {
                  console.log('imgUrl', imgUrl);
                  return (
                    <View key={i} style={styles1.thumbBox}>
                      {imgUrl ? (
                        <Image
                          source={{uri: imgUrl}}
                          style={styles1.smallImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={[
                            styles1.smallImage,
                            {
                              backgroundColor: '#eee',
                              justifyContent: 'center',
                              alignItems: 'center',
                            },
                          ]}>
                          <Text>?</Text>
                        </View>
                      )}
                      <OverlayImageInfo
                        leftTop={data.thumbnailInfo?.[i]?.lokasi}
                        leftBot={data.thumbnailInfo?.[i]?.koordinat}
                        rightTop={data.thumbnailInfo?.[i]?.tanggalFoto}
                        rightBot={data.thumbnailInfo?.[i]?.jamFoto}
                      />
                    </View>
                  );
                })}
              </ScrollView>

              {/* --- FIELD LIST --- */}
              <View style={styles1.detailCard}>
                <FieldItem
                  label="Tanggal"
                  value={formatDateShort(data?.date)}
                  bold
                />
                <FieldItem
                  label="iSafe Number"
                  value={data?.isafe || '-'}
                  bold
                />
                <FieldItem label="PIC" value={picName || data?.pic} />
                <FieldItem label="Status Report" value={data?.status} />
                <FieldItem label="Lokasi" value={data?.location} />
                <FieldItem label="Jenis Report" value={data.report_type} />
                <FieldItem label="Deskripsi" value={data?.description} />
                <FieldItem
                  label="Kolaborasi dengan"
                  value={data.collaboration}
                />
                <FieldItem
                  label="Waktu"
                  value={`${data?.start_time} - ${data?.end_time}`}
                />
                <FieldItem
                  label="Lampiran"
                  value={data?.lampiran || '-'}
                  isLink
                />
              </View>

              {/* --- EDIT BUTTON --- */}
              <TouchableOpacity
                style={styles1.btnEdit}
                onPress={() =>
                  navigation.replace('DetailDailyActivity', {
                    showForm: true,
                    data,
                  })
                }
                activeOpacity={0.85}>
                <Text style={styles1.btnEditText}>Edit</Text>
              </TouchableOpacity>
            </ScrollView>
          </>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
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
  inputText: {
    fontSize: 16,
    color: '#181818',
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
  textArea: {
    minHeight: 74,
    textAlignVertical: 'top',
    marginBottom: 11,
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

export default DetailDailyActivity;
