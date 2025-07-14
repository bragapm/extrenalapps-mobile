import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import {useThemeStore} from '../../theme/useThemeStore';
import AppHeader from '../../components/AppHeader';
import Svg, {
  Line,
  Rect,
  G,
  Text as SvgText,
  Path,
  Circle,
} from 'react-native-svg';
import {useFeatureStore} from '../../store/featureStore';
import {RootStackParamList} from '../../navigation';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';

// Dummy data list absen
const DUMMY_LIST_ABSENSI = [
  {
    id: 1,
    date: '15 Feb 2025',
    name: 'Priya Nair',
    role: 'Dept.Head',
    status: 'Hadir',
    statusType: 'hadir',
  },
  {
    id: 2,
    date: '15 Mar 2025',
    name: 'Alma Sintia',
    role: 'Admin',
    status: 'Tidak hadir',
    statusType: 'tidakHadir',
  },
  {
    id: 3,
    date: '15 Jul 2025',
    name: 'Alma Sintia',
    role: 'Organic',
    status: 'Tidak Hadir',
    statusType: 'tidakHadir',
  },
  {
    id: 4,
    date: '15 Aug 2025',
    name: 'Alma Sintia',
    role: 'Non-Organic',
    status: 'Hadir',
    statusType: 'hadir',
  },
];

const DUMMY_CUTI = [
  {
    id: 1,
    from: '15 April, 2025',
    to: '16 April, 2025',
    name: 'Alma Sintia',
    totalDay: 3,
    approvedBy: 'Jerry Anwar Halim',
    status: 'Ditolak', // "Ditolak", "Waiting", "Disetujui"
  },
  {
    id: 2,
    from: '15 April, 2025',
    to: '16 April, 2025',
    name: 'Rudi Salim',
    totalDay: 3,
    approvedBy: 'Jerry Anwar Halim',
    status: 'Ditolak',
  },
  {
    id: 3,
    from: '15 April, 2025',
    to: '16 April, 2025',
    name: 'Angelica',
    totalDay: 3,
    approvedBy: 'Jerry Anwar Halim',
    status: 'Waiting',
  },
  {
    id: 4,
    from: '15 April, 2025',
    to: '16 April, 2025',
    name: 'Lira Salim',
    totalDay: 3,
    approvedBy: 'Jerry Anwar Halim',
    status: 'Disetujui',
  },
];
const DUMMY_PERDIN = [
  {
    id: 1,
    from: '15 April, 2025',
    to: '16 April, 2025',
    name: 'Alma Sintia',
    totalDay: 'Cirebon',
    approvedBy: 'Jerry Anwar Halim',
    status: 'Ditolak', // "Ditolak", "Waiting", "Disetujui"
  },
  {
    id: 2,
    from: '15 April, 2025',
    to: '16 April, 2025',
    name: 'Rudi Salim',
    totalDay: 'Bandung',
    approvedBy: 'Jerry Anwar Halim',
    status: 'Ditolak',
  },
  {
    id: 3,
    from: '15 April, 2025',
    to: '16 April, 2025',
    name: 'Angelica',
    totalDay: 'Madiun',
    approvedBy: 'Jerry Anwar Halim',
    status: 'Waiting',
  },
  {
    id: 4,
    from: '15 April, 2025',
    to: '16 April, 2025',
    name: 'Lira Salim',
    totalDay: 'Surakarta',
    approvedBy: 'Jerry Anwar Halim',
    status: 'Disetujui',
  },
];

// Komponen badge status absen
const AbsensiBadge = ({status, statusType}) => {
  let color = '#AAA',
    bg = '#F3F3F3',
    border = 'transparent';
  if (statusType === 'perjadin') {
    color = '#B17C00';
    bg = '#FFF6DD';
    border = '#FAD35D';
  } else if (statusType === 'sakit') {
    color = '#F7A401';
    bg = '#FFF6E0';
    border = '#FFECC0';
  } else if (statusType === 'tidakHadir') {
    color = '#E35131';
    bg = 'transparent';
    border = '#E35131';
  } else if (statusType === 'hadir') {
    color = '#2186EB';
    bg = 'transparent';
    border = '#90CCFF';
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
        marginLeft: 6,
        marginTop: -4,
      }}>
      <Text style={{color, fontSize: 13, fontWeight: '500'}}>{status}</Text>
    </View>
  );
};

// Komponen card absensi
const AbsensiCard = ({item, onPress}) => (
  <TouchableOpacity onPress={onPress} style={styles.absenCard}>
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
        justifyContent: 'space-between',
      }}>
      <Text style={styles.absenCardName}>{item.name}</Text>
      {item.statusType !== 'hadir' && (
        <AbsensiBadge status={item.status} statusType={item.statusType} />
      )}
      {item.statusType === 'hadir' && (
        <AbsensiBadge status={item.status} statusType={item.statusType} />
      )}
    </View>
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Text style={styles.absenCardDate}>{item.date}</Text>
    </View>
  </TouchableOpacity>
);

const Attendance: React.FC = () => {
  const activeMenu = useFeatureStore(state => state.activeMenu);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();
  const [type, setType] = useState('Cuti');
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(''); // Format: '15 Jul 2025' dsb
  const PERIOD_OPTIONS = ['Daily', 'Weekly', 'Monthly'];
  const [period, setPeriod] = useState('Weekly');
  const [showPeriodOptions, setShowPeriodOptions] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

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
          paddingVertical: 5,
          gap: 6,
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

  const renderItemCuti = ({item}) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('DetailCuti', {
          showForm: false,
          data: item,
        })
      }
      style={styles.cutiCard}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View>
          <Text
            style={{
              color: '#8F8D89',
              fontSize: 12,
              fontWeight: '400',
              marginBottom: 1,
            }}>
            Date
          </Text>
          <Text
            style={{
              color: '#23221E',
              fontSize: 13,
              fontWeight: '500',
              marginBottom: 6,
            }}>
            {item.from} -{item.to}
          </Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: '#F2F2F2',
          marginVertical: 10,
        }}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}>
        <View style={{flex: 1}}>
          <Text style={styles.cutiLabel}>Nama</Text>
          <Text style={styles.cutiValue}>{item.name}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.cutiLabel}>Jumlah Hari</Text>
          <Text style={styles.cutiValue}>{item.totalDay} hari</Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.cutiLabel}>Approved by</Text>
          <Text style={styles.cutiValue}>{item.approvedBy}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
    const renderItemPerdin = ({item}) => (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('DetailPerdin', {
            showForm: false,
            data: item,
          })
        }
        style={styles.cutiCard}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View>
            <Text
              style={{
                color: '#8F8D89',
                fontSize: 12,
                fontWeight: '400',
                marginBottom: 1,
              }}>
              Date
            </Text>
            <Text
              style={{
                color: '#23221E',
                fontSize: 13,
                fontWeight: '500',
                marginBottom: 6,
              }}>
              {item.from} -{item.to}
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: '#F2F2F2',
            marginVertical: 10,
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}>
          <View style={{flex: 1}}>
            <Text style={styles.cutiLabel}>Nama</Text>
            <Text style={styles.cutiValue}>{item.name}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.cutiLabel}>Tujuan</Text>
            <Text style={styles.cutiValue}>{item.totalDay}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.cutiLabel}>Approved by</Text>
            <Text style={styles.cutiValue}>{item.approvedBy}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );

  const handlePeriodPress = () => setShowPeriodOptions(true);

  const selectPeriod = value => {
    setPeriod(value);
    setShowPeriodOptions(false);
  };
  const filteredAbsensi = DUMMY_LIST_ABSENSI.filter(item => {
    // Filter by keyword
    const keywordMatch = !search
      ? true
      : item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.role.toLowerCase().includes(search.toLowerCase()) ||
        item.status.toLowerCase().includes(search.toLowerCase());

    // Filter by selected date
    const dateMatch = selectedDate ? item.date === selectedDate : true;

    // Period filter: di sini hanya demo, kalau butuh logic "Weekly" custom, tinggal ubah sesuai kebutuhan
    const periodMatch = period === 'Weekly' ? true : true;

    return keywordMatch && dateMatch && periodMatch;
  });

  // Dummy untuk date picker (simple)
  const handleDateFilter = () => {
    // Ganti ini pakai DatePicker/Modal sesuai kebutuhan
    // Demo: Pilih tanggal hardcode (toggle)
    setSelectedDate(selectedDate ? '' : '15 Jul 2025');
  };
  // Dummy untuk period picker
  const handlePeriodFilter = () => {
    setPeriod(period === 'Weekly' ? 'Monthly' : 'Weekly');
  };

  const handleAbsen = () => {
    if (!isCheckedIn) {
      // Logika Check In (nanti bisa panggil API dsb)
      setIsCheckedIn(true);
      // alert('Check In berhasil!');
    } else {
      // Logika Check Out
      setIsCheckedIn(false);
      // alert('Check Out berhasil!');
    }
  };

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={[styles.container, {backgroundColor: colors.bgHome}]}>
        <AppHeader
          // menu={true}
          home={true}
          // label={
          //   activeMenu === 'absen'
          //     ? 'Absensi'
          //     : activeMenu === 'cuti'
          //     ? 'Cuti'
          //     : activeMenu === 'perdin'
          //     ? 'Perjalanan Dinas'
          //     : ''
          // }
        />
        <ScrollView
          style={{flex: 1, width: '100%'}}
          contentContainerStyle={{alignItems: 'center', paddingBottom: 40}}
          showsVerticalScrollIndicator={false}>
          <View style={{width: '100%', alignItems: 'center'}}>
            {/* Judul & Desc */}
            <View
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: '7%',
                marginTop: 15,
              }}>
              <Text style={{color: '#181818', fontSize: 27, fontWeight: '500'}}>
                {activeMenu === 'absen'
                  ? 'Riwayat Absen'
                  : activeMenu === 'cuti'
                  ? 'Cuti'
                  : activeMenu === 'perdin'
                  ? 'Perjalanan Dinas'
                  : ''}
              </Text>
            </View>
            {/* Card Summary */}
            {/* <View style={styles.summaryCard}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}>
                <Text
                  style={{fontWeight: '700', fontSize: 15, color: '#181818'}}>
                  Summary{' '}
                  {activeMenu === 'absen'
                    ? 'Absensi'
                    : activeMenu === 'cuti'
                    ? 'Cuti'
                    : activeMenu === 'perdin'
                    ? 'Perjalanan Dinas'
                    : ''}
                </Text>
                <TouchableOpacity
                  style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                  <Text style={{color: '#989898', fontWeight: '500'}}>
                    Lihat detail
                  </Text>
                  <Text style={{fontSize: 14, color: '#989898'}}>›</Text>
                </TouchableOpacity>
              </View>
              <AbsensiLineChart type={activeMenu} />
              <AbsensiBarChart type={activeMenu} />
            </View> */}
            {/* Filter Row */}
            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Cari"
                placeholderTextColor="#222"
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
                onSubmitEditing={() => {}}
              />
              <TouchableOpacity style={styles.searchIconWrap}>
                <Image
                  source={require('../../assets/icons/ic-search.png')}
                  style={{width: 23, height: 23, tintColor: '#222'}}
                />
              </TouchableOpacity>
            </View>

            {/* Filter Row */}
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={styles.filterBtn}
                onPress={handleDateFilter}>
                <Image
                  source={require('../../assets/icons/ic-calendar.png')}
                  style={{
                    width: 18,
                    height: 18,
                    tintColor: '#222',
                    marginRight: 8,
                  }}
                />
                <Text style={{color: '#222', fontWeight: '500', fontSize: 15}}>
                  {selectedDate ? selectedDate : 'Pilih Tanggal'}
                </Text>
                <Text style={{fontSize: 16, marginLeft: 5, color: '#BDBDBD'}}>
                  ▼
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePeriodPress}
                style={styles.filterBtn}>
                <Text style={{color: '#222', fontWeight: '500', fontSize: 15}}>
                  {period}
                </Text>
                <Text style={{fontSize: 16, marginLeft: 8, color: '#BDBDBD'}}>
                  ▼
                </Text>
              </TouchableOpacity>

              {/* Period Picker Modal */}
              {showPeriodOptions && (
                <View
                  style={{
                    position: 'absolute',
                    top: 180,
                    left: '5%',
                    width: '90%',
                    backgroundColor: '#FFF',
                    borderRadius: 8,
                    zIndex: 999,
                    elevation: 6,
                    borderWidth: 1,
                    borderColor: '#DDD',
                    padding: 12,
                  }}>
                  {PERIOD_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => selectPeriod(opt)}
                      style={{paddingVertical: 8}}>
                      <Text
                        style={{
                          color: opt === period ? '#2186EB' : '#222',
                          fontWeight: opt === period ? '700' : '400',
                          fontSize: 16,
                        }}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <TouchableOpacity style={styles.downloadBtn}>
                <Image
                  source={require('../../assets/icons/ic-download.png')}
                  style={{width: 22, height: 22, tintColor: '#222'}}
                />
              </TouchableOpacity>
            </View>

            {/* List Absensi */}
            <View style={{width: '94%', marginTop: 10, marginBottom: '10%'}}>
              {activeMenu === 'absen' ? (
                <FlatList
                  data={filteredAbsensi}
                  keyExtractor={item => String(item.id)}
                  renderItem={({item}) => (
                    <AbsensiCard
                      onPress={data =>
                        navigation.navigate('DetailAttendance', {data: item})
                      }
                      item={item}
                    />
                  )}
                  scrollEnabled={false}
                />
              ) : activeMenu === 'cuti' ? (
                <FlatList
                  data={DUMMY_CUTI}
                  keyExtractor={item => String(item.id)}
                  renderItem={renderItemCuti}
                  scrollEnabled={false}
                />
              ) : (
                <FlatList
                  data={DUMMY_PERDIN}
                  keyExtractor={item => String(item.id)}
                  renderItem={renderItemPerdin}
                  scrollEnabled={false}
                />
              )}
            </View>
          </View>
        </ScrollView>
        <View style={styles.bottomBtnWrap}>
          {activeMenu === 'absen' ? (
            <TouchableOpacity style={styles.absenButton} onPress={handleAbsen}>
              <Text style={styles.absenButtonText}>
                {isCheckedIn ? 'Check Out' : 'Check In'}
              </Text>
            </TouchableOpacity>
          ) : activeMenu === 'cuti' ? (
            <TouchableOpacity
              style={styles.absenButton}
              onPress={() =>
                navigation.navigate('DetailCuti', {showForm: true})
              }>
              <Text style={styles.absenButtonText}>Plan Cuti</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.absenButton}
              onPress={() =>
                navigation.navigate('DetailPerdin', {showForm: true})
              }>
              <Text style={styles.absenButtonText}>Plan Perjalanan Dinas</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center'},
  summaryCard: {
    width: '94%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginTop: 24,
    marginBottom: 9,
    paddingHorizontal: 16,
    paddingVertical: 13,
    shadowColor: '#E3E3E3',
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 1.5,
  },
  searchContainer: {
    width: '94%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    marginTop: 20,
    marginBottom: 14,
    paddingHorizontal: 16,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: '#222',
    fontWeight: '400',
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  searchIconWrap: {
    marginLeft: 8,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    width: '94%',
    marginBottom: 13,
    alignItems: 'center',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: '#FFF',
    flex: 1,
    height: 45,
  },
  downloadBtn: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    justifyContent: 'center',
    alignItems: 'center',
    width: 45,
    height: 45,
    padding: 0,
  },
  absenCard: {
    backgroundColor: '#FFF',
    borderRadius: 11,
    padding: 15,
    marginBottom: 13,
    borderWidth: 0,
    shadowColor: '#EEE',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
  absenCardDate: {color: '#888', fontSize: 13, marginBottom: 5},
  absenCardName: {
    fontWeight: '500',
    fontSize: 18,
    color: '#191818',
    marginRight: 7,
  },
  absenCardRole: {fontSize: 14, color: '#7B7B7B', fontWeight: '400'},
  bottomBtnWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingVertical: '3%',
    zIndex: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  absenButton: {
    backgroundColor: '#DF2C2C',
    borderRadius: 9,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#DF2C2C',
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 3,
  },
  absenButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  cutiCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    marginTop: 2,
    shadowColor: '#EEE',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  cutiLabel: {
    color: '#8F8D89',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 1,
  },
  cutiValue: {color: '#23221E', fontSize: 15, fontWeight: '700'},
});

export default Attendance;
