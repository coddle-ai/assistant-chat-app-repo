import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

const TimeRangeSlider = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempTime, setTempTime] = useState(null);

  const ensureValidDate = (time) => {
    if (time instanceof Date) return time;
    if (typeof time === "string") return new Date(time);
    return new Date();
  };

  const formatTime = (time) => {
    if (!time) return "INVALID DATE";
    const date = ensureValidDate(time);
    return date
      .toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase();
  };

  const handleStartTimeChange = (event, selectedTime) => {
    if (Platform.OS === "android") {
      setShowStartPicker(false);
      if (selectedTime) {
        onStartTimeChange(selectedTime);
      }
    } else {
      setTempTime(selectedTime || tempTime);
    }
  };

  const handleEndTimeChange = (event, selectedTime) => {
    if (Platform.OS === "android") {
      setShowEndPicker(false);
      if (selectedTime) {
        onEndTimeChange(selectedTime);
      }
    } else {
      setTempTime(selectedTime || tempTime);
    }
  };

  const handleIOSConfirm = (isStart) => {
    if (tempTime) {
      if (isStart) {
        onStartTimeChange(tempTime);
      } else {
        onEndTimeChange(tempTime);
      }
    }
    setShowStartPicker(false);
    setShowEndPicker(false);
    setTempTime(null);
  };

  const handleIOSCancel = () => {
    setShowStartPicker(false);
    setShowEndPicker(false);
    setTempTime(null);
  };

  const renderTimeButton = (time, label, onPress) => (
    <TouchableOpacity style={styles.timeButton} onPress={onPress}>
      <View style={styles.timeContent}>
        <Text style={styles.timeText}>{formatTime(time)}</Text>
        <Text style={styles.timeLabel}>{label}</Text>
      </View>
      <View style={styles.editIconContainer}>
        <MaterialIcons name="edit" size={20} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

  const renderIOSPicker = (isStart) => {
    const visible = isStart ? showStartPicker : showEndPicker;
    const currentTime = isStart ? startTime : endTime;
    const initialDate = ensureValidDate(tempTime || currentTime);

    return (
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleIOSCancel}>
                <Text style={styles.modalButton}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleIOSConfirm(isStart)}>
                <Text style={[styles.modalButton, styles.confirmButton]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={initialDate}
              mode="time"
              display="spinner"
              onChange={isStart ? handleStartTimeChange : handleEndTimeChange}
            />
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Day vs night time start times</Text>
      <Text style={styles.description}>
        These cut-off times are used when categorizing an event as part of the
        day vs. night.
      </Text>

      <View style={styles.timeContainer}>
        {renderTimeButton(startTime, "START", () => {
          const initialDate = ensureValidDate(startTime);
          if (Platform.OS === "ios") {
            setTempTime(initialDate);
          }
          setShowStartPicker(true);
        })}
        <View style={styles.arrowContainer}>
          <MaterialIcons name="arrow-forward" size={24} color="#6B7280" />
        </View>
        {renderTimeButton(endTime, "END", () => {
          const initialDate = ensureValidDate(endTime);
          if (Platform.OS === "ios") {
            setTempTime(initialDate);
          }
          setShowEndPicker(true);
        })}
      </View>

      <View style={styles.timeline}>
        <View style={styles.timeMarkers}>
          <Text style={styles.timeMarker}>6AM</Text>
          <Text style={styles.timeMarker}>8AM</Text>
          <Text style={styles.timeMarker}>10AM</Text>
          <Text style={styles.timeMarker}>12PM</Text>
          <Text style={styles.timeMarker}>2PM</Text>
          <Text style={styles.timeMarker}>4PM</Text>
          <Text style={styles.timeMarker}>6PM</Text>
          <Text style={styles.timeMarker}>8PM</Text>
          <Text style={styles.timeMarker}>10PM</Text>
        </View>
        <View style={styles.timelineBar}>
          <View style={styles.daySleepIndicator}>
            <Ionicons name="sunny" size={20} color="#FFFFFF" />
            <Text style={styles.indicatorText}>Day Sleep</Text>
          </View>
        </View>
      </View>

      {Platform.OS === "android" && showStartPicker && (
        <DateTimePicker
          value={ensureValidDate(startTime)}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleStartTimeChange}
        />
      )}

      {Platform.OS === "android" && showEndPicker && (
        <DateTimePicker
          value={ensureValidDate(endTime)}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleEndTimeChange}
        />
      )}

      {Platform.OS === "ios" && renderIOSPicker(true)}
      {Platform.OS === "ios" && renderIOSPicker(false)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
    lineHeight: 24,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    gap: 12,
  },
  timeButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0,0,0,0.1)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  timeContent: {
    flex: 1,
  },
  timeText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  editIconContainer: {
    marginLeft: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  timeline: {
    marginTop: 8,
  },
  timeMarkers: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  timeMarker: {
    fontSize: 12,
    color: "#6B7280",
  },
  timelineBar: {
    height: 48,
    backgroundColor: "#E5E7EB",
    borderRadius: 24,
    padding: 4,
  },
  daySleepIndicator: {
    backgroundColor: "#0F766E",
    borderRadius: 20,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 8,
  },
  indicatorText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalButton: {
    fontSize: 16,
    color: "#0F766E",
    paddingHorizontal: 8,
  },
  confirmButton: {
    fontWeight: "600",
  },
});

export default TimeRangeSlider;
