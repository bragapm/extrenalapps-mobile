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
import {Picker} from '@react-native-picker/picker';
import DocumentPicker from 'react-native-document-picker';
import {
  BASE_URL,
  createWeeklyActivity,
  getDailyActivities,
  getWeeklyActivityDetail,
  getUsers,
  updateFileMetaDirectus,
  uploadFileDirectus,
} from '../../services/apiServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {WebView} from 'react-native-webview';

const {width} = Dimensions.get('window');
const IMAGE_ASPECT = 1.85; // 16:9

// ====== UTIL DATE/TIME ======
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
function formatDateShort(date) {
  if (!date) return '';
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('id-ID', {month: 'short'});
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}
function formatDate(d) {
  if (!d) return '';
  const tgl = new Date(d);
  return `${tgl.getDate()} ${tgl.toLocaleString('id-ID', {
    month: 'short',
  })} ${tgl.getFullYear()}`;
}

// ====== OPTIONS ======
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

const PPT_MIMES = [
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

function isAllowedDoc(file: {name?: string; type?: string}) {
  const name = (file?.name || '').toLowerCase();
  const type = (file?.type || '').toLowerCase();
  const byExt =
    name.endsWith('.pdf') || name.endsWith('.ppt') || name.endsWith('.pptx');
  const byMime = type === 'application/pdf' || PPT_MIMES.includes(type);
  return byExt || byMime;
}
function isPdfByNameOrMime(file: {name?: string; type?: string; uri?: string}) {
  const name = (file?.name || '').toLowerCase();
  const type = (file?.type || '').toLowerCase();
  return (
    name.endsWith('.pdf') ||
    type === 'application/pdf' ||
    (typeof file?.uri === 'string' && file.uri.endsWith('.pdf'))
  );
}
function isPptByNameOrMime(file: {name?: string; type?: string; uri?: string}) {
  const name = (file?.name || '').toLowerCase();
  const type = (file?.type || '').toLowerCase();
  return (
    name.endsWith('.ppt') ||
    name.endsWith('.pptx') ||
    PPT_MIMES.includes(type) ||
    (typeof file?.uri === 'string' &&
      (file.uri.endsWith('.ppt') || file.uri.endsWith('.pptx')))
  );
}

const DetailWeeklyActivity = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {showForm = false, data} = route.params || {};
  const id = data?.id;

  const [media, setMedia] = useState<
    {
      id: string;
      uri: string;
      name?: string;
      type?: string;
      isServerFile?: boolean;
    }[]
  >([]);
  const [tanggal] = useState(new Date());
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value);
  const [lokasi, setLokasi] = useState('');
  const [pic, setPIC] = useState([]);
  const [judul, setJudul] = useState('-');
  const [jenis, setJenis] = useState(JENIS_REPORT_OPTIONS[0].value);
  const [deskripsi, setDeskripsi] = useState('');

  // ====== RANGE STATE: start & end (window 7 hari) ======
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({start: null, end: null});
  const [showEndPicker, setShowEndPicker] = useState(false);
  const DAYS_WINDOW = 7;
  const stripTime = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const shiftDays = (date, days) => {
    const dt = stripTime(date);
    dt.setDate(dt.getDate() + days);
    return dt;
  };
  const setEndAndBackfillStart = end => {
    const endClean = stripTime(end);
    const startClean = shiftDays(endClean, -(DAYS_WINDOW - 1));
    setDateRange({start: startClean, end: endClean});
  };

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  const [kesimpulan, setKesimpulan] = useState('');
  const [allDaily, setAllDaily] = useState<any[]>([]);
  const [filteredDaily, setFilteredDaily] = useState<any[]>([]);
  const [selectedDaily, setSelectedDaily] = useState<string[]>([]);

  const [userList, setUserList] = useState<any[]>([]);
  const [picName, setPicName] = useState('');

  useEffect(() => {
    getDailyActivities().then(setAllDaily);
  }, []);

  function getWeekOfMonth(date) {
    const tanggal = new Date(date);
    const startOfMonth = new Date(tanggal.getFullYear(), tanggal.getMonth(), 1);
    const dayOfWeekStart = startOfMonth.getDay() || 7;
    const dayOfMonth = tanggal.getDate();
    return Math.ceil((dayOfMonth + dayOfWeekStart - 1) / 7);
  }
  function autoGenerateTitle(dateStart) {
    if (!dateStart) return '-';
    const date = new Date(dateStart);
    const mingguKe = getWeekOfMonth(date);
    const month = date.toLocaleString('id-ID', {month: 'long'});
    const year = date.getFullYear();
    const tglStr = `${date.getDate()} ${month} ${year}`;
    return `W${mingguKe} ${month} ${year}: ${tglStr}`;
  }

  // Filter daily ketika range valid
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start).setHours(0, 0, 0, 0);
      const end = new Date(dateRange.end).setHours(23, 59, 59, 999);
      const filtered = allDaily.filter(item => {
        if (!item.date) return false;
        const dt = new Date(item.date).getTime();
        return dt >= start && dt <= end;
      });
      setFilteredDaily(filtered);
      setSelectedDaily(filtered.map(item => item.id));
    } else {
      setFilteredDaily([]);
      setSelectedDaily([]);
    }
  }, [dateRange, allDaily]);

  // Ambil detail bila mode review
  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      setLoadingDetail(true);
      try {
        const res = await getWeeklyActivityDetail(id);
        if (isMounted) setDetail(res);
      } catch (e) {
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

  // Users untuk mapping PIC & uploader
  useEffect(() => {
    getUsers()
      .then(users => setUserList(users))
      .catch(() => setUserList([]));
  }, []);

  // Tampilkan PIC name pada review
  useEffect(() => {
    if (!showForm && userList?.length && detail?.pics) {
      const names = (detail.pics || [])
        .map(picObj => {
          const user = userList.find(u => u?.id === picObj.directus_users_id);
          return user
            ? `${user?.first_name} ${user.last_name}`
            : picObj.directus_users_id;
        })
        .filter(Boolean);
      setPicName(names.join(', '));
    }
  }, [showForm, userList, detail?.pics]);

  // Prefill form
  useEffect(() => {
    if (showForm && detail) {
      setStatus(detail.status || STATUS_OPTIONS[0].value);
      setLokasi(detail.location || '');
      setPIC(
        Array.isArray(detail.pics) && detail.pics.length > 0
          ? detail.pics.map(x => x.directus_users_id)
          : '',
      );
      setJudul(detail.title || '-');
      setJenis(detail.report_type || JENIS_REPORT_OPTIONS[0].value);
      setDeskripsi(detail.description || '');

      // Dokumen: masukkan sebagai server file (id = directus_files_id)
      if (Array.isArray(detail.documents)) {
        setMedia(
          detail.documents.map(doc => ({
            id: doc.directus_files_id,
            uri: doc.directus_files_id, // server id (akan dirender via BASE_URL/assets/{id})
            name: doc?.filename_download || doc?.title || 'Dokumen',
            isServerFile: true,
          })),
        );
      } else {
        setMedia([]);
      }

      // Prefill date range bila ada
      if (detail.date_start && detail.date_end) {
        setDateRange({
          start: new Date(detail.date_start),
          end: new Date(detail.date_end),
        });
      }
    }
  }, [showForm, detail]);

  // ====== FILE HANDLING: Hanya PDF / PPT ======
  const handleAddDocument = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [
          DocumentPicker.types.pdf,
          // Android mimes
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          // (Optional) iOS UTIs fallback (tidak fatal jika tak dikenal)
          'com.microsoft.powerpoint.ppt',
          'org.openxmlformats.presentationml.presentation',
        ],
        copyTo: 'cachesDirectory',
      });

      const file = {
        id: String(Date.now()),
        uri: res.fileCopyUri || res.uri,
        name: res.name,
        type: res.type,
      };

      if (!isAllowedDoc(file)) {
        Alert.alert('Format tidak didukung', 'Hanya boleh PDF atau PPT/PPTX.');
        return;
      }

      setMedia(prev => [...prev, file]);
    } catch (e: any) {
      if (!DocumentPicker.isCancel(e)) {
        Alert.alert('Gagal memilih dokumen', e?.message || 'Unknown error');
      }
    }
  };

  const handleRemoveMedia = (idx: number) =>
    setMedia(media.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    // Validasi basic
    if (!dateRange.end) {
      Alert.alert(
        'Validasi',
        'Pilih tanggal selesai (range 7 hari akan otomatis).',
      );
      return;
    }
    if (!media.length) {
      Alert.alert('Validasi', 'Minimal unggah 1 dokumen (PDF/PPT).');
      return;
    }

    setLoadingSubmit(true);
    try {
      const uploadedIds: string[] = [];
      for (const file of media) {
        if (!file.isServerFile) {
          // pastikan mime
          const mime =
            (file.type &&
              (file.type === 'application/pdf' ||
                PPT_MIMES.includes(file.type))) ||
            isPdfByNameOrMime(file)
              ? file.type ||
                (isPdfByNameOrMime(file) ? 'application/pdf' : PPT_MIMES[1])
              : PPT_MIMES[1];

          const id = await uploadFileDirectus({
            uri: file.uri,
            name: file.name || 'Lampiran.pdf',
            type: mime as string,
          });

          await updateFileMetaDirectus([id], {
            filename_download: file.name || 'Lampiran.pdf',
          });

          uploadedIds.push(id);
        } else {
          uploadedIds.push(file.id);
        }
      }

      const documents = uploadedIds.map(id => ({directus_files_id: id}));
      const autoTitle = autoGenerateTitle(dateRange.start);

      const body = {
        summary: kesimpulan,
        documents,
        title: autoTitle,
        daily_activities: selectedDaily,
        date_start: dateRange.start
          ? dateRange.start.toISOString().slice(0, 10)
          : null,
        date_end: dateRange.end
          ? dateRange.end.toISOString().slice(0, 10)
          : null,
      };

      await createWeeklyActivity(body);

      Alert.alert('Sukses', 'Berhasil create data weekly activity', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Unknown error');
    } finally {
      setLoadingSubmit(false);
    }
  };

  function getUploaderName() {
    if (!userList?.length || !detail?.user_created) return '-';
    const user = userList.find(u => u.id === detail.user_created);
    if (!user) return detail.user_created || '-';
    return [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  }

  // ===================== RENDER =====================
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
        <View
          style={{
            alignItems: 'center',
            marginVertical: 42,
            backgroundColor: '#FFF',
            borderRadius: 10,
            paddingVertical: '5%',
            paddingHorizontal: '2%',
          }}>
          <Image
            source={require('../../assets/images/404.png')}
            style={{width: 96, height: 96, marginBottom: 12, opacity: 0.7}}
            resizeMode="contain"
          />
          <Text
            style={{
              fontSize: 17,
              color: '#999',
              fontWeight: '600',
              marginBottom: 4,
            }}>
            Data Tidak di Temukan
          </Text>
          <Text style={{fontSize: 13, color: '#A5A5A5'}}>
            Silahkan coba lagi
          </Text>
        </View>
      );
    }
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
              {/* ======= Tanggal Kerja (Single Picker: pilih tanggal selesai, start auto 7 hari ke belakang) ======= */}
              <Text style={styles.inputLabel}>Tanggal kerja</Text>
              <TouchableOpacity
                style={[styles.rangeInput, {marginBottom: 12}]}
                onPress={() => setShowEndPicker(true)}>
                <Text style={styles.inputText}>
                  {dateRange.end
                    ? formatRangeDate(dateRange.start, dateRange.end)
                    : 'Pilih tanggal selesai'}
                </Text>
              </TouchableOpacity>

              {showEndPicker && (
                <DateTimePicker
                  value={dateRange.end || new Date()}
                  mode="date"
                  display="default"
                  onChange={(e, d) => {
                    setShowEndPicker(false);
                    if (d) setEndAndBackfillStart(d);
                  }}
                />
              )}

              {/* ======= Rekapan Daily Activity ======= */}
              <Text style={styles.inputLabel}>Rekapan Daily Activity</Text>
              <View style={styles.recapBox}>
                <ScrollView style={{maxHeight: 120}}>
                  {filteredDaily.length ? (
                    filteredDaily.map(item => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => {
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

              {/* ======= Lampiran: PDF / PPT saja ======= */}
              <Text style={styles.inputLabel}>Lampiran (PDF/PPT saja)</Text>
              <View style={styles.mediaBox}>
                <Text style={styles.mediaLabel}>Dokumen</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{alignItems: 'center'}}>
                  {media.map((item, idx) => (
                    <View key={item.id} style={styles.mediaItemWrap}>
                      {/* Kartu kecil dokumen */}
                      <TouchableOpacity
                        onPress={async () => {
                          // Jika server file → buka URL directus
                          const url = item.isServerFile
                            ? `${BASE_URL}/assets/${item.uri}?download`
                            : item.uri;
                          try {
                            await Linking.openURL(url);
                          } catch {
                            Alert.alert('Gagal membuka dokumen');
                          }
                        }}
                        style={[
                          styles.mediaThumb,
                          {
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 6,
                          },
                        ]}>
                        <Text style={{fontSize: 18}}>📄</Text>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: 11,
                            marginTop: 2,
                            textAlign: 'center',
                            width: 46,
                          }}>
                          {item.name ||
                            (isPdfByNameOrMime(item)
                              ? 'Dokumen.pdf'
                              : isPptByNameOrMime(item)
                              ? 'Dokumen.pptx'
                              : 'Dokumen')}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.mediaRemoveBtn}
                        onPress={() => handleRemoveMedia(idx)}>
                        <Text style={{color: '#fff', fontWeight: 'bold'}}>
                          ×
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={styles.mediaAddBtn}
                    onPress={handleAddDocument}>
                    <Text style={{color: '#D22C32', fontWeight: '500'}}>
                      Tambah
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
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

              {/* Dokumen list */}
              {Array.isArray(detail?.documents) &&
                detail.documents.length > 0 && (
                  <View style={{marginHorizontal: 18, marginTop: 10}}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}>
                      {detail.documents.map((doc, idx) => {
                        const fileId = doc.directus_files_id;
                        // Kita treat hanya PDF/PPT; PDF → WebView, PPT → kartu + tombol buka
                        const isPdf =
                          typeof fileId === 'string' &&
                          fileId.toLowerCase().endsWith('.pdf');

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
                              <View
                                style={{
                                  flex: 1,
                                  padding: 16,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                <Text style={{fontSize: 48, marginBottom: 8}}>
                                  📄
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    marginBottom: 6,
                                  }}
                                  numberOfLines={2}>
                                  {doc?.filename_download || 'Dokumen PPT/PPTX'}
                                </Text>
                                <TouchableOpacity
                                  onPress={() =>
                                    Linking.openURL(
                                      `${BASE_URL}/assets/${fileId}?download`,
                                    )
                                  }
                                  style={{
                                    backgroundColor: '#D22C32',
                                    paddingVertical: 10,
                                    paddingHorizontal: 16,
                                    borderRadius: 8,
                                  }}>
                                  <Text
                                    style={{color: '#fff', fontWeight: '600'}}>
                                    Buka / Unduh
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

              {/* Info pengunggah & tanggal */}
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
  recapItem: {color: '#232323', fontSize: 16, marginBottom: 10},
  recapEmpty: {color: '#777', fontStyle: 'italic'},
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
  inputText: {fontSize: 16, color: '#181818'},
  inputLabel: {
    fontSize: 14,
    color: '#4B4749',
    fontWeight: '400',
    marginBottom: 6,
    marginTop: 4,
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
  mediaItemWrap: {marginRight: 9, position: 'relative', marginVertical: '10%'},
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

export default DetailWeeklyActivity;
