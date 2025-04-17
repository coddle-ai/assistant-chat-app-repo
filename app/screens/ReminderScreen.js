import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as Notifications from "expo-notifications";

export default function ReminderScreen() {
  const colorScheme = useColorScheme();
  const [timeInterval, setTimeInterval] = useState(15);
  const [isDayTimeOnly, setIsDayTimeOnly] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [selectedIntakeType, setSelectedIntakeType] = useState("Bottle");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);

  const timeIntervals = [
    15, 30, 45, 60, 90, 120, 180, 240, 360, 480, 720, 1440,
  ];

  const intakeTypes = [
    { id: "Bottle", icon: "bottle.fill", label: "Bottle" },
    { id: "Nursing", icon: "heart.fill", label: "Nursing" },
    { id: "Solid", icon: "fork.knife", label: "Solid" },
    { id: "Diaper", icon: "drop.fill", label: "Diaper" },
    { id: "Sleep", icon: "moon.fill", label: "Sleep" },
    { id: "Pumping", icon: "drop.fill", label: "Pumping" },
  ];

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  };

  const handleSave = () => {
    if (isReminderEnabled) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Activity Reminder",
          body: `Time to check ${selectedIntakeType.toLowerCase()}`,
          sound: soundEnabled,
        },
        trigger: {
          seconds: timeInterval * 60,
          repeats: true,
        },
      });
    } else {
      Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol
                name="list.bullet"
                size={24}
                color="#0F766E"
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionTitle}>Activity Type</Text>
            </View>

            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setIsDropdownOpen(true)}
            >
              <View style={styles.selectedActivity}>
                <View style={styles.selectedActivityIcon}>
                  <IconSymbol
                    name={
                      intakeTypes.find((t) => t.id === selectedIntakeType)
                        ?.icon || "bottle.fill"
                    }
                    size={20}
                    color="#0F766E"
                  />
                </View>
                <Text style={styles.selectedActivityText}>
                  {intakeTypes.find((t) => t.id === selectedIntakeType)
                    ?.label || "Select Activity"}
                </Text>
              </View>
              <IconSymbol name="chevron.down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Modal
            visible={isDropdownOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setIsDropdownOpen(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setIsDropdownOpen(false)}
            >
              <View style={styles.dropdownModal}>
                <View style={styles.dropdownContent}>
                  {intakeTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.dropdownItem,
                        selectedIntakeType === type.id &&
                          styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        setSelectedIntakeType(type.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <View
                        style={[
                          styles.dropdownItemIcon,
                          selectedIntakeType === type.id &&
                            styles.dropdownItemIconActive,
                        ]}
                      >
                        <IconSymbol
                          name={type.icon}
                          size={20}
                          color={
                            selectedIntakeType === type.id
                              ? "#FFFFFF"
                              : "#0F766E"
                          }
                        />
                      </View>
                      <Text
                        style={[
                          styles.dropdownItemText,
                          selectedIntakeType === type.id &&
                            styles.dropdownItemTextActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          </Modal>

          <View style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol
                name="clock"
                size={24}
                color="#0F766E"
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionTitle}>Time After Event</Text>
            </View>
            <View style={styles.timeIntervalGrid}>
              {timeIntervals.map((interval) => {
                const hours = Math.floor(interval / 60);
                const minutes = interval % 60;
                const displayText =
                  hours > 0
                    ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`
                    : `${minutes}m`;

                return (
                  <TouchableOpacity
                    key={interval}
                    style={[
                      styles.timeIntervalButton,
                      timeInterval === interval &&
                        styles.timeIntervalButtonActive,
                    ]}
                    onPress={() => setTimeInterval(interval)}
                  >
                    <Text
                      style={[
                        styles.timeIntervalText,
                        timeInterval === interval &&
                          styles.timeIntervalTextActive,
                      ]}
                    >
                      {displayText}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol
                name="gear"
                size={24}
                color="#0F766E"
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionTitle}>Settings</Text>
            </View>
            <View style={styles.settingsList}>
              <View style={styles.settingRow}>
                <View style={styles.settingLabelContainer}>
                  <IconSymbol
                    name="bell.fill"
                    size={22}
                    color="#0F766E"
                    style={styles.settingIcon}
                  />
                  <Text style={styles.settingLabel}>Enable Reminders</Text>
                </View>
                <Switch
                  value={isReminderEnabled}
                  onValueChange={(value) => {
                    setIsReminderEnabled(value);
                    if (value) {
                      requestNotificationPermission().then((granted) => {
                        if (!granted) {
                          setIsReminderEnabled(false);
                        }
                      });
                    } else {
                      Notifications.cancelAllScheduledNotificationsAsync();
                    }
                  }}
                  trackColor={{ false: "#E5E7EB", true: "#059669" }}
                  thumbColor={
                    Platform.OS === "ios"
                      ? "#FFFFFF"
                      : isReminderEnabled
                      ? "#FFFFFF"
                      : "#F3F4F6"
                  }
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLabelContainer}>
                  <IconSymbol
                    name="sun.max"
                    size={22}
                    color="#0F766E"
                    style={styles.settingIcon}
                  />
                  <Text
                    style={[
                      styles.settingLabel,
                      !isReminderEnabled && styles.disabledText,
                    ]}
                  >
                    Day Time Only
                  </Text>
                </View>
                <Switch
                  value={isDayTimeOnly}
                  onValueChange={setIsDayTimeOnly}
                  trackColor={{ false: "#E5E7EB", true: "#059669" }}
                  thumbColor={
                    Platform.OS === "ios"
                      ? "#FFFFFF"
                      : isDayTimeOnly
                      ? "#FFFFFF"
                      : "#F3F4F6"
                  }
                  disabled={!isReminderEnabled}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLabelContainer}>
                  <IconSymbol
                    name="speaker.wave.2"
                    size={22}
                    color="#0F766E"
                    style={styles.settingIcon}
                  />
                  <Text
                    style={[
                      styles.settingLabel,
                      !isReminderEnabled && styles.disabledText,
                    ]}
                  >
                    Sound
                  </Text>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{ false: "#E5E7EB", true: "#059669" }}
                  thumbColor={
                    Platform.OS === "ios"
                      ? "#FFFFFF"
                      : soundEnabled
                      ? "#FFFFFF"
                      : "#F3F4F6"
                  }
                  disabled={!isReminderEnabled}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLabelContainer}>
                  <IconSymbol
                    name="waveform"
                    size={22}
                    color="#0F766E"
                    style={styles.settingIcon}
                  />
                  <Text
                    style={[
                      styles.settingLabel,
                      !isReminderEnabled && styles.disabledText,
                    ]}
                  >
                    Haptics
                  </Text>
                </View>
                <Switch
                  value={hapticsEnabled}
                  onValueChange={setHapticsEnabled}
                  trackColor={{ false: "#E5E7EB", true: "#059669" }}
                  thumbColor={
                    Platform.OS === "ios"
                      ? "#FFFFFF"
                      : hapticsEnabled
                      ? "#FFFFFF"
                      : "#F3F4F6"
                  }
                  disabled={!isReminderEnabled}
                />
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.previewSection}>
            <View style={styles.previewHeader}>
              <IconSymbol
                name="info.circle.fill"
                size={22}
                color="#0F766E"
                style={styles.previewIcon}
              />
              <Text style={styles.previewTitle}>Reminder Preview</Text>
            </View>
            <View style={styles.previewContent}>
              {isReminderEnabled ? (
                <>
                  <Text style={styles.previewText}>
                    You will be reminded to check{" "}
                    {selectedIntakeType.toLowerCase()} every{" "}
                    {timeInterval >= 60
                      ? `${Math.floor(timeInterval / 60)}h${
                          timeInterval % 60 ? ` ${timeInterval % 60}m` : ""
                        }`
                      : `${timeInterval}m`}
                  </Text>
                  {isDayTimeOnly && (
                    <Text style={styles.previewText}>
                      • Only during day time (6 AM - 10 PM)
                    </Text>
                  )}
                  {!soundEnabled && (
                    <Text style={styles.previewText}>
                      • Silent notifications
                    </Text>
                  )}
                  {!hapticsEnabled && (
                    <Text style={styles.previewText}>• No vibration</Text>
                  )}
                </>
              ) : (
                <Text style={styles.previewText}>
                  Reminders are currently disabled
                </Text>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionIcon: {
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F766E",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  timeIntervalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    justifyContent: "space-between",
  },
  timeIntervalButton: {
    width: "23%",
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    marginBottom: 4,
  },
  timeIntervalButtonActive: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  timeIntervalText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4B5563",
    textAlign: "center",
  },
  timeIntervalTextActive: {
    color: "white",
  },
  settingsList: {
    gap: 8,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  settingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: 6,
  },
  settingLabel: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#059669",
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 8,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  saveButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  selectedActivity: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedActivityIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F0FDFA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  selectedActivityText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownModal: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  dropdownContent: {
    padding: 6,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: "#059669",
  },
  dropdownItemIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0FDFA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  dropdownItemIconActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  dropdownItemTextActive: {
    color: "white",
  },
  previewSection: {
    backgroundColor: "#F0FDFA",
    borderRadius: 10,
    padding: 8,
    marginTop: 4,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  previewIcon: {
    marginRight: 6,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F766E",
  },
  previewContent: {
    gap: 2,
  },
  previewText: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
  disabledText: {
    color: "#9CA3AF",
  },
});
