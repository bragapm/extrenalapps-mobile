import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import {useThemeStore} from '../../theme/useThemeStore';
import {MAPBOX_ACCESS_TOKEN} from '../../services/apiServices';
import {useIsFocused} from '@react-navigation/native';
import {useUserStore} from '../../store/userStore';
import AppHeader from '../../components/AppHeader';
import FastImage from 'react-native-fast-image';



const {width, height} = Dimensions.get('window');

// Set token hanya sekali, di luar komponen
MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

const DEFAULT_COORDINATE = [106.8272, -6.1751];

const markers: Marker[] = [
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
      images: {
        images1: '../../assets/images/sample1.png',
        images2: '../../assets/images/sample2.png',
      },
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
    name: 'Gugun Gunawan',
    photo: '../../assets/images/sample3.png',
    jabatan: 'Manager Site',
    organisasi: 'Non Orgranic',
    address: 'Jl. Kaler Rimbe Desa. Kalimalang',
  },
  {
    id: '4',
    type: 'employee_organic',
    title: 'Karyawan Organic 1',
    image: require('../../assets/images/marker-employee-organic.png'),
    coordinate: [106.8415, -6.4867],
    name: 'Sultan Gunawan',
    photo: '../../assets/images/sample3.png',
    jabatan: 'Manager Marketing',
    organisasi: 'Orgranic',
    address: 'Jl. Kaler Rimbe Desa. Kalimalang',
  },
];

interface MarkerProfile {
  namaDesa: string;
  kecamatan: string;
  kabupaten: string;
  kepalaDesa?: string;
  telp?: string;
  issues?: {
    selesai?: number;
    onProgress?: number;
    total?: number;
  };
  images?: {
    images1?: any;
    images2?: any;
  };
}

interface Marker {
  id: string;
  type: string;
  title: string;
  image: any;
  coordinate: [number, number];
  profile?: MarkerProfile;
  photo?: any;
  name?: string;
  organisasi?: string;
  jabatan?: string;
  address?: string;
}
const LiveTeam: React.FC = () => {
  const {colors} = useThemeStore();
  const isFocused = useIsFocused(); // untuk pastikan hanya render saat aktif
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
  const userLocation = useUserStore(state => state.location);

  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const coordinate: any = userLocation
    ? [userLocation.longitude, userLocation.latitude] // Mapbox pakai [lng, lat]
    : DEFAULT_COORDINATE;

  const [centerCoord, setCenterCoord] = useState<[number, number]>(coordinate);
  const [locationName, setLocationName] = useState('');
  console.log('locationName', locationName);

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

  

  useEffect(() => {
    const fetchLocationName = async () => {
      const [longitude, latitude] = centerCoord;
      // Ganti MAPBOX_TOKEN dengan token kamu!
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?types=place,region&language=id&access_token=${MAPBOX_ACCESS_TOKEN}`;
      try {
        const response = await fetch(url);
        const json = await response.json();
        // Ambil context kota, provinsi
        let city = '';
        let province = '';
        if (json.features && json.features.length > 0) {
          type Feature = {place_type: string[]; text: string};
          for (const feature of json.features as Feature[]) {
            if (feature.place_type?.includes('place')) city = feature.text;
            if (feature.place_type?.includes('region')) province = feature.text;
          }
        }

        setLocationName(
          [city, province].filter(v => v && v.length > 0).join(', '),
        );
      } catch (e) {
        setLocationName('');
      }
    };
    fetchLocationName();
  }, [centerCoord]);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <AppHeader home={false} liveTeam={true} location={locationName} />
      {isFocused && (
        <View style={styles.mapContainer}>
          <TouchableOpacity
            style={styles.centerButton}
            onPress={() => {
              // trigger camera to user location/default
              cameraRef.current?.setCamera({
                centerCoordinate: coordinate,
                zoomLevel: 15,
                animationDuration: 600,
              });
            }}>
            <View style={styles.centerButtonBg}>
              <Image
                source={require('../../assets/icons/ic-location.png')}
                style={{width: 32, height: 32}}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
          <MapboxGL.MapView
            scaleBarEnabled={false}
            style={styles.map}
            logoEnabled={false}
            attributionEnabled={false}
            onDidFinishLoadingMap={() => setMapLoaded(true)}
            styleURL="mapbox://styles/mapbox/satellite-v9"
            onRegionDidChange={async region => {
              // Dapatkan koordinat center terbaru
              const center: any = await mapRef.current?.getCenter(); // pastikan mapRef = useRef(null)
              if (center) setCenterCoord(center);
            }}
            ref={mapRef}>
            <MapboxGL.Camera
              ref={cameraRef}
              zoomLevel={15}
              centerCoordinate={coordinate}
            />

            {mapLoaded === true
              ? markers.map(marker => (
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
                ))
              : null}

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
          <View
            style={{
              ...styles.bottomSheet,
              height:
                selectedMarker?.type === 'kantor_kepala_desa'
                  ? height * 0.8
                  : 'auto',
            }}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelectedMarker(null)}>
              <Text style={{fontSize: 34, fontWeight: '300', color: '#B4B4AF'}}>
                ×
              </Text>
            </TouchableOpacity>
            {/* Profile Detail */}

            {selectedMarker && selectedMarker.profile && (
              <View>
                {/* Gambar carousel */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  }}>
                  <Image
                    source={require('../../assets/icons/icon-kantor-kepdes.png')}
                    style={{
                      marginRight: '2%',
                      height: 25,
                      width: 25,
                    }}
                  />
                  <Text style={styles.title}>
                    {selectedMarker?.type === 'kantor_kepala_desa'
                      ? 'Profile Desa'
                      : selectedMarker.title}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: '#C3C3BF',
                    borderWidth: 1,
                    marginBottom: '5%',
                    borderColor: '#C3C3BF',
                    marginTop: '2%',
                  }}
                />
                <Image
                  source={require('../../assets/images/sample1.png')}
                  style={{
                    width: '100%',
                    height: height * 0.2,
                    borderRadius: 8,
                    marginBottom: '1%',
                  }}
                  resizeMode="cover"
                />
                {/* FOTO THUMBNAIL */}
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 8,
                    justifyContent: 'center',
                    marginBottom: '2%',
                    paddingHorizontal: '2%',
                  }}>
                  <Image
                    source={require('../../assets/images/sample2.png')}
                    style={styles.thumbPhoto}
                  />
                  <Image
                    source={require('../../assets/images/sample2.png')}
                    style={styles.thumbPhoto}
                  />
                  <Image
                    source={require('../../assets/images/sample2.png')}
                    style={styles.thumbPhoto}
                  />
                </View>
                {/*  */}

                <Text style={styles.subtitle}>
                  {selectedMarker.profile.namaDesa},{' '}
                  {selectedMarker.profile.kecamatan},{' '}
                  {selectedMarker.profile.kabupaten}
                </Text>
                <Text
                  style={{fontWeight: '400', fontSize: 14, color: '#4F4D4A'}}>
                  Kecamatan {selectedMarker.profile.kecamatan}
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    marginTop: '3%',
                    marginLeft: '2%',
                  }}>
                  <View
                    style={{
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                    }}>
                    <Image
                      source={require('../../assets/images/kepdes.png')}
                      style={{
                        width: 35,
                        height: 35,
                      }}
                      resizeMode="contain"
                    />
                    <View
                      style={{
                        marginTop: '3%',
                      }}>
                      <Text
                        style={{
                          fontWeight: '400',
                          color: '#777674',
                          fontSize: 12,
                        }}>
                        Kepala Desa
                      </Text>
                      <Text
                        style={{
                          fontWeight: '600',
                          color: '#161414',
                          fontSize: 14,
                        }}>
                        {selectedMarker.profile.kepalaDesa}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                      marginLeft: '10%',
                    }}>
                    <Image
                      source={require('../../assets/images/call.png')}
                      style={{width: 35, height: 35}}
                      resizeMode="contain"
                    />
                    <View
                      style={{
                        marginTop: '3%',
                      }}>
                      <Text
                        style={{
                          fontWeight: '400',
                          color: '#777674',
                          fontSize: 12,
                        }}>
                        Nomer Telepon
                      </Text>
                      <Text
                        style={{
                          fontWeight: '600',
                          color: '#161414',
                          fontSize: 14,
                        }}>
                        {selectedMarker.profile.telp}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text
                  style={{
                    fontWeight: '500',
                    color: '#4F4D4A',
                    fontSize: 16,
                    marginTop: '5%',
                    marginBottom: '2%',
                  }}>
                  Issue
                </Text>

                <View
                  style={{
                    width: '100%',
                    paddingHorizontal: '3%',
                    paddingVertical: '3%',
                    backgroundColor: '#F4F3F1',
                    borderRadius: 8,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    {/*  */}
                    <View
                      style={{
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                      }}>
                      <Image
                        source={require('../../assets/images/solveIssue.png')}
                        style={{width: 35, height: 35}}
                        resizeMode="contain"
                      />
                      <View
                        style={{
                          marginLeft: '5%',
                        }}>
                        <Text
                          style={{
                            fontWeight: '400',
                            color: '#777674',
                            fontSize: 12,
                          }}>
                          Issue Terselesaikan
                        </Text>
                        <Text
                          style={{
                            fontWeight: '600',
                            color: '#161414',
                            fontSize: 14,
                          }}>
                          {selectedMarker.profile.issues?.selesai}/12
                        </Text>
                      </View>
                    </View>
                    {/*  */}

                    <View
                      style={{
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                      }}>
                      <Image
                        source={require('../../assets/images/issueOnProgress.png')}
                        style={{width: 35, height: 35}}
                        resizeMode="contain"
                      />
                      <View
                        style={{
                          marginLeft: '5%',
                        }}>
                        <Text
                          style={{
                            fontWeight: '400',
                            color: '#777674',
                            fontSize: 12,
                          }}>
                          Issue On Progress
                        </Text>
                        <Text
                          style={{
                            fontWeight: '600',
                            color: '#161414',
                            fontSize: 14,
                          }}>
                          {selectedMarker.profile.issues?.onProgress}/12
                        </Text>
                      </View>
                    </View>
                    {/*  */}
                    <View
                      style={{
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                      }}>
                      <Image
                        source={require('../../assets/images/report.png')}
                        style={{width: 35, height: 35}}
                        resizeMode="contain"
                      />
                      <View
                        style={{
                          marginLeft: '5%',
                        }}>
                        <Text
                          style={{
                            fontWeight: '400',
                            color: '#777674',
                            fontSize: 12,
                          }}>
                          Jumlah Report
                        </Text>
                        <Text
                          style={{
                            fontWeight: '600',
                            color: '#161414',
                            fontSize: 14,
                          }}>
                          {selectedMarker.profile.issues?.total}/12
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}
            {/* Karyawan / marker lain */}
            {selectedMarker && !selectedMarker.profile && (
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  }}>
                  <Image
                    source={require('../../assets/icons/icon-personel.png')}
                    style={{
                      marginRight: '2%',
                      height: 25,
                      width: 25,
                    }}
                  />
                  <Text style={styles.title}>Profile Personil</Text>
                </View>
                <View
                  style={{
                    backgroundColor: '#C3C3BF',
                    borderWidth: 1,
                    marginBottom: '5%',
                    borderColor: '#C3C3BF',
                    marginTop: '2%',
                  }}
                />

                <Image
                  source={require('../../assets/images/sample3.png')}
                  style={{
                    width: '100%',
                    height: height * 0.35,
                    borderRadius: 8,
                    marginBottom: '1%',
                  }}
                  resizeMode="cover"
                />
                <Text
                  style={{
                    fontWeight: '500',
                    fontSize: 18,
                    color: '#161414',
                    paddingVertical: '2%',
                  }}>
                  {selectedMarker?.name}
                </Text>

                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    paddingVertical: '3%',
                    paddingBottom: '5%',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                    }}>
                    <Text
                      style={{
                        fontWeight: '400',
                        fontSize: 16,
                        color: '#4F4D4A',
                      }}>
                      Jabatan:
                    </Text>
                    <Text
                      style={{
                        fontWeight: '400',
                        fontSize: 16,
                        color: '#4F4D4A',
                      }}>
                      {' '}
                      {selectedMarker?.jabatan}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                    }}>
                    <Text
                      style={{
                        fontWeight: '400',
                        fontSize: 16,
                        color: '#4F4D4A',
                      }}>
                      Organisasi:
                    </Text>
                    <Text
                      style={{
                        fontWeight: '400',
                        fontSize: 16,
                        color: '#4F4D4A',
                      }}>
                      {' '}
                      {selectedMarker?.organisasi}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                    }}>
                    <Text
                      style={{
                        fontWeight: '400',
                        fontSize: 16,
                        color: '#4F4D4A',
                      }}>
                      Alamat:
                    </Text>
                    <Text
                      style={{
                        fontWeight: '400',
                        fontSize: 16,
                        color: '#4F4D4A',
                      }}>
                      {' '}
                      {selectedMarker?.address}
                    </Text>
                  </View>
                </View>
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
    maxHeight: height * 1,
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 16,
    zIndex: 99,
  },
  title: {fontSize: 20, fontWeight: '500', marginVertical: 8},
  subtitle: {fontSize: 16, color: '#4F4D4A', fontWeight: '500'},
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
  thumbPhoto: {
    width: width * 0.286,
    height: height * 0.14,
    borderRadius: 8,
    marginRight: 7,
    resizeMode: 'contain',
  },
  centerButton: {
    position: 'absolute',
    bottom: 120,
    left: 10,
    zIndex: 10,
  },
  centerButtonBg: {
    backgroundColor: 'rgba(200,200,200,0.6)', // biar soft blur seperti contoh
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LiveTeam;
