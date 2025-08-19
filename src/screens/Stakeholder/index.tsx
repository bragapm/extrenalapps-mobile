import React, {useEffect, useState, useRef, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  useColorScheme,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Platform,
} from 'react-native';
import Svg, {G, Rect, Text as SvgText, Path} from 'react-native-svg';
import {useThemeStore} from '../../theme/useThemeStore';
import AppHeader from '../../components/AppHeader';
import {getStakeholders, getUsers} from '../../services/apiServices';
import {RootStackParamList} from '../../navigation';
import {StackNavigationProp} from '@react-navigation/stack';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import StackedBarChart from '../../components/StackedBarChart';

type StakeholderProps = {};

// ───────────────────────────────── helpers ─────────────────────────────────
const ORANGE = '#F36A1D';

type Row = {
  id: number;
  organization?: string | null;
  location?: string | null;
  sentiment?: 'positive' | 'negative' | 'neutral' | string;
  position?: string;
  user_created?: string | number;
};

function groupCount(rows: Row[], key: keyof Row) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const raw = (r[key] ?? '') as string;
    const label = (raw && raw.trim()) || 'Tidak diketahui';
    map.set(label, (map.get(label) || 0) + 1);
  }
  // urut alfabet biar stabil
  return [...map.entries()]
    .map(([label, count]) => ({label, count}))
    .sort((a, b) => a.label.localeCompare(b.label, 'id'));
}

/** Convert ke format StackedBarChart single-series */
function toStackedSingleSeries(data: {label: string; count: number}[]) {
  return data.map(d => ({
    label: d.label,
    values: [0, d.count],
    colors: ['#00000000', ORANGE],
  }));
}

/** hitung maxY rapi (kelipatan 5) */
function calcMaxY(counts: number[]) {
  const max = Math.max(1, ...counts);
  return Math.max(1, Math.ceil(max / 5) * 5);
}

function countSentiments(rows: Row[]) {
  let pos = 0,
    neg = 0,
    neu = 0;
  for (const r of rows) {
    const s = String(r.sentiment || '').toLowerCase();
    if (s === 'positive') pos++;
    else if (s === 'negative') neg++;
    else neu++;
  }
  return {pos, neg, neu, total: pos + neg + neu};
}

type SentimenStakeholderCardProps = {
  positif: number;
  negatif: number;
  netral: number;
};

// ─────────────────────────────── Sentimen Pie (tetap) ───────────────────────────────
const sentimenPieData = [
  {key: 'Positif', value: 20, color: '#1FD96F'},
  {key: 'Negatif', value: 10, color: '#D73A3A'},
];

const PieChartSentimen = ({
  data,
  size = 150,
  minInsideAngleDeg = 15, // slice < 15° → label di luar
}: {
  data: {key: string; value: number; color: string}[];
  size?: number;
  minInsideAngleDeg?: number;
}) => {
  const cx = size / 2,
    cy = size / 2,
    r = size / 2 - 2;

  const total = data.reduce((s, x) => s + x.value, 0);
  if (!total) {
    return (
      <Svg width={size} height={size}>
        <Rect x={0} y={0} width={size} height={size} fill="transparent" />
        <SvgText
          x={cx}
          y={cy}
          fontSize={14}
          fill="#9CA3AF"
          textAnchor="middle"
          alignmentBaseline="middle">
          Tidak ada data
        </SvgText>
      </Svg>
    );
  }

  let startAngle = -90; // mulai dari atas (jam 12)

  const toRad = (deg: number) => (Math.PI * deg) / 180;
  const polar = (radius: number, angleDeg: number) => ({
    x: cx + radius * Math.cos(toRad(angleDeg)),
    y: cy + radius * Math.sin(toRad(angleDeg)),
  });

  const describeArc = (r0: number, a0: number, a1: number) => {
    const s = polar(r0, a0);
    const e = polar(r0, a1);
    const largeArc = a1 - a0 > 180 ? 1 : 0;
    return [
      `M ${cx} ${cy}`,
      `L ${s.x} ${s.y}`,
      `A ${r0} ${r0} 0 ${largeArc} 1 ${e.x} ${e.y}`,
      'Z',
    ].join(' ');
  };

  return (
    <Svg width={size} height={size}>
      {data.map((slice, idx) => {
        const sweep = (slice.value / total) * 360;
        const endAngle = startAngle + sweep;

        // 1) gambar slice
        const d = describeArc(r, startAngle, endAngle);

        // 2) posisi label
        const mid = (startAngle + endAngle) / 2;
        const isTiny = sweep < minInsideAngleDeg;

        // label di dalam
        const labelRInside = r * 0.62;
        const pInside = polar(labelRInside, mid);

        // label di luar (dengan leader line)
        const labelROnEdge = r * 0.86;
        const pEdge = polar(labelROnEdge, mid);
        const labelROut = r * 1.02; // titik text
        const pOut = polar(labelROut, mid);
        const anchor =
          Math.cos(toRad(mid)) > 0
            ? 'start'
            : Math.cos(toRad(mid)) < 0
            ? 'end'
            : 'middle';

        const pathKey = `slice-${idx}`;
        const labelKey = `lbl-${idx}`;

        const pathEl = (
          <Path
            key={pathKey}
            d={d}
            fill={slice.color}
            stroke="#fff"
            strokeWidth={2}
          />
        );

        // 3) label element
        const labelEl = isTiny ? (
          // Kecil -> label di luar + garis kecil
          <G key={labelKey}>
            <Path
              d={`M ${pEdge.x} ${pEdge.y} L ${pOut.x} ${pOut.y}`}
              stroke={slice.color}
              strokeWidth={1.5}
              fill="none"
            />
            <SvgText
              x={pOut.x}
              y={pOut.y}
              fontSize={12}
              fontWeight="600"
              fill={slice.color}
              textAnchor={anchor}
              alignmentBaseline="middle">
              {slice.value}
            </SvgText>
          </G>
        ) : (
          // Cukup besar -> label di dalam slice (kontras putih)
          <SvgText
            key={labelKey}
            x={pInside.x}
            y={pInside.y}
            fontSize={14}
            fontWeight="bold"
            fill="#fff"
            textAnchor="middle"
            alignmentBaseline="middle">
            {slice.value}
          </SvgText>
        );

        startAngle = endAngle; // maju untuk slice berikutnya
        return (
          <G key={`g-${idx}`}>
            {pathEl}
            {labelEl}
          </G>
        );
      })}
    </Svg>
  );
};

const SentimenStakeholderCard: React.FC<SentimenStakeholderCardProps> = ({
  positif,
  negatif,
  netral,
}) => {
  const summary = positif + negatif + netral;

  const pieData = [
    {key: 'Positif', value: positif, color: '#1FD96F'},
    {key: 'Negatif', value: negatif, color: '#D73A3A'},
    {key: 'Netral', value: netral, color: '#9CA3AF'}, // abu utk netral
  ].filter(d => d.value > 0); // opsional: sembunyikan slice 0

  return (
    <View style={styles.sentimenWrap}>
      <View style={{flex: 1, alignItems: 'center'}}>
        <Text style={styles.sentimenTitle}>Sentimen Stakeholder</Text>
        <PieChartSentimen data={pieData} size={150} />
      </View>

      <View style={{flex: 1, alignItems: 'flex-start', paddingLeft: 15}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            width: '100%',
          }}>
          <TouchableOpacity style={styles.sentimenDropdown}>
            <Text style={{color: '#777', fontWeight: '500'}}>Desa</Text>
            <Text style={{color: '#BDBDBD', fontSize: 13, marginLeft: 3}}>
              ▼
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{color: '#888', fontSize: 15, marginTop: 8}}>
          Summary Data
        </Text>
        <Text style={styles.sentimenSummary}>{summary}</Text>

        {/* Positif & Negatif & Netral */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 9,
            flexWrap: 'wrap',
          }}>
          <View style={styles.sentimenItem}>
            <View style={[styles.sentimenBar, {backgroundColor: '#1FD96F'}]} />
            <View>
              <Text style={styles.sentimenItemLabel}>Positif</Text>
              <Text style={styles.sentimenItemValue}>{positif}</Text>
            </View>
          </View>

          <View style={[styles.sentimenItem, {marginLeft: '10%'}]}>
            <View style={[styles.sentimenBar, {backgroundColor: '#D73A3A'}]} />
            <View>
              <Text style={styles.sentimenItemLabel}>Negatif</Text>
              <Text style={styles.sentimenItemValue}>{negatif}</Text>
            </View>
          </View>

          <View style={[styles.sentimenItem, {marginLeft: '10%'}]}>
            <View style={[styles.sentimenBar, {backgroundColor: '#9CA3AF'}]} />
            <View>
              <Text style={styles.sentimenItemLabel}>Netral</Text>
              <Text style={styles.sentimenItemValue}>{netral}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const AbsensiBadge = ({statusType}: {statusType: string}) => {
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
        marginTop: -4,
      }}>
      <Text style={{color, fontSize: 13, fontWeight: '500'}}>{statusType}</Text>
    </View>
  );
};

// ─────────────────────────────── Screen ───────────────────────────────
const Stakeholder: React.FC<StakeholderProps> = () => {
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [rows, setRows] = useState<Row[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const sentiment = useMemo(() => countSentiments(rows), [rows]);
  // Fetch
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const run = async () => {
        setLoading(true);
        setError('');
        try {
          const [stakeholdersRes, users] = await Promise.all([
            getStakeholders(),
            getUsers(),
          ]);
          // NORMALISASI: API mengembalikan { data: [...] }
          const list: Row[] = Array.isArray(stakeholdersRes?.data)
            ? stakeholdersRes.data
            : Array.isArray(stakeholdersRes)
            ? stakeholdersRes
            : [];
          const mapping: Record<string, string> = {};
          (users || []).forEach((u: any) => {
            mapping[u.id] = [u.first_name, u.last_name]
              .filter(Boolean)
              .join(' ');
          });
          if (isActive) {
            setRows(list);
            setUserMap(mapping);
          }
        } catch (e) {
          if (isActive) setError('Gagal memuat data stakeholder');
        }
        if (isActive) setLoading(false);
      };
      run();
      return () => {
        isActive = false;
      };
    }, []),
  );

  // ==== DATA UNTUK CHART ====
  const perLocation = useMemo(() => groupCount(rows, 'location'), [rows]);
  const perOrganization = useMemo(
    () => groupCount(rows, 'organization'),
    [rows],
  );

  const locationChartData = useMemo(
    () => toStackedSingleSeries(perLocation),
    [perLocation],
  );
  const orgChartData = useMemo(
    () => toStackedSingleSeries(perOrganization),
    [perOrganization],
  );

  const maxYLocation = useMemo(
    () => calcMaxY(perLocation.map(x => x.count)),
    [perLocation],
  );
  const maxYOrg = useMemo(
    () => calcMaxY(perOrganization.map(x => x.count)),
    [perOrganization],
  );

  const AbsensiCard = ({item, userName}: {item: Row; userName?: string}) => (
    <TouchableOpacity
      style={styles.absenCard}
      onPress={() =>
        navigation.navigate('DetailStakeHolder', {showForm: false, data: item})
      }>
      <AbsensiBadge
        statusType={
          item.sentiment === 'positive'
            ? 'Positif'
            : item.sentiment === 'negative'
            ? 'Negatif'
            : 'Netral'
        }
      />
      <View
        style={{flexDirection: 'row', alignItems: 'center', marginBottom: 3}}>
        <Text style={styles.absenCardName}>{userName || '-'}</Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View style={{flexDirection: 'row'}}>
          <Text style={styles.absenCardRole}>{item.position}</Text>
          <Text style={styles.absenCardRole}> - </Text>
          <Text style={styles.absenCardRole}>{item.organization}</Text>
        </View>
        <View>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center'}}>
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
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={[styles.container, {backgroundColor: colors.bgHome}]}>
        <AppHeader home />
        <ScrollView
          style={{flex: 1, width: '100%'}}
          contentContainerStyle={{alignItems: 'center', paddingBottom: 40}}
          showsVerticalScrollIndicator={false}>
          <View
            style={{
              width: '100%',
              alignItems: 'flex-start',
              paddingHorizontal: '5%',
              paddingTop: '3%',
            }}>
            <Text style={{color: '#181818', fontSize: 27, fontWeight: '500'}}>
              Summary Stakeholder
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

            <View
              style={{
                width: '100%',
                backgroundColor: '#FFF',
                borderRadius: 14,
                paddingHorizontal: '3%',
                paddingVertical: '2%',
                marginTop: '3%',
              }}>
              {/* Chart 1: per Location */}
              <View style={styles.barChartBox}>
                <Text style={styles.chartTitle}>Jumlah Stakeholder</Text>
                <View style={{marginTop: '10%'}}>
                  <StackedBarChart
                    data={locationChartData}
                    maxY={maxYLocation}
                    height={250}
                    // barWidth={24}
                    // chartWidthPerBar={200}
                    // labelColor="#333"
                  />
                </View>
                <View style={styles.legendRow}>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, {backgroundColor: ORANGE}]}
                    />
                    <Text style={styles.legendText}>Total Stakeholder</Text>
                  </View>
                </View>
              </View>

              {/* Chart 2: per Organization */}
              <View style={styles.barChartBox}>
                <Text style={styles.chartTitle}>
                  Jumlah Stakeholder by Instansi
                </Text>
                <View style={{marginTop: '10%'}}>
                  <StackedBarChart
                    data={orgChartData}
                    maxY={maxYOrg}
                    height={250}
                  />
                </View>
                <View style={styles.legendRow}>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, {backgroundColor: ORANGE}]}
                    />
                    <Text style={styles.legendText}>Total Stakeholder</Text>
                  </View>
                </View>
              </View>

              <SentimenStakeholderCard
                positif={sentiment.pos}
                negatif={sentiment.neg}
                netral={sentiment.neu}
              />
            </View>

            {/* List */}
            <Text
              style={{
                color: '#181818',
                fontSize: 27,
                fontWeight: '500',
                marginTop: '10%',
              }}>
              Summary Stakeholder
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
                data={rows}
                keyExtractor={item => String(item.id)}
                renderItem={({item}) => (
                  <AbsensiCard
                    item={item}
                    userName={userMap[String(item.user_created)]}
                  />
                )}
                scrollEnabled={false}
              />
            </View>
          </View>
        </ScrollView>

        {/* FAB */}
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
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('DetailStakeHolder', {showForm: true})
            }
            style={styles.fabButton}>
            <Text style={styles.fabButtonText}>Tambah Stakeholder</Text>
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
    marginRight: 16,
    marginBottom: 4,
  },
  legendDot: {width: 14, height: 14, borderRadius: 3, marginRight: 5},
  legendText: {color: '#666', fontSize: 13},
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

  // Sentimen styles ringkas
  sentimenWrap: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECECEC',
    flexDirection: 'row',
    padding: 24,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sentimenTitle: {
    color: '#161414',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  sentimenDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
    backgroundColor: '#F8F8F8',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#ECECEC',
    marginBottom: 4,
  },
  sentimenSummary: {
    color: '#181818',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 6,
  },
  sentimenItem: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  sentimenBar: {width: 4, height: 28, borderRadius: 3, marginRight: 8},

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
  absenCardName: {
    fontWeight: '700',
    fontSize: 18,
    color: '#191818',
    marginRight: 7,
  },
  absenCardRole: {fontSize: 14, color: '#7B7B7B', fontWeight: '400'},
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

export default Stakeholder;
