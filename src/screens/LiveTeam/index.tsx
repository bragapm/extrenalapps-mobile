import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeStore } from "../../theme/useThemeStore";
const LiveTeam: React.FC = () => {
  const { colors } = useThemeStore();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>Live Team</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18, fontWeight: "bold" },
});

export default LiveTeam;
