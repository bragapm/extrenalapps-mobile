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
  Linking,
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

const DetailMediaAndPublish = () => {
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

  const MEDIA_PARTNERS = [
    {label: 'Kompas', value: 'kompas'},
    {label: 'Detik', value: 'detik'},
    {label: 'Tempo', value: 'tempo'},
  ];

  const [mediaPartner, setMediaPartner] = useState('kompas');
  const [contactPerson, setContactPerson] = useState(''); // "Kontak"

  type TLinkItem = {
    id: string;
    title: string;
    fileName?: string; // UI only
    link: string;
    status: 'positive' | 'negative' | 'netral';
  };

  // Prefill dua kartu seperti contoh gambar
  const [links, setLinks] = useState<TLinkItem[]>([
    {
      id: 'l1',
      title: 'Sinergi Bangun Desa',
      fileName: 'Technical-Spec.docs',
      link: 'https://www.kompas.com/tag/boreno-indc',
      status: 'positive',
    },
    {
      id: 'l2',
      title: 'Sinergi Bangun Desa',
      fileName: 'Technical-Spec.docs',
      link: 'https://www.kompas.com/tag/boreno-indc',
      status: 'positive',
    },
  ]);

  const updateLink = (id: string, patch: Partial<TLinkItem>) => {
    setLinks(prev => prev.map(it => (it.id === id ? {...it, ...patch} : it)));
  };

  const removeLink = (id: string) => {
    setLinks(prev => prev.filter(it => it.id !== id));
  };

  const addLink = () => {
    setLinks(prev => [
      ...prev,
      {id: String(Date.now()), title: '', link: '', status: 'positive'},
    ]);
  };

  // UI-only "upload" (sekadar ganti nama file)
  const mockChooseFile = (id: string) => {
    updateLink(id, {fileName: 'Technical-Spec.docs'});
    // Kalau nanti mau beneran pilih dokumen, tinggal ganti fungsi ini ke DocumentPicker
  };

  const LinkCard = ({
    item,
    onChange,
    onRemove,
  }: {
    item: TLinkItem;
    onChange: (patch: Partial<TLinkItem>) => void;
    onRemove: () => void;
  }) => {
    return (
      <View style={styles.cardWrap}>
        <TouchableOpacity style={styles.cardClose} onPress={onRemove}>
          <Text style={styles.cardCloseText}>×</Text>
        </TouchableOpacity>

        {/* Judul */}
        <Text style={styles.inputLabel}>Judul</Text>
        <TextInput
          style={styles.input}
          value={item.title}
          onChangeText={t => onChange({title: t})}
          placeholder="Judul"
          placeholderTextColor="#BBB"
        />

        {/* File */}
        <Text style={styles.inputLabel}>File</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            onChange({fileName: item.fileName || 'Technical-Spec.docs'})
          }
          style={styles.fileInput}>
          <Text style={styles.fileNameText}>
            {item.fileName || 'Technical-Spec.docs'}
          </Text>
          <View style={styles.fileIconWrap}>
            <Text style={{fontSize: 16, color: '#D22C32'}}>☁️</Text>
          </View>
        </TouchableOpacity>

        {/* Link */}
        <Text style={styles.inputLabel}>Link</Text>
        <TextInput
          style={styles.input}
          value={item.link}
          onChangeText={t => onChange({link: t})}
          placeholder="https://"
          placeholderTextColor="#BBB"
        />

        {/* Status */}
        <Text style={styles.inputLabel}>Status</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={item.status}
            onValueChange={(v: TLinkItem['status']) => onChange({status: v})}
            style={styles.picker}>
            <Picker.Item label="Positif" value="positive" />
            <Picker.Item label="Negatif" value="negative" />
            <Picker.Item label="Netral" value="netral" />
          </Picker>
        </View>
      </View>
    );
  };

  const PlainField = ({label, value}: {label: string; value?: string}) => (
    <View style={styles.plainFieldWrap}>
      <Text style={styles.plainLabel}>{label}</Text>
      <Text style={styles.plainValue}>{value || '-'}</Text>
    </View>
  );

  // Badge kecil untuk kartu berita
  const SentimentPill = ({
    type,
  }: {
    type: 'positive' | 'negative' | 'netral';
  }) => {
    const map = {
      positive: {text: 'Positif', border: '#29B36A', color: '#29B36A'},
      negative: {text: 'Negatif', border: '#E14B43', color: '#E14B43'},
      netral: {text: 'Netral', border: '#6B7280', color: '#6B7280'},
    } as const;
    const cfg = map[type] || map.netral;
    return (
      <View style={[styles.pill, {borderColor: cfg.border}]}>
        <Text style={[styles.pillText, {color: cfg.color}]}>{cfg.text}</Text>
      </View>
    );
  };

  // Kartu berita seperti desain
  const NewsCard = ({
    item,
    onMenuPress,
  }: {
    item: {
      id: string;
      status: 'positive' | 'negative' | 'netral';
      title: string;
      link: string;
      docLabel?: string;
    };
    onMenuPress?: () => void;
  }) => {
    // ambil host dari URL
    const host = (() => {
      try {
        return new URL(item.link).host;
      } catch {
        return item.link?.split('/')[2] || item.link;
      }
    })();

    return (
      <View style={styles.newsCard}>
        <View style={styles.newsTopRow}>
          <SentimentPill type={item.status} />
          <TouchableOpacity
            onPress={onMenuPress}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={styles.kebab}>⋮</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.newsHost}>{host}</Text>
        <Text style={styles.newsTitle}>{item.title}</Text>

        {!!item.link && (
          <TouchableOpacity
            onPress={() => Linking.openURL(item.link)}
            activeOpacity={0.7}>
            <Text style={styles.newsDocLink}>
              {item.docLabel || 'Dokumen.pdf'}
            </Text>
          </TouchableOpacity>
        )}
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
            <AppHeader detail={true} home={false} label="Tambah Publikasi" />
            // ---------- FORM INPUT (EDIT/CREATE) ----------
            <ScrollView
              style={{width: '100%', marginBottom: '20%'}}
              contentContainerStyle={{padding: 20, paddingBottom: 60}}>
              {/* Media Partner */}
              <Text style={styles.inputLabel}>Media Partner</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={mediaPartner}
                  onValueChange={setMediaPartner}
                  style={styles.picker}>
                  {MEDIA_PARTNERS.map(opt => (
                    <Picker.Item
                      key={opt.value}
                      label={opt.label}
                      value={opt.value}
                    />
                  ))}
                </Picker>
              </View>

              {/* Kontak */}
              <Text style={styles.inputLabel}>Kontak</Text>
              <TextInput
                style={styles.input}
                value={contactPerson}
                onChangeText={setContactPerson}
                placeholder="Koordinat"
                placeholderTextColor="#BBB"
              />

              {/* Link section */}
              <Text style={[styles.inputLabel, {marginTop: 6}]}>Link</Text>

              {links.map(item => (
                <LinkCard
                  key={item.id}
                  item={item}
                  onChange={patch => updateLink(item.id, patch)}
                  onRemove={() => removeLink(item.id)}
                />
              ))}

              {/* Tambah */}
              <TouchableOpacity
                style={styles.addDashedBtn}
                onPress={addLink}
                activeOpacity={0.85}>
                <Text style={styles.addDashedText}>Tambah</Text>
              </TouchableOpacity>

              <View style={{height: 50}} />
            </ScrollView>
          </>
        ) : (
          <>
            <AppHeader
              detail={true}
              home={false}
              label="Review Media & Publikasi"
            />
            // ----------- DETAIL REVIEW (READONLY) -----------
            <ScrollView
              style={{width: '100%', marginBottom: '20%'}}
              contentContainerStyle={{padding: 20, paddingBottom: 120}} // beri ruang utk bottom bar
            >
              {/* Field sesuai desain */}
              <PlainField
                label="Media Partner"
                value={detail?.media_partner || 'Kompas.com'}
              />
              <PlainField
                label="Jabatan"
                value={detail?.position || 'Jurnalis'}
              />
              <PlainField label="PIC" value={detail?.pic || 'Gugun Gunawan'} />
              <PlainField
                label="Email"
                value={detail?.email || 'kompasiar@gmail.com'}
              />
              <PlainField
                label="Nomer Hp"
                value={detail?.phone_number || '098768588789'}
              />

              {/* Berita */}
              <Text style={styles.sectionTitle2}>Berita</Text>

              {(
                detail?.news_list || [
                  {
                    id: 'n1',
                    status: 'negative',
                    title:
                      'Pengumuman Penting: Inovasi Terbaru dalam Media dan Publikasi',
                    link: 'https://inddobarakompas-news.com/dokumen.pdf',
                    docLabel: 'Dokumen.pdf',
                  },
                  {
                    id: 'n2',
                    status: 'positive',
                    title:
                      'Pengumuman Penting: Inovasi Terbaru dalam Media dan Publikasi',
                    link: 'https://inddobarakompas-news.com/dokumen.pdf',
                    docLabel: 'Dokumen.pdf',
                  },
                  {
                    id: 'n3',
                    status: 'negative',
                    title:
                      'Pengumuman Penting: Inovasi Terbaru dalam Media dan Publikasi',
                    link: 'https://inddobarakompas-news.com/dokumen.pdf',
                    docLabel: 'Dokumen.pdf',
                  },
                  {
                    id: 'n4',
                    status: 'positive',
                    title:
                      'Pengumuman Penting: Inovasi Terbaru dalam Media dan Publikasi',
                    link: 'https://inddobarakompas-news.com/dokumen.pdf',
                    docLabel: 'Dokumen.pdf',
                  },
                ]
              ).map((it: any) => (
                <NewsCard
                  key={it.id}
                  item={it}
                  onMenuPress={() => {
                    /* buka menu */
                  }}
                />
              ))}
            </ScrollView>
          </>
        )}
        {/* Bottom Button (showForm only) */}

        {!showForm && (
          <View style={styles.bottomBtnGroup}>
            <TouchableOpacity
              style={styles.btnSubmit}
              onPress={() =>
                navigation.replace('DetailMediaAndPublish', {
                  showForm: true,
                  data: detail,
                })
              }
              activeOpacity={0.85}>
              <Text style={styles.submitText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnDeleteOutline}
              onPress={() =>
                Alert.alert('Konfirmasi', 'Hapus data ini?', [
                  {text: 'Batal', style: 'cancel'},
                  {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: () => {
                      /* TODO: panggil API delete */
                    },
                  },
                ])
              }
              activeOpacity={0.85}>
              <Text style={styles.deleteOutlineText}>Hapus</Text>
            </TouchableOpacity>
          </View>
        )}
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
  cardWrap: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    marginTop: 12,
    position: 'relative',
  },
  cardClose: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCloseText: {fontSize: 18, color: '#7A7A7A'},

  // ==== File input look (merah muda seperti gambar) ====
  fileInput: {
    borderWidth: 1.5,
    borderColor: '#E54449',
    backgroundColor: '#FFF1F1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileNameText: {fontSize: 16, color: '#1F1F1F'},
  fileIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E54449',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE8E8',
  },

  // ==== Tombol Tambah bergaris putus-putus ====
  addDashedBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#E54449',
    backgroundColor: '#FAF4F4',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  addDashedText: {color: '#D22C32', fontSize: 16, fontWeight: '600'},
  sectionTitle2: {
    fontWeight: '600',
    fontSize: 14,
    color: '#5B5B5B',
    marginTop: 12,
    marginBottom: 8,
  },
  plainFieldWrap: {
    paddingBottom: 12,
    borderBottomColor: '#E5E5E5',
    borderBottomWidth: 1,
    marginBottom: 6,
  },
  plainLabel: {fontSize: 12, color: '#7C7C7C', marginBottom: 4},
  plainValue: {fontSize: 16, color: '#1F1F1F'},

  // ===== KARTU BERITA =====
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  newsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kebab: {fontSize: 18, color: '#7C7C7C', paddingHorizontal: 6},
  newsHost: {color: '#8E8E8E', fontSize: 12, marginTop: 8},
  newsTitle: {color: '#1F1F1F', fontSize: 16, fontWeight: '600', marginTop: 6},
  newsDocLink: {
    color: '#0B63F6',
    fontSize: 14,
    marginTop: 10,
    textDecorationLine: 'underline',
  },

  // pill
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pillText: {fontSize: 12, fontWeight: '600'},

  // ===== BOTTOM BAR READ-ONLY (Edit / Hapus) =====
  btnDeleteOutline: {
    borderWidth: 1.5,
    borderColor: '#D22C32',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 7,
    alignItems: 'center',
  },
  deleteOutlineText: {color: '#D22C32', fontSize: 18, fontWeight: '600'},
});

export default DetailMediaAndPublish;
