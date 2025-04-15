import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Animated,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function NursingScreen() {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [leftTime, setLeftTime] = useState(0);
  const [rightTime, setRightTime] = useState(0);
  const [activeSide, setActiveSide] = useState(null);
  const [currentDate] = useState(new Date());
  const scaleAnim = useState(new Animated.Value(1))[0];

  // Create continuous pulse animation
  useEffect(() => {
    let pulseAnimation;
    if (isRunning) {
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.03,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
    } else {
      scaleAnim.setValue(1);
    }
    return () => {
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
    };
  }, [isRunning]);

  // Separate timer effect
  useEffect(() => {
    let interval;
    if (isRunning) {
      const startTime = Date.now() - totalTime * 1000;
      interval = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        setTotalTime(elapsedSeconds);
        if (activeSide === "L") {
          setLeftTime((prev) => prev + 1);
        } else if (activeSide === "R") {
          setRightTime((prev) => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, activeSide]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatSideTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h\n${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const toggleTimer = (side) => {
    if (!isRunning) {
      setIsRunning(true);
      setActiveSide(side);
    } else if (activeSide === side) {
      setIsRunning(false);
      setActiveSide(null);
    } else {
      setActiveSide(side);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Time Display */}
        <View style={styles.timeSection}>
          <View style={styles.timeHeader}>
            <View style={styles.timeIconContainer}>
              <IconSymbol name="clock" size={20} color="#0F766E" />
              <Text style={styles.timeLabel}>Session Timer</Text>
            </View>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>
                {currentDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Total Timer */}
        <LinearGradient
          colors={["#CCFBF1", "#99F6E4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.totalTimerContainer}
        >
          <Animated.View
            style={[styles.timerContent, { transform: [{ scale: scaleAnim }] }]}
          >
            <Text style={styles.totalTimerValue}>{formatTime(totalTime)}</Text>
            <Text style={styles.totalLabel}>Total Time</Text>
          </Animated.View>
        </LinearGradient>

        {/* Side Buttons */}
        <View style={styles.sideButtonsContainer}>
          {/* Left Button */}
          <View style={styles.sideButtonWrapper}>
            <TouchableOpacity
              style={[
                styles.sideButton,
                activeSide === "L" && isRunning && styles.activeSideButton,
              ]}
              onPress={() => toggleTimer("L")}
            >
              <View style={styles.buttonContent}>
                {!(activeSide === "L" && isRunning) ? (
                  <IconSymbol
                    name="play.fill"
                    size={32}
                    color="#0F766E"
                    style={styles.playIcon}
                  />
                ) : (
                  <>
                    <IconSymbol name="pause.fill" size={32} color="#FFFFFF" />
                    <Text style={[styles.sideTime, styles.activeText]}>
                      {formatSideTime(leftTime)}
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.sideLabelContainer}>
              <Text style={styles.sideLabel}>L</Text>
            </View>
          </View>

          {/* Right Button */}
          <View style={styles.sideButtonWrapper}>
            <TouchableOpacity
              style={[
                styles.sideButton,
                activeSide === "R" && isRunning && styles.activeSideButton,
              ]}
              onPress={() => toggleTimer("R")}
            >
              <View style={styles.buttonContent}>
                {!(activeSide === "R" && isRunning) ? (
                  <IconSymbol
                    name="play.fill"
                    size={32}
                    color="#0F766E"
                    style={styles.playIcon}
                  />
                ) : (
                  <>
                    <IconSymbol name="pause.fill" size={32} color="#FFFFFF" />
                    <Text style={[styles.sideTime, styles.activeText]}>
                      {formatSideTime(rightTime)}
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.sideLabelContainer}>
              <Text style={styles.sideLabel}>R</Text>
            </View>
          </View>
        </View>

        {/* Manual Entry Button */}
        <TouchableOpacity style={styles.manualEntryButton}>
          <Text style={styles.manualEntryText}>Manual Entry</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDFA",
  },
  content: {
    flex: 1,
  },
  timeSection: {
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 32,
  },
  timeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  timeIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timeLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F766E",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 15,
    color: "#0F766E",
    fontWeight: "500",
  },
  totalTimerContainer: {
    marginBottom: 48,
    marginTop: 24,
    marginHorizontal: 24,
    padding: 32,
    borderRadius: 100,
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  timerContent: {
    alignItems: "center",
  },
  totalTimerValue: {
    fontSize: 56,
    fontWeight: "700",
    color: "#0F766E",
    letterSpacing: -1,
  },
  totalLabel: {
    fontSize: 15,
    color: "#0F766E",
    opacity: 0.7,
    fontWeight: "500",
    marginTop: 8,
  },
  sideButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    marginBottom: 48,
  },
  sideButtonWrapper: {
    alignItems: "center",
    gap: 12,
  },
  sideButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activeSideButton: {
    backgroundColor: "#0F766E",
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  playIcon: {
    opacity: 0.8,
    transform: [{ scale: 1.2 }],
  },
  sideTime: {
    fontSize: 28,
    fontWeight: "600",
    color: "#0F766E",
    marginTop: 8,
    letterSpacing: -0.5,
    textAlign: "center",
    lineHeight: 32,
  },
  activeText: {
    color: "#FFFFFF",
  },
  sideLabelContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDFA",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  sideLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F766E",
  },
  manualEntryButton: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 24,
    alignItems: "center",
    position: "absolute",
    bottom: Platform.OS === "ios" ? 40 : 20,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  manualEntryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F766E",
  },
  buttonContent: {
    alignItems: "center",
    justifyContent: "center",
  },
});
