import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { ThemedText } from "./ThemedText";

export function Collapsible({ title, children }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpand} style={styles.header}>
        <ThemedText type="subtitle">{title}</ThemedText>
        <Animated.Text style={{ transform: [{ rotate: rotateInterpolate }] }}>
          ›
        </Animated.Text>
      </TouchableOpacity>
      {isExpanded && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
});
