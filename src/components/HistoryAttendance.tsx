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
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useThemeStore} from '../theme/useThemeStore';
import {RootStackParamList} from '../navigation';
import {StackNavigationProp} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUserStore} from '../store/userStore';

const {width, height} = Dimensions.get('window');
type HistoryAttendanceProps = {
  item?: any;
};

const HistoryAttendance: React.FC<HistoryAttendanceProps> = ({item}) => {
  return (
    <>
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>{item?.title}</Text>
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
};
const styles = StyleSheet.create({
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
});

export default HistoryAttendance;
