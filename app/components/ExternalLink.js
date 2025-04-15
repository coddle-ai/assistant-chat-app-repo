import React from "react";
import { TouchableOpacity, Linking } from "react-native";

export function ExternalLink({ href, children, style }) {
  const handlePress = () => {
    Linking.openURL(href).catch((err) => {
      console.warn("An error occurred opening the link:", err);
    });
  };

  return (
    <TouchableOpacity
      style={[{ marginVertical: 4 }, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
}
