import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  Linking,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../../navigation";
import { StackNavigationProp } from "@react-navigation/stack";

// Ganti path sesuai folder assets kamu

const LOGO = require("../../assets/icons/uGemsIcon.png");
const GOOGLE = require("../../assets/icons/googleLogin.png");
const APPLE = require("../../assets/icons/applLogin.png");
const ISAFE = require("../../assets/icons/i-safeLogin.png");

const getRole = (input = "") => {
  const value = input.trim().toLowerCase();

  if (/admin/.test(value)) return "admin";
  if (/employee|pegawai|staff|karyawan|emp|emp1|emp2|emp3/.test(value))
    return "employee";
  if (/bod|dept\s*head|dh|director|direktur/.test(value)) return "BOD";
  return null;
};

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [roleError, setRoleError] = useState("");
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleLogin = async () => {
    let hasError = false;

    // reset error state
    setEmailError("");
    setPasswordError("");
    setRoleError("");

    if (!email.trim()) {
      setEmailError("Email tidak boleh kosong.");
      hasError = true;
    }
    if (!password.trim()) {
      setPasswordError("Password tidak boleh kosong.");
      hasError = true;
    }

    const userRole = getRole(email);
    if (!userRole && email.trim()) {
      setRoleError(
        "Role tidak dikenali. Masukkan kata 'admin', 'employee', atau 'bod/dept head'."
      );
      hasError = true;
    }

    if (hasError) return;

    // Simpan ke storage
    await AsyncStorage.setItem("isLoggedIn", "yes");
    await AsyncStorage.setItem("userRole", userRole as string);

    navigation.replace("Main");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />

        {/* Judul */}
        <Text style={styles.title}>Login with your IAM Account</Text>

        {/* Input */}
        <View style={styles.inputBox}>
          <TextInput
            placeholder="Email (isi role: admin/employee/bod)"
            style={styles.input}
            placeholderTextColor="#999"
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(text) => {
              setEmail(text);
              setEmailError("");
              setRoleError("");
            }}
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
          {roleError ? <Text style={styles.errorText}>{roleError}</Text> : null}

          <TextInput
            placeholder="Password"
            style={styles.input}
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError("");
            }}
          />
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}
        </View>

        {/* Sign In Button */}
        <TouchableOpacity onPress={handleLogin} style={styles.signInBtn}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>

        {/* Or */}
        <Text style={styles.orText}>Or</Text>

        {/* OAuth Buttons */}
        <TouchableOpacity style={styles.oauthBtn}>
          <Image source={GOOGLE} style={styles.oauthIcon} />
          <Text style={styles.oauthText}>Sign in with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.oauthBtn}>
          <Image source={APPLE} style={styles.oauthIcon} resizeMode="contain" />
          <Text style={styles.oauthText}>Sign in with Apple</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.oauthBtn}>
          <Image source={ISAFE} style={styles.oauthIcon} />
          <Text style={styles.oauthText}>Sign in with iSafe</Text>
        </TouchableOpacity>

        {/* User Guide, FAQ, Helpdesk */}
        <View style={styles.linksRow}>
          <Text
            style={styles.link}
            onPress={() => Linking.openURL("https://example.com/userguide")}
          >
            User Guide
          </Text>
          <Text style={styles.dot}>|</Text>
          <Text
            style={styles.link}
            onPress={() => Linking.openURL("https://example.com/faq")}
          >
            FAQ
          </Text>
          <Text style={styles.dot}>|</Text>
          <Text
            style={styles.link}
            onPress={() => Linking.openURL("https://example.com/helpdesk")}
          >
            Helpdesk
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Provided by Digitech - GEMS. © 2022 PT. Golden Energy Mines
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flexGrow: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 180,
    height: 110,
    marginBottom: 8,
    marginTop: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
    textAlign: "center",
    marginBottom: 22,
    marginTop: 8,
  },
  inputBox: {
    width: "100%",
    marginBottom: 10,
    marginTop: 0,
  },
  input: {
    height: 46,
    borderColor: "#DDD",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#222",
    backgroundColor: "#fff",
  },
  signInBtn: {
    width: "100%",
    backgroundColor: "#A80000",
    paddingVertical: 13,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 18,
  },
  signInText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  orText: {
    marginVertical: 7,
    color: "#222",
    fontSize: 15,
    fontWeight: "400",
  },
  oauthBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A80000",
    borderRadius: 7,
    marginBottom: 13,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  oauthIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  oauthText: {
    color: "#222",
    fontSize: 15,
    fontWeight: "500",
  },
  linksRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
    marginBottom: 8,
  },
  link: {
    color: "#1266D6",
    fontSize: 15,
    textDecorationLine: "underline",
    marginHorizontal: 2,
  },
  dot: {
    color: "#888",
    fontSize: 15,
    marginHorizontal: 7,
  },
  footer: {
    marginTop: 20,
    color: "#666",
    fontSize: 13,
    textAlign: "center",
  },
  errorText: { color: "red", fontSize: 13, marginBottom: 8, marginLeft: 2 },
});

export default LoginScreen;
