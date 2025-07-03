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
import HistoryAttendance from '../../components/HistoryAttendance';
import TodayStatistics from '../../components/TodayStatistics';
import OragnizationalStructure from '../../components/OragnizationalStructure';
import CustomLineChart from '../../components/CustomLineChart';
import {
  dummyStats,
  dummyHistory,
  dummySummary,
  dummyCutiChart,
  rekapCuti,
  dummyCutiRekap,
  dummyPerjadinChart,
  rekapPerjadin,
  dummyAdminAbsensiTrend,
  dummyAdminMonitoringAbsensi,
  dummyAdminCutiMonitoring,
  dummyAdminCutiTrend,
  dummyAdminPerjadinMonitoring,
  dummyAdminPerjadinTrend,
  dummyLiveAbsensi,
  dummyTotalEmployee,
} from '../../data/dummy.ts';
import TotalEmployee from '../../components/TotalEmployee.tsx';

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

  const sections = React.useMemo(() => {
    if (role === 'admin' || role === 'BOD') {
      return [
        {type: 'stat', title: 'Statistik - Hari Ini', data: dummyStats},
        {
          type: 'total-employee',
          title: 'Total Employee',
          data: dummyTotalEmployee,
        },
        {type: 'live-absensi-admin'},
        {type: 'org', title: 'Struktur Organisasi'},
        {
          type: 'summary-admin',
          title: 'Summary Absensi',
          trendData: dummyAdminAbsensiTrend,
          monitoringData: dummyAdminMonitoringAbsensi,
        },
        {
          type: 'cuti-admin',
        },
        {
          type: 'perjadin-admin',
        },
      ];
    } else {
      return [
        {type: 'stat', title: 'Statistik - Hari Ini', data: dummyStats},
        {type: 'history', title: 'History Absensi', data: dummyHistory},
        {type: 'org', title: 'Struktur Organisasi'},
        {type: 'summary', title: 'Summary Absensi', data: dummySummary},
        {type: 'cuti', title: 'Cuti'},
        {type: 'perjadin', title: 'Perjalanan Dinas'},
      ];
    }
  }, [role]);
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

  const CustomUserBarChartPerjadin = ({
    data = '',
    height = 220,
    maxY = 12,
    barColor = '#EEB82E', // Kuning
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
    const CHART_HEIGHT = height - paddingTop - paddingBottom;
    const yStep = maxY / 6;

    return (
      <Svg width={screenWidth} height={height}>
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
        {data.map((d, i) => {
          const x = paddingLeft + i * (barWidth + gapWidth);
          const h = (d.total_perjadin / maxY) * CHART_HEIGHT;
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
              <SvgText
                x={x + barWidth / 2}
                y={paddingTop + CHART_HEIGHT + 18}
                fontSize={12}
                fill={labelColor}
                textAnchor="middle">
                {d.name}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    );
  };

  const CustomUserBarChart = ({
    data = '',
    height = 220,
    maxY = 12,
    barColor = '#21C067',
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
    const CHART_HEIGHT = height - paddingTop - paddingBottom;
    const yStep = maxY / 6;

    return (
      <Svg width={screenWidth} height={height}>
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
        {data.map((d, i) => {
          const x = paddingLeft + i * (barWidth + gapWidth);
          const h = (d.total_cuti / maxY) * CHART_HEIGHT;
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
              <SvgText
                x={x + barWidth / 2}
                y={paddingTop + CHART_HEIGHT + 18}
                fontSize={12}
                fill={labelColor}
                textAnchor="middle">
                {d.name}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    );
  };

  const renderSection = ({item}: {item: any}) => {
    if (item.type === 'summary-admin') {
      return (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Summary Absensi</Text>
            <TouchableOpacity>
              <Text style={styles.summaryDetail}>Lihat detail &gt;</Text>
            </TouchableOpacity>
          </View>

          {/* Tren Absensi */}
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
                datasets={item.trendData.map((user: any) => ({
                  data: user.data,
                  color: () => user.color,
                  name: user.name,
                }))}
                dotSize={5}
                showLegend={false} // Legend custom di bawah!
              />
            </View>
            {/* Legend otomatis dari data */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginTop: 10,
                justifyContent: 'flex-start',
              }}>
              {item.trendData.map((user: any, idx: number) => (
                <View
                  key={user.name}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: 16,
                    marginBottom: 6,
                  }}>
                  <View
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: user.color,
                      marginRight: 5,
                    }}
                  />
                  <Text style={{fontSize: 13, color: '#333'}}>{user.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Monitoring Absensi */}
          <View style={styles.barChartBox}>
            <Text style={styles.chartTitle}>Monitoring Absensi</Text>
            <TouchableOpacity style={styles.dropdownBox}>
              <Text style={styles.dropdownText}>Tahunan ▼</Text>
            </TouchableOpacity>
            <View style={{marginTop: '10%'}}>
              <CustomStackedBarChart
                data={item.monitoringData}
                height={250}
                maxY={14}
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
                      <Image
                        source={require('../../assets/icons/ic-stackeHolder-disable.png')}
                        style={{
                          height: 20,
                          width: 20,
                        }}
                        resizeMode="contain"
                      />
                      <Text style={styles.jabatanText}>{item.jabatan}</Text>
                    </View>
                  </View>
                  {item.status ? (
                    <View
                      style={[
                        styles.badge,
                        {
                          borderColor: color.border,
                          backgroundColor: color.bg,
                        },
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
          {/* Tren Cuti */}
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
            {/* Legend */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginTop: 10,
                justifyContent: 'flex-start',
              }}>
              {dummyAdminCutiTrend.map((user, idx) => (
                <View
                  key={user.name}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: 16,
                    marginBottom: 6,
                  }}>
                  <View
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: user.color,
                      marginRight: 5,
                    }}
                  />
                  <Text style={{fontSize: 13, color: '#333'}}>{user.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Monitoring Cuti */}
          <View style={styles.barChartBox}>
            <Text style={styles.chartTitle}>Monitoring Cuti</Text>
            <TouchableOpacity style={styles.dropdownBox}>
              <Text style={styles.dropdownText}>Bulan ▼</Text>
            </TouchableOpacity>
            <View style={{marginTop: '10%'}}>
              <CustomUserBarChart
                data={dummyAdminCutiMonitoring}
                height={250}
                maxY={12}
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
      const row1 = item.data.slice(0, 2); // 2 card besar
      const row2 = item.data.slice(2, 5);
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
          {/* Tren Perjalanan Dinas */}
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
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginTop: 10,
                justifyContent: 'flex-start',
              }}>
              {dummyAdminPerjadinTrend.map((user, idx) => (
                <View
                  key={user.name}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: 16,
                    marginBottom: 6,
                  }}>
                  <View
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: user.color,
                      marginRight: 5,
                    }}
                  />
                  <Text style={{fontSize: 13, color: '#333'}}>{user.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Monitoring Perjalanan Dinas */}
          <View style={styles.barChartBox}>
            <Text style={styles.chartTitle}>Monitoring Perjalanan Dinas</Text>
            <TouchableOpacity style={styles.dropdownBox}>
              <Text style={styles.dropdownText}>Bulan ▼</Text>
            </TouchableOpacity>
            <View style={{marginTop: '10%'}}>
              <CustomUserBarChartPerjadin
                data={dummyAdminPerjadinMonitoring}
                height={250}
                maxY={12}
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
      // Statistik grid
      const row1 = item.data.slice(0, 2); // 2 card besar
      const row2 = item.data.slice(2, 5);
      return <TodayStatistics item={item} row1={row1} row2={row2} />;
    }
    if (item.type === 'history') {
      // History list
      return <HistoryAttendance item={item} />;
    }
    if (item.type === 'org') {
      // Struktur organisasi
      return <OragnizationalStructure item={item} />;
    }
    if (item.type === 'summary') {
      const chartData = item.data.chart;

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
            <CustomLineChart
              labels={item.data.rekap.map((x: any) => x.minggu)}
              datasets={[
                {
                  data: item.data.rekap.map((x: any) => x.hadir),
                  color: () => '#2996F5',
                },
                {
                  data: item.data.rekap.map((x: any) => x.tidak_hadir),
                  color: () => '#E24B3B',
                },
              ]}
              dotSize={6}
            />
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
      const chartData = dummyCutiChart;

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
          <View style={styles.rekapBox}>
            <View style={styles.rekapHeader}>
              <Text style={styles.chartTitle}>Rekap Cuti</Text>
              <TouchableOpacity style={styles.dropdownBox}>
                <Text style={styles.dropdownText}>Bulan April ▼</Text>
              </TouchableOpacity>
            </View>

            <CustomLineChart
              labels={rekapCuti.map(x => x.minggu)}
              datasets={[
                {
                  data: rekapCuti.map(x => x.total_cuti),
                  color: () => '#21C067', // hijau!
                },
              ]}
              dotSize={6}
            />
            <View style={styles.legendRow}>
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
      const chartData = dummyPerjadinChart;

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
          <View style={styles.rekapBox}>
            <View style={styles.rekapHeader}>
              <Text style={styles.chartTitle}>Rekap Cuti</Text>
              <TouchableOpacity style={styles.dropdownBox}>
                <Text style={styles.dropdownText}>Bulan April ▼</Text>
              </TouchableOpacity>
            </View>
            <CustomLineChart
              labels={rekapPerjadin.map(x => x.minggu)}
              datasets={[
                {
                  data: rekapPerjadin.map(x => x.total_perjadin),
                  color: () => '#EEB82E', // kuning
                },
              ]}
              dotSize={6}
            />
            <View style={styles.legendRow}>
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
  legendItem: {flexDirection: 'row', alignItems: 'center', marginLeft: 25},
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
  badgeText: {fontWeight: '600', fontSize: 15, textTransform: 'capitalize'},
});

export default HomeScreen;
