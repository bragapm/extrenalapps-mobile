import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  useColorScheme,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
  ScrollView,
  FlatList,
  Platform,
} from 'react-native';
import Svg, {G, Rect, Text as SvgText, TSpan, Path} from 'react-native-svg';
import {useThemeStore} from '../../theme/useThemeStore';
import AppHeader from '../../components/AppHeader';

type MediaAndPublishProps = {
  home?: boolean;
  liveTeam?: boolean;
  menu?: boolean;
  location?: string;
  label?: string;
};

const stakeholderData = {
  labels: ['Desa', 'Desa', 'Desa', 'Desa', 'Desa'],
  value: [43, 28, 24, 29, 15], // Ganti sesuai data kamu
};

const COLOR_STAKEHOLDER = '#F36A1D';

const SingleBarChart = ({data}) => {
  const chartWidth = 320;
  const chartHeight = 200;
  const paddingLeft = 44;
  const paddingBottom = 38;
  const paddingTop = 18;
  const barWidth = 16;
  const gap = 30; // jarak antar bar
  const maxY = 100; // pakai fix max 50 supaya grid rapi, bisa diubah

  return (
    <View
      style={{
        backgroundColor: '#F9F8F6',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ECECEC',
        padding: 18,
      }}>
      <Text
        style={{
          color: '#161414',
          fontSize: 18,
          fontWeight: '600',
          marginBottom: 6,
        }}>
        Jumlah Publikasi
      </Text>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Grid dan Y axis */}
        {[0, 1, 2, 3, 4, 5].map(i => {
          const y =
            paddingTop + (i * (chartHeight - paddingTop - paddingBottom)) / 5;
          return (
            <G key={i}>
              <Rect
                x={paddingLeft}
                y={y}
                width={chartWidth - paddingLeft - 16}
                height={1}
                fill="#E4E4E4"
              />
              <SvgText
                x={paddingLeft - 12}
                y={y + 8}
                fontSize={13}
                fill="#A5A5A5"
                textAnchor="end"
                fontWeight="400">
                {maxY - Math.round((i * maxY) / 5)}
              </SvgText>
            </G>
          );
        })}
        {/* Bars & label bawah */}
        {data.labels.map((label, i) => {
          const baseY = chartHeight - paddingBottom;
          const valueH =
            (data.value[i] / maxY) * (chartHeight - paddingTop - paddingBottom);
          const x = paddingLeft + i * gap + i * barWidth + 8;

          return (
            <G key={i}>
              {/* Bar */}
              <Rect
                x={x}
                y={baseY - valueH}
                width={barWidth}
                height={valueH}
                fill={COLOR_STAKEHOLDER}
                rx={3}
              />
              {/* Label bawah */}
              <SvgText
                x={x + barWidth / 2}
                y={baseY + 24}
                fontSize={15}
                fill="#555"
                textAnchor="middle"
                fontWeight="400">
                {label}
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
          marginTop: 14,
          marginLeft: 8,
        }}>
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 5,
            backgroundColor: COLOR_STAKEHOLDER,
            marginRight: 9,
          }}
        />
        <Text style={{fontSize: 13, color: '#888', fontWeight: '500'}}>
          Publikasi
        </Text>
      </View>
    </View>
  );
};

const sentimenPieData = [
  {key: 'Positif', value: 20, color: '#1FD96F'}, // hijau terang
  {key: 'Negatif', value: 10, color: '#D73A3A'}, // merah
];

const PieChartSentimen = ({data, size = 160}) => {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let startAngle = -90;

  function describeArc(cx, cy, r, startAngle, endAngle) {
    const start = {
      x: cx + r * Math.cos((Math.PI * startAngle) / 180),
      y: cy + r * Math.sin((Math.PI * startAngle) / 180),
    };
    const end = {
      x: cx + r * Math.cos((Math.PI * endAngle) / 180),
      y: cy + r * Math.sin((Math.PI * endAngle) / 180),
    };
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    return [
      `M ${cx} ${cy}`,
      `L ${start.x} ${start.y}`,
      `A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      'Z',
    ].join(' ');
  }

  return (
    <Svg width={size} height={size}>
      {data.map((slice, idx) => {
        const angle = (slice.value / total) * 360;
        const endAngle = startAngle + angle;
        const path = describeArc(cx, cy, r, startAngle, endAngle);
        startAngle += angle;
        return (
          <Path
            key={idx}
            d={path}
            fill={slice.color}
            stroke="#fff"
            strokeWidth={2}
          />
        );
      })}
    </Svg>
  );
};

const SentimenStakeholderCard = () => {
  const summary = sentimenPieData.reduce((a, b) => a + b.value, 0);
  const positif = sentimenPieData.find(x => x.key === 'Positif').value;
  const negatif = sentimenPieData.find(x => x.key === 'Negatif').value;

  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ECECEC',
        flexDirection: 'row',
        padding: 24,
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <View style={{flex: 1, alignItems: 'center'}}>
        <Text
          style={{
            color: '#161414',
            fontSize: 16,
            fontWeight: '500',
            marginBottom: 8,
            alignSelf: 'flex-start',
          }}>
          Sentimen Publikasi
        </Text>
        <PieChartSentimen data={sentimenPieData} size={150} />
      </View>
      <View style={{flex: 1, alignItems: 'flex-start', paddingLeft: 15}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            width: '100%',
          }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 9,
              paddingVertical: 3,
              backgroundColor: '#F8F8F8',
              borderRadius: 7,
              borderWidth: 1,
              borderColor: '#ECECEC',
              marginBottom: 4,
            }}>
            <Text style={{color: '#777', fontWeight: '500'}}>Desa</Text>
            <Text style={{color: '#BDBDBD', fontSize: 13, marginLeft: 3}}>
              ▼
            </Text>
          </TouchableOpacity>
        </View>
        <Text
          style={{
            color: '#888',
            fontSize: 15,
            marginTop: 8,
          }}>
          Summary Data
        </Text>
        <Text
          style={{
            color: '#181818',
            fontSize: 36,
            fontWeight: '700',
            marginBottom: 6,
          }}>
          {summary}
        </Text>
        {/* Positif & Negatif */}
        <View
          style={{flexDirection: 'row', alignItems: 'center', marginTop: 9}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <View
              style={{
                width: 4,
                height: 28,
                backgroundColor: '#1FD96F',
                borderRadius: 3,
                marginRight: 8,
              }}
            />
            <View>
              <Text
                style={{
                  color: '#4F4D4A',
                  fontSize: 11,
                  fontWeight: '400',
                }}>
                Positif
              </Text>
              <Text
                style={{
                  color: '#161414',
                  fontSize: 12,
                  fontWeight: '600',
                }}>
                {positif}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
              marginLeft: '10%',
            }}>
            <View
              style={{
                width: 4,
                height: 28,
                backgroundColor: '#D73A3A',
                borderRadius: 3,
                marginRight: 8,
              }}
            />
            <View>
              <Text
                style={{
                  color: '#4F4D4A',
                  fontSize: 11,
                  fontWeight: '400',
                }}>
                Negatif
              </Text>
              <Text
                style={{
                  color: '#161414',
                  fontSize: 12,
                  fontWeight: '600',
                }}>
                {negatif}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const DUMMY_LIST_ABSENSI = [
  {
    id: 1,
    date: '15/02/2025',
    name: 'Kompas',
    role: 'Ketua',
    status: 'Ridwan',
    statusType: 'Positif',
  },
  {
    id: 2,
    date: '15/02/2025',
    name: 'Pos Jawa',
    role: 'Jurnalis',
    status: 'Hilmi',
    statusType: 'Netral',
  },
  {
    id: 3,
    date: '15/02/2025',
    name: 'Metro Kalsel',
    role: 'Jurnalis',
    status: 'Serva',
    statusType: 'Negatif',
  },
  {
    id: 4,
    date: '15/02/2025',
    name: 'Metro Kalsel',
    role: 'Jurnalis',
    status: 'Azka',
    statusType: 'Negatif',
  },
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

const AbsensiCard = ({item}) => (
  <View style={styles.absenCard}>
    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 3}}>
      <Text style={styles.absenCardName}>{item.name}</Text>
    </View>
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <View
        style={{
          flexDirection: 'row',
        }}>
        <Text style={styles.absenCardRole}>{item.role}</Text>
        <Text style={styles.absenCardRole}>-</Text>
        <Text style={styles.absenCardRole}>{item.status}</Text>
      </View>
      <View>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '400',
              color: '#4F4D4A',
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
  </View>
);

const MediaAndPublish: React.FC<MediaAndPublishProps> = ({}) => {
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();
  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={[styles.container, {backgroundColor: colors.bgHome}]}>
        <AppHeader menu={true} home={false} label={'Publikasi dan Media'} />
        <ScrollView
          style={{flex: 1, width: '100%'}}
          contentContainerStyle={{alignItems: 'center', paddingBottom: 40}}
          showsVerticalScrollIndicator={false}>
          <View
            style={{
              width: '100%',
              alignItems: 'flex-start',
              paddingHorizontal: '6%',
              paddingTop: '3%',
            }}>
            <Text style={{color: '#181818', fontSize: 27, fontWeight: '700'}}>
              Publikasi dan Media
            </Text>

            <Text
              style={{
                color: '#7C7672',
                fontSize: 14,
                marginTop: 2,
                fontWeight: '400',
              }}>
              Pantau dan kelola seluruh aktivitas publikasi dan media.
            </Text>

            <View
              style={{
                width: '100%',
                backgroundColor: '#FFF',
                borderRadius: 14,
                paddingHorizontal: '3%',
                paddingVertical: '2%',
                marginTop: '3%',
              }}>
              <SingleBarChart data={stakeholderData} />

              <SentimenStakeholderCard />
            </View>
            <Text
              style={{
                color: '#181818',
                fontSize: 27,
                fontWeight: '500',
                marginTop: '10%',
              }}>
              Summary Publikasi
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
            <View style={{width: '100%', marginTop: 10, marginBottom: '10%'}}>
              <FlatList
                data={DUMMY_LIST_ABSENSI}
                keyExtractor={item => String(item.id)}
                renderItem={({item}) => <AbsensiCard item={item} />}
                scrollEnabled={false}
              />
            </View>
          </View>
        </ScrollView>
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: Platform.OS === 'ios' ? 8 : 0,
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 14,
            zIndex: 99,
            paddingVertical: '3%',
          }}>
          <TouchableOpacity style={styles.fabButton}>
            <Text style={styles.fabButtonText}>Tambah Publikasi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center'},
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
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

export default MediaAndPublish;
