import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  Dimensions,
  FlatList,
  Modal,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useRouter } from "expo-router";
import { LineChart } from "react-native-chart-kit";

export default function NursingAnalyticsScreen() {
  const router = useRouter();
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [showThisWeek, setShowThisWeek] = useState(true);
  const [showLastWeek, setShowLastWeek] = useState(true);
  const [tooltipData, setTooltipData] = useState(null);

  // Generate last 8 weeks data
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i * 7);
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - 6);
    return {
      id: i,
      startDate,
      endDate: date,
      label: `${startDate.getDate()} ${startDate.toLocaleString("default", {
        month: "short",
      })} - ${date.getDate()} ${date.toLocaleString("default", {
        month: "short",
      })}`,
    };
  }).reverse();

  const nursingData = {
    feedInterval: {
      current: "17h 48m",
      previous: "14h 8m",
      change: 25.9,
      label: "Time between feeds",
    },
    feedTime: {
      current: "18m",
      previous: "21m",
      change: -14,
      label: "Average feed duration",
    },
  };

  const formatTime = (timeStr) => {
    if (timeStr.includes("0h")) {
      return timeStr.replace("0h ", "");
    }
    return timeStr;
  };

  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: showThisWeek ? [36, 9, 12, 22, 14, 16, 27] : [],
        color: (opacity = 1) => `rgba(15, 118, 110, ${opacity})`,
        strokeWidth: 3,
        withDots: true,
        withInnerLines: true,
        withOuterLines: true,
        withVerticalLines: false,
        withHorizontalLines: true,
        withVerticalLabels: true,
        withHorizontalLabels: true,
        fillShadowGradient: "#0F766E",
        fillShadowGradientOpacity: 0.1,
      },
      {
        data: showLastWeek ? [28, 12, 15, 18, 20, 14, 22] : [],
        color: (opacity = 1) => `rgba(204, 251, 241, ${opacity})`,
        strokeWidth: 2,
        withDots: true,
        withInnerLines: true,
        withOuterLines: true,
        withVerticalLines: false,
        withHorizontalLines: true,
        withVerticalLabels: true,
        withHorizontalLabels: true,
        fillShadowGradient: "#CCFBF1",
        fillShadowGradientOpacity: 0.1,
      },
    ],
  };

  const renderMetricCard = (title, data, color) => (
    <View style={[styles.metricCard, { backgroundColor: color }]}>
      <View>
        <Text style={styles.metricTitle}>{data.label}</Text>
        <Text style={styles.metricPrevious}>vs. last week</Text>
      </View>
      <View style={styles.metricContent}>
        <Text style={styles.metricValue}>{formatTime(data.current)}</Text>
        <View style={styles.metricComparison}>
          <Text style={styles.metricPrevious}>{formatTime(data.previous)}</Text>
          <View style={styles.changeContainer}>
            <IconSymbol
              size={14}
              name={
                data.change >= 0
                  ? "arrow.up.circle.fill"
                  : "arrow.down.circle.fill"
              }
              color={data.change >= 0 ? "#059669" : "#DC2626"}
            />
            <Text
              style={[
                styles.changeText,
                { color: data.change >= 0 ? "#059669" : "#DC2626" },
              ]}
            >
              {Math.abs(data.change)}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderWeekItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.weekItem,
        selectedWeek === index && styles.selectedWeekItem,
      ]}
      onPress={() => setSelectedWeek(index)}
    >
      <Text
        style={[
          styles.weekText,
          selectedWeek === index && styles.selectedWeekText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const getDayName = (index) => chartData.labels[index];

  const handleDataPointClick = (data) => {
    if (!data || typeof data.index === "undefined") return;

    const value = data.value;
    const dayName = getDayName(data.index);
    const isCurrentWeek = data.dataset === 0;

    setTooltipData({
      value,
      dayName,
      isCurrentWeek,
    });

    // Auto-hide tooltip after 2 seconds
    setTimeout(() => {
      setTooltipData(null);
    }, 2000);
  };

  const Tooltip = ({ data }) => {
    if (!data) return null;

    return (
      <View style={styles.tooltipContainer}>
        <View style={styles.tooltipContent}>
          <Text style={styles.tooltipValue}>{data.value}m</Text>
          <Text style={styles.tooltipDay}>{data.dayName}</Text>
          <Text style={styles.tooltipWeek}>
            {data.isCurrentWeek ? "This Week" : "Last Week"}
          </Text>
        </View>
        <View style={styles.tooltipArrow} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
      >
        {/* Week Selector */}
        <View style={styles.weekSelectorContainer}>
          <FlatList
            data={weeks}
            renderItem={renderWeekItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weekList}
          />
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Weekly Summary</Text>
          </View>
          <View style={styles.summaryMetrics}>
            {renderMetricCard(
              "Feed Interval",
              nursingData.feedInterval,
              "#ECFDF5"
            )}
            {renderMetricCard("Feed Time", nursingData.feedTime, "#FEF3C7")}
          </View>
        </View>

        {/* Trend Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Daily Nursing Duration</Text>
          </View>
          <View style={styles.chartWrapper}>
            <LineChart
              data={{
                ...chartData,
                datasets: [
                  ...(showThisWeek ? [chartData.datasets[0]] : []),
                  ...(showLastWeek ? [chartData.datasets[1]] : []),
                ],
              }}
              width={Dimensions.get("window").width - 48}
              height={220}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(15, 118, 110, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(15, 118, 110, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "1.5",
                  stroke: "#ffffff",
                  fill: "#0F766E",
                },
                propsForBackgroundLines: {
                  strokeDasharray: "",
                  stroke: "#E5E7EB",
                  strokeWidth: 1,
                },
                propsForLabels: {
                  fontSize: 11,
                },
                fillShadowGradient: "#0F766E",
                fillShadowGradientOpacity: 0.1,
              }}
              bezier
              style={styles.chart}
              withDots={true}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              yAxisLabel=""
              yAxisSuffix="m"
              yAxisInterval={1}
              segments={4}
              getDotColor={(dataPoint, dataPointIndex) => {
                return showThisWeek && dataPointIndex < 7
                  ? "#0F766E"
                  : "#99F6E4";
              }}
              onDataPointClick={handleDataPointClick}
              decorator={() => null}
            />
            {tooltipData && <Tooltip data={tooltipData} />}
          </View>
          <View style={styles.legendContainer}>
            <TouchableOpacity
              style={[
                styles.legendItem,
                showThisWeek && styles.legendItemActive,
              ]}
              onPress={() => setShowThisWeek(!showThisWeek)}
              activeOpacity={0.7}
            >
              <View style={styles.legendDotContainer}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#0F766E" }]}
                />
              </View>
              <Text
                style={[
                  styles.legendText,
                  showThisWeek && styles.legendTextActive,
                ]}
              >
                This Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.legendItem,
                showLastWeek && styles.legendItemActive,
              ]}
              onPress={() => setShowLastWeek(!showLastWeek)}
              activeOpacity={0.7}
            >
              <View style={styles.legendDotContainer}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#99F6E4" }]}
                />
              </View>
              <Text
                style={[
                  styles.legendText,
                  showLastWeek && styles.legendTextActive,
                ]}
              >
                Last Week
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Insights Section */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Patterns & Insights</Text>

          {/* Feeding Patterns Card */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <IconSymbol size={20} name="clock" color="#1F2937" />
              <Text style={styles.statHeaderText}>Feeding Patterns</Text>
            </View>
            <View style={styles.patternsContainer}>
              <View style={styles.patternItem}>
                <Text style={styles.patternLabel}>Most Active Day</Text>
                <Text style={styles.patternValue}>Monday</Text>
                <Text style={styles.patternSubtext}>36 minutes average</Text>
              </View>
              <View style={styles.patternItem}>
                <Text style={styles.patternLabel}>Least Active Day</Text>
                <Text style={styles.patternValue}>Tuesday</Text>
                <Text style={styles.patternSubtext}>9 minutes average</Text>
              </View>
            </View>
          </View>

          {/* Weekly Comparison Card */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <IconSymbol size={20} name="chart.bar" color="#1F2937" />
              <Text style={styles.statHeaderText}>Weekly Comparison</Text>
            </View>
            <View style={styles.comparisonContainer}>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>Total Sessions</Text>
                <View style={styles.comparisonValueContainer}>
                  <Text style={styles.comparisonValue}>28</Text>
                  <View style={styles.comparisonChange}>
                    <IconSymbol size={12} name="arrow.up" color="#059669" />
                    <Text style={[styles.changeText, { color: "#059669" }]}>
                      15%
                    </Text>
                  </View>
                </View>
                <Text style={styles.comparisonSubtext}>vs. last week</Text>
              </View>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>Longest Session</Text>
                <View style={styles.comparisonValueContainer}>
                  <Text style={styles.comparisonValue}>36m</Text>
                  <View style={styles.comparisonChange}>
                    <IconSymbol size={12} name="arrow.up" color="#059669" />
                    <Text style={[styles.changeText, { color: "#059669" }]}>
                      8%
                    </Text>
                  </View>
                </View>
                <Text style={styles.comparisonSubtext}>vs. last week</Text>
              </View>
            </View>
          </View>
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
  header: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#DCFCE7",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
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
        elevation: 4,
      },
    }),
  },
  summaryHeader: {
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F766E",
  },
  summaryMetrics: {
    flexDirection: "column",
    gap: 8,
  },
  metricsContainer: {
    gap: 12,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  metricCard: {
    width: "100%",
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#F0FDFA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  metricTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F766E",
    marginBottom: 2,
  },
  metricContent: {
    alignItems: "flex-end",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F766E",
    marginBottom: 2,
  },
  metricComparison: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricPrevious: {
    fontSize: 12,
    color: "#64748B",
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  chartContainer: {
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
  chartHeader: {
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F766E",
  },
  chartWrapper: {
    position: "relative",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    marginHorizontal: -8,
  },
  statsContainer: {
    gap: 12,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F766E",
    marginBottom: 8,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
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
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  statHeaderText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F766E",
  },
  patternsContainer: {
    gap: 12,
  },
  patternItem: {
    gap: 4,
  },
  patternLabel: {
    fontSize: 13,
    color: "#0F766E",
    opacity: 0.7,
  },
  patternValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F766E",
  },
  patternSubtext: {
    fontSize: 13,
    color: "#0F766E",
    opacity: 0.7,
  },
  comparisonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  comparisonItem: {
    flex: 1,
    gap: 4,
  },
  comparisonLabel: {
    fontSize: 13,
    color: "#0F766E",
    opacity: 0.7,
  },
  comparisonValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  comparisonValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F766E",
  },
  comparisonChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  comparisonSubtext: {
    fontSize: 13,
    color: "#0F766E",
    opacity: 0.7,
  },
  weekSelectorContainer: {
    marginBottom: 12,
  },
  weekList: {
    paddingHorizontal: 4,
    gap: 8,
  },
  weekItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    marginRight: 8,
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
  selectedWeekItem: {
    backgroundColor: "#CCFBF1",
  },
  weekText: {
    fontSize: 14,
    color: "#0F766E",
    fontWeight: "500",
  },
  selectedWeekText: {
    color: "#0F766E",
    fontWeight: "600",
  },
  tooltipContainer: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    alignItems: "center",
  },
  tooltipContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    minWidth: 100,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0F766E20",
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tooltipValue: {
    color: "#0F766E",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  tooltipDay: {
    color: "#0F766E",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  tooltipWeek: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
  },
  tooltipArrow: {
    width: 12,
    height: 6,
    backgroundColor: "#FFFFFF",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: "#0F766E20",
    transform: [{ rotate: "45deg" }],
    position: "absolute",
    top: -3,
    alignSelf: "center",
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
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "transparent",
  },
  legendItemActive: {
    backgroundColor: "#CCFBF1",
    borderColor: "#0F766E",
  },
  legendDotContainer: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  legendTextActive: {
    color: "#0F766E",
    fontWeight: "600",
  },
});
