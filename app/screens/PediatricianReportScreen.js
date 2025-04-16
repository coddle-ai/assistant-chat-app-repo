import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Share,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

export default function PediatricianReportScreen() {
  const colorScheme = useColorScheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // Dummy data for the report
  const reportData = {
    childInfo: {
      name: "Om",
      fullName: "Om Prakash",
      age: "20m 15d",
      weight: "10.2 kg",
      height: "78 cm",
      lastVisit: "2024-04-01",
    },
    dailyIntake: {
      breastMilk: {
        frequency: "4 times/day",
        amountPerSession: "120 ml",
        totalAmount: "480 ml",
        averageDuration: "15 min",
      },
      formula: {
        frequency: "2 times/day",
        amountPerSession: "90 ml",
        totalAmount: "180 ml",
      },
      solids: {
        meals: "3 times/day",
        snacks: "2 times/day",
        notes: "Good appetite, prefers soft foods",
      },
    },
    sleep: {
      nightSleep: {
        duration: "9.5 hours",
        bedtime: "8:00 PM",
        wakeTime: "5:30 AM",
      },
      naps: {
        count: "2 naps",
        duration: "1.5 hours each",
        totalNapTime: "3 hours",
      },
      totalSleep: "12.5 hours",
    },
    diaper: {
      pee: {
        count: "6-8 times/day",
        notes: "Normal pattern",
      },
      poo: {
        count: "2-3 times/day",
        notes: "Normal consistency",
      },
      mixed: {
        count: "1-2 times/day",
        notes: "Usually after meals",
      },
    },
    healthMetrics: {
      temperature: "36.8°C",
      activity: "Active, crawling, pulling to stand",
    },
    growth: {
      weightPercentile: "75th",
      heightPercentile: "80th",
      headCircumference: "45 cm",
      notes: "Steady growth curve",
    },
    milestones: [
      "Crawling proficiently",
      "Pulling to stand",
      'Says "mama" and "dada"',
      "Pincer grasp developed",
    ],
    concerns: ["Occasional night waking", "Mild eczema on cheeks"],
    recommendations: [
      "Continue current feeding schedule",
      "Introduce more finger foods",
      "Monitor eczema with current cream",
    ],
  };

  const generateStyledReport = async () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          @page {
            margin: 1.5cm;
            size: A4;
          }
          
          * {
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #1F2937;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            background-color: white;
            font-size: 11pt;
          }
          
          .container {
            max-width: 100%;
            margin: 0 auto;
            background: white;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1.5pt solid #E5E7EB;
          }
          
          .logo {
            width: 60px;
            height: 60px;
            margin-bottom: 12px;
            object-fit: contain;
          }
          
          .title {
            font-size: 18pt;
            font-weight: 600;
            color: #065F46;
            margin: 0 0 4px 0;
          }
          
          .subtitle {
            font-size: 11pt;
            color: #4B5563;
            margin: 0;
          }
          
          .section {
            margin-bottom: 16px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 13pt;
            font-weight: 600;
            color: #065F46;
            margin: 0 0 8px 0;
            padding-bottom: 4px;
            border-bottom: 1pt solid #E5E7EB;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 12px;
          }
          
          .info-item {
            background: #F9FAFB;
            padding: 10px;
            border-radius: 4px;
            border: 0.5pt solid #E5E7EB;
          }
          
          .info-label {
            font-size: 9pt;
            color: #6B7280;
            margin-bottom: 2px;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
          }
          
          .info-value {
            font-size: 11pt;
            font-weight: 500;
            color: #1F2937;
          }
          
          .card {
            background: #F9FAFB;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 12px;
            border: 0.5pt solid #E5E7EB;
          }
          
          .row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 6px 0;
            border-bottom: 0.5pt solid #E5E7EB;
          }
          
          .row:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
          
          .row:first-child {
            padding-top: 0;
          }
          
          .label {
            font-weight: 500;
            color: #4B5563;
            flex: 1;
            font-size: 10pt;
          }
          
          .value {
            text-align: right;
            flex: 2;
            font-size: 10pt;
          }
          
          .value div {
            margin-bottom: 1px;
          }
          
          .value div:last-child {
            margin-bottom: 0;
          }
          
          .bullet-list {
            list-style-type: none;
            padding-left: 0;
            margin: 0;
          }
          
          .bullet-list li {
            position: relative;
            padding-left: 12px;
            margin-bottom: 4px;
            font-size: 10pt;
          }
          
          .bullet-list li:last-child {
            margin-bottom: 0;
          }
          
          .bullet-list li:before {
            content: "•";
            color: #059669;
            position: absolute;
            left: 0;
          }
          
          .footer {
            text-align: center;
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1pt solid #E5E7EB;
            color: #6B7280;
            font-size: 9pt;
          }
          
          .footer p {
            margin: 2px 0;
          }
          
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .section {
              page-break-inside: avoid;
            }
            
            .card, .info-grid {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="file:///Users/archak/Projects/AssistantChatAppExpo/assets/images/CoddleLogo.jpg" alt="Coddle Logo" class="logo">
            <h1 class="title">Pediatrician Report</h1>
            <p class="subtitle">${reportData.childInfo.fullName} • ${
      reportData.childInfo.age
    }</p>
          </div>
          
          <div class="section">
            <h2 class="section-title">Child Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Full Name</div>
                <div class="info-value">${reportData.childInfo.fullName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Age</div>
                <div class="info-value">${reportData.childInfo.age}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Weight</div>
                <div class="info-value">${reportData.childInfo.weight}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Height</div>
                <div class="info-value">${reportData.childInfo.height}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Daily Intake</h2>
            <div class="card">
              <div class="row">
                <span class="label">Breast Milk</span>
                <div class="value">
                  <div>${reportData.dailyIntake.breastMilk.frequency}</div>
                  <div>${
                    reportData.dailyIntake.breastMilk.amountPerSession
                  } per session</div>
                  <div>Total: ${
                    reportData.dailyIntake.breastMilk.totalAmount
                  }</div>
                </div>
              </div>
              <div class="row">
                <span class="label">Formula</span>
                <div class="value">
                  <div>${reportData.dailyIntake.formula.frequency}</div>
                  <div>${
                    reportData.dailyIntake.formula.amountPerSession
                  } per session</div>
                  <div>Total: ${
                    reportData.dailyIntake.formula.totalAmount
                  }</div>
                </div>
              </div>
              <div class="row">
                <span class="label">Solids</span>
                <div class="value">
                  <div>${reportData.dailyIntake.solids.meals}</div>
                  <div>${reportData.dailyIntake.solids.snacks}</div>
                  <div>${reportData.dailyIntake.solids.notes}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Sleep Patterns</h2>
            <div class="card">
              <div class="row">
                <span class="label">Night Sleep</span>
                <div class="value">
                  <div>${reportData.sleep.nightSleep.duration}</div>
                  <div>${reportData.sleep.nightSleep.bedtime} - ${
      reportData.sleep.nightSleep.wakeTime
    }</div>
                </div>
              </div>
              <div class="row">
                <span class="label">Naps</span>
                <div class="value">
                  <div>${reportData.sleep.naps.count}</div>
                  <div>${reportData.sleep.naps.duration}</div>
                  <div>Total: ${reportData.sleep.naps.totalNapTime}</div>
                </div>
              </div>
              <div class="row">
                <span class="label">Total Sleep</span>
                <div class="value">${reportData.sleep.totalSleep}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Diaper Changes</h2>
            <div class="card">
              <div class="row">
                <span class="label">Pee</span>
                <div class="value">
                  <div>${reportData.diaper.pee.count}</div>
                  <div>${reportData.diaper.pee.notes}</div>
                </div>
              </div>
              <div class="row">
                <span class="label">Poo</span>
                <div class="value">
                  <div>${reportData.diaper.poo.count}</div>
                  <div>${reportData.diaper.poo.notes}</div>
                </div>
              </div>
              <div class="row">
                <span class="label">Mixed</span>
                <div class="value">
                  <div>${reportData.diaper.mixed.count}</div>
                  <div>${reportData.diaper.mixed.notes}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Growth & Development</h2>
            <div class="card">
              <div class="row">
                <span class="label">Weight Percentile</span>
                <div class="value">${reportData.growth.weightPercentile}</div>
              </div>
              <div class="row">
                <span class="label">Height Percentile</span>
                <div class="value">${reportData.growth.heightPercentile}</div>
              </div>
              <div class="row">
                <span class="label">Head Circumference</span>
                <div class="value">${reportData.growth.headCircumference}</div>
              </div>
              <div class="row">
                <span class="label">Notes</span>
                <div class="value">${reportData.growth.notes}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Milestones</h2>
            <div class="card">
              <ul class="bullet-list">
                ${reportData.milestones.map((m) => `<li>${m}</li>`).join("")}
              </ul>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Concerns</h2>
            <div class="card">
              <ul class="bullet-list">
                ${reportData.concerns.map((c) => `<li>${c}</li>`).join("")}
              </ul>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Recommendations</h2>
            <div class="card">
              <ul class="bullet-list">
                ${reportData.recommendations
                  .map((r) => `<li>${r}</li>`)
                  .join("")}
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Report generated on ${new Date().toLocaleDateString()}</p>
            <p>© ${new Date().getFullYear()} Coddle. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
        width: 595, // A4 width in points (72 dpi)
        height: 842, // A4 height in points (72 dpi)
      });

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Pediatrician Report - ${reportData.childInfo.fullName}`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pediatrician Report</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={generateStyledReport}
        >
          <IconSymbol
            name="square.and.arrow.up"
            size={24}
            color={Colors[colorScheme].text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Child Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>
                {reportData.childInfo.fullName}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{reportData.childInfo.age}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>
                {reportData.childInfo.weight}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>
                {reportData.childInfo.height}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Intake</Text>
          <View style={styles.intakeCard}>
            <View style={styles.intakeRow}>
              <Text style={styles.intakeLabel}>Breast Milk</Text>
              <View style={styles.intakeDetails}>
                <Text style={styles.intakeValue}>
                  {reportData.dailyIntake.breastMilk.frequency}
                </Text>
                <Text style={styles.intakeSubValue}>
                  {reportData.dailyIntake.breastMilk.amountPerSession} per
                  session
                </Text>
                <Text style={styles.intakeSubValue}>
                  Total: {reportData.dailyIntake.breastMilk.totalAmount}
                </Text>
              </View>
            </View>
            <View style={styles.intakeRow}>
              <Text style={styles.intakeLabel}>Formula</Text>
              <View style={styles.intakeDetails}>
                <Text style={styles.intakeValue}>
                  {reportData.dailyIntake.formula.frequency}
                </Text>
                <Text style={styles.intakeSubValue}>
                  {reportData.dailyIntake.formula.amountPerSession} per session
                </Text>
                <Text style={styles.intakeSubValue}>
                  Total: {reportData.dailyIntake.formula.totalAmount}
                </Text>
              </View>
            </View>
            <View style={styles.intakeRow}>
              <Text style={styles.intakeLabel}>Solids</Text>
              <View style={styles.intakeDetails}>
                <Text style={styles.intakeValue}>
                  {reportData.dailyIntake.solids.meals}
                </Text>
                <Text style={styles.intakeSubValue}>
                  {reportData.dailyIntake.solids.snacks}
                </Text>
                <Text style={styles.intakeSubValue}>
                  {reportData.dailyIntake.solids.notes}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep</Text>
          <View style={styles.sleepCard}>
            <View style={styles.sleepRow}>
              <Text style={styles.sleepLabel}>Night Sleep</Text>
              <View style={styles.sleepDetails}>
                <Text style={styles.sleepValue}>
                  {reportData.sleep.nightSleep.duration}
                </Text>
                <Text style={styles.sleepSubValue}>
                  {reportData.sleep.nightSleep.bedtime} -{" "}
                  {reportData.sleep.nightSleep.wakeTime}
                </Text>
              </View>
            </View>
            <View style={styles.sleepRow}>
              <Text style={styles.sleepLabel}>Naps</Text>
              <View style={styles.sleepDetails}>
                <Text style={styles.sleepValue}>
                  {reportData.sleep.naps.count}
                </Text>
                <Text style={styles.sleepSubValue}>
                  {reportData.sleep.naps.duration}
                </Text>
                <Text style={styles.sleepSubValue}>
                  Total: {reportData.sleep.naps.totalNapTime}
                </Text>
              </View>
            </View>
            <View style={styles.sleepRow}>
              <Text style={styles.sleepLabel}>Total Sleep</Text>
              <Text style={styles.sleepValue}>
                {reportData.sleep.totalSleep}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diaper Changes</Text>
          <View style={styles.diaperCard}>
            <View style={styles.diaperRow}>
              <Text style={styles.diaperLabel}>Pee</Text>
              <View style={styles.diaperDetails}>
                <Text style={styles.diaperValue}>
                  {reportData.diaper.pee.count}
                </Text>
                <Text style={styles.diaperSubValue}>
                  {reportData.diaper.pee.notes}
                </Text>
              </View>
            </View>
            <View style={styles.diaperRow}>
              <Text style={styles.diaperLabel}>Poo</Text>
              <View style={styles.diaperDetails}>
                <Text style={styles.diaperValue}>
                  {reportData.diaper.poo.count}
                </Text>
                <Text style={styles.diaperSubValue}>
                  {reportData.diaper.poo.notes}
                </Text>
              </View>
            </View>
            <View style={styles.diaperRow}>
              <Text style={styles.diaperLabel}>Mixed</Text>
              <View style={styles.diaperDetails}>
                <Text style={styles.diaperValue}>
                  {reportData.diaper.mixed.count}
                </Text>
                <Text style={styles.diaperSubValue}>
                  {reportData.diaper.mixed.notes}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Temperature</Text>
              <Text style={styles.metricValue}>
                {reportData.healthMetrics.temperature}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Activity Level</Text>
              <Text style={styles.metricValue}>
                {reportData.healthMetrics.activity}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Growth</Text>
          <View style={styles.growthCard}>
            <View style={styles.growthRow}>
              <Text style={styles.growthLabel}>Weight Percentile</Text>
              <Text style={styles.growthValue}>
                {reportData.growth.weightPercentile}
              </Text>
            </View>
            <View style={styles.growthRow}>
              <Text style={styles.growthLabel}>Height Percentile</Text>
              <Text style={styles.growthValue}>
                {reportData.growth.heightPercentile}
              </Text>
            </View>
            <View style={styles.growthRow}>
              <Text style={styles.growthLabel}>Head Circumference</Text>
              <Text style={styles.growthValue}>
                {reportData.growth.headCircumference}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Callouts</Text>
          <View style={styles.calloutsCard}>
            <View style={styles.calloutSection}>
              <Text style={styles.calloutTitle}>Milestones</Text>
              {reportData.milestones.map((milestone, index) => (
                <Text key={index} style={styles.calloutItem}>
                  • {milestone}
                </Text>
              ))}
            </View>
            <View style={styles.calloutSection}>
              <Text style={styles.calloutTitle}>Concerns</Text>
              {reportData.concerns.map((concern, index) => (
                <Text key={index} style={styles.calloutItem}>
                  • {concern}
                </Text>
              ))}
            </View>
            <View style={styles.calloutSection}>
              <Text style={styles.calloutTitle}>Recommendations</Text>
              {reportData.recommendations.map((recommendation, index) => (
                <Text key={index} style={styles.calloutItem}>
                  • {recommendation}
                </Text>
              ))}
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
    backgroundColor: "#F0FDF4",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#DCFCE7",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
  },
  shareButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  infoItem: {
    width: "48%",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  intakeCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  intakeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  intakeLabel: {
    fontSize: 16,
    color: "#4B5563",
  },
  intakeDetails: {
    flex: 1,
    alignItems: "flex-end",
  },
  intakeValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  intakeSubValue: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  metricLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  growthCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  growthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  growthLabel: {
    fontSize: 16,
    color: "#4B5563",
  },
  growthValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  calloutsCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  calloutSection: {
    marginBottom: 16,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  calloutItem: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
    lineHeight: 20,
  },
  sleepCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sleepRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sleepLabel: {
    fontSize: 16,
    color: "#4B5563",
  },
  sleepDetails: {
    flex: 1,
    alignItems: "flex-end",
  },
  sleepValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  sleepSubValue: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  diaperCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  diaperRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  diaperLabel: {
    fontSize: 16,
    color: "#4B5563",
  },
  diaperDetails: {
    flex: 1,
    alignItems: "flex-end",
  },
  diaperValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  diaperSubValue: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
});
