import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Modal,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";

const DiaperTypeButton = ({ type, icon, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.typeButton, isSelected && styles.selectedTypeButton]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.typeButtonContent}>
      <View
        style={[
          styles.iconContainer,
          isSelected && styles.selectedIconContainer,
        ]}
      >
        <IconSymbol
          name={icon}
          size={24}
          color={isSelected ? "#FFFFFF" : "#0F766E"}
        />
      </View>
      <Text
        style={[
          styles.typeButtonText,
          isSelected && styles.selectedTypeButtonText,
        ]}
      >
        {type}
      </Text>
    </View>
  </TouchableOpacity>
);

const QuantityButton = ({ label, icon, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.typeButton, isSelected && styles.selectedTypeButton]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.typeButtonContent}>
      <View
        style={[
          styles.iconContainer,
          isSelected && styles.selectedIconContainer,
        ]}
      >
        <IconSymbol
          name={icon}
          size={24}
          color={isSelected ? "#FFFFFF" : "#0F766E"}
        />
      </View>
      <Text
        style={[
          styles.typeButtonText,
          isSelected && styles.selectedTypeButtonText,
        ]}
      >
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

const ColorButton = ({ color, label, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.typeButton, isSelected && styles.selectedTypeButton]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.typeButtonContent}>
      <View
        style={[
          styles.colorCircle,
          { backgroundColor: color },
          isSelected && styles.selectedColorCircle,
        ]}
      />
      <Text
        style={[
          styles.typeButtonText,
          isSelected && styles.selectedTypeButtonText,
        ]}
      >
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

const ConsistencyButton = ({ type, icon, color, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.typeButton, isSelected && styles.selectedTypeButton]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.typeButtonContent}>
      <View
        style={[
          styles.iconContainer,
          isSelected && styles.selectedIconContainer,
        ]}
      >
        <IconSymbol
          name={icon}
          size={20}
          color={isSelected ? "#FFFFFF" : color || "#DC2626"}
        />
      </View>
      <Text
        style={[
          styles.typeButtonText,
          isSelected && styles.selectedTypeButtonText,
          styles.concernText,
        ]}
      >
        {type}
      </Text>
    </View>
  </TouchableOpacity>
);

const TooltipModal = ({ visible, onClose }) => {
  const indicators = [
    {
      title: "White Stool",
      description:
        "May indicate a bile duct or liver issue. Prompt evaluation is recommended.",
      icon: "circle.fill",
      color: "#FFFFFF",
    },
    {
      title: "Black Stool",
      description:
        "Normal during first 1–3 days (meconium). If appears/reappears after first week, contact pediatrician.",
      icon: "circle.fill",
      color: "#000000",
    },
    {
      title: "Mucousy Stool",
      description:
        "May be normal after illness or vaccinations, but follow up if persistent.",
      icon: "waveform.path",
      color: "#DC2626",
    },
    {
      title: "Red Stool",
      description:
        "Can signal food sensitivity, infection, or other concerns. Contact pediatrician.",
      icon: "drop.fill",
      color: "#DC2626",
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.tooltipContainer}>
          <View style={styles.tooltipHeader}>
            <Text style={styles.tooltipTitle}>Concerning Indicators</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark.circle.fill" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.tooltipContent}>
            {indicators.map((indicator, index) => (
              <View key={index} style={styles.indicatorItem}>
                <View style={styles.indicatorIconContainer}>
                  <IconSymbol
                    name={indicator.icon}
                    size={20}
                    color={indicator.color}
                  />
                </View>
                <View style={styles.indicatorTextContainer}>
                  <Text style={styles.indicatorTitle}>{indicator.title}</Text>
                  <Text style={styles.indicatorDescription}>
                    {indicator.description}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default function DiaperScreen() {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedConsistency, setSelectedConsistency] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to upload photos.",
          [{ text: "OK" }]
        );
      }
    })();
  }, []);

  const handleAddPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add photo. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log({
      type: selectedType,
      quantity: selectedQuantity,
      color: selectedColor,
      consistency: selectedConsistency,
      note,
      photos,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Time Header */}
          <View style={styles.timeSection}>
            <View style={styles.timeHeader}>
              <View style={styles.timeIconContainer}>
                <IconSymbol name="clock" size={24} color="#374151" />
                <Text style={styles.timeLabel}>Time</Text>
              </View>
              <TouchableOpacity
                style={styles.dateContainer}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name="calendar"
                  size={20}
                  color="#374151"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.dateText}>Apr 15 at 5:08 PM</Text>
                <IconSymbol
                  name="chevron.right"
                  size={16}
                  color="#374151"
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Diaper Contents */}
          <View
            style={[
              styles.section,
              { backgroundColor: "#E0F7F6", padding: 16, borderRadius: 16 },
            ]}
          >
            <Text style={styles.sectionTitle}>Diaper Contents *</Text>
            <View style={styles.buttonGrid}>
              <DiaperTypeButton
                type="Wet"
                icon="drop.fill"
                isSelected={selectedType === "wet"}
                onPress={() => setSelectedType("wet")}
              />
              <DiaperTypeButton
                type="Dirty"
                icon="circle.fill"
                isSelected={selectedType === "dirty"}
                onPress={() => setSelectedType("dirty")}
              />
              <DiaperTypeButton
                type="Mixed"
                icon="circle.grid.cross.fill"
                isSelected={selectedType === "mixed"}
                onPress={() => setSelectedType("mixed")}
              />
              <DiaperTypeButton
                type="Clean"
                icon="checkmark.circle.fill"
                isSelected={selectedType === "clean"}
                onPress={() => setSelectedType("clean")}
              />
            </View>
          </View>

          {/* Amount */}
          <View
            style={[
              styles.section,
              { backgroundColor: "#F0FDF9", padding: 16, borderRadius: 16 },
            ]}
          >
            <Text style={styles.sectionTitle}>Amount</Text>
            <View style={styles.buttonGrid}>
              <QuantityButton
                label="Small"
                icon="drop"
                isSelected={selectedQuantity === "small"}
                onPress={() => setSelectedQuantity("small")}
              />
              <QuantityButton
                label="Medium"
                icon="drop.fill"
                isSelected={selectedQuantity === "medium"}
                onPress={() => setSelectedQuantity("medium")}
              />
              <QuantityButton
                label="Large"
                icon="drop.circle.fill"
                isSelected={selectedQuantity === "large"}
                onPress={() => setSelectedQuantity("large")}
              />
              <QuantityButton
                label="Overflow"
                icon="exclamationmark.circle.fill"
                isSelected={selectedQuantity === "overflow"}
                onPress={() => setSelectedQuantity("overflow")}
              />
            </View>
          </View>

          {/* Color */}
          <View
            style={[
              styles.section,
              { backgroundColor: "#F0FDF9", padding: 16, borderRadius: 16 },
            ]}
          >
            <Text style={styles.sectionTitle}>Color (optional)</Text>
            <View style={styles.buttonGrid}>
              <ColorButton
                color="#FFD700"
                label="Yellow"
                isSelected={selectedColor === "yellow"}
                onPress={() => setSelectedColor("yellow")}
              />
              <ColorButton
                color="#8B4513"
                label="Brown"
                isSelected={selectedColor === "brown"}
                onPress={() => setSelectedColor("brown")}
              />
              <ColorButton
                color="#2E8B57"
                label="Green"
                isSelected={selectedColor === "green"}
                onPress={() => setSelectedColor("green")}
              />
              <ColorButton
                color="#2F4F4F"
                label="Black"
                isSelected={selectedColor === "black"}
                onPress={() => setSelectedColor("black")}
              />
            </View>
          </View>

          {/* Concerning Indicators */}
          <View
            style={[
              styles.section,
              { backgroundColor: "#FEF2F2", padding: 16, borderRadius: 16 },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: "#DC2626" }]}>
                Concerning Indicators
              </Text>
              <TouchableOpacity
                onPress={() => setShowTooltip(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <IconSymbol
                  name="info.circle.fill"
                  size={18}
                  color="#DC2626"
                  style={{ opacity: 0.8 }}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.buttonGrid}>
              <ConsistencyButton
                type="White Stool"
                icon="circle.fill"
                color="#FFFFFF"
                isSelected={selectedConsistency === "white"}
                onPress={() => setSelectedConsistency("white")}
              />
              <ConsistencyButton
                type="Black Stool"
                icon="circle.fill"
                color="#000000"
                isSelected={selectedConsistency === "black"}
                onPress={() => setSelectedConsistency("black")}
              />
              <ConsistencyButton
                type="Mucousy Stool"
                icon="waveform.path"
                isSelected={selectedConsistency === "mucousy"}
                onPress={() => setSelectedConsistency("mucousy")}
              />
              <ConsistencyButton
                type="Red Stool"
                icon="drop.fill"
                color="#DC2626"
                isSelected={selectedConsistency === "blood"}
                onPress={() => setSelectedConsistency("blood")}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <TooltipModal
        visible={showTooltip}
        onClose={() => setShowTooltip(false)}
      />

      {/* Bottom Bar with Add Details and Save */}
      <View style={styles.bottomBar}>
        {/* Add Details Button */}
        <TouchableOpacity
          style={styles.addDetailsButton}
          onPress={() => setShowDetails(!showDetails)}
          activeOpacity={0.7}
        >
          <View style={styles.addDetailsContent}>
            <IconSymbol
              name={showDetails ? "chevron.down" : "chevron.right"}
              size={16}
              color="#374151"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.addDetailsText}>
              {showDetails ? "Hide Details" : "Add Details"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Expandable Details Section */}
        {showDetails && (
          <View style={styles.detailsSection}>
            {/* Photos */}
            <View style={styles.detailItem}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={handleAddPhoto}
              >
                <IconSymbol name="photo" size={20} color="#374151" />
                <Text style={styles.photoButtonText}>Add Photos</Text>
              </TouchableOpacity>
              {photos.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.photoScroll}
                >
                  {photos.map((photo, index) => (
                    <Image
                      key={index}
                      source={{ uri: photo }}
                      style={styles.photoThumbnail}
                    />
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Notes */}
            <View style={styles.detailItem}>
              <TextInput
                style={styles.noteInput}
                placeholder="Add a note..."
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            !selectedType && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          activeOpacity={0.9}
          disabled={!selectedType}
        >
          <View style={styles.saveButtonContent}>
            <IconSymbol
              name="checkmark.circle.fill"
              size={20}
              color={selectedType ? "#0F766E" : "#9CA3AF"}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.saveButtonText,
                !selectedType && { color: "#9CA3AF" },
              ]}
            >
              Save Change
            </Text>
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
    padding: 12,
  },
  timeSection: {
    marginBottom: 16,
  },
  timeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 12,
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
    gap: 4,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F766E",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  dateText: {
    fontSize: 13,
    color: "#0F766E",
    fontWeight: "500",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F766E",
    marginBottom: 8,
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  typeButton: {
    flex: 1,
    minWidth: "23%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 8,
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
  selectedTypeButton: {
    backgroundColor: "#0F766E",
  },
  typeButtonContent: {
    alignItems: "center",
    gap: 4,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#0F766E",
    textAlign: "center",
  },
  selectedTypeButtonText: {
    color: "#FFFFFF",
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  selectedColorCircle: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  bottomBar: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
    paddingTop: 8,
    backgroundColor: "#F0FDFA",
    borderTopWidth: 1,
    borderTopColor: "rgba(15, 118, 110, 0.1)",
  },
  addDetailsButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 8,
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
  addDetailsContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  addDetailsText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F766E",
  },
  detailsSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 8,
    padding: 10,
    gap: 8,
  },
  detailItem: {
    gap: 6,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  photoButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#0F766E",
  },
  photoScroll: {
    marginTop: 6,
  },
  photoThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 6,
  },
  noteInput: {
    backgroundColor: "#F0FDFA",
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: "#1F2937",
    minHeight: 60,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#94A3B8",
    borderRadius: 10,
    overflow: "hidden",
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  saveButtonDisabled: {
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  concernText: {
    color: "#DC2626",
    fontSize: 11,
    lineHeight: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  tooltipContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  tooltipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  tooltipContent: {
    padding: 16,
  },
  indicatorItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  indicatorIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  indicatorTextContainer: {
    flex: 1,
  },
  indicatorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  indicatorDescription: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
});
