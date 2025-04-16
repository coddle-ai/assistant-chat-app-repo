import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { TimeRangeSlider } from "../components/TimeRangeSlider";

const ProfileSection = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const TimePreferenceButton = ({ label, icon, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.timeButton, isSelected && styles.selectedTimeButton]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.timeButtonContent}>
      <View
        style={[
          styles.iconContainer,
          isSelected && styles.selectedIconContainer,
        ]}
      >
        <IconSymbol
          name={icon}
          size={20}
          color={isSelected ? "#FFFFFF" : "#0F766E"}
        />
      </View>
      <Text
        style={[
          styles.timeButtonText,
          isSelected && styles.selectedTimeButtonText,
        ]}
      >
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function ChildProfileScreen() {
  const [childImage, setChildImage] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [gender, setGender] = useState(null);
  const [dayPreference, setDayPreference] = useState(null);
  const [nightPreference, setNightPreference] = useState(null);

  const handleAddPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setChildImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log({
      childImage,
      dateOfBirth,
      dueDate,
      gender,
      dayPreference,
      nightPreference,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Profile Image */}
          <View style={styles.imageSection}>
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={handleAddPhoto}
            >
              {childImage ? (
                <Image source={{ uri: childImage }} style={styles.childImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <IconSymbol
                    name="person.crop.circle.fill"
                    size={40}
                    color="#9CA3AF"
                  />
                </View>
              )}
              <View style={styles.addPhotoButton}>
                <IconSymbol name="plus.circle.fill" size={24} color="#0F766E" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Date of Birth */}
          <ProfileSection title="Date of Birth">
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                // TODO: Implement date picker
              }}
            >
              <IconSymbol
                name="calendar"
                size={20}
                color="#0F766E"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.dateText}>
                {dateOfBirth || "Select date"}
              </Text>
              <IconSymbol
                name="chevron.right"
                size={16}
                color="#0F766E"
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
          </ProfileSection>

          {/* Due Date */}
          <ProfileSection title="Initial Planned Due Date">
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                // TODO: Implement date picker
              }}
            >
              <IconSymbol
                name="calendar"
                size={20}
                color="#0F766E"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.dateText}>{dueDate || "Select date"}</Text>
              <IconSymbol
                name="chevron.right"
                size={16}
                color="#0F766E"
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
          </ProfileSection>

          {/* Gender */}
          <ProfileSection title="Gender">
            <View style={styles.buttonGrid}>
              <TimePreferenceButton
                label="Male"
                icon="person.fill"
                isSelected={gender === "male"}
                onPress={() => setGender("male")}
              />
              <TimePreferenceButton
                label="Female"
                icon="person.fill"
                isSelected={gender === "female"}
                onPress={() => setGender("female")}
              />
            </View>
          </ProfileSection>

          {/* Time Range Slider */}
          <TimeRangeSlider
            startTime="8:00 AM"
            endTime="6:15 PM"
            onStartTimeChange={(time) =>
              console.log("Start time changed:", time)
            }
            onEndTimeChange={(time) => console.log("End time changed:", time)}
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.9}
        >
          <View style={styles.saveButtonContent}>
            <IconSymbol
              name="checkmark.circle.fill"
              size={20}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
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
  childImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F766E",
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
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
  dateText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeButton: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
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
  selectedTimeButton: {
    backgroundColor: "#0F766E",
  },
  timeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F766E",
  },
  selectedTimeButtonText: {
    color: "#FFFFFF",
  },
  bottomBar: {
    padding: 16,
    backgroundColor: "#F0FDFA",
    borderTopWidth: 1,
    borderTopColor: "rgba(15, 118, 110, 0.1)",
  },
  saveButton: {
    backgroundColor: "#0F766E",
    borderRadius: 12,
    overflow: "hidden",
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
