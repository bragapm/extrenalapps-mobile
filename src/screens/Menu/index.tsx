import React from 'react';
import {View, Button, StyleSheet} from 'react-native';
import {useThemeStore} from '../../theme/useThemeStore';
import {useFeatureStore} from '../../store/featureStore';
import MediaAndPublish from '../MediaAndPublish';
import Stakeholder from '../Stakeholder';

const MenuScreen: React.FC = () => {
  const {toggleTheme, mode, colors} = useThemeStore();
  const activeMenu = useFeatureStore(state => state.activeMenu);

  return (
    <>{activeMenu === 'stakeholder' ? <Stakeholder /> : <MediaAndPublish />}</>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});

export default MenuScreen;
