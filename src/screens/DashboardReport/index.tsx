// src/screens/DashboardReport.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  StatusBar,
  useColorScheme,
  Image,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Svg, {
  G,
  Rect,
  Text as SvgText,
  TSpan,
  Path,
  Circle,
} from 'react-native-svg';

import {useThemeStore} from '../../theme/useThemeStore';
import AppHeader from '../../components/AppHeader';
import StackedBarChart from '../../components/StackedBarChart';
import GroupedBarChart from '../../components/GroupedBarChart';

/* ===== Dummy data ===== */
const employeePerformanceDummy = [
  {label: 'Land\nDispute', open: 4, close: 2},
  {label: 'Land\nDispute', open: 5, close: 3},
  {label: 'Land\nDispute', open: 5, close: 3},
  {label: 'Land\nDispute', open: 4, close: 2},
  {label: 'Land\nDispute', open: 6, close: 3},
];

const PIE_COLORS = ['#94DB26', '#E2DF34', '#F45D2F', '#DF3B32'];

const pieDataPretty = [
  {label: 'General', value: 20, color: PIE_COLORS[0]},
  {label: 'Collaboration', value: 20, color: PIE_COLORS[1]},
  {label: 'Land Dispute', value: 20, color: PIE_COLORS[2]},
  {label: 'Environment', value: 20, color: PIE_COLORS[3]},
];

const stackedBarData = [
  {label: 'Priya', values: [6, 3], colors: ['#1B7EDF', '#20D372']},
  {label: 'Nair', values: [12, 5], colors: ['#1B7EDF', '#20D372']},
  {label: 'Ilam', values: [9, 3], colors: ['#1B7EDF', '#20D372']},
  {label: 'Aprilia', values: [8, 3], colors: ['#1B7EDF', '#20D372']},
  {label: 'Tintin', values: [9, 3], colors: ['#1B7EDF', '#20D372']},
];

const BAR_CHART_COLORS = {selesai: '#FFD9A2', ongoing: '#FF8727'};

/* ===== Filter options ===== */
const JENIS_REPORT = [
  {label: 'Semua', value: ''},
  {label: 'Report Urgent', value: 'urgent'},
  {label: 'Warning Report', value: 'warning'},
  {label: 'Daily Report', value: 'daily'},
];

const STATUS = [
  {label: 'Semua', value: ''},
  {label: 'Open', value: 'open'},
  {label: 'Closed', value: 'closed'},
  {label: 'In Progress', value: 'in_progress'},
  {label: 'Approved', value: 'approved'},
  {label: 'Draft', value: 'draft'},
  {label: 'Reject', value: 'reject'},
];

/* ===== Helpers ===== */
function formatDate(d?: string | Date | null) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${String(date.getDate()).padStart(2, '0')} ${date.toLocaleString(
    'id-ID',
    {month: 'long'},
  )} ${date.getFullYear()}`;
}

/* ---------- Simple bar (Report Status) ---------- */
const BarChart = ({data}) => {
  const chartWidth = 320;
  const chartHeight = 230;
  const paddingLeft = 24;
  const paddingBottom = 56;
  const paddingTop = 28;
  const barWidth = 12;
  const groupGap = 54;
  const barGap = 10;
  const maxY = Math.max(...data.map(d => Math.max(d.selesai, d.ongoing)), 32);

  return (
    <View style={stylesCard.wrap}>
      <View style={stylesCard.headerRow}>
        <Text style={stylesCard.headerTitle}>Report Status</Text>
      </View>
      <Svg width={chartWidth} height={chartHeight}>
        {[0, 1, 2, 3, 4, 5].map(i => {
          const y =
            paddingTop + (i * (chartHeight - paddingTop - paddingBottom)) / 5;
          return (
            <G key={i}>
              <Rect
                x={paddingLeft}
                y={y}
                width={chartWidth - paddingLeft - 16}
                height={1.2}
                fill="#E4E4E4"
              />
              <SvgText
                x={paddingLeft - 12}
                y={y + 7}
                fontSize={13}
                fill="#A5A5A5"
                textAnchor="end"
                fontWeight="400">
                {Math.round(maxY - (i * maxY) / 5)}
              </SvgText>
            </G>
          );
        })}
        {data.map((d, i) => {
          const baseY = chartHeight - paddingBottom;
          const selesaiH =
            (d.selesai / maxY) * (chartHeight - paddingTop - paddingBottom);
          const ongoingH =
            (d.ongoing / maxY) * (chartHeight - paddingTop - paddingBottom);
          const groupX =
            paddingLeft + i * groupGap + i * barWidth + i * barGap + 8;
          const [label1, label2] = d.label.split(' ');
          return (
            <G key={i}>
              <Rect
                x={groupX}
                y={baseY - selesaiH}
                width={barWidth}
                height={selesaiH}
                fill={BAR_CHART_COLORS.selesai}
                rx={4}
              />
              <Rect
                x={groupX + barWidth + barGap}
                y={baseY - ongoingH}
                width={barWidth}
                height={ongoingH}
                fill={BAR_CHART_COLORS.ongoing}
                rx={4}
              />
              <SvgText
                x={groupX + barWidth + barGap / 2}
                y={baseY + 22}
                fontSize={13}
                fill="#454545"
                textAnchor="middle"
                fontWeight="400">
                <TSpan x={groupX + barWidth + barGap / 2} dy={0}>
                  {label1}
                </TSpan>
                <TSpan x={groupX + barWidth + barGap / 2} dy={15}>
                  {label2}
                </TSpan>
              </SvgText>
            </G>
          );
        })}
      </Svg>

      <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 18}}>
        <LegendBlock label="Selesai" color={BAR_CHART_COLORS.selesai} />
        <LegendBlock label="On Going" color={BAR_CHART_COLORS.ongoing} />
      </View>
    </View>
  );
};

const LegendBlock = ({label, color}) => (
  <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 26}}>
    <View
      style={{
        width: 18,
        height: 18,
        borderRadius: 5,
        backgroundColor: color,
        marginRight: 7,
      }}
    />
    <Text style={{fontSize: 16, color: '#888', fontWeight: '500'}}>
      {label}
    </Text>
  </View>
);

/* ---------- Pretty Pie (sesuai gambar #1) ---------- */
const PrettyPieChart = ({
  data,
  size = 160,
  strokeColor = '#FFFFFF',
  strokeWidth = 5,
}: {
  data: {label: string; value: number; color: string}[];
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
}) => {
  const width = size;
  const height = size;
  const cx = width / 2;
  const cy = height / 2;
  const r = (size / 2) * 0.9; // beri margin sedikit
  const total = data.reduce((s, d) => s + d.value, 0);

  const polar = (angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad)};
  };

  const pathArc = (start: number, end: number) => {
    const startPt = polar(end);
    const endPt = polar(start);
    const large = end - start <= 180 ? '0' : '1';
    return `M ${cx} ${cy} L ${startPt.x} ${startPt.y} A ${r} ${r} 0 ${large} 0 ${endPt.x} ${endPt.y} Z`;
  };

  let acc = 0;
  return (
    <Svg width={width} height={height}>
      {/* outline lembut */}
      <Circle cx={cx} cy={cy} r={r} fill="#F9F9F9" />
      {data.map((d, i) => {
        const start = acc;
        const sweep = (d.value / total) * 360;
        const end = acc + sweep;
        acc = end;

        // posisi angka di tengah slice
        const mid = start + sweep / 2;
        const rad = ((mid - 90) * Math.PI) / 180;
        const tx = cx + r * 0.6 * Math.cos(rad);
        const ty = cy + r * 0.6 * Math.sin(rad);

        return (
          <G key={i}>
            <Path
              d={pathArc(start, end)}
              fill={d.color}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <SvgText
              x={tx}
              y={ty + 4}
              textAnchor="middle"
              fontSize={14}
              fill="#FFFFFF"
              fontWeight="700">
              {d.value}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
};

/* ================== DASHBOARD ================== */
const DashboardReport = ({role, sections}) => {
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();

  // filter state
  const [jenisReport, setJenisReport] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [tanggal, setTanggal] = React.useState<string | null>(null);
  const [showDate, setShowDate] = React.useState(false);

  const FilterBar = () => (
    <View style={filterStyles.container}>
      {/* Tanggal */}
      <TouchableOpacity
        style={[filterStyles.inputBox, {flexGrow: 1}]}
        onPress={() => setShowDate(true)}
        activeOpacity={0.8}>
        <Image
          source={require('../../assets/icons/ic-calendar.png')}
          style={{width: 18, height: 18, marginRight: 8}}
        />
        <Text style={filterStyles.inputText}>
          {tanggal ? formatDate(tanggal) : 'Tanggal'}
        </Text>
        <Text style={filterStyles.chev}>▾</Text>
      </TouchableOpacity>

      {/* Jenis Report */}
      <View style={[filterStyles.inputBox, {flexGrow: 1}]}>
        <Picker
          selectedValue={jenisReport}
          onValueChange={setJenisReport}
          style={filterStyles.picker}>
          {JENIS_REPORT.map(opt => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
        <Text style={filterStyles.chev}>▾</Text>
      </View>

      {/* Status */}
      <View style={[filterStyles.inputBox, {flexGrow: 1}]}>
        <Picker
          selectedValue={status}
          onValueChange={setStatus}
          style={filterStyles.picker}>
          {STATUS.map(opt => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
        <Text style={filterStyles.chev}>▾</Text>
      </View>

      {/* Download */}
      <TouchableOpacity
        style={filterStyles.iconBtn}
        onPress={() => {
          /* export here */
        }}>
        <Image
          source={require('../../assets/icons/ic-download.png')}
          style={{width: 22, height: 22}}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );

  const ListHeaderComponent = (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={[styles.container, {backgroundColor: colors.bgHome}]}>
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
            Dashboard Laporan
          </Text>
        </View>
      </View>
    </>
  );

  const renderSection = ({item}) => {
    if (item.type !== 'report-admin') return null;

    const total = pieDataPretty.reduce((s, d) => s + d.value, 0);

    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Laporan</Text>
          <TouchableOpacity>
            <Text style={styles.summaryDetail}>Lihat detail &gt;</Text>
          </TouchableOpacity>
        </View>

        {/* FILTER di atas Report Issue Summary */}
        <FilterBar />

        {/* Report Issue Summary */}
        <View style={stylesCard.wrap}>
          <View style={stylesCard.headerRow}>
            <Text style={stylesCard.headerTitle}>Report Issue Summary</Text>
          </View>
          <GroupedBarChart
            data={employeePerformanceDummy}
            maxY={10}
            height={250}
          />
        </View>

        {/* ===== Report Summary — match gambar #1 ===== */}
        <View style={styles.summaryOuter}>
          <Text style={styles.summaryOuterTitle}>Report Summary</Text>

          {/* inner bordered area */}
          <View style={styles.summaryInner}>
            {/* Legend top (horizontal) */}
            <View style={styles.topLegendRow}>
              {pieDataPretty.map(d => (
                <View key={d.label} style={styles.topLegendItem}>
                  <View
                    style={[styles.topLegendDot, {backgroundColor: d.color}]}
                  />
                  <Text style={styles.topLegendText}>{d.label}</Text>
                </View>
              ))}
            </View>

            <View style={{flexDirection: 'row', width: '100%', marginTop: 8}}>
              {/* Pie */}
              <View style={{flex: 1, alignItems: 'center'}}>
                <PrettyPieChart data={pieDataPretty} size={180} />
              </View>

              {/* Right side: Summary list 2 kolom */}
              <View style={{flex: 1, paddingLeft: 6}}>
                <Text style={{color: '#6B6B6B', fontSize: 13, marginBottom: 2}}>
                  Summary Data
                </Text>
                <Text
                  style={{
                    fontSize: 34,
                    fontWeight: '800',
                    color: '#111',
                    marginBottom: 10,
                  }}>
                  {total}
                </Text>

                <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                  {pieDataPretty.map((d, idx) => (
                    <View
                      key={d.label + idx}
                      style={{width: '50%', paddingRight: 8, marginBottom: 12}}>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <View
                          style={[styles.sideBar, {backgroundColor: d.color}]}
                        />
                        <Text style={styles.sideLabel} numberOfLines={2}>
                          {d.label}
                        </Text>
                      </View>
                      <Text style={styles.sideValue}>{d.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Bottom legend (big, 4 items) */}
          <View style={styles.bottomLegendRow}>
            {pieDataPretty.map(d => (
              <View key={'b-' + d.label} style={styles.bottomLegendItem}>
                <View
                  style={[styles.bottomLegendDot, {backgroundColor: d.color}]}
                />
                <Text style={styles.bottomLegendText}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bar lain */}
        <View style={stylesCard.wrap}>
          <View style={stylesCard.headerRow}>
            <Text style={stylesCard.headerTitle}>Report Status</Text>
          </View>
          <StackedBarChart
            data={stackedBarData}
            maxY={14}
            height={250}
            chartWidthPerBar={80}
          />
        </View>
      </View>
    );
  };

  return (
    <>
      <FlatList
        data={sections}
        keyExtractor={(item, idx) => item.type + idx}
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 50, backgroundColor: '#F4F3F1'}}
        ListHeaderComponent={ListHeaderComponent}
      />

      {/* Date picker */}
      <DateTimePickerModal
        isVisible={showDate}
        mode="date"
        date={tanggal ? new Date(tanggal) : new Date()}
        onConfirm={d => {
          setShowDate(false);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          setTanggal(`${y}-${m}-${day}`);
        }}
        onCancel={() => setShowDate(false)}
      />
    </>
  );
};

/* ===== styles ===== */
const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center'},

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

  /* Report Summary (card sesuai gambar #1) */
  summaryOuter: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECECEC',
    padding: 12,
    marginTop: 12,
  },
  summaryOuterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1919',
    marginBottom: 6,
  },
  summaryInner: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 10,
    padding: 12,
  },

  topLegendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  topLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
    marginBottom: 6,
  },
  topLegendDot: {width: 14, height: 14, borderRadius: 3, marginRight: 6},
  topLegendText: {fontSize: 15, color: '#4A4A4A', fontWeight: '500'},

  sideBar: {width: 3, height: 22, borderRadius: 2, marginRight: 8},
  sideLabel: {fontSize: 14, color: '#555', fontWeight: '500', flex: 1},
  sideValue: {
    fontSize: 13,
    color: '#888',
    marginLeft: 11,
    marginTop: 2,
    fontWeight: '600',
  },

  bottomLegendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingTop: 10,
  },
  bottomLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
    marginTop: 6,
  },
  bottomLegendDot: {width: 22, height: 22, borderRadius: 6, marginRight: 8},
  bottomLegendText: {fontSize: 17, color: '#666', fontWeight: '600'},
});

const stylesCard = StyleSheet.create({
  wrap: {
    backgroundColor: '#F9F8F6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECECEC',
    marginTop: 12,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTitle: {fontSize: 19, fontWeight: 'bold', color: '#1A1919'},
});

/** Styles filter bar */
const filterStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap', // biar otomatis 2 baris saat sempit
    gap: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 6,
    marginBottom: 8,
  },
  inputBox: {
    minWidth: 120,
    height: 44,
    flexBasis: '28%',
    flexShrink: 1,
    borderWidth: 1,
    borderColor: '#B4B4B4',
    borderRadius: 10,
    backgroundColor: '#FFF',
    paddingLeft: 12,
    paddingRight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  picker: {flex: 1, height: 52, color: '#333', backgroundColor: 'transparent'},
  inputText: {fontSize: 15, color: '#353535'},
  chev: {
    position: 'absolute',
    right: 10,
    top: 10,
    fontSize: 16,
    color: '#9E9E9E',
  },
  iconBtn: {
    height: 44,
    width: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B4B4B4',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DashboardReport;
