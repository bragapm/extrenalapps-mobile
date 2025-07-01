import React from "react";
import { View, Button, StyleSheet } from "react-native";
import { useThemeStore } from "../../theme/useThemeStore";


const MenuScreen: React.FC = () => {
  const { toggleTheme, mode, colors } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Button
        title={`Switch to ${mode === "light" ? "Dark" : "Light"} Mode`}
        onPress={toggleTheme}
        color={colors.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default MenuScreen;
