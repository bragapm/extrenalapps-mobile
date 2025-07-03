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

// Dummy data tren absensi (Line Chart)
const DUMMY_ABSENSI_TREND = [
  {
    name: 'Priya',
    color: '#377DFF',
    data: [6, 17, 3, 2, 10, 15, 5, 11, 6, 1, 1, 10],
  },
  {
    name: 'Angel',
    color: '#8C3D1A',
    data: [20, 14, 4, 7, 7, 13, 6, 10, 10, 0, 0, 11],
  },
  {
    name: 'Ilam',
    color: '#2DC365',
    data: [4, 5, 2, 5, 6, 10, 7, 10, 5, 2, 1, 5],
  },
  {
    name: 'David',
    color: '#EE9595',
    data: [17, 10, 7, 0, 9, 12, 8, 13, 12, 1, 1, 12],
  },
];
const DUMMY_TOTAL_ABSENSI = [
  {label: 'Land Dispute', close: 5, open: 3},
  {label: 'Land Dispute', close: 8, open: 4},
  {label: 'Land Dispute', close: 8, open: 4},
  {label: 'Land Dispute', close: 8, open: 4},
  {label: 'Land Dispute', close: 5, open: 3},
  {label: 'Land Dispute', close: 9, open: 4},
];

// Dummy data list absen
const DUMMY_LIST_ABSENSI = [
  {
    id: 1,
    date: '15/02/2025',
    name: 'Priya Nair',
    role: 'Dept.Head',
    status: 'Perjalanan Dinas',
    statusType: 'perjadin',
  },
  {
    id: 2,
    date: '15/02/2025',
    name: 'Alma Sintia',
    role: 'Admin',
    status: 'sakit',
    statusType: 'sakit',
  },
  {
    id: 3,
    date: '15/02/2025',
    name: 'Alma Sintia',
    role: 'Organic',
    status: 'Cuti',
    statusType: 'cuti',
  },
  {
    id: 4,
    date: '15/02/2025',
    name: 'Alma Sintia',
    role: 'Non-Organic',
    status: 'Hadir',
    statusType: 'hadir',
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
  } else if (statusType === 'cuti') {
    color = '#21B573';
    bg = '#E6FFF1';
    border = '#60DEAA';
  } else if (statusType === 'hadir') {
    color = '#2186EB';
    bg = '#E6F2FF';
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
const AbsensiCard = ({item}) => (
  <View style={styles.absenCard}>
    <Text style={styles.absenCardDate}>{item.date}</Text>
    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 3}}>
      <Text style={styles.absenCardName}>{item.name}</Text>
      {item.statusType !== 'hadir' && (
        <AbsensiBadge status={item.status} statusType={item.statusType} />
      )}
      {item.statusType === 'hadir' && (
        <AbsensiBadge status={item.status} statusType={item.statusType} />
      )}
    </View>
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Image
        source={require('../../assets/icons/ic-stackeHolder-disable.png')}
        style={{width: 15, height: 15, marginRight: 5}}
        resizeMode="contain"
      />
      <Text style={styles.absenCardRole}>{item.role}</Text>
    </View>
  </View>
);

// Komponen line chart absensi
const AbsensiLineChart = ({type = 'Absensi'}) => {
  const chartWidth = 300;
  const chartHeight = 150;
  const labelPad = 20; // Tambahan bawah
  const leftPad = 36;
  const topPad = 26;
  const maxY = 25;
  const xStep = (chartWidth - leftPad - 8) / 11;
  const yRatio = (chartHeight - topPad) / maxY;
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sept',
    'Oct',
    'Nov',
    'Des',
  ];

  return (
    <View style={{backgroundColor: '#FFF', borderRadius: 13, padding: 10}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Text
          style={{
            fontWeight: '700',
            fontSize: 17,
            color: '#181818',
            marginBottom: 5,
          }}>
          Tren{' '}
          {type === 'Absensi'
            ? 'Absensi'
            : type === 'Cuti'
            ? 'Cuti'
            : type === 'Perdin'
            ? 'Perjalanan Dinas'
            : ''}
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
      <Svg
        width={chartWidth}
        height={chartHeight + labelPad} // height dinaikkan
        style={{alignSelf: 'center'}}>
        {/* Grid Y */}
        {[0, 1, 2, 3, 4, 5].map(i => {
          const y = topPad + (i * (chartHeight - topPad)) / 5;
          return (
            <Line
              key={i}
              x1={leftPad}
              x2={chartWidth - 4}
              y1={y}
              y2={y}
              stroke="#E6E6E6"
              strokeWidth="1"
            />
          );
        })}
        {/* Axis Y label */}
        {[0, 5, 10, 15, 20, 25].map((v, i) => {
          const y = chartHeight - v * yRatio;
          return (
            <SvgText
              key={i}
              x={leftPad - 10}
              y={y + 3}
              fontSize="11"
              fill="#A4A4A4"
              textAnchor="end">
              {v}
            </SvgText>
          );
        })}
        {/* Axis X label */}
        {months.map((m, i) => (
          <SvgText
            key={i}
            x={leftPad + i * xStep}
            y={chartHeight + 14} // DI DALAM AREA SVG!
            fontSize="12"
            fill="#989898"
            textAnchor="middle">
            {m}
          </SvgText>
        ))}
        {/* Multi-Line */}
        {DUMMY_ABSENSI_TREND.map(user => {
          const points = user.data.map((val, i) => [
            leftPad + i * xStep,
            chartHeight - val * yRatio,
          ]);
          const path = points.reduce(
            (acc, [x, y], i) => acc + (i === 0 ? `M${x},${y}` : `L${x},${y}`),
            '',
          );
          return (
            <G key={user.name}>
              <Path
                d={path}
                fill="none"
                stroke={user.color}
                strokeWidth="2.5"
              />
              {points.map(([x, y], i) => (
                <Circle key={i} cx={x} cy={y} r={2.8} fill={user.color} />
              ))}
            </G>
          );
        })}
      </Svg>
      {/* Legend */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 14,
          marginTop: 10,
          marginLeft: 10,
        }}>
        {DUMMY_ABSENSI_TREND.map(user => (
          <View
            key={user.name}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 10,
              marginBottom: 6,
            }}>
            <View
              style={{
                width: 15,
                height: 4,
                backgroundColor: user.color,
                borderRadius: 2,
                marginRight: 7,
              }}
            />
            <Text style={{fontSize: 13, color: '#686868'}}>{user.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Komponen bar chart absensi
const AbsensiBarChart = ({type = 'Absensi'}) => {
  // Setting sesuai tampilan
  const chartWidth = 340; // Lebar lebih besar biar label ga mepet
  const chartHeight = 130;
  const labelPad = 35; // Lebih panjang supaya label di bawah chart
  const leftPad = 32;
  const barW = 22; // Lebar bar sedikit lebih ramping
  const barGap = 30; // Jarak antar bar dilebarkan
  const maxY = 12;
  const yRatio = (chartHeight - 30) / maxY;

  return (
    <View
      style={{
        backgroundColor: '#FFF',
        borderRadius: 13,
        padding: 13,
        marginTop: 12,
      }}>
      <Text
        style={{
          fontWeight: '700',
          fontSize: 17,
          color: '#181818',
          marginBottom: 4,
        }}>
        Total{' '}
        {type === 'Absensi'
          ? 'Absensi'
          : type === 'Cuti'
          ? 'Cuti'
          : type === 'Perdin'
          ? 'Perjalanan Dinas'
          : ''}
      </Text>
      <Svg
        width={chartWidth}
        height={chartHeight + labelPad}
        style={{alignSelf: 'center'}}>
        {/* Grid */}
        {[0, 1, 2, 3].map(i => {
          const y = 30 + (i * (chartHeight - 30)) / 3;
          return (
            <Line
              key={i}
              x1={leftPad}
              x2={chartWidth - 16}
              y1={y}
              y2={y}
              stroke="#E6E6E6"
              strokeWidth="1"
            />
          );
        })}
        {/* Axis Y label */}
        {[0, 4, 8, 12].map((v, i) => {
          const y = chartHeight - v * yRatio + 10;
          return (
            <SvgText
              key={i}
              x={leftPad - 12}
              y={y}
              fontSize="11"
              fill="#A4A4A4"
              textAnchor="end">
              {v}
            </SvgText>
          );
        })}
        {/* Bar group */}
        {DUMMY_TOTAL_ABSENSI.map((item, i) => {
          const x = leftPad + i * (barW + barGap);
          const closeH = item.close * yRatio;
          const openH = item.open * yRatio;
          const yBase = chartHeight - 4;

          return (
            <G key={i}>
              {/* Bar Open (Pink) */}
              <Rect
                x={x}
                y={yBase - openH}
                width={barW}
                height={openH}
                fill="#F6D2D2"
                rx={4}
              />
              {/* Bar Close (Red) */}
              <Rect
                x={x}
                y={yBase - openH - closeH}
                width={barW}
                height={closeH}
                fill="#DF2C2C"
                rx={4}
              />
              {/* Label bawah (posisi di luar SVG area chart, agar tidak numpuk) */}
              <SvgText
                x={x + barW / 2}
                y={chartHeight + 25} // Tambah jarak agar tidak numpuk bar!
                fontSize={7}
                fill="#949292"
                textAnchor="middle"
                fontWeight="500">
                {item.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
      {/* Legend */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 10,
          marginLeft: 4,
        }}>
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 6,
            backgroundColor: '#DF2C2C',
          }}
        />
        <Text
          style={{
            color: '#C4402E',
            marginLeft: 8,
            fontSize: 15,
            fontWeight: '500',
          }}>
          Close
        </Text>
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 6,
            backgroundColor: '#F6D2D2',
            marginLeft: 18,
          }}
        />
        <Text
          style={{
            color: '#D29A99',
            marginLeft: 8,
            fontSize: 15,
            fontWeight: '500',
          }}>
          Open
        </Text>
      </View>
    </View>
  );
};

const Attendance: React.FC = () => {
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();
  const [type, setType] = useState('Cuti');
  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={[styles.container, {backgroundColor: colors.bgHome}]}>
        <AppHeader
          menu={true}
          home={false}
          label={
            type === 'Absensi'
              ? 'Absensi'
              : type === 'Cuti'
              ? 'Cuti'
              : type === 'Perdin'
              ? 'Perjalanan Dinas'
              : ''
          }
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
              <Text style={{color: '#181818', fontSize: 27, fontWeight: '700'}}>
                {type === 'Absensi'
                  ? 'Absensi'
                  : type === 'Cuti'
                  ? 'Cuti'
                  : type === 'Perdin'
                  ? 'Perjalanan Dinas'
                  : ''}
              </Text>
              <Text
                style={{
                  color: '#7C7672',
                  fontSize: 14,
                  marginTop: 2,
                  fontWeight: '400',
                }}>
                Catat dan kelola aktivitas harian Anda dengan mudah.
              </Text>
            </View>
            {/* Card Summary */}
            <View style={styles.summaryCard}>
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
                  {type === 'Absensi'
                    ? 'Absensi'
                    : type === 'Cuti'
                    ? 'Cuti'
                    : type === 'Perdin'
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
              <AbsensiLineChart type={type} />
              <AbsensiBarChart type={type} />
            </View>
            {/* Filter Row */}
            <View style={styles.filterRow}>
              <TouchableOpacity style={styles.filterBtn}>
                <Text style={{color: '#222', fontWeight: '500'}}>Filter</Text>
                <Text style={{fontSize: 16, marginLeft: 6, color: '#BDBDBD'}}>
                  ▼
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterBtn}>
                <Text style={{color: '#222', fontWeight: '500'}}>
                  Pilih Tanggal
                </Text>
                <Text style={{fontSize: 16, marginLeft: 6, color: '#BDBDBD'}}>
                  ▼
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.downloadBtn}>
                <Image
                  source={require('../../assets/icons/ic-download.png')}
                  style={{width: 20, height: 20}}
                />
              </TouchableOpacity>
            </View>
            {/* List Absensi */}
            <View style={{width: '94%', marginTop: 10, marginBottom: '10%'}}>
              <FlatList
                data={DUMMY_LIST_ABSENSI}
                keyExtractor={item => String(item.id)}
                renderItem={({item}) => <AbsensiCard item={item} />}
                scrollEnabled={false}
              />
            </View>
          </View>
        </ScrollView>
        <View style={styles.bottomBtnWrap}>
          <TouchableOpacity style={styles.absenButton}>
            <Text style={styles.absenButtonText}>
              {type === 'Absensi'
                ? 'Absensi'
                : type === 'Cuti'
                ? 'Cuti'
                : type === 'Perdin'
                ? 'Perjalanan Dinas'
                : ''}
            </Text>
          </TouchableOpacity>
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
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    width: '94%',
    marginTop: 10,
    marginBottom: 9,
    alignItems: 'center',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    flex: 1,
  },
  downloadBtn: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    padding: 9,
    justifyContent: 'center',
    alignItems: 'center',
    width: 42,
    height: 42,
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
    fontWeight: '700',
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
});

export default Attendance;
