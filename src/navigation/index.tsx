import React, { useState, useRef } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  Theme as NavTheme,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useThemeStore } from "../theme/useThemeStore";
import Modal from "react-native-modal";

// Dummy screens

import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  useColorScheme,
} from "react-native";

// Ganti path sesuai lokasi gambar
import HomeActive from "../assets/icons/home-enable.png";
import HomeInactive from "../assets/icons/home-disable.png";
import TeamActive from "../assets/icons/liveTeam-enable.png";
import TeamInactive from "../assets/icons/liveTeam-disable.png";
import MenuActive from "../assets/icons/menu-enable.png";
import MenuInactive from "../assets/icons/menu-disable.png";
import HomeScreen from "../screens/HomeScreen";
import LiveTeam from "../screens/LiveTeam";
import MenuScreen from "../screens/Menu";
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/Login";

export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
  Login: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const colorScheme = useColorScheme();
  const { toggleTheme, mode, colors } = useThemeStore();
  const [showMenu, setShowMenu] = useState(false);
  const [openAktifitas, setOpenAktifitas] = useState(false);
  const [openMasterData, setOpenMasterData] = useState(false);

  const icons: any = {
    home: {
      active: require("../assets/icons/home-enable.png"),
      dark: require("../assets/icons/home-disable.png"),
      light: require("../assets/icons/home-disable-dark.png"),
    },
    liveTeam: {
      active: require("../assets/icons/liveTeam-enable.png"),
      dark: require("../assets/icons/liveTeam-disable.png"),
      light: require("../assets/icons/liveteam-disable-dark.png"),
    },
    menuTabs: {
      active: require("../assets/icons/menu-enable.png"),
      dark: require("../assets/icons/menu-disable.png"),
      light: require("../assets/icons/menu-disable-dark.png"),
    },
    chevronDown: require("../assets/images/chev-down.png"), // ganti sesuai path
    chevronUp: require("../assets/images/chevronUp.png"),
  };

  const getTabIcon = (focused: boolean, type: string) => (
    <Image
      source={
        focused
          ? icons[type].active
          : colorScheme !== "dark"
          ? icons[type].dark
          : icons[type].light
      }
      style={{ width: 24, height: 24 }}
      resizeMode="contain"
    />
  );

  return (
    <>
      <Tab.Navigator
        initialRouteName="home"
        screenOptions={{
          tabBarActiveTintColor: colors.tabIconActive,
          tabBarInactiveTintColor: colors.tabIcon,
          tabBarStyle: {
            backgroundColor: colors.tabBg,
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
            borderTopWidth: 0,
            elevation: 5,
            shadowColor: "#3C221D",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
          },
          headerShown: false,
          tabBarShowLabel: !showMenu,
        }}
      >
        <Tab.Screen
          name="home"
          component={HomeScreen}
          options={{
            tabBarLabel: "Home",
            tabBarIcon: ({ focused }) => getTabIcon(focused, "home"),
          }}
        />
        <Tab.Screen
          name="liveTeam"
          component={LiveTeam}
          options={{
            tabBarLabel: "Live Team",
            tabBarIcon: ({ focused }) => getTabIcon(focused, "liveTeam"),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate("liveTeam");
            },
          })}
        />
        <Tab.Screen
          name="menuTabs"
          component={MenuScreen} // Komponen tetap kasih, tapi jangan render apapun
          options={{
            tabBarLabel: "Menu",
            tabBarIcon: ({ focused }) => getTabIcon(focused, "menuTabs"),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setShowMenu(true);
            },
          }}
        />

        {/* {isAuthenticated && (
        <Tab.Screen
          name="profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: "Profile",
            tabBarIcon: ({ focused }) => getTabIcon(focused, "profile"),
          }}
        />
      )} */}
      </Tab.Navigator>
      <Modal
        isVisible={showMenu}
        onBackdropPress={() => setShowMenu(false)}
        style={{ margin: 0, justifyContent: "flex-end" }}
        backdropTransitionOutTiming={0}
      >
        <View style={menuStyles.sheet}>
          <View style={menuStyles.bar} />
          <Text style={menuStyles.menuTitle}>Menu</Text>

          {/* === Aktifitas Accordion === */}
          <TouchableOpacity
            style={menuStyles.menuItemActive}
            onPress={() => setOpenAktifitas(!openAktifitas)}
            activeOpacity={0.85}
          >
            <Image
              source={require("../assets/icons/ic-aktifitas-enable.png")}
              style={menuStyles.iconRed}
            />
            <Text style={menuStyles.menuTextActive}>Aktifitas</Text>
            <View style={{ flex: 1 }} />
            <Image
              source={openAktifitas ? icons.chevronUp : icons.chevronDown}
              style={menuStyles.chevron}
              resizeMode="contain"
            />
          </TouchableOpacity>
          {openAktifitas && (
            <View style={menuStyles.accordionPanel}>
              <TouchableOpacity style={menuStyles.accordionItem}>
                <Text style={menuStyles.accordionText}>Log Aktifitas</Text>
              </TouchableOpacity>
              <TouchableOpacity style={menuStyles.accordionItem}>
                <Text style={menuStyles.accordionText}>Riwayat Presensi</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* === Master Data Accordion === */}
          <TouchableOpacity
            style={menuStyles.menuItem}
            onPress={() => setOpenMasterData(!openMasterData)}
            activeOpacity={0.85}
          >
            <Image
              source={require("../assets/icons/ic-masterData-disable.png")}
              style={menuStyles.icon}
              resizeMode="contain"
            />
            <Text style={menuStyles.menuText}>Master Data</Text>
            <View style={{ flex: 1 }} />
            <Image
              source={openMasterData ? icons.chevronUp : icons.chevronDown}
              style={menuStyles.chevron}
            />
          </TouchableOpacity>
          {openMasterData && (
            <View style={menuStyles.accordionPanel}>
              <TouchableOpacity style={menuStyles.accordionItem}>
                <Text style={menuStyles.accordionText}>Data User</Text>
              </TouchableOpacity>
              <TouchableOpacity style={menuStyles.accordionItem}>
                <Text style={menuStyles.accordionText}>Data Jabatan</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* === Menu lainnya biasa === */}
          <TouchableOpacity style={menuStyles.menuItem}>
            <Image
              source={require("../assets/icons/ic-stackeHolder-disable.png")}
              style={menuStyles.icon}
              resizeMode="contain"
            />
            <Text style={menuStyles.menuText}>Stakeholder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={menuStyles.menuItem}>
            <Image
              source={require("../assets/icons/ic-mediaPublikasi-disable.png")}
              style={menuStyles.icon}
              resizeMode="contain"
            />
            <Text style={menuStyles.menuText}>Media & Publikasi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={menuStyles.menuItem}>
            <Image
              source={require("../assets/icons/ic-masterData-disable.png")}
              style={menuStyles.icon}
              resizeMode="contain"
            />
            <Text style={menuStyles.menuText}>Maps Tracking</Text>
          </TouchableOpacity>

          {/* Close */}
          <TouchableOpacity
            style={menuStyles.closeBtn}
            onPress={() => setShowMenu(false)}
          >
            <Text style={{ color: "#E24B3B", fontSize: 22 }}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}
const menuStyles = StyleSheet.create({
  sheet: {
    backgroundColor: "#FAFAFA",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 40,
    minHeight: 380,
    elevation: 4,
  },
  bar: {
    width: 60,
    height: 5,
    backgroundColor: "#D3D3D3",
    alignSelf: "center",
    borderRadius: 4,
    marginBottom: 12,
  },
  menuTitle: {
    fontWeight: "600",
    fontSize: 20,
    marginBottom: 18,
    marginLeft: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    paddingLeft: 4,
  },
  menuItemActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEDEE",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 2,
    paddingLeft: 4,
  },
  icon: {
    width: 26,
    height: 26,
    marginRight: 18,
    tintColor: "#232323",
  },
  iconRed: {
    width: 26,
    height: 26,
    marginRight: 18,
    tintColor: "#E24B3B",
  },
  chevron: {
    width: 22,
    height: 22,
    tintColor: "#DB555A",
  },
  menuText: {
    fontSize: 17,
    color: "#232323",
    fontWeight: "400",
  },
  menuTextActive: {
    fontSize: 17,
    color: "#E24B3B",
    fontWeight: "500",
  },
  closeBtn: {
    position: "absolute",
    right: 14,
    top: 12,
    padding: 6,
  },
  accordionPanel: {
    paddingLeft: 60,
    backgroundColor: "#FFF5F5",
    marginBottom: 6,
    borderRadius: 10,
  },
  accordionItem: {
    paddingVertical: 11,
    paddingLeft: 2,
  },
  accordionText: {
    fontSize: 15,
    color: "#DB555A",
  },
});

export default function AppNavigation() {
  const { mode } = useThemeStore();
  const theme: NavTheme = mode === "dark" ? DarkTheme : DefaultTheme;
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
