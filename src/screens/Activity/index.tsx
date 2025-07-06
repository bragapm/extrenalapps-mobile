import React from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  Platform,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import Svg, {
  Rect,
  G,
  Text as SvgText,
  TSpan,
  Path,
  Circle,
} from 'react-native-svg';
import {useThemeStore} from '../../theme/useThemeStore';
import AppHeader from '../../components/AppHeader';
import {
  dummyWeeklyActivityData,
  dummyWeeklyReports,
  dummyActivityReports,
  dummyReport,
} from '../../data/dummy';
import {useFeatureStore} from '../../store/featureStore';

const COLOR_WEEKLY_M1 = '#FFE2BB';
const COLOR_WEEKLY_M2 = '#FF832A';
const COLOR_DAILY_OPEN = '#1F93FF';
const COLOR_DAILY_CLOSE = '#20D372';

const STATUS_STYLE = {
  Waiting: {bg: '#F7F7F7', color: '#868686', border: '#B0B0B0'},
  Approved: {bg: '#EAF3FF', color: '#2196F3', border: '#2196F3'},
  Open: {bg: '#FFF9E6', color: '#C9A927', border: '#C9A927'},
  Close: {bg: '#E6FFF1', color: '#21B573', border: '#21B573'},
};

const employeePerformanceDummy = {
  labels: [
    'Land\nDispute',
    'Land\nDispute',
    'Land\nDispute',
    'Land\nDispute',
    'Land\nDispute',
  ],
  open: [4, 5, 5, 4, 6], // Tinggi bar HIJAU
  close: [2, 3, 3, 2, 3], // Tinggi bar KUNING
};

const pieChartData = [
  {
    key: 'Land Dispute',
    value: 20,
    color: '#D3D32E', // hijau terang
  },
  {
    key: 'Land Use',
    value: 20,
    color: '#8ED32E', // kuning
  },
  {
    key: 'Land Compensation',
    value: 10,
    color: '#E35131', // merah gelap
  },
  {
    key: 'Land Tenure',
    value: 10,
    color: '#D32E36', // orange kemerahan
  },
];

const StatusBadge = ({status}) => {
  const style = STATUS_STYLE[status] || STATUS_STYLE.Waiting;
  let icon = require('../../assets/icons/ic-time.png');
  if (status === 'Approved') icon = require('../../assets/icons/ic-check.png');
  if (status === 'Close') icon = require('../../assets/icons/ic-check2.png');
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: style.bg,
        borderColor: style.border,
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 4,
      }}>
      <Image
        source={icon}
        style={{width: 16, height: 16, marginRight: 6}}
        resizeMode="contain"
      />
      <Text style={{fontSize: 13, color: style.color, fontWeight: '500'}}>
        {status}
      </Text>
    </View>
  );
};

// --- WEEKLY BAR CHART ---
const WeeklyBarChart = ({data}) => {
  const chartWidth = 330,
    chartHeight = 170,
    padding = 33,
    maxY = 30,
    barWidth = 13,
    gap = 28;
  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Distribusi Aktivitas</Text>
      <Svg width={chartWidth} height={chartHeight}>
        {[0, 1, 2, 3, 4].map(i => {
          const y = padding + (i * (chartHeight - padding * 1.45)) / 4;
          return (
            <G key={i}>
              <Rect
                x={padding}
                y={y}
                width={chartWidth - padding * 1.2}
                height={1}
                fill="#E5E5E5"
              />
              <SvgText
                x={padding - 14}
                y={y + 5}
                fontSize={11}
                fill="#A5A5A5"
                textAnchor="end">
                {maxY - Math.round((i * maxY) / 4)}
              </SvgText>
            </G>
          );
        })}
        {data.map((item, i) => {
          const x0 = padding + i * (barWidth * 2 + gap);
          const m1H = (item.open / maxY) * (chartHeight - padding * 1.45);
          const m2H = (item.close / maxY) * (chartHeight - padding * 1.45);
          const yBase = chartHeight - padding * 0.52;
          return (
            <G key={item.label + i}>
              <Rect
                x={x0}
                y={yBase - m1H}
                width={barWidth}
                height={m1H}
                fill={COLOR_WEEKLY_M1}
                rx={2}
              />
              <Rect
                x={x0 + barWidth + 7}
                y={yBase - m2H}
                width={barWidth}
                height={m2H}
                fill={COLOR_WEEKLY_M2}
                rx={2}
              />
              <SvgText
                x={x0 + barWidth + 4}
                y={yBase + 28}
                fontSize={16}
                fill="#949292"
                textAnchor="middle"
                fontWeight="500">
                {item.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
      <View style={styles.legendWrap}>
        <View style={[styles.legendDot, {backgroundColor: COLOR_WEEKLY_M1}]} />
        <Text style={[styles.legendLabel, {color: '#BFA074'}]}>Minggu-1</Text>
        <View
          style={[
            styles.legendDot,
            {backgroundColor: COLOR_WEEKLY_M2, marginLeft: 19},
          ]}
        />
        <Text style={[styles.legendLabel, {color: '#FF832A'}]}>Minggu-2</Text>
      </View>
    </View>
  );
};

// --- DAILY BAR CHART ---
const ActivityBarChart = ({data}) => {
  const chartWidth = 300,
    chartHeight = 170,
    padding = 33,
    maxY = 30,
    barWidth = 13,
    gap = 28;
  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Distribusi Aktivitas</Text>
      <Svg width={chartWidth} height={chartHeight}>
        {[0, 1, 2, 3, 4].map(i => {
          const y = padding + (i * (chartHeight - padding * 1.5)) / 4;
          return (
            <G key={i}>
              <Rect
                x={padding}
                y={y}
                width={chartWidth - padding * 1.2}
                height={1}
                fill="#E5E5E5"
              />
              <SvgText
                x={padding - 14}
                y={y + 5}
                fontSize={11}
                fill="#000"
                textAnchor="end">
                {maxY - Math.round((i * maxY) / 4)}
              </SvgText>
            </G>
          );
        })}
        {data.map((item, i) => {
          const x0 = padding + i * (barWidth * 2 + gap);
          const openH = (item.open / maxY) * (chartHeight - padding * 1.5);
          const closeH = (item.close / maxY) * (chartHeight - padding * 1.5);
          const yBase = chartHeight - padding * 0.55;
          return (
            <G key={item.label}>
              <Rect
                x={x0}
                y={yBase - openH}
                width={barWidth}
                height={openH}
                fill={COLOR_DAILY_OPEN}
                rx={2}
              />
              <Rect
                x={x0 + barWidth + 4}
                y={yBase - closeH}
                width={barWidth}
                height={closeH}
                fill={COLOR_DAILY_CLOSE}
                rx={2}
              />
              <SvgText
                x={x0 + barWidth + 2}
                y={yBase + 18}
                fontSize={13}
                fill="#7C7672"
                textAnchor="middle"
                fontWeight="500">
                {item.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
      <View style={styles.legendWrap}>
        <View style={[styles.legendDot, {backgroundColor: COLOR_DAILY_OPEN}]} />
        <Text style={[styles.legendLabel, {color: '#A17F4D'}]}>Open</Text>
        <View
          style={[
            styles.legendDot,
            {backgroundColor: COLOR_DAILY_CLOSE, marginLeft: 24},
          ]}
        />
        <Text style={[styles.legendLabel, {color: '#6C3A1E'}]}>Close</Text>
      </View>
    </View>
  );
};

const COLOR_CLOSE = '#FFE936'; // Kuning
const COLOR_OPEN = '#20D372'; // Hijau

const EmployeePerformanceChart = ({data}) => {
  const chartWidth = 300;
  const chartHeight = 200;
  const paddingLeft = 48;
  const paddingBottom = 38;
  const paddingTop = 18;
  const maxY = 12;
  const barWidth = 15;
  const gap = 55; // Perbesar supaya ga tabrakan label

  return (
    <View
      style={{
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 18,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        width: '100%',
        alignSelf: 'center',
        elevation: 2,
      }}>
      <Text
        style={{
          color: '#161414',
          fontSize: 16,
          marginTop: 5,
          fontWeight: '600',
          paddingBottom: '5%',
        }}>
        Employee Performance
      </Text>

      <Svg width={chartWidth} height={chartHeight}>
        {/* Garis grid dan Y-axis */}
        {[0, 1, 2, 3, 4].map(i => {
          const y =
            paddingTop + (i * (chartHeight - paddingTop - paddingBottom)) / 4;
          return (
            <G key={i}>
              <Rect
                x={paddingLeft}
                y={y}
                width={chartWidth - paddingLeft - 14}
                height={1.2}
                fill="#E4E4E4"
              />
              <SvgText
                x={paddingLeft - 13}
                y={y + 6}
                fontSize={12}
                fill="#A5A5A5"
                textAnchor="end"
                fontWeight="400">
                {maxY - Math.round((i * maxY) / 4)}
              </SvgText>
            </G>
          );
        })}
        {/* BAR */}
        {data.labels.map((label, i) => {
          const baseY = chartHeight - paddingBottom;
          const closeH =
            (data.close[i] / maxY) * (chartHeight - paddingTop - paddingBottom);
          const openH =
            (data.open[i] / maxY) * (chartHeight - paddingTop - paddingBottom);

          // Titik X bar
          const x = paddingLeft + i * gap + 6;

          // Pisah text label menjadi dua baris dengan TSpan
          const [labelLine1, labelLine2] = label.split('\n');

          return (
            <G key={i}>
              {/* CLOSE (kuning, bawah) */}
              <Rect
                x={x}
                y={baseY - closeH}
                width={barWidth}
                height={closeH}
                fill={COLOR_CLOSE}
                rx={3}
              />
              {/* OPEN (hijau, atas) */}
              <Rect
                x={x}
                y={baseY - closeH - openH}
                width={barWidth}
                height={openH}
                fill={COLOR_OPEN}
                rx={3}
              />
              {/* Label: 2 line, tetap center */}
              <SvgText
                x={x + barWidth / 2}
                y={baseY + 20}
                fontSize={11}
                fill="#888"
                textAnchor="middle"
                fontWeight="400">
                <TSpan x={x + barWidth / 2} dy={0}>
                  {labelLine1}
                </TSpan>
                <TSpan x={x + barWidth / 2} dy={16}>
                  {labelLine2}
                </TSpan>
              </SvgText>
            </G>
          );
        })}
      </Svg>
      {/* LEGEND */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 13,
          marginLeft: '10%',
        }}>
        <View
          style={{
            width: 18,
            height: 18,
            backgroundColor: COLOR_CLOSE,
            borderRadius: 5,
            marginRight: '2%',
          }}
        />
        <Text
          style={{
            color: '#777674',
            fontSize: 13,
            marginTop: 5,
            fontWeight: '400',
            marginRight: '5%',
          }}>
          Close
        </Text>

        <View
          style={{
            width: 18,
            height: 18,
            backgroundColor: COLOR_OPEN,
            borderRadius: 5,
            marginRight: 8,
          }}
        />
        <Text
          style={{
            color: '#777674',
            fontSize: 13,
            marginTop: 5,
            fontWeight: '500',
          }}>
          Open
        </Text>
      </View>
    </View>
  );
};

const PieChartSummary = ({data}) => {
  const width = 180;
  const height = 180;
  const cx = width / 2;
  const cy = height / 2;
  const r = 78;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  let cumulativeAngle = 0;

  // Helper function untuk arc SVG Path
  function describeArc(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    const d = [
      `M ${cx} ${cy}`,
      `L ${start.x} ${start.y}`,
      `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      'Z',
    ].join(' ');
    return d;
  }

  function polarToCartesian(cx, cy, r, angle) {
    const rad = ((angle - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  return (
    <>
      <View
        style={{
          backgroundColor: '#FFF',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#ECECEC',
          width: '100%',
          marginVertical: 10,
          padding: 15,
        }}>
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              color: '#161414',
              fontSize: 16,
              marginTop: 5,
              fontWeight: '600',
              paddingBottom: '5%',
            }}>
            Report Summary
          </Text>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 2,
              paddingHorizontal: 9,
              paddingVertical: 3,
              backgroundColor: '#F8F8F8',
              borderRadius: 7,
              borderWidth: 1,
              borderColor: '#ECECEC',
            }}>
            <Text style={{color: '#989898', fontWeight: '500'}}>Tahunan</Text>
            <Text style={{color: '#BDBDBD', fontSize: 13}}>▼</Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: 'row',
          }}>
          {/* Pie Chart */}
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Svg width={width} height={height}>
              {/* Background bulat */}
              <Circle cx={cx} cy={cy} r={r} fill="#F8F8F8" />
              {data.map((d, i) => {
                const startAngle = cumulativeAngle;
                const arc = (d.value / total) * 360;
                const endAngle = cumulativeAngle + arc;
                cumulativeAngle = endAngle;
                return (
                  <Path
                    key={d.key}
                    d={describeArc(cx, cy, r, startAngle, endAngle)}
                    fill={d.color}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                );
              })}
            </Svg>
          </View>

          {/* Summary Data */}
          <View style={{flex: 1, marginLeft: 15, justifyContent: 'center'}}>
            <Text
              style={{
                color: '#4F4D4A',
                fontSize: 14,
                marginTop: 5,
                fontWeight: '400',
                marginRight: '5%',
              }}>
              Summary Data
            </Text>
            <Text
              style={{
                color: '#161414',
                fontSize: 16,
                marginTop: 5,
                fontWeight: '500',
                marginRight: '5%',
              }}>
              {total}
            </Text>

            <View style={{flexDirection: 'row', marginTop: 7}}>
              {/* Kolom Kiri */}
              <View style={{flex: 1}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  <View
                    style={{
                      width: 3,
                      height: 32,
                      backgroundColor: '#90D637',
                      borderRadius: 4,
                      marginRight: 8,
                    }}
                  />
                  <View>
                    <Text
                      style={{
                        color: '#4F4D4A',
                        fontSize: 12,
                        marginTop: 5,
                        fontWeight: '400',
                        marginRight: '5%',
                      }}>
                      Land Dispute
                    </Text>

                    <Text
                      style={{
                        color: '#161414',
                        fontSize: 14,
                        marginTop: 5,
                        fontWeight: '500',
                        marginRight: '5%',
                      }}>
                      {data[0].value}
                    </Text>
                  </View>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View
                    style={{
                      width: 3,
                      height: 32,
                      backgroundColor: '#DBD733',
                      borderRadius: 4,
                      marginRight: 8,
                    }}
                  />
                  <View>
                    <Text
                      style={{
                        color: '#4F4D4A',
                        fontSize: 11,
                        marginTop: 5,
                        fontWeight: '400',
                        marginRight: '5%',
                      }}>
                      Land Use
                    </Text>

                    <Text
                      style={{
                        color: '#161414',
                        fontSize: 14,
                        marginTop: 5,
                        fontWeight: '500',
                        marginRight: '5%',
                      }}>
                      {data[1].value}
                    </Text>
                  </View>
                </View>
              </View>
              {/* Kolom Kanan */}
              <View style={{flex: 1}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  <View
                    style={{
                      width: 3,
                      height: 32,
                      backgroundColor: '#E44C41',
                      borderRadius: 4,
                      marginRight: 8,
                    }}
                  />
                  <View>
                    <Text
                      style={{
                        color: '#4F4D4A',
                        fontSize: 12,
                        marginTop: 5,
                        fontWeight: '400',
                        marginRight: '5%',
                      }}>
                      Land Compensation
                    </Text>
                    <Text
                      style={{
                        color: '#161414',
                        fontSize: 14,
                        marginTop: 5,
                        fontWeight: '500',
                        marginRight: '5%',
                      }}>
                      {data[2].value}
                    </Text>
                  </View>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View
                    style={{
                      width: 3,
                      height: 32,
                      backgroundColor: '#EF5934',
                      borderRadius: 4,
                      marginRight: 8,
                    }}
                  />
                  <View>
                    <Text
                      style={{
                        color: '#4F4D4A',
                        fontSize: 11,
                        marginTop: 5,
                        fontWeight: '400',
                        marginRight: '5%',
                      }}>
                      Land Tenure
                    </Text>

                    <Text
                      style={{
                        color: '#161414',
                        fontSize: 14,
                        marginTop: 5,
                        fontWeight: '500',
                        marginRight: '5%',
                      }}>
                      {data[3].value}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

// --- FILTER & SORT HEADER ---
const FilterSortHeader = ({filter, setFilter, sort, setSort}) => (
  <View style={styles.headerFilterSort}>
    <TouchableOpacity
      style={styles.filterBtn}
      onPress={() => setFilter(filter === 'all' ? 'mine' : 'all')}>
      <Image
        source={require('../../assets/icons/ic-lihatSemua.png')}
        style={{width: 16, height: 16, marginRight: 6}}
        resizeMode="contain"
      />
      <Text style={styles.filterText}>Lihat Semua</Text>
      <Text style={styles.arrowDown}>▼</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.filterBtn}
      onPress={() => setSort(sort === 'latest' ? 'oldest' : 'latest')}>
      <Image
        source={require('../../assets/icons/ic-time.png')}
        style={{width: 16, height: 16, marginRight: 6}}
        resizeMode="contain"
      />
      <Text style={styles.filterText}>
        Sort By: {sort === 'latest' ? 'Latest' : 'Oldest'}
      </Text>
      <Text style={styles.arrowDown}>▼</Text>
    </TouchableOpacity>
  </View>
);

// --- CARD WEEKLY LIST ---
const WeeklyReportCard = ({item}) => (
  <View style={styles.weeklyCard}>
    <Text style={{fontSize: 13, color: '#888', marginBottom: 3}}>
      {item.date}
    </Text>
    <Text
      numberOfLines={2}
      style={{
        fontSize: 21,
        fontWeight: '700',
        color: '#181818',
        marginBottom: 12,
      }}>
      {item.title}
    </Text>
    <View style={{width: '100%', flexDirection: 'row', alignItems: 'center'}}>
      <Image
        source={require('../../assets/icons/ic-stackeHolder-disable.png')}
        style={{width: 18, height: 18, marginRight: 6}}
        resizeMode="contain"
      />
      <Text style={{fontSize: 15, fontWeight: '400', color: '#514E4A'}}>
        Nama PIC - iSafe Number
      </Text>
      <View style={{flex: 1}} />
      <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#FF832A',
            marginRight: 2,
          }}>
          Lihat
        </Text>
        <Image
          source={require('../../assets/icons/chevRed.png')}
          style={{width: 12, height: 12}}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  </View>
);

// --- CARD DAILY LIST ---
const ActivityCard = ({item}) => (
  <View
    style={{
      backgroundColor: '#FFF',
      borderRadius: 12,
      padding: 14,
      marginBottom: 14,
      elevation: 1,
      borderWidth: 1,
      borderColor: '#F2F2F2',
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 6,
    }}>
    <StatusBadge status={item.status} />
    <Text style={{fontSize: 12, color: '#888'}}>{item.date}</Text>
    <Text
      numberOfLines={2}
      style={{
        fontSize: 15,
        fontWeight: '700',
        marginVertical: 3,
        color: '#232323',
      }}>
      {item.title}
    </Text>
    <Text style={{fontSize: 13, color: '#6D6B6A'}}>{item.type}</Text>
    <View
      style={{
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: '2%',
      }}>
      <View style={{alignItems: 'center', flexDirection: 'row'}}>
        <Image
          source={require('../../assets/icons/ic-stackeHolder-disable.png')}
          style={{width: 16, height: 16}}
          resizeMode="contain"
        />
        <Text
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: '#4F4D4A',
            marginLeft: 4,
          }}>
          Nama PIC
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: '#4F4D4A',
            marginLeft: 4,
          }}>
          -
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: '#4F4D4A',
            marginLeft: 4,
          }}>
          iSafe Number
        </Text>
      </View>
      <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={{fontSize: 13, fontWeight: '500', color: '#4F4D4A'}}>
          Lihat
        </Text>
        <Image
          source={require('../../assets/icons/chevRed.png')}
          style={{width: 10, height: 10, marginLeft: 4}}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
    <TouchableOpacity
      style={{position: 'absolute', top: 12, right: 12, padding: 6}}>
      <Text style={{fontSize: 18, color: '#AAA'}}>⋮</Text>
    </TouchableOpacity>
  </View>
);
const ReportCard = ({item}) => (
  <View
    style={{
      backgroundColor: '#FFF',
      borderRadius: 12,
      padding: 14,
      marginBottom: 14,
      elevation: 1,
      borderWidth: 1,
      borderColor: '#F2F2F2',
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 6,
    }}>
    <StatusBadge status={item.status} />

    <Text
      numberOfLines={2}
      style={{
        fontSize: 15,
        fontWeight: '700',
        marginVertical: 3,
        color: '#232323',
      }}>
      {item.title}
    </Text>
    <Text style={{fontSize: 13, color: '#6D6B6A'}}>{item.type}</Text>

    <TouchableOpacity
      style={{position: 'absolute', top: 12, right: 12, padding: 6}}>
      <Text style={{fontSize: 18, color: '#AAA'}}>⋮</Text>
    </TouchableOpacity>
  </View>
);

const activityData = [
  {label: 'issue a', open: 17, close: 12},
  {label: 'issue b', open: 14, close: 8},
  {label: 'issue c', open: 7, close: 18},
  {label: 'issue d', open: 7, close: 18},
  {label: 'issue e', open: 7, close: 18},
];

// Komponen Bar Chart "Employee Performance"

// RETURN DISINI
const Activity = () => {
  const activeMenu = useFeatureStore(state => state.activeMenu);
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();
  const [filter, setFilter] = React.useState('all');
  const [sort, setSort] = React.useState('latest');

  console.log('activeMenu', activeMenu);
  // Pakai data & UI sesuai initial
  let mode = 'daily'; // default
  if (activeMenu === 'harian') mode = 'daily';
  else if (activeMenu === 'mingguan') mode = 'weekly';
  else if (activeMenu === 'laporan') mode = 'laporan';
  const isWeekly = mode === 'weekly';
  console.log('mode', mode);
  const reports = isWeekly
    ? [...dummyWeeklyReports]
    : mode === 'daily'
    ? [...dummyActivityReports]
    : [...dummyReport];
  if (sort === 'oldest') reports.reverse();

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={[styles.container, {backgroundColor: colors.bgHome}]}>
        <AppHeader menu={true} home={false} label="Activity" />
        <ScrollView
          style={{flex: 1, width: '100%'}}
          contentContainerStyle={{alignItems: 'center'}}
          showsVerticalScrollIndicator={false}>
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              paddingHorizontal: '2%',
              paddingVertical: '2%',
            }}>
            {/* TITLE */}
            <View
              style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                alignSelf: 'flex-start',
                paddingHorizontal: '5%',
              }}>
              <Text
                style={{
                  color: '#161414',
                  fontSize: 22,
                  marginTop: '2%',
                  fontWeight: '500',
                }}>
                {mode === 'weekly'
                  ? 'Weekly'
                  : mode === 'daily'
                  ? 'Daily Activity'
                  : 'Report'}
              </Text>
              <Text
                style={{
                  color: '#4F4D4A',
                  fontSize: 12,
                  marginTop: '2%',
                  fontWeight: '400',
                }}>
                Catat dan kelola aktivitas harian Anda dengan mudah.
              </Text>
            </View>
            {/* RANGE/DATE DAN CHART */}
            {mode === 'weekly' && (
              <>
                {/* TANGGAL FILTER WEEKLY */}
                <View style={styles.weeklyHeaderWrap}>
                  <TouchableOpacity style={styles.weeklyInput}>
                    <Image
                      source={require('../../assets/icons/ic-time.png')}
                      style={{width: 16, height: 16, marginRight: 7}}
                      resizeMode="contain"
                    />
                    <Text style={styles.weeklyInputText}>02 Mei, 2025</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.weeklyInput}>
                    <Image
                      source={require('../../assets/icons/ic-time.png')}
                      style={{width: 16, height: 16, marginRight: 7}}
                      resizeMode="contain"
                    />
                    <Text style={styles.weeklyInputText}>02 Mei, 2025</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={{...styles.weeklyButton, backgroundColor: colors.red}}>
                  <Text style={styles.weeklyButtonText}>Tampilkan</Text>
                </TouchableOpacity>
                <View
                  style={{
                    width: '90%',
                    backgroundColor: '#FFF',
                    borderRadius: 14,
                    paddingHorizontal: '3%',
                    paddingVertical: '2%',
                    marginTop: '3%',
                  }}>
                  <Text
                    style={{
                      color: '#161414',
                      fontSize: 13,
                      marginTop: 5,
                      fontWeight: '500',
                    }}>
                    Summery Activity
                  </Text>
                  <WeeklyBarChart data={dummyWeeklyActivityData} />
                </View>
              </>
            )}
            {mode === 'daily' && (
              <>
                <View
                  style={{
                    width: '90%',
                    backgroundColor: '#FFF',
                    borderRadius: 10,
                    paddingHorizontal: '3%',
                    paddingVertical: '2%',
                    marginTop: '3%',
                  }}>
                  <Text
                    style={{
                      color: '#161414',
                      fontSize: 13,
                      marginTop: 5,
                      fontWeight: '500',
                    }}>
                    Summery Activity
                  </Text>
                  <ActivityBarChart data={activityData} />
                </View>
              </>
            )}

            {mode === 'laporan' && (
              <>
                <View style={styles.weeklyHeaderWrap}>
                  <TouchableOpacity style={styles.weeklyInput}>
                    <Image
                      source={require('../../assets/icons/ic-time.png')}
                      style={{width: 16, height: 16, marginRight: 7}}
                      resizeMode="contain"
                    />
                    <Text style={styles.weeklyInputText}>02 Mei, 2025</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.weeklyInput}>
                    <Image
                      source={require('../../assets/icons/ic-time.png')}
                      style={{width: 16, height: 16, marginRight: 7}}
                      resizeMode="contain"
                    />
                    <Text style={styles.weeklyInputText}>02 Mei, 2025</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={{...styles.weeklyButton, backgroundColor: colors.red}}>
                  <Text style={styles.weeklyButtonText}>Tampilkan</Text>
                </TouchableOpacity>
                <View
                  style={{
                    width: '90%',
                    backgroundColor: '#FFF',
                    borderRadius: 14,
                    paddingHorizontal: '3%',
                    paddingVertical: '2%',
                    marginTop: '3%',
                  }}>
                  <Text
                    style={{
                      color: '#161414',
                      fontSize: 13,
                      marginTop: 5,
                      fontWeight: '500',
                    }}>
                    Summery Activity
                  </Text>
                  <EmployeePerformanceChart data={employeePerformanceDummy} />
                  <PieChartSummary data={pieChartData} />
                </View>
              </>
            )}
            {/* FILTER & SORT */}
            {mode !== 'laporan' && (
              <FilterSortHeader
                filter={filter}
                setFilter={setFilter}
                sort={sort}
                setSort={setSort}
              />
            )}

            {/* LIST */}
            <View style={{marginTop: 14, width: '92%', marginBottom: '20%'}}>
              <FlatList
                data={reports}
                keyExtractor={item => String(item.id)}
                renderItem={({item}) =>
                  mode === 'daily' ? (
                    <ActivityCard item={item} />
                  ) : mode === 'weekly' ? (
                    <WeeklyReportCard item={item} />
                  ) : (
                    <ReportCard item={item} />
                  )
                }
                scrollEnabled={false}
              />
            </View>
          </View>
        </ScrollView>
        {mode === 'laporan' ? null : (
          <View style={styles.bottomBtnWrap}>
            <TouchableOpacity style={styles.fabButton}>
              <Text style={styles.fabButtonText}>
                {isWeekly ? 'Buat Weekly' : 'Buat Daily Activity'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  // ...styles sama seperti kode kamu di atas, gabungkan yang daily/weekly, tidak perlu diubah banyak.
  container: {flex: 1, alignItems: 'center'},
  chartCard: {
    backgroundColor: '#FAF8F7',
    borderRadius: 16,
    padding: 18,
    width: '100%',
    alignSelf: 'center',
    marginTop: 18,
    marginBottom: 8,
    elevation: 2,
    borderColor: '#F2F2F2',
    borderWidth: 1,
  },
  chartTitle: {
    fontWeight: '700',
    color: '#181818',
    fontSize: 18,
    marginBottom: 6,
  },
  legendWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 3,
    marginBottom: 2,
  },
  legendDot: {width: 14, height: 14, borderRadius: 3},
  legendLabel: {marginLeft: 8, fontSize: 15, fontWeight: '500'},
  headerFilterSort: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 12,
    width: '92%',
    gap: 13,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderColor: '#DEDEDE',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 19,
    paddingVertical: 7,
    flex: 1,
  },
  filterText: {fontSize: 14, fontWeight: '500', color: '#222', flex: 1},
  arrowDown: {
    fontSize: 15,
    marginLeft: 8,
    color: '#B5B5B5',
    fontWeight: 'bold',
  },
  weeklyHeaderWrap: {
    flexDirection: 'row',
    width: '90%',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
    justifyContent: 'space-between',
  },
  weeklyInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#DFDFDF',
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginRight: 5,
  },
  weeklyInputText: {color: '#222', fontWeight: '500', fontSize: 15},
  weeklyButton: {
    width: '90%',
    marginTop: 14,
    backgroundColor: '#FF4545',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  weeklyButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  weeklyCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 17,
    marginBottom: 17,
    borderWidth: 0,
    shadowColor: '#EEE',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  bottomBtnWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 8 : 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    zIndex: 99,
    paddingVertical: '3%',
  },
  fabButton: {
    backgroundColor: '#D33838',
    borderRadius: 9,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 3,
  },
  fabButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default Activity;
