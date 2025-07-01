// src/components/TabBarItem.tsx
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface TabBarItemProps {
  icon: any;
  label: string;
  focused: boolean;
  activeColor: string;
  inactiveColor: string;
}

const TabBarItem: React.FC<TabBarItemProps> = ({
  icon,
  label,
  focused,
  activeColor,
  inactiveColor,
}) => {
  return (
    <View
      style={[
        styles.container,
        focused && {
          backgroundColor: "#FFF5F6", // warna latar pas aktif
          borderRadius: 10,
        },
      ]}
    >
      <Image
        source={icon}
        style={{
          width: 26,
          height: 26,
          tintColor: focused ? activeColor : inactiveColor,
        }}
        resizeMode="contain"
      />
      <Text
        style={{
          fontSize: 13,
          color: focused ? activeColor : inactiveColor,
          fontWeight: focused ? "bold" : "normal",
          marginTop: 3,
        }}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 6,
    marginBottom: 6,
  },
});

export default TabBarItem;
