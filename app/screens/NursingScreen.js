import React, { useState, useEffect, useRef, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Animated,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, set, subDays, isSameDay } from "date-fns";

const ManualEntryModal = ({ visible, onClose, onSave }) => {
  const [entryType, setEntryType] = useState("total"); // "total" or "sides"
  const [totalMinutes, setTotalMinutes] = useState("");
  const [leftMinutes, setLeftMinutes] = useState("");
  const [rightMinutes, setRightMinutes] = useState("");
  const [error, setError] = useState("");

  const validateAndSetMinutes = (value, setter) => {
    const numValue = parseInt(value) || 0;
    if (numValue > 120) {
      setError("Time cannot exceed 120 minutes");
      setter("120");
    } else {
      setError("");
      setter(value);
    }
  };

  const handleSave = () => {
    const total = parseInt(totalMinutes) || 0;
    const left = parseInt(leftMinutes) || 0;
    const right = parseInt(rightMinutes) || 0;

    if (entryType === "total") {
      if (total > 120) {
        setError("Total time cannot exceed 120 minutes");
        return;
      }
      onSave({ total });
    } else {
      if (left + right > 120) {
        setError("Combined time cannot exceed 120 minutes");
        return;
      }
      onSave({ left, right });
    }
    setError("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Manual Time Entry</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={20} color="#1F2937" />
            </TouchableOpacity>
          </View>

          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                entryType === "total" && styles.segmentButtonActive,
              ]}
              onPress={() => {
                setEntryType("total");
                setError("");
              }}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  entryType === "total" && styles.segmentButtonTextActive,
                ]}
              >
                Total Time
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                entryType === "sides" && styles.segmentButtonActive,
              ]}
              onPress={() => {
                setEntryType("sides");
                setError("");
              }}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  entryType === "sides" && styles.segmentButtonTextActive,
                ]}
              >
                Left & Right
              </Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {entryType === "total" ? (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Total Time (minutes)</Text>
              <TextInput
                style={[styles.timeInput, error && styles.timeInputError]}
                value={totalMinutes}
                onChangeText={(value) =>
                  validateAndSetMinutes(value, setTotalMinutes)
                }
                keyboardType="numeric"
                placeholder="Enter minutes (max 120)"
                maxLength={3}
              />
            </View>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Left Side (minutes)</Text>
                <TextInput
                  style={[styles.timeInput, error && styles.timeInputError]}
                  value={leftMinutes}
                  onChangeText={(value) =>
                    validateAndSetMinutes(value, setLeftMinutes)
                  }
                  keyboardType="numeric"
                  placeholder="Enter minutes"
                  maxLength={3}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Right Side (minutes)</Text>
                <TextInput
                  style={[styles.timeInput, error && styles.timeInputError]}
                  value={rightMinutes}
                  onChangeText={(value) =>
                    validateAndSetMinutes(value, setRightMinutes)
                  }
                  keyboardType="numeric"
                  placeholder="Enter minutes"
                  maxLength={3}
                />
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.saveButton, error && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!!error}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ManualEntryButton = memo(({ onPress }) => (
  <TouchableOpacity
    style={styles.manualEntryButton}
    onPress={onPress}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  >
    <IconSymbol name="pencil" size={16} color="#0F766E" />
  </TouchableOpacity>
));

const SaveButton = memo(
  ({ onPress }) => (
    <TouchableOpacity
      style={styles.saveButton}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.saveButtonContent}>
        <IconSymbol
          name="square.and.arrow.down"
          size={20}
          color="#FFFFFF"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.saveButtonText}>Save Session</Text>
      </View>
    </TouchableOpacity>
  ),
  (prevProps, nextProps) => true
);

const DateTimeModal = ({ visible, onClose, onSave, currentDate }) => {
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [error, setError] = useState("");

  const handleDateChange = (event, date) => {
    if (Platform.OS === "android") {
      if (event.type === "dismissed") {
        onClose();
        return;
      }
    }
    if (date) {
      // Validate that the selected date is not in the future
      if (date > new Date()) {
        setError("Cannot select a future date and time");
        return;
      }
      setError("");
      setSelectedDate(date);
      if (Platform.OS === "android") {
        onSave(date);
        onClose();
      }
    }
  };

  const handleSave = () => {
    if (selectedDate > new Date()) {
      setError("Cannot select a future date and time");
      return;
    }
    setError("");
    onSave(selectedDate);
    onClose();
  };

  if (Platform.OS === "android") {
    if (visible) {
      return (
        <DateTimePicker
          value={selectedDate}
          mode="datetime"
          is24Hour={true}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      );
    }
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Date & Time</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={20} color="#1F2937" />
            </TouchableOpacity>
          </View>

          <DateTimePicker
            value={selectedDate}
            mode="datetime"
            display="spinner"
            onChange={handleDateChange}
            style={{ height: 200 }}
            maximumDate={new Date()}
          />

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <LinearGradient
            colors={["#0F766E", "#0D9488"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}
          >
            <TouchableOpacity
              style={styles.saveButtonContent}
              onPress={handleSave}
              activeOpacity={0.9}
            >
              <IconSymbol
                name="checkmark"
                size={20}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

export default function NursingScreen() {
  const router = useRouter();
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timerState, setTimerState] = useState({
    isRunning: false,
    totalTime: 0,
    leftTime: 0,
    rightTime: 0,
    activeSide: null,
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const suggestAnim = useRef(new Animated.Value(1)).current;
  const [suggestedSide, setSuggestedSide] = useState(null);

  // Create continuous pulse animation
  useEffect(() => {
    let pulseAnimation;
    if (timerState.isRunning) {
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
  }, [timerState.isRunning]);

  // Optimized timer effect
  useEffect(() => {
    if (timerState.isRunning) {
      startTimeRef.current = Date.now() - timerState.totalTime * 1000;
      timerRef.current = setInterval(() => {
        const elapsedSeconds = Math.floor(
          (Date.now() - startTimeRef.current) / 1000
        );
        setTimerState((prev) => ({
          ...prev,
          totalTime: elapsedSeconds,
          leftTime: prev.activeSide === "L" ? prev.leftTime + 1 : prev.leftTime,
          rightTime:
            prev.activeSide === "R" ? prev.rightTime + 1 : prev.rightTime,
        }));
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerState.isRunning, timerState.activeSide]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: timerState.activeSide ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [timerState.activeSide]);

  // Modify the suggestion animation to be more subtle
  useEffect(() => {
    let suggestAnimation;
    if (!timerState.isRunning && suggestedSide) {
      suggestAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(suggestAnim, {
            toValue: 1.05,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(suggestAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      suggestAnimation.start();
    } else {
      suggestAnim.setValue(1);
    }
    return () => {
      if (suggestAnimation) {
        suggestAnimation.stop();
      }
    };
  }, [suggestedSide, timerState.isRunning]);

  // Remove the useEffect for suggestion as we'll handle it directly in toggleTimer
  useEffect(() => {
    if (timerState.isRunning) {
      setSuggestedSide(null);
    }
  }, [timerState.isRunning]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0 || hours > 0) parts.push(`${mins}m`);
    parts.push(`${secs}s`);

    return parts.join(" ");
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
    setTimerState((prev) => {
      if (!prev.isRunning) {
        setSuggestedSide(null); // Clear suggestion when starting
        return {
          ...prev,
          isRunning: true,
          activeSide: side,
        };
      } else if (prev.activeSide === side) {
        // When stopping a side, suggest the opposite side
        const oppositeSide = side === "L" ? "R" : "L";
        setSuggestedSide(oppositeSide);
        return {
          ...prev,
          isRunning: false,
          activeSide: null,
        };
      } else {
        setSuggestedSide(null); // Clear suggestion when switching sides
        return {
          ...prev,
          activeSide: side,
        };
      }
    });
  };

  const toggleMainTimer = () => {
    setTimerState((prev) => ({
      ...prev,
      isRunning: !prev.isRunning,
      activeSide: null,
    }));
  };

  const handleManualEntry = (times) => {
    if (times.total !== undefined) {
      setTimerState((prev) => ({
        ...prev,
        totalTime: times.total * 60,
        isRunning: false,
        activeSide: null,
      }));
    } else {
      setTimerState((prev) => ({
        ...prev,
        leftTime: times.left * 60,
        rightTime: times.right * 60,
        totalTime: (times.left + times.right) * 60,
        isRunning: false,
        activeSide: null,
      }));
    }
  };

  const handleSave = () => {
    if (timerState.totalTime === 0) {
      Alert.alert(
        "No Time Recorded",
        "Please record some nursing time before saving.",
        [{ text: "OK" }]
      );
      return;
    }

    // Stop the timer if it's running
    if (timerState.isRunning) {
      setTimerState((prev) => ({
        ...prev,
        isRunning: false,
        activeSide: null,
      }));
    }

    // TODO: Implement actual save logic here
    Alert.alert(
      "Session Saved",
      `Total Time: ${formatTime(timerState.totalTime)}\nLeft: ${formatTime(
        timerState.leftTime
      )}\nRight: ${formatTime(timerState.rightTime)}`,
      [
        {
          text: "OK",
          onPress: () => {
            setTimerState({
              isRunning: false,
              totalTime: 0,
              leftTime: 0,
              rightTime: 0,
              activeSide: null,
            });
          },
        },
      ]
    );
  };

  const handleDateTimeChange = (newDate) => {
    setCurrentDate(newDate);
    setShowDatePicker(false);
  };

  const isTimerEmpty = timerState.totalTime === 0;

  return (
    <View style={styles.outerContainer}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Time Display */}
          <View style={styles.timeSection}>
            <View style={styles.timeHeader}>
              <View style={styles.timeIconContainer}>
                <IconSymbol name="clock" size={24} color="#0F766E" />
                <Text style={styles.timeLabel}>Time</Text>
              </View>
              <TouchableOpacity
                style={styles.dateContainer}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name="calendar"
                  size={16}
                  color="#0F766E"
                  style={{ marginRight: 8, opacity: 0.8 }}
                />
                <Text style={styles.dateText}>
                  {currentDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <IconSymbol
                  name="chevron.down"
                  size={12}
                  color="#0F766E"
                  style={{ marginLeft: 4, opacity: 0.6 }}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Total Timer / Main Play Button */}
          <View style={styles.totalTimerSection}>
            <TouchableOpacity
              onPress={toggleMainTimer}
              activeOpacity={0.9}
              disabled={timerState.activeSide !== null}
              style={styles.totalTimerTouchable}
            >
              <LinearGradient
                colors={[
                  timerState.isRunning && !timerState.activeSide
                    ? "#0F766E"
                    : "#E0FDFA",
                  timerState.isRunning && !timerState.activeSide
                    ? "#0E7490"
                    : "#99F6E4",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.totalTimerContainer}
              >
                <Animated.View
                  style={[
                    styles.timerContent,
                    { transform: [{ scale: scaleAnim }] },
                  ]}
                >
                  <View style={styles.totalLabelContainer}>
                    <Text
                      style={[
                        styles.totalLabel,
                        timerState.isRunning &&
                          !timerState.activeSide &&
                          styles.activeTimerText,
                      ]}
                    >
                      Total Time
                    </Text>
                    <ManualEntryButton
                      onPress={() => setShowManualEntry(true)}
                      style={[
                        styles.timerManualEntry,
                        timerState.isRunning &&
                          !timerState.activeSide &&
                          styles.activeManualEntry,
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.totalTimerValue,
                      timerState.isRunning &&
                        !timerState.activeSide &&
                        styles.activeTimerText,
                    ]}
                  >
                    {formatTime(timerState.totalTime)}
                  </Text>
                  <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={styles.playIconContainer}>
                      <IconSymbol
                        name={
                          !timerState.isRunning || timerState.activeSide
                            ? "play.circle.fill"
                            : "pause.circle.fill"
                        }
                        size={44}
                        color={
                          timerState.isRunning && !timerState.activeSide
                            ? "#FFFFFF"
                            : "#0F766E"
                        }
                        style={styles.mainPlayIcon}
                      />
                    </View>
                  </Animated.View>
                </Animated.View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Side Buttons */}
          <View style={styles.sideButtonsContainer}>
            {/* Left Button */}
            <View style={styles.sideButtonWrapper}>
              <Animated.View
                style={{
                  transform: [
                    { scale: suggestedSide === "L" ? suggestAnim : 1 },
                  ],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.sideButton,
                    timerState.activeSide === "L" &&
                      timerState.isRunning &&
                      styles.activeSideButton,
                    timerState.isRunning &&
                      !timerState.activeSide &&
                      styles.disabledSideButton,
                  ]}
                  onPress={() => toggleTimer("L")}
                  disabled={timerState.isRunning && !timerState.activeSide}
                >
                  {suggestedSide === "L" ? (
                    <LinearGradient
                      colors={["#E0FDFA", "#99F6E4"]}
                      style={[
                        styles.gradientSuggestion,
                        styles.sideButtonContent,
                      ]}
                    >
                      <View style={styles.buttonContent}>
                        <IconSymbol
                          name="play.circle.fill"
                          size={44}
                          color="#0F766E"
                          style={styles.playIcon}
                        />
                      </View>
                    </LinearGradient>
                  ) : (
                    <View style={styles.buttonContent}>
                      {!(
                        timerState.activeSide === "L" && timerState.isRunning
                      ) ? (
                        <IconSymbol
                          name="play.circle.fill"
                          size={44}
                          color={
                            timerState.isRunning && !timerState.activeSide
                              ? "#CBD5E1"
                              : "#0F766E"
                          }
                          style={[
                            styles.playIcon,
                            timerState.isRunning &&
                              !timerState.activeSide &&
                              styles.disabledIcon,
                          ]}
                        />
                      ) : (
                        <>
                          <IconSymbol
                            name="pause.circle.fill"
                            size={44}
                            color="#FFFFFF"
                          />
                          <Text style={[styles.sideTime, styles.activeText]}>
                            {formatSideTime(timerState.leftTime)}
                          </Text>
                        </>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
              <View
                style={[
                  styles.sideLabelContainer,
                  timerState.isRunning &&
                    !timerState.activeSide &&
                    styles.disabledLabel,
                  suggestedSide === "L" && styles.suggestedSideLabel,
                ]}
              >
                <Text
                  style={[
                    styles.sideLabel,
                    timerState.isRunning &&
                      !timerState.activeSide &&
                      styles.disabledLabelText,
                  ]}
                >
                  Left
                </Text>
              </View>
            </View>

            {/* Right Button */}
            <View style={styles.sideButtonWrapper}>
              <Animated.View
                style={{
                  transform: [
                    { scale: suggestedSide === "R" ? suggestAnim : 1 },
                  ],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.sideButton,
                    timerState.activeSide === "R" &&
                      timerState.isRunning &&
                      styles.activeSideButton,
                    timerState.isRunning &&
                      !timerState.activeSide &&
                      styles.disabledSideButton,
                  ]}
                  onPress={() => toggleTimer("R")}
                  disabled={timerState.isRunning && !timerState.activeSide}
                >
                  {suggestedSide === "R" ? (
                    <LinearGradient
                      colors={["#E0FDFA", "#99F6E4"]}
                      style={[
                        styles.gradientSuggestion,
                        styles.sideButtonContent,
                      ]}
                    >
                      <View style={styles.buttonContent}>
                        <IconSymbol
                          name="play.circle.fill"
                          size={44}
                          color="#0F766E"
                          style={styles.playIcon}
                        />
                      </View>
                    </LinearGradient>
                  ) : (
                    <View style={styles.buttonContent}>
                      {!(
                        timerState.activeSide === "R" && timerState.isRunning
                      ) ? (
                        <IconSymbol
                          name="play.circle.fill"
                          size={44}
                          color={
                            timerState.isRunning && !timerState.activeSide
                              ? "#CBD5E1"
                              : "#0F766E"
                          }
                          style={[
                            styles.playIcon,
                            timerState.isRunning &&
                              !timerState.activeSide &&
                              styles.disabledIcon,
                          ]}
                        />
                      ) : (
                        <>
                          <IconSymbol
                            name="pause.circle.fill"
                            size={44}
                            color="#FFFFFF"
                          />
                          <Text style={[styles.sideTime, styles.activeText]}>
                            {formatSideTime(timerState.rightTime)}
                          </Text>
                        </>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
              <View
                style={[
                  styles.sideLabelContainer,
                  timerState.isRunning &&
                    !timerState.activeSide &&
                    styles.disabledLabel,
                  suggestedSide === "R" && styles.suggestedSideLabel,
                ]}
              >
                <Text
                  style={[
                    styles.sideLabel,
                    timerState.isRunning &&
                      !timerState.activeSide &&
                      styles.disabledLabelText,
                  ]}
                >
                  Right
                </Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
      <View style={styles.bottomBar}>
        <SaveButton onPress={handleSave} />
      </View>
      <ManualEntryModal
        visible={showManualEntry}
        onClose={() => setShowManualEntry(false)}
        onSave={handleManualEntry}
      />
      <DateTimeModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSave={handleDateTimeChange}
        currentDate={currentDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#F0FDFA",
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 8 : 16,
  },
  timeSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  timeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  timeIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timeLabel: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F766E",
    letterSpacing: -0.5,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(15, 118, 110, 0.1)",
  },
  dateText: {
    fontSize: 16,
    color: "#0F766E",
    fontWeight: "600",
  },
  totalTimerSection: {
    position: "relative",
    marginHorizontal: 20,
    marginBottom: 32,
  },
  totalTimerTouchable: {
    width: "100%",
  },
  totalTimerContainer: {
    padding: 32,
    borderRadius: 80,
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  timerContent: {
    alignItems: "center",
  },
  totalLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 18,
    color: "#0F766E",
    fontWeight: "600",
    opacity: 0.8,
  },
  totalTimerValue: {
    fontSize: 48,
    fontWeight: "700",
    color: "#0F766E",
    letterSpacing: -1,
    marginBottom: 8,
    textAlign: "center",
    lineHeight: 56,
  },
  activeTimerText: {
    color: "#FFFFFF",
  },
  playIconContainer: {
    marginTop: 4,
  },
  mainPlayIcon: {
    opacity: 0.9,
  },
  sideButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    paddingHorizontal: 20,
    marginBottom: Platform.OS === "ios" ? 90 : 80,
  },
  sideButtonWrapper: {
    alignItems: "center",
    gap: 20,
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
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  activeSideButton: {
    backgroundColor: "#0F766E",
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  playIcon: {
    opacity: 0.9,
  },
  sideTime: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0F766E",
    marginTop: 12,
    letterSpacing: -0.5,
    textAlign: "center",
    lineHeight: 34,
  },
  activeText: {
    color: "#FFFFFF",
  },
  sideLabelContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "#F0FDFA",
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
  sideLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F766E",
  },
  buttonContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  manualEntryContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    backgroundColor: "#F0FDFA",
  },
  manualEntryButton: {
    backgroundColor: "#F0FDFA",
    padding: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F766E",
  },
  saveButton: {
    backgroundColor: "#0F766E",
    borderRadius: 16,
    overflow: "hidden",
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
  buttonDisabled: {
    backgroundColor: "#E2E8F0",
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  saveButtonTextDisabled: {
    color: "#94A3B8",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500",
  },
  timeInputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 32 : 24,
    paddingTop: 12,
    backgroundColor: "#F0FDFA",
    borderTopWidth: 1,
    borderTopColor: "rgba(15, 118, 110, 0.08)",
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  segmentButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
  },
  segmentButtonTextActive: {
    color: "#0F766E",
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  timeInputSection: {
    marginBottom: 24,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  timeInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    color: "#1F2937",
    textAlign: "center",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0F766E",
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  saveButtonGradient: {
    borderRadius: 16,
    marginTop: 24,
    overflow: "hidden",
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
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500",
  },
  timerManualEntry: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activeManualEntry: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  suggestedSideButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 4,
    borderColor: "#0F766E",
    borderStyle: "solid",
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  suggestedSideLabel: {
    backgroundColor: "#E0FDFA",
    borderWidth: 1,
    borderColor: "#0F766E",
  },
  gradientSuggestion: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#0F766E",
  },
  sideButtonContent: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  suggestedText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#0F766E",
  },
  dateButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  dateButton: {
    flex: 1,
    backgroundColor: "#F0FDFA",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(15, 118, 110, 0.1)",
  },
  dateButtonSelected: {
    backgroundColor: "#0F766E",
    borderColor: "#0F766E",
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F766E",
  },
  dateButtonTextSelected: {
    color: "#FFFFFF",
  },
  timeSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 12,
  },
  timeOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeButton: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F0FDFA",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(15, 118, 110, 0.1)",
  },
  timeButtonSelected: {
    backgroundColor: "#0F766E",
    borderColor: "#0F766E",
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F766E",
  },
  timeButtonTextSelected: {
    color: "#FFFFFF",
  },
  disabledSideButton: {
    backgroundColor: "#E2E8F0",
  },
  disabledLabel: {
    backgroundColor: "#E2E8F0",
  },
  disabledLabelText: {
    color: "#6B7280",
  },
});
