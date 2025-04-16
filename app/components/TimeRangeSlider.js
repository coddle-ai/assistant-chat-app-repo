import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";

const SLIDER_WIDTH = Dimensions.get("window").width - 48; // Increased width to match screenshot
const TIME_MARKS = [
  "6AM",
  "8AM",
  "10AM",
  "12PM",
  "2PM",
  "4PM",
  "6PM",
  "8PM",
  "10PM",
];

export const TimeRangeSlider = ({
  startTime = "8:00 AM",
  endTime = "6:15 PM",
  onStartTimeChange,
  onEndTimeChange,
  title = "Day vs night time start times",
}) => {
  const [sliderValues, setSliderValues] = useState({
    start: TIME_MARKS.indexOf("8AM") * (SLIDER_WIDTH / (TIME_MARKS.length - 1)),
    end: TIME_MARKS.indexOf("6PM") * (SLIDER_WIDTH / (TIME_MARKS.length - 1)),
  });

  const getTimeFromPosition = (position) => {
    const index = Math.round(
      (position / SLIDER_WIDTH) * (TIME_MARKS.length - 1)
    );
    return TIME_MARKS[Math.max(0, Math.min(TIME_MARKS.length - 1, index))];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        These cut-off times are used when categorizing an event as part of the
        day vs. night.
      </Text>

      <View style={styles.timeContainer}>
        <View style={styles.timeBox}>
          <Text style={styles.timeValue}>{startTime}</Text>
          <Text style={styles.timeLabel}>START</Text>
        </View>

        <View style={styles.arrow}>
          <IconSymbol name="arrow.right" size={20} color="#0F766E" />
        </View>

        <View style={styles.timeBox}>
          <Text style={styles.timeValue}>{endTime}</Text>
          <Text style={styles.timeLabel}>END</Text>
        </View>
      </View>

      <View style={styles.sliderContainer}>
        <View style={styles.sliderTrack} />
        <View
          style={[
            styles.sliderFill,
            {
              left: sliderValues.start,
              width: sliderValues.end - sliderValues.start,
            },
          ]}
        />

        <View style={styles.markersContainer}>
          {TIME_MARKS.map((time, index) => (
            <View
              key={time}
              style={[
                styles.marker,
                { left: index * (SLIDER_WIDTH / (TIME_MARKS.length - 1)) },
              ]}
            >
              <Text style={styles.markerText}>{time}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.sliderHandle, { left: sliderValues.start }]}>
          <View style={styles.handleKnob} />
        </View>
        <View style={[styles.sliderHandle, { left: sliderValues.end }]}>
          <View style={styles.handleKnob} />
        </View>
      </View>

      <View style={styles.daySleepContainer}>
        <View style={styles.daySleepIndicator}>
          <IconSymbol name="sun.max.fill" size={16} color="#0F766E" />
          <Text style={styles.daySleepText}>Day Sleep</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    backgroundColor: "transparent",
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F766E",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
    lineHeight: 20,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 48,
    paddingHorizontal: 24,
  },
  timeBox: {
    alignItems: "center",
  },
  timeValue: {
    fontSize: 24,
    fontWeight: "600",
    color: "#0F766E",
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  arrow: {
    padding: 8,
  },
  sliderContainer: {
    height: 60,
    width: SLIDER_WIDTH,
    alignSelf: "center",
  },
  sliderTrack: {
    position: "absolute",
    top: 20,
    width: "100%",
    height: 2,
    backgroundColor: "#E2E8F0",
    borderRadius: 1,
  },
  sliderFill: {
    position: "absolute",
    top: 20,
    height: 2,
    backgroundColor: "#0F766E",
    borderRadius: 1,
  },
  markersContainer: {
    position: "absolute",
    top: 30,
    width: "100%",
  },
  marker: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -15 }],
  },
  markerText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 8,
  },
  sliderHandle: {
    position: "absolute",
    top: 12,
    width: 16,
    height: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    transform: [{ translateX: -8 }],
    borderWidth: 2,
    borderColor: "#0F766E",
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  handleKnob: {
    position: "absolute",
    top: 3,
    left: 3,
    width: 6,
    height: 6,
    backgroundColor: "#0F766E",
    borderRadius: 3,
  },
  daySleepContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  daySleepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: "#0F766E",
  },
  daySleepText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F766E",
  },
});
