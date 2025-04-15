import React from "react";
import { View } from "react-native";
import { useColorScheme } from "../hooks/useColorScheme";

export function ThemedView({ style, ...props }) {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === "dark" ? "#000" : "#fff";

  return <View style={[{ backgroundColor }, style]} {...props} />;
}
