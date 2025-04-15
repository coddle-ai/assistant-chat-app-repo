import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { format } from "date-fns";

export default function DailyIntakeScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Sample data - replace with actual data from your backend
  const dailyLogs = [
    {
      id: 1,
      time: "07:30 AM",
      type: "Nursing",
      duration: "15m",
      side: "Left",
      notes: "Calm feeding",
    },
    {
      id: 2,
      time: "10:15 AM",
      type: "Bottle",
      amount: "90ml",
      formula: "Regular",
      notes: "Finished quickly",
    },
    {
      id: 3,
      time: "02:00 PM",
      type: "Nursing",
      duration: "20m",
      side: "Right",
      notes: "Sleepy but fed well",
    },
    {
      id: 4,
      time: "05:45 PM",
      type: "Bottle",
      amount: "120ml",
      formula: "Regular",
      notes: "Very hungry",
    },
  ];

  const dailySummary = {
    totalFeedings: dailyLogs.length,
    totalNursing: dailyLogs.filter((log) => log.type === "Nursing").length,
    totalBottle: dailyLogs.filter((log) => log.type === "Bottle").length,
    totalVolume: dailyLogs
      .filter((log) => log.amount)
      .reduce((sum, log) => sum + parseInt(log.amount), 0),
    avgDuration: Math.round(
      dailyLogs
        .filter((log) => log.duration)
        .reduce((sum, log) => sum + parseInt(log.duration), 0) /
        dailyLogs.filter((log) => log.duration).length
    ),
  };

  const renderFeedingCard = (log) => (
    <View key={log.id} style={styles.feedingCard}>
      <View style={styles.feedingHeader}>
        <View style={styles.timeContainer}>
          <IconSymbol name="clock" size={16} color="#0F766E" />
          <Text style={styles.timeText}>{log.time}</Text>
        </View>
        <View
          style={[
            styles.typeTag,
            { backgroundColor: log.type === "Nursing" ? "#F0FDFA" : "#FEF3C7" },
          ]}
        >
          <Text
            style={[
              styles.typeText,
              { color: log.type === "Nursing" ? "#0F766E" : "#92400E" },
            ]}
          >
            {log.type}
          </Text>
        </View>
      </View>

      <View style={styles.feedingDetails}>
        {log.type === "Nursing" ? (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>{log.duration}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Side:</Text>
              <Text style={styles.detailValue}>{log.side}</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount:</Text>
              <Text style={styles.detailValue}>{log.amount}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Formula:</Text>
              <Text style={styles.detailValue}>{log.formula}</Text>
            </View>
          </>
        )}
        {log.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesText}>{log.notes}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>
            {format(selectedDate, "EEEE, MMMM d")}
          </Text>
        </View>

        {/* Daily Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Daily Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {dailySummary.totalFeedings}
              </Text>
              <Text style={styles.summaryLabel}>Total Feeds</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {dailySummary.totalNursing}
              </Text>
              <Text style={styles.summaryLabel}>Nursing</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {dailySummary.totalBottle}
              </Text>
              <Text style={styles.summaryLabel}>Bottle</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {dailySummary.totalVolume}ml
              </Text>
              <Text style={styles.summaryLabel}>Total Volume</Text>
            </View>
          </View>
        </View>

        {/* Feeding Logs */}
        <View style={styles.logsContainer}>
          <Text style={styles.logsTitle}>Feeding Log</Text>
          {dailyLogs.map(renderFeedingCard)}
        </View>
      </ScrollView>
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
    padding: 16,
  },
  dateHeader: {
    marginBottom: 16,
    alignItems: "center",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F766E",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F766E",
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F0FDFA",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F766E",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  logsContainer: {
    gap: 12,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F766E",
    marginBottom: 8,
  },
  feedingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  feedingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F766E",
  },
  typeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  feedingDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 13,
    color: "#0F766E",
    fontWeight: "600",
  },
  notesContainer: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  notesText: {
    fontSize: 13,
    color: "#64748B",
    fontStyle: "italic",
  },
});
