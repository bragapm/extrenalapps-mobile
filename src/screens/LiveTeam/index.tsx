import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import {useThemeStore} from '../../theme/useThemeStore';
import {MAPBOX_ACCESS_TOKEN} from '../../services/apiServices';
import {useIsFocused} from '@react-navigation/native';

const {width, height} = Dimensions.get('window');

// Set token hanya sekali, di luar komponen
MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

const DEFAULT_COORDINATE = [106.8272, -6.1751];

const LiveTeam: React.FC = () => {
  const {colors} = useThemeStore();
  const isFocused = useIsFocused(); // untuk pastikan hanya render saat aktif
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setMapLoaded(false); // reset saat keluar dari screen
    }
  }, [isFocused]);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {isFocused && (
        <View style={styles.mapContainer}>
          <MapboxGL.MapView
            style={styles.map}
            logoEnabled={false}
            attributionEnabled={false}
            onDidFinishLoadingMap={() => setMapLoaded(true)}>
            <MapboxGL.Camera
              zoomLevel={12}
              centerCoordinate={DEFAULT_COORDINATE}
            />

            {mapLoaded && (
              <MapboxGL.PointAnnotation
                id="jakarta"
                coordinate={DEFAULT_COORDINATE}>
                <View style={styles.marker} />
              </MapboxGL.PointAnnotation>
            )}
          </MapboxGL.MapView>
        </View>
      )}
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
    backgroundColor: '#FF4848',
    borderWidth: 2,
    borderColor: '#FFF',
  },
});

export default LiveTeam;
