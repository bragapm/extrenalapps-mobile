import React, { useEffect, useState } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useThemeStore } from "../theme/useThemeStore";
import { RootStackParamList } from "../navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AppHeaderProps = {
  home?: boolean;
};

const AppHeader: React.FC<AppHeaderProps> = ({ home = true }) => {
  const { colors } = useThemeStore();
  const colorScheme = useColorScheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    // Bersihin storage, bisa di-expand
    await AsyncStorage.removeItem("isLoggedIn");
    await AsyncStorage.removeItem("userRole");
    // Navigasi ke Login
    navigation.replace("Login");
  };

  return (
    <>
      {home === true ? (
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: "12%",
            paddingHorizontal: "5%",
            backgroundColor: "#FFF",
            paddingVertical: "3%",
          }}
        >
          <View
            style={{
              width: "50%",
              alignItems: "flex-start",
              // paddingHorizontal: "2%",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../assets/images/LogoBIB.png")}
              style={{ width: 160, height: 54 }}
              resizeMode="contain"
            />
          </View>
          <View
            style={{
              width: "50%",
              alignItems: "flex-end",
              // paddingHorizontal: "2%",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: colors.red,
                borderRadius: 10,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: "5%",
                paddingVertical: "5%",
                marginHorizontal: "2%",
              }}
              onPress={() => setShowConfirm(true)}
            >
              <Image
                source={require("../assets/icons/logoutIcon.png")}
                style={{ width: 15, height: 30 }}
                resizeMode="contain"
              />
              <Text
                style={{
                  color: colors.background,
                  fontWeight: "400",
                  fontSize: 16,
                  marginLeft: "5%",
                }}
              >
                Logout
              </Text>
            </TouchableOpacity>
            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: 10,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: "5%",
                paddingVertical: "5%",
                borderWidth: 2,
                borderColor: colors.green,
              }}
            >
              <Image
                source={require("../assets/icons/iconSignal.png")}
                style={{ width: 15, height: 30 }}
                resizeMode="contain"
              />
              <Text
                style={{
                  color: colors.green,
                  fontWeight: "400",
                  fontSize: 16,
                  marginLeft: "5%",
                }}
              >
                Online
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <></>
      )}
      <Modal
        transparent
        visible={showConfirm}
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 14 }}
            >
              Konfirmasi Logout
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#222",
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              Apakah Anda yakin ingin logout?
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                onPress={() => setShowConfirm(false)}
                style={[styles.modalBtn, { backgroundColor: "#f3f3f3" }]}
              >
                <Text style={{ color: "#222", fontWeight: "500" }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={[
                  styles.modalBtn,
                  { backgroundColor: "#E24B3B", marginLeft: 10 },
                ]}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Ya, Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.28)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 22,
    alignItems: "center",
    elevation: 8,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
});
export default AppHeader;
