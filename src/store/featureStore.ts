import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type DrawerTabKey = 'home' | 'activity' | 'attendance' | 'menu';
type DrawerMenuKey = string | null;

type FeatureStoreType = {
  activeTab: DrawerTabKey;
  setActiveTab: (tab: DrawerTabKey) => void;
  activeMenu: DrawerMenuKey;
  setActiveMenu: (key: DrawerMenuKey) => void;
  clear: () => void;
};

export const useFeatureStore = create<FeatureStoreType>()(set => ({
  activeTab: 'home',
  setActiveTab: tab => set({activeTab: tab}),
  activeMenu: 'absensi',
  setActiveMenu: key => set({activeMenu: key}),
  clear: () => set({activeTab: 'home', activeMenu: 'absensi'}),
}));
