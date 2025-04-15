import React from "react";
import { Text, Platform } from "react-native";

export function IconSymbol({ name, size = 24, color = "#000000", style }) {
  // Only use SF Symbols on iOS
  if (Platform.OS === "ios") {
    return (
      <Text
        style={[
          {
            fontFamily: "system",
            fontSize: size,
            color: color,
            lineHeight: size,
            height: size,
          },
          style,
        ]}
      >
        {String.fromCharCode(0xf8ff) + name}
      </Text>
    );
  }

  // For Android, return a simple text representation
  return (
    <Text
      style={[
        {
          fontSize: size,
          color: color,
          lineHeight: size,
          height: size,
        },
        style,
      ]}
    >
      {name.split(".")[0]}
    </Text>
  );
}
