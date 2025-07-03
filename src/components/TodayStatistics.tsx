import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Image, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');
type TodayStatisticsProps = {
  item?: any;
  row1?: any;
  row2?: any;
};

const TodayStatistics: React.FC<TodayStatisticsProps> = ({
  item,
  row1,
  row2,
}) => {
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
              style={[styles.statsItemLarge, {marginRight: i === 0 ? 12 : 0}]}
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
              style={[styles.statsItemSmall, {marginRight: i < 2 ? 12 : 0}]}>
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
};

const styles = StyleSheet.create({
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
});

export default TodayStatistics;
