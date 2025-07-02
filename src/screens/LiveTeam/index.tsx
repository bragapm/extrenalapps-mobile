import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import {useThemeStore} from '../../theme/useThemeStore';
import {MAPBOX_ACCESS_TOKEN} from '../../services/apiServices';
import {useIsFocused} from '@react-navigation/native';
import {useUserStore} from '../../store/userStore';

const {width, height} = Dimensions.get('window');

// Set token hanya sekali, di luar komponen
MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

const DEFAULT_COORDINATE = [106.8272, -6.1751];

const markers = [
  {
    id: '1',
    type: 'kantor_kepala_desa',
    title: 'Kantor Kepala Desa',
    image: require('../../assets/images/marker-kantorKepalaDesa.png'),
    coordinate: [106.84172, -6.485948],
    profile: {
      namaDesa: 'Bahari Jaya',
      kecamatan: 'Kusan Tengah',
      kabupaten: 'Tanah Bumbu',
      kepalaDesa: 'Bahari Jaya',
      telp: '08563827635',
      issues: {selesai: 8, onProgress: 8, total: 12},
      photos: [
        'https://images.unsplash.com/photo-1464983953574-0892a716854b',
        'https://images.unsplash.com/photo-1464983953574-0892a716854b',
        'https://images.unsplash.com/photo-1464983953574-0892a716854b',
        'https://images.unsplash.com/photo-1464983953574-0892a716854b',
      ],
    },
  },
  {
    id: '2',
    type: 'desa',
    title: 'Desa Satiung',
    image: require('../../assets/images/marker-desa.png'),
    coordinate: [106.8422, -6.4858], // geser dikit dari pakansari
    profile: {
      namaDesa: 'Desa Satiung',
      kecamatan: 'Kusan Tengah',
      kabupaten: 'Tanah Bumbu',
    },
  },
  {
    id: '3',
    type: 'employee_nonorganic',
    title: 'Karyawan Non Organic 1',
    image: require('../../assets/images/marker-employee-nonOrganic.png'),
    coordinate: [106.842, -6.4865],
  },
  {
    id: '4',
    type: 'employee_organic',
    title: 'Karyawan Organic 1',
    image: require('../../assets/images/marker-employee-organic.png'),
    coordinate: [106.8415, -6.4867],
  },
];

const LiveTeam: React.FC = () => {
  const {colors} = useThemeStore();
  const isFocused = useIsFocused(); // untuk pastikan hanya render saat aktif
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const userLocation = useUserStore(state => state.location);
  console.log('userLocation', userLocation);

  const coordinate = userLocation
    ? [userLocation.longitude, userLocation.latitude] // Mapbox pakai [lng, lat]
    : DEFAULT_COORDINATE;

  useEffect(() => {
    if (!isFocused) {
      setMapLoaded(false); // reset saat keluar dari screen
    }
  }, [isFocused]);

  const baseLng = 106.81443833333333;
  const baseLat = -6.473346666666667;

  const markersNearby = markers.filter(
    m =>
      Math.abs(m.coordinate[0] - baseLng) < 0.02 &&
      Math.abs(m.coordinate[1] - baseLat) < 0.02,
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {isFocused && (
        <View style={styles.mapContainer}>
          <MapboxGL.MapView
            scaleBarEnabled={false}
            style={styles.map}
            logoEnabled={false}
            attributionEnabled={false}
            onDidFinishLoadingMap={() => setMapLoaded(true)}
            styleURL="mapbox://styles/mapbox/satellite-v9">
            <MapboxGL.Camera zoomLevel={15} centerCoordinate={coordinate} />

            {mapLoaded &&
              markers.map(marker => (
                <MapboxGL.PointAnnotation
                  key={marker.id}
                  id={marker.id}
                  coordinate={marker.coordinate}
                  onSelected={() => setSelectedMarker(marker)}>
                  <Image
                    source={marker.image}
                    style={{width: 54, height: 54, resizeMode: 'contain'}} // lebih gede!
                  />
                </MapboxGL.PointAnnotation>
              ))}

            {/* User Location */}
            <MapboxGL.PointAnnotation id="me" coordinate={coordinate}>
              <View style={styles.marker} />
            </MapboxGL.PointAnnotation>
          </MapboxGL.MapView>
        </View>
      )}

      {/* Modal detail marker */}
      <Modal
        visible={!!selectedMarker}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedMarker(null)}>
        <View style={styles.modalBg}>
          <View style={styles.bottomSheet}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelectedMarker(null)}>
              <Text style={{fontSize: 24, fontWeight: 'bold'}}>×</Text>
            </TouchableOpacity>
            {/* Profile Detail */}
            {selectedMarker && selectedMarker.profile && (
              <View>
                {/* Gambar carousel */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{marginBottom: 12}}>
                  {selectedMarker.profile.photos?.map((url, idx) => (
                    <Image key={idx} source={{uri: url}} style={styles.photo} />
                  ))}
                </ScrollView>
                <Text style={styles.title}>{selectedMarker.title}</Text>
                <Text style={styles.subtitle}>
                  {selectedMarker.profile.namaDesa},{' '}
                  {selectedMarker.profile.kecamatan},{' '}
                  {selectedMarker.profile.kabupaten}
                </Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Kepala Desa:</Text>
                  <Text style={styles.bold}>
                    {selectedMarker.profile.kepalaDesa}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Nomer Telepon:</Text>
                  <Text style={styles.bold}>{selectedMarker.profile.telp}</Text>
                </View>
                <View style={styles.issueCard}>
                  <Text>
                    Issue Terselesaikan:{' '}
                    {selectedMarker.profile.issues?.selesai}/12
                  </Text>
                  <Text>
                    Issue On Progress:{' '}
                    {selectedMarker.profile.issues?.onProgress}/12
                  </Text>
                  <Text>
                    Jumlah Report: {selectedMarker.profile.issues?.total}/12
                  </Text>
                </View>
              </View>
            )}
            {/* Karyawan / marker lain */}
            {selectedMarker && !selectedMarker.profile && (
              <View style={{alignItems: 'center'}}>
                <Text style={styles.title}>{selectedMarker.title}</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  mapContainer: {
    flex: 1,
    margin: 0,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  map: {
    flex: 1,
    minHeight: height * 0.6,
  },
  marker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1F93FF',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    maxHeight: height * 0.7,
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 16,
    zIndex: 99,
  },
  title: {fontSize: 20, fontWeight: 'bold', marginVertical: 8},
  subtitle: {fontSize: 16, color: '#666'},
  row: {flexDirection: 'row', alignItems: 'center', marginVertical: 4},
  label: {color: '#888', marginRight: 8},
  bold: {fontWeight: 'bold'},
  issueCard: {
    marginTop: 12,
    backgroundColor: '#fdeaea',
    borderRadius: 8,
    padding: 12,
  },
  photo: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    resizeMode: 'cover',
  },
});

export default LiveTeam;
