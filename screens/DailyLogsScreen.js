import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { ThemedView, ThemedText } from "../components/ThemedComponents";
import { format, subDays, addDays } from "date-fns";
import { Calendar } from "react-native-calendars";

const FILTER_TABS = ["All", "Feed", "Sleep", "Diaper"];
const ITEMS_PER_PAGE = 5; // Number of days to load at once

// Example data structure for logs
const logs = {
  "Apr 10, 2025": {
    nursing: [
      {
        time: "05:34AM",
        duration: "22m",
        details: "L-7m, R-15m | Start L",
        logType: "quick",
      },
    ],
    solids: [
      {
        time: "06:15PM",
        amount: "1 bowl",
        type: "Daal rice",
        logType: "manual",
      },
    ],
    bottle: [
      {
        time: "07:05PM",
        amount: "120ml",
        type: "Expressed milk",
        logType: "ai",
      },
    ],
    pumping: [
      { time: "11:00PM", amount: "150ml", logType: "quick" },
      { time: "06:30PM", amount: "180ml", logType: "manual" },
      { time: "11:30AM", amount: "200ml", logType: "ai" },
    ],
  },
  "Apr 09, 2025": {
    nursing: [{ time: "11:00AM", duration: "11m" }],
    bottle: [{ time: "08:30PM", amount: "120ml", type: "Expressed milk" }],
    sleep: [
      { time: "09:30PM - 05:30AM", duration: "Slept for 8h 0m" },
      { time: "05:15PM - 07:30PM", duration: "Slept for 2h 15m" },
    ],
    pumping: [
      { time: "10:05PM", amount: "165ml" },
      { time: "04:30PM", amount: "150ml" },
    ],
  },
  "Apr 08, 2025": {
    nursing: [
      { time: "06:00AM", duration: "15m", details: "L-8m, R-7m | Start R" },
      { time: "02:30PM", duration: "12m", details: "L-6m, R-6m | Start L" },
    ],
    solids: [
      { time: "11:00AM", amount: "1/2 bowl", type: "Oatmeal" },
      { time: "05:00PM", amount: "1 bowl", type: "Mashed banana" },
    ],
    sleep: [
      { time: "08:00PM - 06:00AM", duration: "Slept for 10h 0m" },
      { time: "12:30PM - 02:00PM", duration: "Slept for 1h 30m" },
    ],
    diaper: [
      { time: "07:30AM", type: "Wet" },
      { time: "01:00PM", type: "Mixed" },
      { time: "04:45PM", type: "Wet" },
    ],
  },
  "Apr 07, 2025": {
    nursing: [
      { time: "05:45AM", duration: "18m", details: "L-9m, R-9m | Start L" },
      { time: "03:00PM", duration: "14m", details: "L-7m, R-7m | Start R" },
    ],
    bottle: [
      { time: "10:30AM", amount: "150ml", type: "Formula" },
      { time: "07:00PM", amount: "120ml", type: "Expressed milk" },
    ],
    sleep: [
      { time: "09:00PM - 05:45AM", duration: "Slept for 8h 45m" },
      { time: "11:30AM - 01:00PM", duration: "Slept for 1h 30m" },
    ],
    pumping: [
      { time: "09:00AM", amount: "180ml" },
      { time: "02:00PM", amount: "160ml" },
      { time: "08:00PM", amount: "190ml" },
    ],
  },
  "Apr 06, 2025": {
    nursing: [
      { time: "06:15AM", duration: "20m", details: "L-10m, R-10m | Start L" },
    ],
    solids: [
      { time: "11:30AM", amount: "1 bowl", type: "Rice cereal" },
      { time: "05:30PM", amount: "1/2 bowl", type: "Avocado" },
    ],
    sleep: [
      { time: "08:30PM - 06:15AM", duration: "Slept for 9h 45m" },
      { time: "12:00PM - 01:30PM", duration: "Slept for 1h 30m" },
    ],
    diaper: [
      { time: "07:00AM", type: "Wet" },
      { time: "02:00PM", type: "Mixed" },
      { time: "06:00PM", type: "Wet" },
    ],
  },
  "Apr 05, 2025": {
    nursing: [
      { time: "05:30AM", duration: "16m", details: "L-8m, R-8m | Start R" },
      { time: "02:00PM", duration: "13m", details: "L-7m, R-6m | Start L" },
    ],
    bottle: [
      { time: "09:30AM", amount: "140ml", type: "Formula" },
      { time: "06:30PM", amount: "130ml", type: "Expressed milk" },
    ],
    sleep: [
      { time: "09:15PM - 05:30AM", duration: "Slept for 8h 15m" },
      { time: "11:00AM - 12:30PM", duration: "Slept for 1h 30m" },
    ],
    pumping: [
      { time: "08:30AM", amount: "170ml" },
      { time: "01:00PM", amount: "150ml" },
      { time: "07:30PM", amount: "180ml" },
    ],
  },
};

const DailyLogsScreen = () => {
  const [selectedTab, setSelectedTab] = useState("All");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [visibleDates, setVisibleDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  // Initialize with first page of dates
  React.useEffect(() => {
    const dates = Object.keys(logs).sort((a, b) => new Date(b) - new Date(a));
    setVisibleDates(dates.slice(0, ITEMS_PER_PAGE));
  }, []);

  const loadMoreDates = useCallback(() => {
    if (isLoading) return;

    setIsLoading(true);
    const dates = Object.keys(logs).sort((a, b) => new Date(b) - new Date(a));
    const currentLength = visibleDates.length;
    const nextDates = dates.slice(
      currentLength,
      currentLength + ITEMS_PER_PAGE
    );

    setTimeout(() => {
      setVisibleDates((prev) => [...prev, ...nextDates]);
      setIsLoading(false);
    }, 500); // Simulate network delay
  }, [visibleDates, isLoading]);

  const scrollToDate = useCallback((date) => {
    const dates = Object.keys(logs).sort((a, b) => new Date(b) - new Date(a));
    const index = dates.indexOf(date);
    if (index !== -1) {
      // Load dates around the target date
      const startIndex = Math.max(0, index - 2);
      const endIndex = Math.min(dates.length, index + 3);
      setVisibleDates(dates.slice(startIndex, endIndex));

      // Scroll to the date after a short delay to ensure the dates are loaded
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: index - startIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }, 100);
    }
  }, []);

  const handleDateSelect = useCallback(
    (day) => {
      const selectedDateStr = format(new Date(day.dateString), "MMM dd, yyyy");
      setSelectedDate(new Date(day.dateString));
      setIsDatePickerVisible(false);
      scrollToDate(selectedDateStr);
    },
    [scrollToDate]
  );

  const filterActivities = (activities) => {
    if (selectedTab === "All") return activities;

    const filteredActivities = {};
    switch (selectedTab) {
      case "Feed":
        if (activities.nursing) filteredActivities.nursing = activities.nursing;
        if (activities.solids) filteredActivities.solids = activities.solids;
        if (activities.bottle) filteredActivities.bottle = activities.bottle;
        break;
      case "Sleep":
        if (activities.sleep) filteredActivities.sleep = activities.sleep;
        break;
      case "Diaper":
        if (activities.diaper) filteredActivities.diaper = activities.diaper;
        break;
      default:
        return activities;
    }
    return filteredActivities;
  };

  const shouldShowDate = (activities) => {
    if (selectedTab === "All") return true;
    const filtered = filterActivities(activities);
    return Object.keys(filtered).length > 0;
  };

  const getLogTypeIcon = (logType) => {
    switch (logType) {
      case "quick":
        return "⚡"; // Lightning bolt for quick log (more subtle than phone)
      case "ai":
        return "★"; // Star for AI assistant (more subtle than sparkles)
      default:
        return "";
    }
  };

  const renderSummary = (activities) => {
    const filteredActivities = filterActivities(activities);
    const summary = {
      nursing: filteredActivities.nursing?.length || 0,
      solids: filteredActivities.solids?.length || 0,
      bottle: filteredActivities.bottle?.length || 0,
      pumping: filteredActivities.pumping?.length || 0,
      sleep: filteredActivities.sleep?.length || 0,
    };

    const getTotalPumpingAmount = () => {
      return filteredActivities.pumping?.reduce((total, pump) => {
        return total + parseInt(pump.amount);
      }, 0);
    };

    const getTotalSleepDuration = () => {
      if (!filteredActivities.sleep) return "";
      return filteredActivities.sleep.reduce((total, sleep) => {
        const duration = sleep.duration.match(/(\d+)h\s*(\d+)m/);
        if (duration) {
          return total + parseInt(duration[1]) * 60 + parseInt(duration[2]);
        }
        return total;
      }, 0);
    };

    return (
      <>
        {summary.nursing > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryIcon}>🤱</Text>
            <Text style={styles.summaryLabel}>Nursing</Text>
            <Text style={styles.summaryValue}>
              {summary.nursing} time{summary.nursing > 1 ? "s" : ""} •{" "}
              {filteredActivities.nursing[0].duration}
            </Text>
          </View>
        )}
        {summary.solids > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryIcon}>🍽️</Text>
            <Text style={styles.summaryLabel}>Solids</Text>
            <Text style={styles.summaryValue}>
              {summary.solids} time{summary.solids > 1 ? "s" : ""} •{" "}
              {filteredActivities.solids[0].type}
            </Text>
          </View>
        )}
        {summary.bottle > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryIcon}>🍼</Text>
            <Text style={styles.summaryLabel}>Bottle</Text>
            <Text style={styles.summaryValue}>
              {summary.bottle} time{summary.bottle > 1 ? "s" : ""} •{" "}
              {filteredActivities.bottle[0].amount}
            </Text>
          </View>
        )}
        {summary.pumping > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryIcon}>💧</Text>
            <Text style={styles.summaryLabel}>Pumping</Text>
            <Text style={styles.summaryValue}>
              {summary.pumping} time{summary.pumping > 1 ? "s" : ""} •{" "}
              {getTotalPumpingAmount()}ml
            </Text>
          </View>
        )}
        {summary.sleep > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryIcon}>😴</Text>
            <Text style={styles.summaryLabel}>Sleep</Text>
            <Text style={styles.summaryValue}>
              {summary.sleep} time{summary.sleep > 1 ? "s" : ""} •{" "}
              {Math.floor(getTotalSleepDuration() / 60)}h{" "}
              {getTotalSleepDuration() % 60}m
            </Text>
          </View>
        )}
      </>
    );
  };

  const renderTimeline = (activities) => {
    const filteredActivities = filterActivities(activities);
    return Object.entries(filteredActivities).map(([type, events]) =>
      events.map((event, index) => {
        const formattedTime =
          type === "sleep" ? event.time.replace(" - ", "→") : event.time;

        return (
          <View
            key={`${type}-${event.time}-${index}`}
            style={styles.timelineEntry}
          >
            <View style={styles.timelineLeft}>
              <Text style={styles.activityType}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
              <Text style={styles.timelineTime}>{formattedTime}</Text>
            </View>
            <View style={styles.timelineRight}>
              <View style={styles.timelineDetails}>
                {event.duration && (
                  <Text style={styles.timelineDetail}>{event.duration}</Text>
                )}
                {event.amount && (
                  <Text style={styles.timelineDetail}>{event.amount}</Text>
                )}
                {event.type && (
                  <Text style={styles.timelineDetail}>{event.type}</Text>
                )}
                {event.details && (
                  <Text style={styles.timelineDetail}>{event.details}</Text>
                )}
                {event.logType && (
                  <Text style={styles.logTypeIcon}>
                    {getLogTypeIcon(event.logType)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        );
      })
    );
  };

  const renderItem = useCallback(
    ({ item: date }) => {
      const activities = logs[date];
      if (!shouldShowDate(activities)) return null;

      return (
        <View style={styles.dayContainer}>
          <View style={styles.dateHeader}>
            <View style={styles.dateIcon}>
              <Text style={styles.clockIcon}>🕐</Text>
            </View>
            <Text style={styles.dateText}>{date}</Text>
          </View>

          {selectedTab !== "Summary" && (
            <View style={styles.summaryContainer}>
              {renderSummary(activities)}
            </View>
          )}

          {selectedTab !== "Summary" && (
            <View style={styles.timelineContainer}>
              {renderTimeline(activities)}
            </View>
          )}

          {selectedTab === "Summary" && (
            <View style={styles.summaryContainer}>
              {renderSummary(activities)}
            </View>
          )}
        </View>
      );
    },
    [selectedTab]
  );

  const ListFooterComponent = useCallback(() => {
    if (visibleDates.length >= Object.keys(logs).length) return null;

    return (
      <View style={styles.loadMoreContainer}>
        {isLoading ? (
          <ActivityIndicator color="#BE185D" />
        ) : (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={loadMoreDates}
          >
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [isLoading, visibleDates.length, loadMoreDates]);

  const DatePickerModal = ({
    visible,
    onClose,
    onDateSelect,
    selectedDate,
  }) => (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.datePickerContainer}>
          <View style={styles.datePickerHeader}>
            <Text style={styles.datePickerTitle}>Select Date</Text>
          </View>
          <View style={styles.datePickerContent}>
            <Calendar
              onDayPress={onDateSelect}
              markedDates={{
                [format(selectedDate, "yyyy-MM-dd")]: {
                  selected: true,
                  selectedColor: "#FCE7F3",
                  selectedTextColor: "#BE185D",
                },
              }}
              theme={{
                calendarBackground: "white",
                textSectionTitleColor: "#6B7280",
                selectedDayBackgroundColor: "#FCE7F3",
                selectedDayTextColor: "#BE185D",
                todayTextColor: "#BE185D",
                dayTextColor: "#111827",
                textDisabledColor: "#D1D5DB",
                dotColor: "#BE185D",
                selectedDotColor: "#BE185D",
                arrowColor: "#BE185D",
                monthTextColor: "#111827",
                indicatorColor: "#BE185D",
                textDayFontWeight: "400",
                textMonthFontWeight: "600",
                textDayHeaderFontWeight: "500",
                textDayFontSize: 15,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 13,
              }}
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContentContainer}
          >
            <TouchableOpacity
              style={[styles.dateFilterButton]}
              onPress={() => setIsDatePickerVisible(true)}
            >
              <View style={styles.dateIconContainer}>
                <Text style={styles.clockIcon}>🕐</Text>
              </View>
            </TouchableOpacity>
            {FILTER_TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, selectedTab === tab && styles.selectedTab]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === tab && styles.selectedTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          ref={flatListRef}
          data={visibleDates}
          renderItem={renderItem}
          keyExtractor={(date) => date}
          contentContainerStyle={styles.logsContentContainer}
          onEndReached={loadMoreDates}
          onEndReachedThreshold={0.5}
          ListFooterComponent={ListFooterComponent}
          initialNumToRender={ITEMS_PER_PAGE}
          maxToRenderPerBatch={ITEMS_PER_PAGE}
          windowSize={5}
          removeClippedSubviews={true}
        />

        <DatePickerModal
          visible={isDatePickerVisible}
          onClose={() => setIsDatePickerVisible(false)}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  tabsWrapper: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E3F2FD",
    paddingVertical: 8,
  },
  tabsContentContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    alignItems: "center",
  },
  logsContainer: {
    flex: 1,
  },
  logsContentContainer: {
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  dayContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingLeft: 4,
  },
  dateIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1976D2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  clockIcon: {
    fontSize: 18,
    color: "#6B7280",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
  },
  summaryContainer: {
    backgroundColor: "#E3F2FD",
    padding: 16,
    paddingLeft: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 24,
    color: "#333333",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
    paddingLeft: 4,
  },
  summaryIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "600",
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 8,
    flex: 2,
  },
  timelineContainer: {
    marginTop: 12,
    paddingLeft: 4,
  },
  timelineEntry: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingLeft: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  timelineLeft: {
    width: 140,
    paddingLeft: 4,
  },
  timelineRight: {
    flex: 1,
  },
  activityType: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 14,
    color: "#6B7280",
  },
  timelineDetails: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    position: "relative",
    paddingRight: 16,
  },
  timelineDetail: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginRight: 8,
  },
  logTypeIcon: {
    position: "absolute",
    right: 0,
    top: 0,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 14,
  },
  dateFilterButton: {
    marginRight: 8,
  },
  dateIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  selectedTab: {
    backgroundColor: "#2196F3",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
  },
  selectedTabText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    maxWidth: 340,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  datePickerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E3F2FD",
    backgroundColor: "#1976D2",
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  datePickerContent: {
    padding: 20,
  },
  datePickerButton: {
    backgroundColor: "#F3F4F6",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: "#4B5563",
    fontWeight: "500",
  },
  loadMoreContainer: {
    padding: 16,
    alignItems: "center",
  },
  loadMoreButton: {
    backgroundColor: "#1976D2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#1565C0",
  },
  loadMoreText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DailyLogsScreen;
