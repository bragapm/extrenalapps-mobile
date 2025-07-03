import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

type Legend = {
  label: string;
  color: string;
};

type ChartCardSectionProps = {
  title: string;
  detailText?: string;
  onDetailPress?: () => void;
  chartTitle: string;
  chartDropdownText: string;
  ChartComponent: React.ReactNode;
  legends: Legend[];
  rekapTitle: string;
  rekapDropdownText: string;
  RekapChartComponent: React.ReactNode;
  rekapLegends: Legend[];
};

export default function ChartCardSection({
  title,
  detailText,
  onDetailPress,
  chartTitle,
  chartDropdownText,
  ChartComponent,
  legends,
  rekapTitle,
  rekapDropdownText,
  RekapChartComponent,
  rekapLegends,
}: ChartCardSectionProps) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {detailText && (
          <TouchableOpacity onPress={onDetailPress}>
            <Text style={styles.detail}>{detailText}</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Bar Chart Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{chartTitle}</Text>
        <TouchableOpacity style={styles.dropdownBox}>
          <Text style={styles.dropdownText}>{chartDropdownText}</Text>
        </TouchableOpacity>
        <View style={{marginTop: '10%'}}>{ChartComponent}</View>
        {/* Legend */}
        <View style={styles.legendRow}>
          {legends.map((l, i) => (
            <View style={styles.legendItem} key={i}>
              <View style={[styles.legendDot, {backgroundColor: l.color}]} />
              <Text style={styles.legendText}>{l.label}</Text>
            </View>
          ))}
        </View>
      </View>
      {/* Rekap Chart Section */}
      <View style={styles.section}>
        <View style={styles.rekapHeader}>
          <Text style={styles.sectionTitle}>{rekapTitle}</Text>
          <TouchableOpacity style={styles.dropdownBox}>
            <Text style={styles.dropdownText}>{rekapDropdownText}</Text>
          </TouchableOpacity>
        </View>
        {RekapChartComponent}
        {/* Legend */}
        <View style={styles.legendRow}>
          {rekapLegends.map((l, i) => (
            <View style={styles.legendItem} key={i}>
              <View style={[styles.legendDot, {backgroundColor: l.color}]} />
              <Text style={styles.legendText}>{l.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {fontSize: 17, fontWeight: 'bold', color: '#232323'},
  detail: {color: '#161414', fontSize: 14, fontWeight: '500'},
  section: {
    marginBottom: 16,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  sectionTitle: {
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
  rekapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
