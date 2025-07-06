import React, {useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import {useFeatureStore} from '../store/featureStore';

type DrawerTabKey = 'home' | 'activity' | 'attendance' | 'menu';

interface MenuItem {
  key: string;
  label: string;
  highlight?: boolean;
}

interface MenuDataItem {
  items: MenuItem[];
}

type MenuData = Record<DrawerTabKey, MenuDataItem>;

interface MenuDrawerProps {
  visible: boolean;
  onClose: () => void;
  type?: DrawerTabKey;
  onMenuChange?: (key: string) => void;
}

const tabIcons: Record<DrawerTabKey, ImageSourcePropType> = {
  home: require('../assets/icons/home-enable.png'),
  activity: require('../assets/icons/aktifitas-enable.png'),
  attendance: require('../assets/icons/absensi-enable.png'),
  menu: require('../assets/icons/menu-enable.png'),
};

const tabLabels: Record<DrawerTabKey, string> = {
  home: 'Dashboard',
  activity: 'Aktifitas',
  attendance: 'Absensi',
  menu: 'More',
};

const menuData: MenuData = {
  home: {
    items: [
      {key: 'absensi', label: 'Absensi'},
      {key: 'laporan', label: 'Laporan'},
    ],
  },
  activity: {
    items: [
      {key: 'harian', label: 'Aktifitas Harian'},
      {key: 'mingguan', label: 'Mingguan/Bulanan'},
      {key: 'laporan', label: 'Laporan'},
    ],
  },
  attendance: {
    items: [
      {key: 'absen', label: 'Absen'},
      {key: 'cuti', label: 'Cuti'},
      {key: 'perdin', label: 'Perjalanan Dinas'},
    ],
  },
  menu: {
    items: [
      {key: 'stakeholder', label: 'Stakeholder'},
      {key: 'publikasi', label: 'Media & Publikasi'},
    ],
  },
};

const MenuDrawer: React.FC<MenuDrawerProps> = ({
  visible,
  onClose,
  type = 'home',
  onMenuChange,
}) => {
  const activeMenu = useFeatureStore(state => state.activeMenu);
  const setActiveMenu = useFeatureStore(state => state.setActiveMenu);

  const items = menuData[type]?.items || [];
  const icon = tabIcons[type] || tabIcons['home'];
  const label = tabLabels[type] || tabLabels['home'];

  // Pastikan selalu ada active menu setiap drawer dibuka
  useEffect(() => {
    if (!visible) return;
    // Apakah activeMenu cocok dengan tab sekarang?
    const found = items.find(item => item.key === activeMenu);
    if (!found && items.length > 0) {
      // Fallback: set menu pertama (atau bisa pakai yang highlight)
      setActiveMenu(items[0].key);
      if (onMenuChange) onMenuChange(items[0].key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, type, items, activeMenu]);

  // Nilai yang di-highlight
  const currentActiveMenu = items.find(item => item.key === activeMenu)
    ? activeMenu
    : items[0]?.key;

  const handleMenuPress = (key: string) => {
    setActiveMenu(key);
    if (onMenuChange) onMenuChange(key);
  };

  if (!visible) return null;
  return (
    <View style={styles.backdrop}>
      <View style={styles.sheet}>
        {/* TOP: Icon + Label + Chevron */}
        <View style={styles.headerRow}>
          <View style={styles.iconLabel}>
            <Image source={icon} style={styles.tabIcon} />
            <Text style={styles.tabLabel}>{label}</Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={16}>
            <Image
              source={require('../assets/images/chev-down.png')}
              style={styles.chevronDown}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        {/* MENU ITEMS */}
        <View style={{marginTop: 22}}>
          {items.map((item, i) => {
            const isActive = item.key === currentActiveMenu;
            return (
              <TouchableOpacity
                key={item.key || i}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => handleMenuPress(item.key)}>
                <Text
                  style={[styles.menuText, isActive && styles.menuTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.23)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  sheet: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 24,
    paddingHorizontal: 0,
    paddingBottom: 32,
    minHeight: 240,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 18,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tabIcon: {
    width: 26,
    height: 26,
    marginRight: 14,
    tintColor: '#E24B3B',
  },
  tabLabel: {
    fontSize: 19,
    fontWeight: '600',
    color: '#E24B3B',
  },
  chevronDown: {
    width: 32,
    height: 32,
    tintColor: '#DB555A',
    marginLeft: 10,
  },
  menuItem: {
    paddingVertical: 14,
    borderRadius: 10,
    paddingHorizontal: 25,
    marginBottom: 6,
    width: '100%',
  },
  menuItemActive: {
    backgroundColor: '#FFEDEE',
    width: '100%',
  },
  menuText: {fontSize: 17, color: '#232323', fontWeight: '400'},
  menuTextActive: {color: '#E24B3B', fontWeight: '500'},
});
export default MenuDrawer;
