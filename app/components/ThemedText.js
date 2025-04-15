import React from "react";
import { Text, StyleSheet } from "react-native";
import { useColorScheme } from "../hooks/useColorScheme";

const textStyles = {
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    color: "#2563eb",
    textDecorationLine: "underline",
  },
};

export function ThemedText({ type = "default", style, ...props }) {
  const colorScheme = useColorScheme();
  const color = colorScheme === "dark" ? "#fff" : "#000";

  return (
    <Text
      style={[textStyles[type] || textStyles.default, { color }, style]}
      {...props}
    />
  );
}
