import React from 'react';
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
  Image,
} from 'react-native';
import {useThemeStore} from '../../theme/useThemeStore';
import AppHeader from '../../components/AppHeader';
import HistoryAttendance from '../../components/HistoryAttendance';
import {dummyLiveAbsensi, dummyWorkPlanner} from '../../data/dummy';
import Svg, {G, Rect, Text as SvgText, TSpan, Path} from 'react-native-svg';
import {constants} from 'crypto';
import StackedBarChart from '../../components/StackedBarChart';
import GroupedBarChart from '../../components/GroupedBarChart';
import PieChart from '../../components/PieChart';

const employeePerformanceDummy = [
  {label: 'Land\nDispute', open: 4, close: 2},
  {label: 'Land\nDispute', open: 5, close: 3},
  {label: 'Land\nDispute', open: 5, close: 3},
  {label: 'Land\nDispute', open: 4, close: 2},
  {label: 'Land\nDispute', open: 6, close: 3},
];

const PIE_COLORS = [
  '#94DB26', // Land Dispute (hijau terang)
  '#E2DF34', // Land Compensation (kuning)
  '#F45D2F', // Land Use (merah-oranye)
  '#DF3B32', // Land Tenure (merah tua)
];

const pieDataDummy = [
  {key: 'Land Dispute', value: 20, color: PIE_COLORS[0]},
  {key: 'Land Compensation', value: 40, color: PIE_COLORS[1]},
  {key: 'Land Use', value: 40, color: PIE_COLORS[2]},
  {key: 'Land Tenure', value: 20, color: PIE_COLORS[3]},
];
const pieData = [
  {value: 20, color: PIE_COLORS[0], label: 'Land Dispute'},
  {value: 10, color: PIE_COLORS[1], label: 'Land Compensation'},
  {value: 60, color: PIE_COLORS[2], label: 'Land Use'},
  {value: 10, color: PIE_COLORS[3], label: 'Land Tenure'},
];

const barChartData = [
  {label: 'Priya', values: [6, 3], colors: ['#1B7EDF', '#20D372']}, // [hadir, tidak hadir]
  {label: 'Nair', values: [12, 5], colors: ['#1B7EDF', '#20D372']},
  {label: 'Ilam', values: [9, 3], colors: ['#1B7EDF', '#20D372']},
  {label: 'Aprilia', values: [8, 3], colors: ['#1B7EDF', '#20D372']},
  {label: 'Tintin', values: [9, 3], colors: ['#1B7EDF', '#20D372']},
];

const BAR_CHART_COLORS = {
  selesai: '#FFD9A2', // kuning muda
  ongoing: '#FF8727', // orange terang
};

const BarChart = ({data}) => {
  const chartWidth = 320; // Lebarkan biar label muat
  const chartHeight = 230;
  const paddingLeft = 24;
  const paddingBottom = 56;
  const paddingTop = 28;
  const barWidth = 12;
  const groupGap = 54; // jarak antar kategori
  const barGap = 10; // jarak antar bar dalam kategori
  const maxY = Math.max(...data.map(d => Math.max(d.selesai, d.ongoing)), 32);

  return (
    <View
      style={{
        backgroundColor: '#F9F8F6',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ECECEC',
        marginTop: 22,
        padding: 20,
      }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}>
        <Text style={{fontSize: 19, fontWeight: 'bold', color: '#1A1919'}}>
          Report Status
        </Text>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
            paddingHorizontal: 10,
            paddingVertical: 3,
            backgroundColor: '#F8F8F8',
            borderRadius: 7,
            borderWidth: 1,
            borderColor: '#ECECEC',
          }}>
          <Text style={{color: '#989898', fontWeight: '500'}}>Filter</Text>
          <Text style={{color: '#BDBDBD', fontSize: 13}}>▼</Text>
        </TouchableOpacity>
      </View>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Garis grid dan Y-axis */}
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
        {/* Bars & Label */}
        {data.map((d, i) => {
          const baseY = chartHeight - paddingBottom;
          const selesaiH =
            (d.selesai / maxY) * (chartHeight - paddingTop - paddingBottom);
          const ongoingH =
            (d.ongoing / maxY) * (chartHeight - paddingTop - paddingBottom);
          // Kelompok bar di tengah label, jadi label bukan di satu bar
          const groupX =
            paddingLeft + i * groupGap + i * barWidth + i * barGap + 8;
          // Untuk label multi line
          const [label1, label2] = d.label.split(' ');

          return (
            <G key={i}>
              {/* Selesai (kiri) */}
              <Rect
                x={groupX}
                y={baseY - selesaiH}
                width={barWidth}
                height={selesaiH}
                fill={BAR_CHART_COLORS.selesai}
                rx={4}
              />
              {/* On Going (kanan) */}
              <Rect
                x={groupX + barWidth + barGap}
                y={baseY - ongoingH}
                width={barWidth}
                height={ongoingH}
                fill={BAR_CHART_COLORS.ongoing}
                rx={4}
              />
              {/* Label bawah, di tengah antara dua bar */}
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
      {/* Legend */}
      <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 18}}>
        {/* Selesai */}
        <View
          style={{flexDirection: 'row', alignItems: 'center', marginRight: 26}}>
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              backgroundColor: BAR_CHART_COLORS.selesai,
              marginRight: 7,
            }}
          />
          <Text style={{fontSize: 16, color: '#888', fontWeight: '500'}}>
            Selesai
          </Text>
        </View>
        {/* On Going */}
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              backgroundColor: BAR_CHART_COLORS.ongoing,
              marginRight: 7,
            }}
          />
          <Text style={{fontSize: 16, color: '#888', fontWeight: '500'}}>
            On Going
          </Text>
        </View>
      </View>
    </View>
  );
};

const DashboardReport = ({role, sections}) => {
  const screenWidth = Dimensions.get('window').width;
  const imageWidth = screenWidth * 0.85;
  const imageHeight = imageWidth * (115 / screenWidth);
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();

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
    if (item.type === 'report-admin') {
      return (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Laporan</Text>
            <TouchableOpacity>
              <Text style={styles.summaryDetail}>Lihat detail &gt;</Text>
            </TouchableOpacity>
          </View>
          {/* <StackedBarChart
            data={employeePerformanceDummy}
            maxY={14}
            height={250}
          /> */}

          <View
            style={{
              backgroundColor: '#F9F8F6',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#ECECEC',
              marginTop: 22,
              padding: 20,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}>
              <Text
                style={{fontSize: 19, fontWeight: 'bold', color: '#1A1919'}}>
                Report Issue Summary
              </Text>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  backgroundColor: '#F8F8F8',
                  borderRadius: 7,
                  borderWidth: 1,
                  borderColor: '#ECECEC',
                }}>
                <Text style={{color: '#989898', fontWeight: '500'}}>
                  Filter
                </Text>
                <Text style={{color: '#BDBDBD', fontSize: 13}}>▼</Text>
              </TouchableOpacity>
            </View>
            <GroupedBarChart
              data={employeePerformanceDummy}
              maxY={10} // set maxY biar sesuai nilai maksimal
              height={250} // bisa diubah sesuai kebutuhan, biasanya 120-150
            />
          </View>

          <View
            style={{
              backgroundColor: '#F9F8F6',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#ECE8E1',
              padding: 18,
              marginTop: 12,
              alignItems: 'center',
              justifyContent: 'space-between',
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
                <Text style={{color: '#989898', fontWeight: '500'}}>
                  Tahunan
                </Text>
                <Text style={{color: '#BDBDBD', fontSize: 13}}>▼</Text>
              </TouchableOpacity>
            </View>
            {/* Pie Chart */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
              }}>
              <PieChart data={pieData} size={140} />
              <View
                style={{
                  flex: 1,
                  marginLeft: 15,
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    width: 185, // Atur lebar supaya muat 2 kolom
                  }}>
                  {/* Kolom 1 - Summary Data & Land Dispute + Land Use */}
                  <View style={{width: '50%'}}>
                    <Text
                      style={{
                        color: '#4F4D4A',
                        fontSize: 11,
                        marginBottom: 2,
                        fontWeight: '400',
                      }}>
                      Summary Data
                    </Text>
                    <Text
                      style={{
                        color: '#161414',
                        fontSize: 24,
                        fontWeight: '700',
                        marginBottom: 8,
                      }}>
                      48
                    </Text>
                    {/* Land Dispute */}
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
                          backgroundColor: '#90D637',
                          borderRadius: 3,
                          marginRight: 8,
                        }}
                      />
                      <View>
                        <Text
                          style={{
                            color: '#4F4D4A',
                            fontSize: 13,
                            fontWeight: '400',
                          }}>
                          Land Dispute
                        </Text>
                        <Text
                          style={{
                            color: '#161414',
                            fontSize: 16,
                            fontWeight: '600',
                          }}>
                          {pieDataDummy[0].value}
                        </Text>
                      </View>
                    </View>
                    {/* Land Use */}
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <View
                        style={{
                          width: 4,
                          height: 28,
                          backgroundColor: '#DBD733',
                          borderRadius: 3,
                          marginRight: 8,
                        }}
                      />
                      <View>
                        <Text
                          style={{
                            color: '#4F4D4A',
                            fontSize: 13,
                            fontWeight: '400',
                          }}>
                          Land Use
                        </Text>
                        <Text
                          style={{
                            color: '#161414',
                            fontSize: 16,
                            fontWeight: '600',
                          }}>
                          {pieDataDummy[2].value}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {/* Kolom 2 - Land Compensation & Land Tenure */}
                  <View style={{width: '50%', paddingLeft: 10}}>
                    {/* Land Compensation */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 42,
                        marginBottom: 12,
                      }}>
                      <View
                        style={{
                          width: 4,
                          height: 28,
                          backgroundColor: '#E44C41',
                          borderRadius: 3,
                          marginRight: 8,
                        }}
                      />
                      <View>
                        <Text
                          style={{
                            color: '#4F4D4A',
                            fontSize: 13,
                            fontWeight: '400',
                          }}>
                          Land Compensation
                        </Text>
                        <Text
                          style={{
                            color: '#161414',
                            fontSize: 16,
                            fontWeight: '600',
                          }}>
                          {pieDataDummy[1].value}
                        </Text>
                      </View>
                    </View>
                    {/* Land Tenure */}
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <View
                        style={{
                          width: 4,
                          height: 28,
                          backgroundColor: '#EF5934',
                          borderRadius: 3,
                          marginRight: 8,
                        }}
                      />
                      <View>
                        <Text
                          style={{
                            color: '#4F4D4A',
                            fontSize: 13,
                            fontWeight: '400',
                          }}>
                          Land Tenure
                        </Text>
                        <Text
                          style={{
                            color: '#161414',
                            fontSize: 16,
                            fontWeight: '600',
                          }}>
                          {pieDataDummy[3].value}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                marginTop: 20,
                width: '100%',
                flexWrap: 'wrap',
              }}>
              {/* Land Dispute */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 18,
                  marginVertical: '2%',
                }}>
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    backgroundColor: '#94DB26', // hijau terang
                    marginRight: 7,
                  }}
                />
                <Text style={{fontSize: 15, color: '#555', fontWeight: '500'}}>
                  Land Dispute
                </Text>
              </View>
              {/* Land Compensation */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 18,
                }}>
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    backgroundColor: '#E2DF34', // kuning
                    marginRight: 7,
                  }}
                />
                <Text style={{fontSize: 15, color: '#555', fontWeight: '500'}}>
                  Land Compensation
                </Text>
              </View>
              {/* Land Use */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 18,
                }}>
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    backgroundColor: '#F45D2F', // orange
                    marginRight: 7,
                  }}
                />
                <Text style={{fontSize: 15, color: '#555', fontWeight: '500'}}>
                  Land Use
                </Text>
              </View>
              {/* Land Tenure */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 0,
                }}>
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    backgroundColor: '#DF3B32', // merah tua
                    marginRight: 7,
                  }}
                />
                <Text style={{fontSize: 15, color: '#555', fontWeight: '500'}}>
                  Land Tenure
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              backgroundColor: '#F9F8F6',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#ECECEC',
              marginTop: 22,
              padding: 20,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}>
              <Text
                style={{fontSize: 19, fontWeight: 'bold', color: '#1A1919'}}>
                Report Status
              </Text>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  backgroundColor: '#F8F8F8',
                  borderRadius: 7,
                  borderWidth: 1,
                  borderColor: '#ECECEC',
                }}>
                <Text style={{color: '#989898', fontWeight: '500'}}>
                  Filter
                </Text>
                <Text style={{color: '#BDBDBD', fontSize: 13}}>▼</Text>
              </TouchableOpacity>
            </View>
            <StackedBarChart
              data={barChartData}
              maxY={14}
              height={250}
              chartWidthPerBar={80}
              // barWidth={24}        // Opsional, lebar bar
              // chartWidthPerBar={42} // Opsional, jarak antar bar
              // labelColor="#333"     // Opsional, warna label bawah
            />
          </View>
        </View>
      );
    }
    if (item.type === 'work-planner-admin') {
      const badgeColors = {
        perjadin: {border: '#545454', text: '#545454', bg: '#fff'},
        sakit: {border: '#FDB813', text: '#FDB813', bg: '#fff'},
        cuti: {border: '#21C067', text: '#21C067', bg: '#fff'},
        hadir: {border: '#2996F5', text: '#2996F5', bg: '#fff'},
      };
      return (
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.headerText}>Rencana Kerja - Hari Ini</Text>
            <TouchableOpacity>
              <Text style={styles.detailLink}>Lihat detail &gt;</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={dummyWorkPlanner}
            keyExtractor={(item, idx) => item.name + idx}
            renderItem={({item}) => {
              const color =
                badgeColors[item.statusType] || badgeColors['hadir'];
              return (
                <View style={styles.itemRow}>
                  <View>
                    <Text style={styles.nameText}>
                      {' '}
                      {item.name.length > 27
                        ? item.name.slice(0, 27) + '...'
                        : item.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 3,
                      }}>
                      <Image
                        source={require('../../assets/icons/ic-stackeHolder-disable.png')}
                        style={{width: 18, height: 18, marginRight: 6}}
                        resizeMode="contain"
                      />
                      <Text style={styles.jabatanText}>
                        {item.jabatan} - iSafe Number
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      alignSelf: 'flex-end',
                    }}>
                    <TouchableOpacity>
                      <Text style={styles.detailPlanner}>
                        Lihat detail &gt;
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            ItemSeparatorComponent={() => <View style={{height: 12}} />}
          />
        </View>
      );
    }
    return null;
  };

  return (
    <>
      <FlatList
        data={sections}
        keyExtractor={(item, idx) => item.type + idx}
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 50}}
        ListHeaderComponent={ListHeaderComponent}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    alignItems: 'center',
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
  card: {
    width: '94%',
    alignSelf: 'center',
    // backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 5,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingVertical: 20,
    paddingHorizontal: 16,
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
  detailPlanner: {color: '#161414', fontSize: 14, fontWeight: '400'},
});

export default DashboardReport;
