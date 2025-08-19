// DashboardAbsensi.tsx
import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  ImageBackground,
  StatusBar,
  useColorScheme,
  TextInput,
  Switch,
} from 'react-native';
import CustomLineChart from '../../components/CustomLineChart'; // Pastikan path benar
// import {
//   CustomStackedBarChart,
//   CustomCutiBarChart,
//   CustomPerjadinBarChart,
//   CustomUserBarChart,
//   CustomUserBarChartPerjadin,
// } from './CustomCharts'; // Kalau chart custom-mu di satu file, import dari sana
import TotalEmployee from '../../components/TotalEmployee.tsx';
import HistoryAttendance from '../../components/HistoryAttendance';
import TodayStatistics from '../../components/TodayStatistics';
import OragnizationalStructure from '../../components/OragnizationalStructure';
import Svg, {Rect, G, Text as SvgText} from 'react-native-svg';
import {useThemeStore} from '../../theme/useThemeStore.ts';
import AppHeader from '../../components/AppHeader.tsx';
import StackedBarChart from '../../components/StackedBarChart.tsx';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation/index.tsx';

type StackedBarChartData = {
  month: string;
  hadir?: number;
  tidak_hadir?: number;
};

type CustomStackedBarChartProps = {
  data: StackedBarChartData[];
  height?: number;
  maxY?: number;
  barColor1?: string;
  barColor2?: string;
  labelColor?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
};

type StackedBarCutiChartData = {
  month: string;
  cuti?: number;
  tidak_hadir?: number;
};

type CustomStackedBarCutiChartProps = {
  data: StackedBarCutiChartData[];
  height?: number;
  maxY?: number;
  barColor?: string;
  labelColor?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
};

type StackedBarPerdinChartData = {
  month: string;
  cuti?: number;
  tidak_hadir?: number;
};

type CustomStackedBarPerdinChartProps = {
  data: StackedBarPerdinChartData[];
  height?: number;
  maxY?: number;
  barColor?: string;
  labelColor?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
};

const DashboardAbsensi = ({
  sections,
  role,
  dummyAdminAbsensiTrend,
  dummyAdminMonitoringAbsensi,
  dummyAdminCutiTrend,
  dummyAdminCutiMonitoring,
  dummyAdminPerjadinTrend,
  dummyAdminPerjadinMonitoring,
  dummyLiveAbsensi,
  dummyTotalEmployee,
  dummyStats,
  dummyHistory,
  dummySummary,
  dummyCutiChart,
  rekapCuti,
  dummyPerjadinChart,
  rekapPerjadin,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const imageWidth = screenWidth * 0.85; // 85% dari lebar layar
  const imageHeight = imageWidth * (115 / screenWidth);
  // NOTE: Semua props di atas bisa di-pass dari HomeScreen, tinggal sesuaikan data dummy apa yang kamu mau kirim
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [useManualTime, setUseManualTime] = useState(false);
  const [manualTime, setManualTime] = useState(''); // contoh: "06:30" atau "19"

  // Parse "HH" atau "HH:MM" → jam (0-23) | null jika invalid
  const parseHour = (s: string): number | null => {
    const trimmed = s.trim();
    if (!trimmed) return null;
    // izinkan "H", "HH", "HH:MM"
    const m = /^([01]?\d|2[0-3])(?::([0-5]\d))?$/.exec(trimmed);
    if (!m) return null;
    const hh = Number(m[1]);
    // const mm = m[2] ? Number(m[2]) : 0; // jika nanti butuh menit
    return hh; // aturan enable/disable berdasarkan jam (bukan menit)
  };

  const deviceHour = new Date().getHours();
  const manualHour = parseHour(manualTime);
  const effectiveHour =
    useManualTime && manualHour != null ? manualHour : deviceHour;

  // Disable antara 07:00 - 16:59 (>=7 dan <17)
  const isButtonDisabled = useMemo(
    () => effectiveHour >= 7 && effectiveHour < 17,
    [effectiveHour],
  );

  const handleGoToAttendance = () => {
    // Kalau komponen ini ada di dalam Stack yang berada di bawah Tab:
    // const parentNav = navigation.getParent();
    // if (parentNav?.navigate) {
    //   parentNav.navigate('attendance');
    //   return;
    // }
    // Fallback kalau struktur navigasi berbeda:
    try {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
            params: {
              screen: 'attendance',
              params: {activeMenu: 'absen', mode: 'daily'},
            },
          },
        ],
      });
    } catch {
      // Jika tab-nya dibungkus navigator bernama, contoh: "MainTabs"
      navigation.navigate('MainTabs' as never, {screen: 'attendance'} as never);
    }
  };

  const renderSection = ({item}) => {
    // Semua logic seperti sebelumnya
    if (item.type === 'summary-admin') {
      return (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Summary Absensi</Text>
            <TouchableOpacity>
              <Text style={styles.summaryDetail}>Lihat detail &gt;</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.barChartBox}>
            <Text style={styles.chartTitle}>Tren Absensi</Text>
            <TouchableOpacity style={styles.dropdownBox}>
              <Text style={styles.dropdownText}>Tahunan ▼</Text>
            </TouchableOpacity>
            <View style={{marginTop: '10%'}}>
              <CustomLineChart
                labels={[
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'Mei',
                  'Jun',
                  'Jul',
                  'Agu',
                  'Sep',
                  'Okt',
                  'Nov',
                  'Des',
                ]}
                datasets={dummyAdminAbsensiTrend.map(user => ({
                  data: user.data,
                  color: () => user.color,
                  name: user.name,
                }))}
                dotSize={5}
                showLegend={false}
              />
            </View>
            <View style={styles.legendRow}>
              {dummyAdminAbsensiTrend.map(user => (
                <View key={user.name} style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, {backgroundColor: user.color}]}
                  />
                  <Text style={{fontSize: 13, color: '#333'}}>{user.name}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.barChartBox}>
            <Text style={styles.chartTitle}>Monitoring Absensi</Text>
            <TouchableOpacity style={styles.dropdownBox}>
              <Text style={styles.dropdownText}>Tahunan ▼</Text>
            </TouchableOpacity>
            <View style={{marginTop: '10%'}}>
              <StackedBarChart
                data={dummyAdminMonitoringAbsensi}
                maxY={14}
                height={250}
                // barWidth={24}        // Opsional, lebar bar
                // chartWidthPerBar={42} // Opsional, jarak antar bar
                // labelColor="#333"     // Opsional, warna label bawah
              />
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, {backgroundColor: '#2996F5'}]}
                />
                <Text style={styles.legendText}>Hadir</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, {backgroundColor: '#E24B3B'}]}
                />
                <Text style={styles.legendText}>Tidak Hadir</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }
    if (item.type === 'live-absensi-admin') {
      const badgeColors = {
        perjadin: {border: '#545454', text: '#545454', bg: '#fff'},
        sakit: {border: '#FDB813', text: '#FDB813', bg: '#fff'},
        cuti: {border: '#21C067', text: '#21C067', bg: '#fff'},
        hadir: {border: '#2996F5', text: '#2996F5', bg: '#fff'},
      };
      return (
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.headerText}>Live Absensi</Text>
            <TouchableOpacity>
              <Text style={styles.detailLink}>Lihat detail &gt;</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={dummyLiveAbsensi}
            keyExtractor={(item, idx) => item.name + idx}
            renderItem={({item}) => {
              const color =
                badgeColors[item.statusType] || badgeColors['hadir'];
              return (
                <View style={styles.itemRow}>
                  <View>
                    <Text style={styles.nameText}>{item.name}</Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 3,
                      }}>
                      <Text style={styles.jabatanText}>{item.jabatan}</Text>
                    </View>
                  </View>
                  {item.status ? (
                    <View
                      style={[
                        styles.badge,
                        {borderColor: color.border, backgroundColor: color.bg},
                      ]}>
                      <Text style={[styles.badgeText, {color: color.text}]}>
                        {item.status}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            }}
            ItemSeparatorComponent={() => <View style={{height: 12}} />}
          />
        </View>
      );
    }
    if (item.type === 'cuti-admin') {
      return (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Cuti</Text>
            <TouchableOpacity>
              <Text style={styles.summaryDetail}>Lihat detail &gt;</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.barChartBox}>
            <Text style={styles.chartTitle}>Tren Cuti</Text>
            <TouchableOpacity style={styles.dropdownBox}>
              <Text style={styles.dropdownText}>Tahunan ▼</Text>
            </TouchableOpacity>
            <View style={{marginTop: '10%'}}>
              <CustomLineChart
                labels={[
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'Mei',
                  'Jun',
                  'Jul',
                  'Agu',
                  'Sep',
                  'Okt',
                  'Nov',
                  'Des',
                ]}
                datasets={dummyAdminCutiTrend.map(user => ({
                  data: user.data,
                  color: () => user.color,
                  name: user.name,
                }))}
                dotSize={5}
                showLegend={false}
              />
            </View>
            <View style={styles.legendRow}>
              {dummyAdminCutiTrend.map(user => (
                <View key={user.name} style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, {backgroundColor: user.color}]}
                  />
                  <Text style={{fontSize: 13, color: '#333'}}>{user.name}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.barChartBox}>
            <Text style={styles.chartTitle}>Monitoring Cuti</Text>
            <TouchableOpacity style={styles.dropdownBox}>
              <Text style={styles.dropdownText}>Bulan ▼</Text>
            </TouchableOpacity>
            <View style={{marginTop: '10%'}}>
              <StackedBarChart
                data={dummyAdminCutiMonitoring}
                maxY={14}
                height={250}
                // barWidth={24}        // Opsional, lebar bar
                // chartWidthPerBar={42} // Opsional, jarak antar bar
                // labelColor="#333"     // Opsional, warna label bawah
              />
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, {backgroundColor: '#21C067'}]}
                />
                <Text style={styles.legendText}>Total Cuti</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }
    if (item.type === 'total-employee') {
      const row1 = dummyTotalEmployee.slice(0, 2);
      const row2 = dummyTotalEmployee.slice(2, 5);
      return <TotalEmployee item={item} row1={row1} row2={row2} />;
    }
    if (item.type === 'perjadin-admin') {
      return (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Perjalanan Dinas</Text>
            <TouchableOpacity>
              <Text style={styles.summaryDetail}>Lihat detail &gt;</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.barChartBox}>
            <Text style={styles.chartTitle}>Tren Perjalanan Dinas</Text>
            <TouchableOpacity style={styles.dropdownBox}>
              <Text style={styles.dropdownText}>Tahunan ▼</Text>
            </TouchableOpacity>
            <View style={{marginTop: '10%'}}>
              <CustomLineChart
                labels={[
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'Mei',
                  'Jun',
                  'Jul',
                  'Agu',
                  'Sep',
                  'Okt',
                  'Nov',
                  'Des',
                ]}
                datasets={dummyAdminPerjadinTrend.map(user => ({
                  data: user.data,
                  color: () => user.color,
                  name: user.name,
                }))}
                dotSize={5}
                showLegend={false}
              />
            </View>
            <View style={styles.legendRow}>
              {dummyAdminPerjadinTrend.map(user => (
                <View key={user.name} style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, {backgroundColor: user.color}]}
                  />
                  <Text style={{fontSize: 13, color: '#333'}}>{user.name}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.barChartBox}>
            <Text style={styles.chartTitle}>Monitoring Perjalanan Dinas</Text>
            <TouchableOpacity style={styles.dropdownBox}>
              <Text style={styles.dropdownText}>Bulan ▼</Text>
            </TouchableOpacity>
            <View style={{marginTop: '10%'}}>
              <StackedBarChart
                data={dummyAdminPerjadinMonitoring}
                maxY={14}
                height={250}
                // barWidth={24}        // Opsional, lebar bar
                // chartWidthPerBar={42} // Opsional, jarak antar bar
                // labelColor="#333"     // Opsional, warna label bawah
              />
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, {backgroundColor: '#EEB82E'}]}
                />
                <Text style={styles.legendText}>Total Perjalanan Dinas</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }

    if (item.type === 'stat') {
      const row1 = dummyStats.slice(0, 2);
      const row2 = dummyStats.slice(2, 5);
      return <TodayStatistics item={item} row1={row1} row2={row2} />;
    }
    if (item.type === 'history') {
      return <HistoryAttendance item={item} />;
    }
    if (item.type === 'org') {
      return <OragnizationalStructure item={item} />;
    }
    if (item.type === 'summary') {
      return (
        <View>
          <Text>Summary Section</Text>
        </View>
      );
    }

    return null;
  };

  const ListHeaderComponent = (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View
        style={[
          styles.container,
          {backgroundColor: colorScheme === 'dark' ? '#F4F3F1' : '#F4F3F1'},
        ]}>
        <AppHeader />

        <View
          style={{
            width: '100%',
            alignItems: 'flex-start',
            paddingHorizontal: '5%',
            paddingVertical: '2%',
          }}>
          <Text
            style={{
              color: '#161414',
              fontSize: 20,
              marginTop: 12,
              fontWeight: '500',
            }}>
            Dashboard Absensi
          </Text>
        </View>
      </View>
    </>
  );

  return (
    <>
      <FlatList
        data={sections}
        keyExtractor={(item, idx) => item.type + idx}
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 50,
          backgroundColor: colorScheme === 'dark' ? '#F4F3F1' : '#F4F3F1',
        }}
        ListHeaderComponent={ListHeaderComponent}
      />
      {/* <View style={styles.testPanel}>
        <View style={styles.testRow}>
          <Text style={styles.testLabel}>Gunakan jam manual untuk testing</Text>
          <Switch value={useManualTime} onValueChange={setUseManualTime} />
        </View>

        {useManualTime && (
          <View style={styles.manualRow}>
            <TextInput
              style={styles.timeInput}
              placeholder="Masukkan jam (HH atau HH:MM)"
              keyboardType="number-pad"
              value={manualTime}
              onChangeText={setManualTime}
              maxLength={5}
            />
            <Text style={styles.currentInfo}>
              Jam efektif: {manualHour != null ? manualHour : '--'} (device:{' '}
              {deviceHour})
            </Text>
          </View>
        )}

        {!useManualTime && (
          <Text style={styles.currentInfo}>Jam device: {deviceHour}</Text>
        )}
      </View> */}

      {/* ====== FOOTER / BUTTON ====== */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.btnSubmit,
            isButtonDisabled && {backgroundColor: '#ccc'},
          ]}
          disabled={isButtonDisabled}
          activeOpacity={isButtonDisabled ? 1 : 0.7}
          onPress={handleGoToAttendance}>
          <Text style={styles.submitText}>Cek Absen</Text>
        </TouchableOpacity>

        {/* <Text style={styles.hintText}>
          Tombol{' '}
          {isButtonDisabled
            ? 'DISABLED (07:00–16:59)'
            : 'ENABLED (di luar 07:00–16:59)'}{' '}
          · Sumber jam: {useManualTime ? 'Manual' : 'Device'}
        </Text> */}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    alignItems: 'center',
  },
  hintText: {textAlign: 'center', color: '#666', fontSize: 12},
  statsCard: {
    width: '94%',
    alignSelf: 'center',
    backgroundColor: '#FFF',
    borderRadius: 18,
    marginTop: -40,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
  },
  statsItem: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    marginBottom: 12,
    alignItems: 'flex-start',

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
    borderWidth: 2,
    borderColor: '#DB555A',
    minHeight: 100,
    flex: 1,
  },
  statsCardHeader: {
    marginBottom: 12,
  },
  statsCardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#232323',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  statsValue: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#161414',
    marginBottom: 4,
    marginTop: '10%',
  },
  statsLabel: {
    color: '#888',
    fontSize: 14,
  },
  historyCard: {
    width: '100%',
    alignSelf: 'center',
    // backgroundColor: "#FFF",
    borderRadius: 18,
    marginTop: 18,
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
    paddingHorizontal: '5%',
    marginTop: '5%',
  },
  historyTitle: {fontSize: 16, fontWeight: 'bold', color: '#232323'},
  historyDetailLink: {color: '#1266D6', fontSize: 14, fontWeight: '500'},
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  historyType: {fontWeight: 'bold', fontSize: 15, color: '#333'},
  historyDate: {color: '#888', fontSize: 14, marginTop: 3},
  historyTime: {fontWeight: '600', fontSize: 15, color: '#333'},
  historyStatus: {
    color: '#4F4D4A',
    fontSize: 14,
    marginTop: 3,
    fontWeight: '400',
  },
  orgCard: {
    width: '94%',
    alignSelf: 'center',
    backgroundColor: '#FFF',
    borderRadius: 18,
    marginTop: 18,
    padding: 16,
    marginBottom: 30,
  },
  orgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orgTitle: {fontSize: 16, fontWeight: 'bold', color: '#232323'},
  orgDetailLink: {color: '#161414', fontSize: 14, fontWeight: '500'},
  orgChart: {
    backgroundColor: '#F4F6F8',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    fontWeight: '400',
  },
  text: {fontSize: 18, fontWeight: 'bold'},
  statsItemLarge: {
    flex: 1,
    minHeight: 100,
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#DB555A',
    // padding: 14,
    justifyContent: 'space-between',
  },
  statsItemSmall: {
    flex: 1,
    minHeight: 100,
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#DB555A',
    // padding: 10,
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '94%',
    alignSelf: 'center',
    backgroundColor: '#FFF',
    borderRadius: 18,
    marginTop: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {fontSize: 17, fontWeight: 'bold', color: '#232323'},
  summaryDetail: {color: '#161414', fontSize: 14, fontWeight: '500'},
  barChartBox: {
    marginBottom: 16,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#232323',
  },
  dropdownBox: {
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 4,
  },
  dropdownText: {color: '#666', fontSize: 13},
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Biar auto wrap!
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
    // justifyContent: 'flex-start', // optional
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16, // Ganti marginLeft → marginRight biar rapih
    marginBottom: 4, // Jarak antar row saat wrap
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 3,
    marginRight: 5,
  },
  legendText: {color: '#666', fontSize: 13},
  rekapBox: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  rekapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  dayBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {color: '#FFF', fontWeight: 'bold', fontSize: 17},
  card: {
    width: '94%',
    alignSelf: 'center',
    // backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginTop: 22,
    marginBottom: 8,
    shadowColor: '#000',
    // shadowOpacity: 0.04,
    // shadowOffset: {width: 0, height: 1},
    // elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {fontSize: 18, fontWeight: 'bold', color: '#222'},
  detailLink: {color: '#161414', fontSize: 15, fontWeight: '500'},
  itemRow: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameText: {fontSize: 18, fontWeight: '600', color: '#161414'},
  jabatanText: {color: '#888', fontSize: 15, marginLeft: 5, fontWeight: '500'},
  badge: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
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
  badgeText: {fontWeight: '600', fontSize: 15, textTransform: 'capitalize'},
  testPanel: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  testRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testLabel: {color: '#161414', fontSize: 14, fontWeight: '500'},
  manualRow: {marginTop: 8},
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  currentInfo: {marginTop: 6, color: '#666', fontSize: 12},
});

export default DashboardAbsensi;
