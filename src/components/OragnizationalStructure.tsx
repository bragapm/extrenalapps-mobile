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

type OragnizationalStructureProps = {
  item?: any;
};

const OragnizationalStructure: React.FC<OragnizationalStructureProps> = ({
  item,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const imageWidth = screenWidth * 0.85; // 85% dari lebar layar
  const imageHeight = imageWidth * (115 / screenWidth);
  return (
    <View style={styles.orgCard}>
      <View style={styles.orgHeader}>
        <Text style={styles.orgTitle}>{item.title}</Text>
        <TouchableOpacity>
          <Text style={styles.orgDetailLink}>Lihat detail &gt;</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.orgChart}>
        <Image
          source={require('../assets/images/dummy-orgchart.png')}
          style={{
            width: '100%',
            height: imageHeight * 2,
            borderRadius: 10,
            paddingVertical: '3%',
          }}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
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
});

export default OragnizationalStructure;
