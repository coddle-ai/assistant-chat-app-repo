import React from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "react-native";

const colors = {
  light: {
    background: "#FFFFFF",
    text: "#000000",
  },
  dark: {
    background: "#1A1A1A",
    text: "#FFFFFF",
  },
};

export const ThemedView = React.memo(({ style, ...props }) => {
  const colorScheme = useColorScheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors[colorScheme || "light"].background,
        },
        style,
      ]}
      {...props}
    />
  );
});

export const ThemedText = React.memo(({ style, ...props }) => {
  const colorScheme = useColorScheme();
  return (
    <Text
      style={[
        {
          color: colors[colorScheme || "light"].text,
        },
        style,
      ]}
      {...props}
    />
  );
});

ThemedView.displayName = "ThemedView";
ThemedText.displayName = "ThemedText";
