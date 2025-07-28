import React, {useCallback, useEffect, useState} from 'react';
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
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  getBusinessTripDetail,
  getStakeholdersDetail,
  getUsers,
  patchData,
  postData,
  putData,
  updateFileMetaDirectus,
  uploadFileDirectus,
} from '../../services/apiServices';
import UploadPickerModal from '../../components/UploadPickerModal';

const transportasiList = [
  {label: 'Air Transportation', value: 'air'},
  {label: 'Hotel', value: 'hotel'},
  {label: 'Land Transportation', value: 'land'},
  {label: 'Visa/Paspor', value: 'visa'},
];

const jenisSentiment = [
  {label: 'Positif', value: 'positive'},
  {label: 'Negatif', value: 'negative'},
  {label: 'Netral', value: 'netral'},
];

const AbsensiBadge = ({statusType}) => {
  let color = '#AAA',
    bg = '#F3F3F3',
    border = 'transparent';
  if (statusType === 'Positif') {
    color = '#21B573';
    bg = '#E6FFF1';
    border = '#60DEAA';
  } else if (statusType === 'Negatif') {
    color = '#C4432C';
    bg = '#FFF6E0';
    border = '#C4432C';
  } else if (statusType === 'Netral') {
    color = '#232221';
    bg = '#FFFFFF00';
    border = '#232221';
  }
  return (
    <View
      style={{
        borderRadius: 6,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: bg,
        paddingVertical: 2,
        paddingHorizontal: 8,
        alignSelf: 'flex-start',
        marginLeft: 0,
        marginTop: -4,
      }}>
      <Text style={{color, fontSize: 13, fontWeight: '500'}}>{statusType}</Text>
    </View>
  );
};

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

const DetailStakeholder = () => {
  const route = useRoute();
  const {showForm = false, data} = route.params || {};
  const id = data?.id;
  const navigation = useNavigation();
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userMap, setUserMap] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const handleAddMedia = () => setModalVisible(true);
  // Form states
  const [tujuan, setTujuan] = useState('');
  const [jenisPerdin, setJenisPerdin] = useState(jenisSentiment[0].value);
  const [tanggalMulai, setTanggalMulai] = useState(null);
  const [tanggalAkhir, setTanggalAkhir] = useState(null);
  const [negara, setNegara] = useState('Indonesia');
  const [kota, setKota] = useState('');
  const [transportasi, setTransportasi] = useState([]);
  const [approver, setApprover] = useState('');
  const [note, setNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateType, setDateType] = useState('mulai');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [organization, setOrganization] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [sentiment, setSentiment] = useState('positive');
  const [media, setMedia] = useState([]); // Untuk file lampiran
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showPicker, setShowPicker] = useState(false); // Untuk modal upload file

  // Simulasi detail personnel
  const personnel = {
    name: data?.name || 'Priya Nair',
    isafeId: data?.isafeId || '121HGF',
    nik: data?.nik || 'IDT01A5JWADPKZA999',
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchDetail = async () => {
        setLoading(true);
        try {
          const [detailData, users] = await Promise.all([
            getStakeholdersDetail(id),
            getUsers(),
          ]);
          // Map user id to name
          const userMapping = {};
          users.forEach(u => {
            userMapping[u.id] = `${u.first_name || ''} ${
              u.last_name || ''
            }`.trim();
          });
          if (isActive) {
            setUserMap(userMapping);
            setDetail(detailData);
          }
        } catch (e) {
          if (isActive) setDetail(null);
        } finally {
          if (isActive) setLoading(false);
        }
      };
      if (id) fetchDetail();

      // cleanup
      return () => {
        isActive = false;
      };
    }, [id]),
  );

  useEffect(() => {
    if (showForm && data) {
      setName(data.name || '');
      setPosition(data.position || '');
      setOrganization(data.organization || '');
      setLocation(data.location || '');
      setAddress(data.address || '');
      setPhoneNumber(data.phone_number || '');
      setEmail(data.email || '');
      setSentiment(data.sentiment || 'positive');
      // setMedia(...); // Kalau mau handle lampiran
    } else if (showForm) {
      // Reset semua kalau tidak ada data
      setName('');
      setPosition('');
      setOrganization('');
      setLocation('');
      setAddress('');
      setPhoneNumber('');
      setEmail('');
      setSentiment('positive');
      // setMedia([]);
    }
  }, [showForm, data]);

  // Handle transportasi checkbox

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

    // Build body sesuai field API
    const body = {
      name,
      position,
      organization,
      location,
      address,
      phone_number: phoneNumber,
      email,
      sentiment,
    };

    try {
      if (data?.id) {
        // MODE EDIT (PATCH)
        await patchData(`/items/stakeholders/${data.id}`, body);
        Alert.alert('Sukses', 'Stakeholder berhasil diupdate!');
      } else {
        // MODE CREATE (POST)
        await postData('/items/stakeholders', body);
        Alert.alert('Sukses', 'Stakeholder berhasil ditambahkan!');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Gagal submit data');
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
            <AppHeader detail={true} home={false} label="Tambah Stakeholder" />
            // ---------- FORM INPUT (EDIT/CREATE) ----------
            <ScrollView
              style={{width: '100%', marginBottom: '20%'}}
              contentContainerStyle={{padding: 20, paddingBottom: 60}}>
              <Text style={styles.inputLabel}>Nama</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nama"
                placeholderTextColor="#BBB"
              />
              <Text style={styles.inputLabel}>Jabatan</Text>
              <TextInput
                style={styles.input}
                value={position}
                onChangeText={setPosition}
                placeholder="Jabatan"
                placeholderTextColor="#BBB"
              />
              <Text style={styles.inputLabel}>Organisasi/Instansi</Text>
              <TextInput
                style={styles.input}
                value={organization}
                onChangeText={setOrganization}
                placeholder="Organisasi/Institusi"
                placeholderTextColor="#BBB"
              />
              <Text style={styles.inputLabel}>Lokasi</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Lokasi"
                placeholderTextColor="#BBB"
              />
              <Text style={styles.inputLabel}>Alamat</Text>
              <TextInput
                style={styles.textArea}
                value={address}
                onChangeText={setAddress}
                placeholder="Alamat"
                multiline
              />

              <Text style={styles.inputLabel}>Nomor HP</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Nomor Hp"
                placeholderTextColor="#BBB"
              />
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="email"
                placeholderTextColor="#BBB"
              />

              {/* Jenis Perjalanan Dinas */}
              <Text style={styles.inputLabel}>Sentimenitas</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={sentiment}
                  onValueChange={setSentiment}
                  style={styles.picker}>
                  {jenisSentiment.map(opt => (
                    <Picker.Item
                      key={opt.value}
                      label={opt.label}
                      value={opt.value}
                    />
                  ))}
                </Picker>
              </View>

              {/* <Text style={[styles.inputLabel, {marginBottom: 4}]}>
                Lampiran
              </Text> */}
              {/* <View style={styles.mediaBox}>
                <Text style={styles.mediaLabel}>Media</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{alignItems: 'center', gap: 7}}>
                  {media.map((item, idx) => (
                    <View key={item.id} style={styles.mediaItemWrap}>
                      {item?.isServerFile ? (
                        <Image
                          source={{uri: assetUrls[idx]}}
                          style={styles.mediaThumb}
                        />
                      ) : item?.isFile ? (
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

                  <TouchableOpacity
                    disabled={loadingSubmit}
                    style={styles.mediaAddBtn}
                    onPress={handleAddMedia}>
                    <Text style={{color: '#D22C32', fontWeight: '500'}}>
                      Tambah
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View> */}
              {/* <UploadPickerModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onCamera={handleCamera}
                onFile={handleFile}
                onDocument={handleDocument}
              /> */}

              <View style={{height: 50}} />
            </ScrollView>
          </>
        ) : (
          <>
            <AppHeader detail={true} home={false} label="Review Stakeholder" />
            // ----------- DETAIL REVIEW (READONLY) -----------
            <ScrollView
              style={{width: '100%'}}
              contentContainerStyle={{padding: 20, paddingBottom: 60}}>
              <Text style={styles.sectionTitle}>Detail Personil</Text>
              <DetailField label="Nama" value={detail?.name || '-'} />
              <DetailField label="Jabatan" value={detail?.position || '-'} />
              <DetailField
                label="Organisasi/Instansi"
                value={detail?.organization || '-'}
              />
              <DetailField label="Alamat" value={detail?.address || '-'} />
              <DetailField label="No. Hp" value={detail?.phone_number || '-'} />
              <DetailField label="Email" value={detail?.email || '-'} />
              <View style={styles.fieldWrap}>
                {/* style={{...styles.weeklyButton, backgroundColor: colors.red}}> */}
                <Text style={{...styles.label, marginBottom: '2%'}}>
                  Sentimenitas
                </Text>
                <AbsensiBadge
                  statusType={
                    detail?.sentiment === 'positive'
                      ? 'Positif'
                      : detail?.sentiment === 'negative'
                      ? 'Negatif'
                      : 'Netral'
                  }
                />
              </View>
              <DetailField label="Lampiran" value={detail?.document || '-'} />
              <DetailField
                label="Last Update"
                value={detail?.date_updated || '-'}
              />
              {/* Bottom Edit Button */}
              <TouchableOpacity
                style={styles.btnEdit}
                onPress={() =>
                  navigation.replace('DetailStakeHolder', {
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
});

export default DetailStakeholder;
