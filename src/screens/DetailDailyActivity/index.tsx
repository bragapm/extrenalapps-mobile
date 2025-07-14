import React, {useState} from 'react';
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
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {Picker} from '@react-native-picker/picker';
import UploadPickerModal from '../../components/UploadPickerModal';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';

const {width} = Dimensions.get('window');
const IMAGE_ASPECT = 1.85; // 16:9

const dummyData = {
  status: 'Open',
  title: 'Land Dispute | Issue A',
  mainImage: require('../../assets/images/imgSample.png'),
  images: [
    require('../../assets/images/imgSample2.png'),
    require('../../assets/images/imgSample2.png'),
    require('../../assets/images/imgSample2.png'),
  ],
  lokasi: 'Lokasi Kantor A',
  koordinat: '-0.37042, 68.57022',
  tanggalFoto: '12 Juni 2025',
  jamFoto: '12:00 WIB',
  thumbnailInfo: [
    {
      lokasi: 'Lokasi Kantor A',
      koordinat: '-0.37042, 68.57022',
      tanggalFoto: '12 Juni 2025',
      jamFoto: '12:00 WIB',
    },
    {
      lokasi: 'Lokasi Kantor A',
      koordinat: '-0.37042, 68.57022',
      tanggalFoto: '12 Juni 2025',
      jamFoto: '12:00 WIB',
    },
    {
      lokasi: 'Lokasi Kantor A',
      koordinat: '-0.37042, 68.57022',
      tanggalFoto: '12 Juni 2025',
      jamFoto: '12:00 WIB',
    },
    {
      lokasi: 'Lokasi Kantor A',
      koordinat: '-0.37042, 68.57022',
      tanggalFoto: '12 Juni 2025',
      jamFoto: '12:00 WIB',
    },
  ],
  tanggal: '12 Feb 2025',
  isafe: 'ID123245',
  pic: 'Priya Nair',
  statusReport: 'Open',
  lokasiA: 'Lokasi A',
  jenis: 'Land Dispute',
  deskripsi: 'Deskripsi',
  kolaborasi: 'Divisi IT',
  waktu: '09:00 - 17:00 WIB',
  lampiran: {text: 'Surat permohonan cuti.pdf', url: 'https://google.com/'},
};

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
        {value.text}
      </Text>
    ) : (
      <Text
        style={[
          styles1.fieldValue,
          bold && {fontWeight: 'bold', color: '#222'},
        ]}>
        {value}
      </Text>
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
  {label: 'Open', value: 'Open'},
  {label: 'Waiting', value: 'Waiting'},
  {label: 'Closed', value: 'Closed'},
];
const JENIS_REPORT_OPTIONS = [
  {label: 'Land Dispute', value: 'Land Dispute'},
  {label: 'Taman Nasional', value: 'Taman Nasional'},
  {label: 'Lainnya', value: 'Lainnya'},
];

const DetailDailyActivity = () => {
  const navigation = useNavigation();
  const data = dummyData;
  const route = useRoute();
  const {
    showForm = false,
    // data
  } = route.params || {};

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
      if (img) setMedia(m => [...m, {uri: img.path}]);
    } catch (e) {
      console.log('Camera error:', e); // <-- Tambahkan ini
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
      if (img) setMedia(m => [...m, {uri: img.path}]);
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
          uri: res.uri,
          name: res.name,
          type: res.type,
          isFile: true, // flag, biar tahu ini file bukan gambar
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

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F6F6" />
      <View style={{flex: 1, backgroundColor: '#F6F6F6'}}>
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
              contentContainerStyle={{padding: 18, paddingBottom: 80}}>
              {/* Tanggal Kerja */}
              <Text style={styles.inputLabel}>Tanggal kerja</Text>
              <TouchableOpacity
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
              />

              {/* PIC */}
              <Text style={styles.inputLabel}>PIC</Text>
              <TextInput
                style={styles.input}
                value={pic}
                onChangeText={setPIC}
                placeholder="Nama PIC"
              />

              {/* Judul Report */}
              <Text style={styles.inputLabel}>Judul Report</Text>
              <TextInput
                style={styles.input}
                value={judul}
                onChangeText={setJudul}
                placeholder="-"
              />

              {/* Jenis Report */}
              <Text style={styles.inputLabel}>Jenis Report</Text>
              <View style={styles.pickerWrapper}>
                <Picker
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
              />

              {/* Kolaborasi dengan */}
              <Text style={styles.inputLabel}>Kolaborasi dengan</Text>
              <TextInput
                style={styles.input}
                value={kolaborasi}
                onChangeText={setKolaborasi}
                placeholder="Divisi IT"
              />

              {/* Waktu Mulai */}
              <Text style={styles.inputLabel}>Waktu mulai</Text>
              <TextInput
                style={styles.input}
                value={waktuMulai}
                onChangeText={setWaktuMulai}
                placeholder="09:00 WIB"
              />

              {/* Waktu Selesai */}
              <Text style={styles.inputLabel}>Waktu Selesai</Text>
              <TextInput
                style={styles.input}
                value={waktuSelesai}
                onChangeText={setWaktuSelesai}
                placeholder="09:00 WIB"
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
                    <View key={idx} style={styles.mediaItemWrap}>
                      {item.isFile ? (
                        <TouchableOpacity
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
              <TouchableOpacity style={styles.btnSubmit}>
                <Text style={styles.submitText}>Simpan</Text>
              </TouchableOpacity>
              <TouchableOpacity
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
              label="Review Perjalanan Dinas"
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
                <Image
                  source={data.mainImage}
                  style={styles1.headerImage}
                  resizeMode="cover"
                />
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
                {data.images.map((img, i) => (
                  <View key={i} style={styles1.thumbBox}>
                    <Image
                      source={img}
                      style={styles1.smallImage}
                      resizeMode="contain"
                    />
                    {/* Overlay kiri bawah & kanan bawah thumbnail */}
                    <OverlayImageInfo
                      leftTop={data.thumbnailInfo[i].lokasi}
                      leftBot={data.thumbnailInfo[i].koordinat}
                      rightTop={data.thumbnailInfo[i].tanggalFoto}
                      rightBot={data.thumbnailInfo[i].jamFoto}
                    />
                  </View>
                ))}
              </ScrollView>

              {/* --- FIELD LIST --- */}
              <View style={styles1.detailCard}>
                <FieldItem label="Tanggal" value={data.tanggal} bold />
                <FieldItem label="iSafe Number" value={data.isafe} bold />
                <FieldItem label="PIC" value={data.pic} bold />
                <FieldItem label="Status Report" value={data.statusReport} />
                <FieldItem label="Lokasi" value={data.lokasiA} />
                <FieldItem label="Jenis Report" value={data.jenis} />
                <FieldItem label="Deskripsi" value={data.deskripsi} />
                <FieldItem label="Kolaborasi dengan" value={data.kolaborasi} />
                <FieldItem label="Waktu" value={data.waktu} />
                <FieldItem label="Lampiran" value={data.lampiran} isLink />
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
    paddingVertical: 10,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
