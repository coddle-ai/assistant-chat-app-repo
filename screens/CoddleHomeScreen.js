import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const trackingData = [
  {
    type: "Bottle",
    lastTime: "1h ago",
    quantity: "120ml",
    color: "#EBF5FF",
    textColor: "#1E40AF",
    isBottle: true,
    isDue: true,
  },
  {
    type: "Breastfeed",
    lastTime: "2h ago",
    quantity: "10 min",
    color: "#FCE7F3",
    textColor: "#9D174D",
  },
  {
    type: "Solids",
    lastTime: "3h ago",
    quantity: "Banana",
    color: "#FEF3C7",
    textColor: "#92400E",
  },
  {
    type: "Bottle",
    lastTime: "1h ago",
    quantity: "120ml",
    color: "#EBF5FF",
    textColor: "#1E40AF",
    isBottle: true,
  },
  {
    type: "Sleep",
    lastTime: "Just now",
    quantity: "Started",
    color: "#CCFBF1",
    textColor: "#134E4A",
    isOngoing: true,
  },
  {
    type: "Diaper",
    lastTime: "1.5h ago",
    quantity: "Wet",
    color: "#D1FAE5",
    textColor: "#065F46",
    isDiaper: true,
  },
  {
    type: "Pumping",
    lastTime: "30m ago",
    quantity: "150ml",
    color: "#FEE2E2",
    textColor: "#991B1B",
  },
];

const prompts = [
  {
    type: "question",
    text: "What should I do if baby skips naps?",
    icon: "❓",
  },
  {
    type: "recommendation",
    text: "Best sleep schedule for 6-month-old",
    icon: "💡",
  },
  {
    type: "log",
    text: "Log bottle feeding",
    icon: "🍼",
  },
];

export default function CoddleHomeScreen() {
  const renderSummaryCard = () => (
    <View style={styles.summaryCard}>
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Feeding</Text>
        <Text style={styles.summaryText}>🍼 Bottle: 2x (250ml)</Text>
        <Text style={styles.summaryText}>🤱 Breastfeeding: 1x (10 min)</Text>
        <Text style={styles.summaryText}>🍌 Solids: 2x (Banana, Oats)</Text>
      </View>

      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Sleep</Text>
        <Text style={styles.summaryText}>😴 Nap: 1x</Text>
      </View>

      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Diaper</Text>
        <Text style={styles.summaryText}>💩 2x (Mixed)</Text>
      </View>
    </View>
  );

  const renderTrackingCard = (item) => (
    <View
      key={`${item.type}-${item.lastTime}`}
      style={[styles.trackingCard, { backgroundColor: item.color }]}
    >
      <View>
        {item.isDue && (
          <View style={styles.dueTag}>
            <Text style={styles.dueText}>Due</Text>
          </View>
        )}
        {item.isOngoing && (
          <View style={styles.ongoingIndicator}>
            <Text>⚡</Text>
          </View>
        )}
        <Text style={[styles.trackingText, { color: item.textColor }]}>
          ⏱ {item.lastTime}
        </Text>
        <Text style={[styles.trackingText, { color: item.textColor }]}>
          📊 {item.quantity}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        {item.isDiaper ? (
          <>
            <TouchableOpacity style={styles.iconButton}>
              <Text>💩</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text>💧</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text>♻️</Text>
            </TouchableOpacity>
          </>
        ) : item.isBottle ? (
          <>
            <TouchableOpacity style={styles.iconButton}>
              <Text>🍼</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text>🥛</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.plusButton}>
            <Ionicons name="add" size={24} color="#1F2937" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.childSelector}>
          <Text style={styles.childText}>Om · 9m 30d</Text>
          <Ionicons name="chevron-down" size={16} color="#1F2937" />
        </TouchableOpacity>

        <Text style={styles.titleText}>Coddle</Text>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="settings-outline" size={24} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.suggestionCard, styles.questionCard]}
        activeOpacity={0.7}
      >
        <View style={styles.suggestionIconContainer}>
          <Text style={styles.suggestionIcon}>{prompts[0].icon}</Text>
        </View>
        <Text style={styles.suggestionText}>{prompts[0].text}</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView}>
        {renderSummaryCard()}

        <View style={styles.trackingGrid}>
          {trackingData.map(renderTrackingCard)}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="home-outline" size={24} color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="list-outline" size={24} color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabButton}>
          <Ionicons name="logo-reddit" size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="stats-chart-outline" size={24} color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="person-outline" size={24} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.voiceButton}>
        <Ionicons name="mic-outline" size={24} color="#1F2937" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "white",
  },
  childSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  childText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  summarySection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 2,
  },
  trackingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  trackingCard: {
    width: "48.5%",
    borderRadius: 12,
    padding: 12,
    minHeight: 110,
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  trackingText: {
    fontSize: 12,
    marginBottom: 3,
    opacity: 0.8,
  },
  dueTag: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  dueText: {
    fontSize: 10,
    color: "#92400E",
  },
  ongoingIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  iconButton: {
    backgroundColor: "white",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  plusButton: {
    backgroundColor: "white",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  suggestionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderLeftWidth: 3,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  questionCard: {
    borderLeftColor: "#3B82F6",
  },
  suggestionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.03)",
    justifyContent: "center",
    alignItems: "center",
  },
  suggestionIcon: {
    fontSize: 14,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  navButton: {
    padding: 8,
  },
  fabButton: {
    backgroundColor: "#FCD34D",
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -32,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  voiceButton: {
    position: "absolute",
    right: "50%",
    bottom: 96,
    transform: [{ translateX: 28 }],
    backgroundColor: "white",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
