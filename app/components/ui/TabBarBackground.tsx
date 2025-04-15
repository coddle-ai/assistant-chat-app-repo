import React from "react";
import { Platform, View } from "react-native";
import { BlurView } from "expo-blur";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function TabBarBackground() {
  const tabBarHeight = useBottomTabBarHeight();

  if (Platform.OS === "ios") {
    return (
      <BlurView
        intensity={25}
        tint="light"
        className="absolute inset-0"
        style={{ height: tabBarHeight }}
      />
    );
  }

  // On Android, use a semi-transparent background
  return (
    <View
      className="absolute inset-0 bg-white/80"
      style={{ height: tabBarHeight }}
    />
  );
}

export function useBottomTabOverflow() {
  const tabHeight = useBottomTabBarHeight();
  const { bottom } = useSafeAreaInsets();
  return tabHeight - bottom;
}
