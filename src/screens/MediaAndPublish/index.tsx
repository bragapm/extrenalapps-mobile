import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  useColorScheme,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
  ScrollView,
} from 'react-native';
import {useThemeStore} from '../../theme/useThemeStore';
import AppHeader from '../../components/AppHeader';

type MediaAndPublishProps = {
  home?: boolean;
  liveTeam?: boolean;
  menu?: boolean;
  location?: string;
  label?: string;
};

const MediaAndPublish: React.FC<MediaAndPublishProps> = ({}) => {
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();
  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={[styles.container, {backgroundColor: colors.bgHome}]}>
        <AppHeader menu={true} home={false} label={'Publikasi dan Media'} />
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
            <Text style={{color: '#181818', fontSize: 27, fontWeight: '700'}}>
              Publikasi dan Media
            </Text>

            <Text
              style={{
                color: '#7C7672',
                fontSize: 14,
                marginTop: 2,
                fontWeight: '400',
              }}>
              Pantau dan kelola seluruh aktivitas publikasi dan media.
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center'},
});

export default MediaAndPublish;
