import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";

import { ThemedView } from "./ThemedView";
import { useColorScheme } from "../hooks/useColorScheme";

const HEADER_HEIGHT = 250;

export default function ParallaxScrollView({
  headerImage,
  headerBackgroundColor,
  children,
}) {
  const colorScheme = useColorScheme();
  const scrollRef = useAnimatedRef();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor:
              headerBackgroundColor[colorScheme] || headerBackgroundColor.light,
          },
          headerAnimatedStyle,
        ]}
      >
        {headerImage}
      </Animated.View>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={1}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {children}
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  content: {
    paddingTop: HEADER_HEIGHT,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
});
