import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  StatusBar,
  Image,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  FlatList,
  ScrollView,
} from 'react-native';
import {useThemeStore} from '../../theme/useThemeStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppHeader from '../../components/AppHeader';
import {BarChart} from 'react-native-chart-kit';
import Svg, {Rect, G, Text as SvgText} from 'react-native-svg';
import {useUserStore} from '../../store/userStore';

const dummyStats = [
  {
    title: 'Jumlah Absen',
    value: '17/31',
    icon: require('../../assets/images/ic-user.png'),
  },
  {
    title: 'Jumlah Cuti',
    value: '0/31',
    icon: require('../../assets/images/ic-envelope.png'),
  },
  {
    title: 'Total Sakit',
    value: '0/31',
    icon: require('../../assets/images/hospital-JP.png'),
  },
  {
    title: 'Alpha',
    value: '0/31',
    icon: require('../../assets/images/ic-pause.png'),
  },
  {
    title: 'Total Perjadin',
    value: '0/31',
    icon: require('../../assets/images/user-helmet-safety.png'),
  },
];

const dummyHistory = [
  {type: 'Hadir', date: '23 Feb 2025', time: '09:00 WITA', status: 'On time'},
  {type: 'Sakit', date: '24 Feb 2025', time: '09:00 WITA', status: 'On time'},
  {type: 'Cuti', date: '24 Feb 2025', time: '09:00 WITA', status: 'On time'},
  {
    type: 'Perjalanan Dinas',
    date: '24 Feb 2025',
    time: '09:00 WITA',
    status: 'On time',
  },
];
const dummySummary = {
  chart: [
    {month: 'Jan', hadir: 6, tidak_hadir: 3},
    {month: 'Feb', hadir: 8, tidak_hadir: 4},
    {month: 'Mar', hadir: 7, tidak_hadir: 3},
    {month: 'Apr', hadir: 8, tidak_hadir: 3},
    {month: 'Mei', hadir: 5, tidak_hadir: 2},
    {month: 'Jun', hadir: 8, tidak_hadir: 4},
    {month: 'Jul', hadir: 8, tidak_hadir: 4},
    {month: 'Agu', hadir: 8, tidak_hadir: 5},
    {month: 'Sep', hadir: 8, tidak_hadir: 5},
    {month: 'Okt', hadir: 8, tidak_hadir: 7},
    {month: 'Nov', hadir: 0, tidak_hadir: 14},
    {month: 'Des', hadir: 0, tidak_hadir: 14},
  ],
  rekap: [
    {tanggal: '2025-04-01', status: 'hadir'},
    {tanggal: '2025-04-09', status: 'tidak_hadir'},
    {tanggal: '2025-04-15', status: 'tidak_hadir'},
    {tanggal: '2025-04-18', status: 'tidak_hadir'},
    {tanggal: '2025-04-20', status: 'tidak_hadir'},
    {tanggal: '2025-04-24', status: 'tidak_hadir'},
    {tanggal: '2025-04-26', status: 'tidak_hadir'},
  ],
};

const dummyCutiChart = [
  {month: 'Jan', total_cuti: 6},
  {month: 'Feb', total_cuti: 8},
  {month: 'Mar', total_cuti: 8},
  {month: 'Apr', total_cuti: 9},
  {month: 'Mei', total_cuti: 5},
  {month: 'Jun', total_cuti: 8},
  {month: 'Jul', total_cuti: 8},
  {month: 'Agu', total_cuti: 8},
  {month: 'Sept', total_cuti: 8},
  {month: 'Okt', total_cuti: 8},
  {month: 'Nov', total_cuti: 8},
  {month: 'Des', total_cuti: 8},
];

const dummyCutiRekap = [
  18,
  20,
  24, // Tanggal cuti (hijau)
];

const dummyPerjadinChart = [
  {month: 'Jan', total_perjadin: 6},
  {month: 'Feb', total_perjadin: 8},
  {month: 'Mar', total_perjadin: 8},
  {month: 'Apr', total_perjadin: 9},
  {month: 'Mei', total_perjadin: 5},
  {month: 'Jun', total_perjadin: 8},
  {month: 'Jul', total_perjadin: 8},
  {month: 'Agu', total_perjadin: 8},
  {month: 'Sept', total_perjadin: 8},
  {month: 'Okt', total_perjadin: 8},
  {month: 'Nov', total_perjadin: 8},
  {month: 'Des', total_perjadin: 8},
];

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

const dummyPerjadinRekap = [18, 20, 24];
const HomeScreen: React.FC = () => {
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();
  const screenWidth = Dimensions.get('window').width;
  const imageWidth = screenWidth * 0.85; // 85% dari lebar layar
  const imageHeight = imageWidth * (115 / screenWidth);

  const [role, setRole] = useState('');
  const [summary, setSummary] = useState(dummySummary);
  const userLocation = useUserStore(state => state.location);
  console.log('userLocation', userLocation);

  const sections = [
    {type: 'stat', title: 'Statistik - Hari Ini', data: dummyStats},
    {type: 'history', title: 'History Absensi', data: dummyHistory},
    {type: 'org', title: 'Struktur Organisasi'},
    {type: 'summary', title: 'Summary Absensi', data: summary},
    {type: 'cuti', title: 'Cuti'},
    {type: 'perjadin', title: 'Perjalanan Dinas'},
  ];
  useEffect(() => {
    const getRole = async () => {
      const r = await AsyncStorage.getItem('userRole');
      setRole(r || '');
    };
    getRole();
  }, []);

  const CustomStackedBarChart: React.FC<CustomStackedBarChartProps> = ({
    data,
    height = 220,
    maxY = 16,
    barColor1 = '#2996F5',
    barColor2 = '#E24B3B',
    labelColor = '#888',
    paddingLeft = 36,
    paddingRight = 16,
    paddingTop = 18,
    paddingBottom = 30,
  }) => {
    const screenWidth = Dimensions.get('window').width * 0.85;
    const chartWidth = screenWidth - paddingLeft - paddingRight;
    const barCount = data.length;
    const gapCount = barCount - 1;
    const barWidth = 22;
    const totalBarWidth = barWidth * barCount;
    const gapWidth = (chartWidth - totalBarWidth) / gapCount;

    const CHART_HEIGHT = height - 40; // lebihin jarak buat label bawah
    const yStep = maxY / 6;

    return (
      <Svg width={screenWidth} height={height}>
        {/* Grid Y */}
        {[...Array(7)].map((_, i) => {
          const y = paddingTop + (CHART_HEIGHT * i) / 6;
          return (
            <G key={i}>
              <Rect
                x={paddingLeft}
                y={y}
                width={chartWidth}
                height={1}
                fill="#eee"
              />
              <SvgText
                x={paddingLeft - 8}
                y={y + 6}
                fontSize={12}
                fill={labelColor}
                textAnchor="end"
                fontWeight="400">
                {Math.round(maxY - i * yStep)}
              </SvgText>
            </G>
          );
        })}
        {/* Bars */}
        {data.map((d: any, i: any) => {
          const x = paddingLeft + i * (barWidth + gapWidth);
          const totalValue = (d.tidak_hadir || 0) + (d.hadir || 0);
          // Handling biar bar gak lebih tinggi dari maxY
          const valueTidakHadir = d.tidak_hadir || 0;
          const valueHadir = d.hadir || 0;

          const hTidakHadir = (valueTidakHadir / maxY) * CHART_HEIGHT;
          const hHadir = (valueHadir / maxY) * CHART_HEIGHT;
          const yTidakHadir = paddingTop + CHART_HEIGHT - hTidakHadir;
          const yHadir = yTidakHadir - hHadir;

          return (
            <G key={i}>
              {/* Tidak Hadir (MERAH, bawah) */}
              <Rect
                x={x}
                y={yTidakHadir}
                width={barWidth}
                height={hTidakHadir}
                fill={barColor2}
                rx={4}
              />
              {/* Hadir (BIRU, atas) */}
              {valueHadir > 0 && (
                <Rect
                  x={x}
                  y={yHadir}
                  width={barWidth}
                  height={hHadir}
                  fill={barColor1}
                  rx={4}
                />
              )}
              {/* Label bulan */}
              <SvgText
                x={x + barWidth / 2}
                y={CHART_HEIGHT + 35}
                fontSize={12}
                fill={labelColor}
                textAnchor="middle">
                {d.month}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    );
  };

  const CustomCutiBarChart: React.FC<CustomStackedBarCutiChartProps> = ({
    data,
    height = 220,
    maxY = 12,
    barColor = '#21C067', // Green!
    labelColor = '#888',
    paddingLeft = 36,
    paddingRight = 16,
    paddingTop = 18,
    paddingBottom = 30,
  }) => {
    const screenWidth = Dimensions.get('window').width * 0.85; // biar ga full
    const chartWidth = screenWidth - paddingLeft - paddingRight;
    const barCount = data.length;
    const gapCount = barCount - 1;
    const barWidth = 15;
    const totalBarWidth = barWidth * barCount;
    const gapWidth = (chartWidth - totalBarWidth) / gapCount;
    const CHART_HEIGHT = height - paddingTop - paddingBottom;
    const yStep = maxY / 6;

    return (
      <Svg width={screenWidth} height={height}>
        {/* Grid Y */}
        {[...Array(7)].map((_, i) => {
          const y = paddingTop + (CHART_HEIGHT * i) / 6;
          return (
            <G key={i}>
              <Rect
                x={paddingLeft}
                y={y}
                width={chartWidth}
                height={1}
                fill="#eee"
              />
              <SvgText
                x={paddingLeft - 8}
                y={y + 6}
                fontSize={12}
                fill={labelColor}
                textAnchor="end"
                fontWeight="400">
                {Math.round(maxY - i * yStep)}
              </SvgText>
            </G>
          );
        })}
        {/* Bars */}
        {data.map((d: any, i: any) => {
          const x = paddingLeft + i * (barWidth + gapWidth);
          const value = d.total_cuti || 0;
          const h = (value / maxY) * CHART_HEIGHT;
          const y = paddingTop + CHART_HEIGHT - h;

          return (
            <G key={i}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                fill={barColor}
                rx={3}
              />

              {/* Label bulan */}
              <SvgText
                x={x + barWidth / 2}
                y={paddingTop + CHART_HEIGHT + 18}
                fontSize={12}
                fill={labelColor}
                textAnchor="middle">
                {d.month}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    );
  };

  const CustomPerjadinBarChart: React.FC<CustomStackedBarPerdinChartProps> = ({
    data,
    height = 220,
    maxY = 12,
    barColor = '#EEB82E', // warna kuning
    labelColor = '#888',
    paddingLeft = 36,
    paddingRight = 16,
    paddingTop = 18,
    paddingBottom = 30,
  }) => {
    const screenWidth = Dimensions.get('window').width * 0.85;
    const chartWidth = screenWidth - paddingLeft - paddingRight;
    const barCount = data.length;
    const gapCount = barCount - 1;
    const barWidth = 15;
    const totalBarWidth = barWidth * barCount;
    const gapWidth = (chartWidth - totalBarWidth) / gapCount;
    const CHART_HEIGHT = height - paddingTop - paddingBottom;
    const yStep = maxY / 6;

    return (
      <Svg width={screenWidth} height={height}>
        {/* Grid Y */}
        {[...Array(7)].map((_, i) => {
          const y = paddingTop + (CHART_HEIGHT * i) / 6;
          return (
            <G key={i}>
              <Rect
                x={paddingLeft}
                y={y}
                width={chartWidth}
                height={1}
                fill="#eee"
              />
              <SvgText
                x={paddingLeft - 8}
                y={y + 6}
                fontSize={12}
                fill={labelColor}
                textAnchor="end"
                fontWeight="400">
                {Math.round(maxY - i * yStep)}
              </SvgText>
            </G>
          );
        })}
        {/* Bars */}
        {data.map((d: any, i: any) => {
          const x = paddingLeft + i * (barWidth + gapWidth);
          const value = d.total_perjadin || 0;
          const h = (value / maxY) * CHART_HEIGHT;
          const y = paddingTop + CHART_HEIGHT - h;

          return (
            <G key={i}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                fill={barColor}
                rx={3}
              />
              {/* Label bulan */}
              <SvgText
                x={x + barWidth / 2}
                y={paddingTop + CHART_HEIGHT + 18}
                fontSize={12}
                fill={labelColor}
                textAnchor="middle">
                {d.month}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    );
  };
  const renderSection = ({item}: {item: any}) => {
    if (item.type === 'stat') {
      // Statistik grid
      const row1 = item.data.slice(0, 2); // 2 card besar
      const row2 = item.data.slice(2, 5);
      return (
        <View style={styles.statsCard}>
          <View style={styles.statsCardHeader}>
            <Text style={styles.statsCardTitle}>{item.title}</Text>
          </View>
          <View>
            {/* Row 1: 3 item */}
            <View style={styles.statsRow}>
              {row1.map((stat: any, i: any) => (
                <View
                  style={[
                    styles.statsItemLarge,
                    {marginRight: i === 0 ? 12 : 0},
                  ]}
                  key={i}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        paddingHorizontal: '5%',
                        paddingTop: '5%',
                      }}>
                      <Text style={styles.statsValue}>{stat.value}</Text>
                      <Text style={styles.statsLabel}>{stat.title}</Text>
                    </View>
                    <View
                      style={{
                        alignItems: 'flex-start',
                        marginTop: '-10%',
                      }}>
                      <Image
                        source={stat.icon}
                        style={{width: 35, height: 35, alignSelf: 'flex-end'}}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
            {/* Row 2: 2 item */}
            <View style={[styles.statsRow, {marginTop: 12}]}>
              {row2.map((stat: any, i: any) => (
                <View
                  key={i}
                  style={[
                    styles.statsItemSmall,
                    {marginRight: i < 2 ? 12 : 0},
                  ]}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        alignItems: 'flex-start',
                        justifyContent: 'center',

                        paddingTop: '10%',
                      }}>
                      <Text
                        style={[
                          styles.statsValue,
                          {marginLeft: '5%', fontSize: 13},
                        ]}>
                        {stat.value}
                      </Text>
                      <Text
                        style={[
                          styles.statsLabel,
                          {marginLeft: '5%', fontSize: 11},
                        ]}>
                        {stat.title}
                      </Text>
                    </View>
                    <View
                      style={{
                        alignItems: 'flex-start',
                        marginTop: '-15%',
                      }}>
                      <Image
                        source={stat.icon}
                        style={{width: 32, height: 32}}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      );
    }
    if (item.type === 'history') {
      // History list
      return (
        <>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>{item.title}</Text>
            <TouchableOpacity>
              <Text style={styles.historyDetailLink}>Lihat Semuanya &gt;</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.historyCard}>
            <FlatList
              data={item.data}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({item}) => (
                <View
                  style={{
                    backgroundColor: '#FFFF',
                    paddingHorizontal: '3%',
                    paddingVertical: '2%',
                    borderRadius: 10,
                    marginBottom: '3%',
                    width: '100%',
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowOffset: {width: 0, height: 2},
                    elevation: 2,
                  }}>
                  <View>
                    <Text style={styles.historyType}>{item.type}</Text>
                    <Text style={styles.historyDate}>{item.date}</Text>
                  </View>
                  <View style={{alignItems: 'flex-end'}}>
                    <Text style={styles.historyTime}>{item.time}</Text>
                    <Text style={styles.historyStatus}>{item.status}</Text>
                  </View>
                </View>
              )}
              scrollEnabled={false}
            />
          </View>
        </>
      );
    }
    if (item.type === 'org') {
      // Struktur organisasi
      return (
        <View style={styles.orgCard}>
          <View style={styles.orgHeader}>
            <Text style={styles.orgTitle}>{item.title}</Text>
            <TouchableOpacity>
              <Text style={styles.orgDetailLink}>Lihat detail &gt;</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.orgChart}>
            <Image
              source={require('../../assets/images/dummy-orgchart.png')}
              style={{
                width: '100%',
                height: imageHeight * 2,
                borderRadius: 10,
                paddingVertical: '3%',
              }}
              resizeMode="cover"
            />
          </View>
        </View>
      );
    }
    if (item.type === 'summary') {
      function generateCalendar(month: any, year: any, rekap: any) {
        const daysInMonth = new Date(year, month, 0).getDate();
        const calendar = [];
        for (let i = 1; i <= daysInMonth; i++) {
          const tanggal = `${year}-${String(month).padStart(2, '0')}-${String(
            i,
          ).padStart(2, '0')}`;
          const found = rekap.find((x: any) => x.tanggal === tanggal);
          calendar.push({
            day: i,
            status: found ? found.status : 'hadir', // default hadir
          });
        }
        return calendar;
      }
      const chartData = item.data.chart;
      const calendarData = generateCalendar(4, 2025, item.data.rekap);
      return (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Summary Absensi</Text>
            <TouchableOpacity>
              <Text style={styles.summaryDetail}>Lihat detail &gt;</Text>
            </TouchableOpacity>
          </View>

          {/* Bar Chart */}
          <View style={styles.barChartBox}>
            <Text style={styles.chartTitle}>Monitoring Absensi</Text>
            <TouchableOpacity style={styles.dropdownBox}>
              <Text style={styles.dropdownText}>Tahunan ▼</Text>
            </TouchableOpacity>
            {/* --- SCROLLABLE BAR CHART --- */}
            <View
              style={{
                marginTop: '10%',
              }}>
              <CustomStackedBarChart
                data={chartData}
                height={250}
                maxY={14} // Pastikan maxY lebih tinggi dari nilai tertinggi di data
              />
            </View>
            {/* Legend manual */}
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

          {/* Kalender Grid */}
          <View style={styles.rekapBox}>
            <View style={styles.rekapHeader}>
              <Text style={styles.chartTitle}>Rekap Absensi</Text>
              <TouchableOpacity style={styles.dropdownBox}>
                <Text style={styles.dropdownText}>Bulan April ▼</Text>
              </TouchableOpacity>
            </View>
            {/* Kalender grid */}
            <View style={styles.calendarGrid}>
              {calendarData.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dayBox,
                    {
                      backgroundColor:
                        item.status === 'hadir' ? '#2996F5' : '#E24B3B',
                    },
                  ]}>
                  <Text style={styles.dayText}>{item.day}</Text>
                </View>
              ))}
            </View>
            {/* Legend */}
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

    if (item.type === 'cuti') {
      const generateCutiCalendar = (
        month = 4,
        year = 2025,
        cutiDays: number[] = [],
      ): {day: number; status: string}[] => {
        const daysInMonth = new Date(year, month, 0).getDate();
        return Array.from({length: daysInMonth}, (_, i) => {
          const day = i + 1;
          return {
            day,
            status: cutiDays.includes(day) ? 'cuti' : 'hadir',
          };
        });
      };
      // Data
      const chartData = dummyCutiChart;
      const rekapDays = generateCutiCalendar(4, 2025, dummyCutiRekap);

      return (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Cuti</Text>
            <TouchableOpacity>
              <Text style={styles.summaryDetail}>Lihat detail &gt;</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.barChartBox}>
            <Text style={styles.chartTitle}>Monitoring Cuti</Text>
            <TouchableOpacity style={styles.dropdownBox}>
              <Text style={styles.dropdownText}>Tahunan ▼</Text>
            </TouchableOpacity>
            <View
              style={{
                marginTop: '10%',
              }}>
              <CustomCutiBarChart data={chartData} height={250} maxY={12} />
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
          <View
            style={{backgroundColor: '#fff', borderRadius: 14, padding: 18}}>
            {/* Judul dan dropdown */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}>
              <Text style={{fontWeight: 'bold', fontSize: 18, color: '#222'}}>
                Rekap Cuti
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: '#f3f3f3',
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                }}>
                <Text style={{color: '#232323', fontWeight: 'bold'}}>
                  Bulan April ▼
                </Text>
              </TouchableOpacity>
            </View>
            {/* Kalender GRID */}
            <View
              style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 6}}>
              {rekapDays.map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor:
                      item.status === 'cuti' ? '#21C067' : '#2996F5',
                    margin: 4,
                  }}>
                  <Text
                    style={{color: '#FFF', fontWeight: 'bold', fontSize: 17}}>
                    {item.day}
                  </Text>
                </View>
              ))}
            </View>
            {/* Legend bawah */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, {backgroundColor: '#2996F5'}]}
                />
                <Text style={styles.legendText}>Hadir</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, {backgroundColor: '#21C067'}]}
                />
                <Text style={styles.legendText}>Cuti</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }
    if (item.type === 'perjadin') {
      const generatePerjadinCalendar = (
        month: number = 4,
        year: number = 2025,
        perjadinDays: number[] = [],
      ): {day: number; status: string}[] => {
        const daysInMonth = new Date(year, month, 0).getDate();
        return Array.from({length: daysInMonth}, (_, i) => {
          const day = i + 1;
          return {
            day,
            status: perjadinDays.includes(day) ? 'perjadin' : 'hadir',
          };
        });
      };
      const chartData = dummyPerjadinChart;
      const rekapDays = generatePerjadinCalendar(4, 2025, dummyPerjadinRekap);

      return (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Perjalanan Dinas</Text>
            <TouchableOpacity>
              <Text style={styles.summaryDetail}>Lihat detail &gt;</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.barChartBox}>
            <Text style={styles.chartTitle}>Monitoring Perjalanan Dinas</Text>
            <TouchableOpacity style={styles.dropdownBox}>
              <Text style={styles.dropdownText}>Tahunan ▼</Text>
            </TouchableOpacity>
            <View
              style={{
                marginTop: '10%',
              }}>
              <CustomPerjadinBarChart data={chartData} height={190} maxY={12} />
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
          <View
            style={{backgroundColor: '#fff', borderRadius: 14, padding: 18}}>
            {/* Judul dan dropdown */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}>
              <Text style={{fontWeight: 'bold', fontSize: 18, color: '#222'}}>
                Rekap Perjalanan Dinas
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: '#f3f3f3',
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                }}>
                <Text style={{color: '#232323', fontWeight: 'bold'}}>
                  Bulan April ▼
                </Text>
              </TouchableOpacity>
            </View>
            {/* Kalender GRID */}
            <View
              style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 6}}>
              {rekapDays.map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor:
                      item.status === 'perjadin' ? '#EEB82E' : '#2996F5',
                    margin: 4,
                  }}>
                  <Text
                    style={{color: '#FFF', fontWeight: 'bold', fontSize: 17}}>
                    {item.day}
                  </Text>
                </View>
              ))}
            </View>
            {/* Legend bawah */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, {backgroundColor: '#2996F5'}]}
                />
                <Text style={styles.legendText}>Hadir</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, {backgroundColor: '#EEB82E'}]}
                />
                <Text style={styles.legendText}>Perjalanan Dinas</Text>
              </View>
            </View>
          </View>
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
      <View style={[styles.container, {backgroundColor: colors.bgHome}]}>
        <AppHeader />
        <ImageBackground
          source={require('../../assets/images/widget-header.png')}
          style={{
            // flex: 1,
            width: '100%',
            height: imageHeight * 1.7,
            borderRadius: 10,
          }}
          resizeMode="contain">
          <View
            style={{
              width: '100%',
              alignItems: 'flex-start',
              paddingHorizontal: '5%',
              paddingVertical: '2%',
            }}>
            <Text
              style={{
                color: colors.red,
                fontSize: 20,
                marginTop: 12,
                fontWeight: '600',
              }}>
              Selamat datang, {role}
            </Text>
            <Text
              style={{
                color: colors.red,
                fontSize: 20,
                marginTop: 12,
                fontWeight: '600',
              }}>
              Anda belum absen hari ini
            </Text>
          </View>
        </ImageBackground>
      </View>
    </>
  );
  return (
    <FlatList
      data={sections}
      keyExtractor={(item, idx) => item.type + idx}
      renderItem={renderSection}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={{
        backgroundColor: colors.bgHome,
        paddingBottom: 50,
        position: 'absolute',
      }}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    alignItems: 'center',
  },
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
  legendRow: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
  legendItem: {flexDirection: 'row', alignItems: 'center', marginRight: 14},
  legendDot: {width: 16, height: 16, borderRadius: 6, marginRight: 5},
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
});

export default HomeScreen;
