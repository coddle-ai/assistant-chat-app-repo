import React, { useEffect, useRef } from "react";
import { Text, Animated, StyleSheet, View } from "react-native";

export function HelloWave() {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Delay before next animation
        setTimeout(animate, 2000);
      });
    };

    animate();
    return () => rotateAnim.setValue(0);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "20deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.wave,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      >
        👋
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  wave: {
    fontSize: 24,
    transform: [{ translateY: -2 }],
  },
});
