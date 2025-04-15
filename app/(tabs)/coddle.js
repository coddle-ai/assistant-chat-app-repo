import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Animated,
  Image,
  PanResponder,
  Dimensions,
  Modal,
  Switch,
  TextInput,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";

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
    type: "question",
    text: "How to handle night wakings?",
    icon: "❓",
  },
  {
    type: "recommendation",
    text: "Solid food ideas for 9-month-old",
    icon: "💡",
  },
  {
    type: "log",
    text: "Log bottle feeding",
    icon: "🍼",
  },
];

export default function CoddleScreen() {
  const colorScheme = useColorScheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const borderPulseAnim = useRef(new Animated.Value(0.3)).current;
  const [showExpoBar, setShowExpoBar] = useState(false);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [breastfeedTimer, setBreastfeedTimer] = useState({
    isRunning: false,
    activeSide: null,
    seconds: 0,
    leftSeconds: 0,
    rightSeconds: 0,
    totalSeconds: 0,
  });
  const timerRef = useRef(null);
  const [activities, setActivities] = useState({
    Breastfeeding: true,
    Bottle: true,
    Solid: true,
    Diaper: true,
    Sleep: true,
    Pumping: true,
    Growth: false,
    Activities: false,
    Milestones: false,
    Medications: false,
  });

  const [trackingData, setTrackingData] = useState([
    {
      type: "Bottle",
      activityType: "Bottle",
      lastTime: "1h ago",
      quantity: "120ml",
      color: "#EBF5FF",
      textColor: "#1E40AF",
      isBottle: true,
      isDue: true,
    },
    {
      type: "Breastfeed",
      activityType: "Breastfeeding",
      lastTime: "2h ago",
      quantity: "10 min",
      color: "#FCE7F3",
      textColor: "#9D174D",
      startSide: "left",
    },
    {
      type: "Solids",
      activityType: "Solid",
      lastTime: "3h ago",
      quantity: "Banana",
      color: "#FEF3C7",
      textColor: "#92400E",
    },
    {
      type: "Sleep",
      activityType: "Sleep",
      lastTime: "2h 39m ago",
      quantity: "1h 23m",
      color: "#CCFBF1",
      textColor: "#134E4A",
      isOngoing: true,
    },
    {
      type: "Diaper",
      activityType: "Diaper",
      lastTime: "1h 30m ago",
      quantity: "Wet",
      color: "#D1FAE5",
      textColor: "#065F46",
      isDiaper: true,
    },
    {
      type: "Pumping",
      activityType: "Pumping",
      lastTime: "30m ago",
      quantity: "150ml",
      color: "#FEE2E2",
      textColor: "#991B1B",
    },
    {
      type: "Growth",
      activityType: "Growth",
      lastTime: "2d ago",
      quantity: "7.2 kg",
      color: "#F3E8FF",
      textColor: "#6B21A8",
    },
    {
      type: "Activities",
      activityType: "Activities",
      lastTime: "1d ago",
      quantity: "Tummy time",
      color: "#E0F2FE",
      textColor: "#075985",
    },
    {
      type: "Milestones",
      activityType: "Milestones",
      lastTime: "5d ago",
      quantity: "First word",
      color: "#FFE4E6",
      textColor: "#9F1239",
    },
    {
      type: "Medications",
      activityType: "Medications",
      lastTime: "12h ago",
      quantity: "Vitamin D",
      color: "#F1F5F9",
      textColor: "#334155",
    },
  ]);

  // Add new Animated Values for FAB position with initial values
  const pan = useRef(
    new Animated.ValueXY({
      x: Dimensions.get("window").width - 80,
      y: Dimensions.get("window").height - 200,
    })
  ).current;
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // Create panResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (e, gesture) => {
        pan.flattenOffset();

        // Snap to edges
        const newX = gesture.moveX > screenWidth / 2 ? screenWidth - 80 : 16;

        // Calculate bounded Y position
        const maxY = screenHeight - 200;
        const minY = 100;
        const boundedY = Math.min(Math.max(gesture.moveY, minY), maxY);

        Animated.parallel([
          Animated.spring(pan.x, {
            toValue: newX,
            useNativeDriver: false,
            friction: 6,
          }),
          Animated.spring(pan.y, {
            toValue: boundedY,
            useNativeDriver: false,
            friction: 6,
          }),
        ]).start();
      },
    })
  ).current;

  const router = useRouter();

  useEffect(() => {
    if (breastfeedTimer.isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [breastfeedTimer.isRunning]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(borderPulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(borderPulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const toggleExpoBar = () => {
    setShowExpoBar(!showExpoBar);
  };

  const toggleActivity = (activity) => {
    setActivities((prev) => ({
      ...prev,
      [activity]: !prev[activity],
    }));
  };

  // Filter tracking cards based on selected activities
  const visibleTrackingData = trackingData.filter(
    (item) => activities[item.activityType]
  );

  // Update timer functions
  useEffect(() => {
    if (breastfeedTimer.isRunning) {
      timerRef.current = setInterval(() => {
        setBreastfeedTimer((prev) => ({
          ...prev,
          seconds: prev.seconds + 1,
          totalSeconds: prev.totalSeconds + 1,
          [prev.activeSide === "left" ? "leftSeconds" : "rightSeconds"]:
            prev[prev.activeSide === "left" ? "leftSeconds" : "rightSeconds"] +
            1,
        }));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [breastfeedTimer.isRunning]);

  const startTimer = (side) => {
    if (breastfeedTimer.isRunning && breastfeedTimer.activeSide === side) {
      // Stop timer if clicking the same side
      clearInterval(timerRef.current);
      setBreastfeedTimer((prev) => ({
        ...prev,
        isRunning: false,
        activeSide: null,
        seconds: 0,
      }));
    } else {
      // Start new timer
      if (breastfeedTimer.isRunning) {
        // Save the time for the previous side before switching
        setBreastfeedTimer((prev) => ({
          ...prev,
          [prev.activeSide === "left" ? "leftSeconds" : "rightSeconds"]:
            prev.seconds,
          seconds: 0,
          activeSide: side,
        }));
      } else {
        // Start fresh timer
        setBreastfeedTimer((prev) => ({
          ...prev,
          isRunning: true,
          activeSide: side,
          seconds: 0,
        }));
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePromptClick = (prompt) => {
    router.push({
      pathname: "/chat",
      params: {
        initialQuestion: prompt.text,
        isFromPrompt: true,
      },
    });
  };

  const [sleepTimer, setSleepTimer] = useState({
    isRunning: false,
    startTime: null,
    duration: 0,
    showWakeInput: false,
    wakeAlarmMinutes: 30,
    isAlarmSet: false,
  });

  const [bottleInput, setBottleInput] = useState({
    showInput: false,
    amount: 110,
    isSet: false,
    milkType: "Formula",
  });

  const [breastInput, setBreastInput] = useState({
    showInput: false,
    amount: 120,
    isSet: false,
  });

  const [pumpingInput, setPumpingInput] = useState({
    showInput: false,
    amount: 150,
    isSet: false,
  });

  const bottleAmountAnim = useRef(new Animated.Value(0)).current;
  const timeAnim = useRef(new Animated.Value(0)).current;
  const pumpingAmountAnim = useRef(new Animated.Value(0)).current;
  const pumpingTimeAnim = useRef(new Animated.Value(0)).current;

  const animateBottleAmount = () => {
    bottleAmountAnim.setValue(0);
    Animated.spring(bottleAmountAnim, {
      toValue: 1,
      duration: 600,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const animateTime = () => {
    timeAnim.setValue(0);
    Animated.spring(timeAnim, {
      toValue: 1,
      duration: 600,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const animatePumpingText = () => {
    pumpingAmountAnim.setValue(0);
    pumpingTimeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(pumpingAmountAnim, {
        toValue: 1,
        duration: 600,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(pumpingTimeAnim, {
        toValue: 1,
        duration: 600,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleBottleInput = () => {
    setBottleInput((prev) => ({
      ...prev,
      showInput: !prev.showInput,
      isSet: false,
    }));
    // Hide breast input when showing bottle input
    if (!bottleInput.showInput) {
      setBreastInput((prev) => ({
        ...prev,
        showInput: false,
        isSet: false,
      }));
    }
  };

  const toggleBreastInput = () => {
    setBreastInput((prev) => ({
      ...prev,
      showInput: !prev.showInput,
      isSet: false,
    }));
    // Hide bottle input when showing breast input
    if (!breastInput.showInput) {
      setBottleInput((prev) => ({
        ...prev,
        showInput: false,
        isSet: false,
      }));
    }
  };

  const togglePumpingInput = () => {
    setPumpingInput((prev) => ({
      ...prev,
      showInput: !prev.showInput,
      isSet: false,
    }));
  };

  const updateBottleAmount = (amount) => {
    const newAmount = Math.max(1, Math.min(1000, amount || 110));
    setBottleInput((prev) => ({
      ...prev,
      amount: newAmount,
    }));
  };

  const updateBreastAmount = (amount) => {
    const newAmount = Math.max(1, Math.min(1000, amount || 120));
    setBreastInput((prev) => ({
      ...prev,
      amount: newAmount,
    }));
  };

  const updatePumpingAmount = (amount) => {
    const newAmount = Math.max(1, Math.min(1000, amount || 150));
    setPumpingInput((prev) => ({
      ...prev,
      amount: newAmount,
    }));
  };

  const toggleMilkType = () => {
    setBottleInput((prev) => ({
      ...prev,
      milkType: prev.milkType === "Formula" ? "Breastmilk" : "Formula",
    }));
  };

  const saveBottleAmount = () => {
    setBottleInput((prev) => ({
      ...prev,
      showInput: false,
      isSet: false,
    }));
    // Hide breast input when saving bottle amount
    setBreastInput((prev) => ({
      ...prev,
      showInput: false,
      isSet: false,
    }));
    // Update the tracking data with the new amount and milk type
    setTrackingData((prevData) =>
      prevData.map((item) => {
        if (item.type === "Bottle") {
          return {
            ...item,
            quantity: `${bottleInput.amount}ml · ${bottleInput.milkType}`,
            lastTime: "Just now",
          };
        }
        return item;
      })
    );
    // Trigger both animations
    animateBottleAmount();
    animateTime();
  };

  const saveBreastAmount = () => {
    setBreastInput((prev) => ({
      ...prev,
      showInput: false,
      isSet: true,
    }));
    // Hide bottle input when saving breast amount
    setBottleInput((prev) => ({
      ...prev,
      showInput: false,
      isSet: false,
    }));
    // Update the tracking data with the new amount
    setTrackingData((prevData) =>
      prevData.map((item) => {
        if (item.type === "Bottle") {
          return {
            ...item,
            quantity: `${breastInput.amount}ml · Breastmilk`,
            lastTime: "Just now",
          };
        }
        return item;
      })
    );
    // Trigger animations
    animateBottleAmount();
    animateTime();
  };

  const savePumpingAmount = () => {
    setPumpingInput((prev) => ({
      ...prev,
      showInput: false,
      isSet: true,
    }));
    setTrackingData((prevData) =>
      prevData.map((item) => {
        if (item.type === "Pumping") {
          return {
            ...item,
            quantity: `${pumpingInput.amount}ml`,
            lastTime: "Just now",
          };
        }
        return item;
      })
    );
    animatePumpingText();
  };

  const diaperAmountAnim = useRef(new Animated.Value(0)).current;
  const diaperTimeAnim = useRef(new Animated.Value(0)).current;

  const animateDiaperText = () => {
    diaperAmountAnim.setValue(0);
    diaperTimeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(diaperAmountAnim, {
        toValue: 1,
        duration: 600,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(diaperTimeAnim, {
        toValue: 1,
        duration: 600,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const updateDiaperStatus = (type) => {
    setTrackingData((prevData) =>
      prevData.map((item) => {
        if (item.type === "Diaper") {
          return {
            ...item,
            quantity: type,
            lastTime: "Just now",
          };
        }
        return item;
      })
    );
    animateDiaperText();
  };

  // Replace showFoodModal state with expanded state for the Solids card
  const [expandedCard, setExpandedCard] = useState(null);
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [recentFoods] = useState([
    { id: 1, name: "Banana", icon: "🍌" },
    { id: 2, name: "Sweet Potato", icon: "🍠" },
    { id: 3, name: "Avocado", icon: "🥑" },
    { id: 4, name: "Carrot", icon: "🥕" },
    { id: 5, name: "Apple", icon: "🍎" },
    { id: 6, name: "Yogurt", icon: "🥄" },
    { id: 7, name: "Peas", icon: "🥄" },
    { id: 8, name: "Milk", icon: "🥛" },
  ]);

  const selectFood = (foodName) => {
    setTrackingData((prevData) =>
      prevData.map((item) => {
        if (item.type === "Solids") {
          return {
            ...item,
            quantity: foodName,
            lastTime: "Just now",
          };
        }
        return item;
      })
    );
    setExpandedCard(null);
    setFoodSearchQuery("");
  };

  const renderTrackingCard = (item, index) => {
    const isLastCard = index === visibleTrackingData.length - 1;
    const isOddCount = visibleTrackingData.length % 2 !== 0;
    const isExpanded = expandedCard === item.type;

    const renderFoodSelection = () => {
      const filteredFoods = foodSearchQuery
        ? recentFoods.filter((food) =>
            food.name.toLowerCase().includes(foodSearchQuery.toLowerCase())
          )
        : [];

      return (
        <View style={styles.foodSelectionContainer}>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Type food name"
              value={foodSearchQuery}
              onChangeText={setFoodSearchQuery}
              autoFocus
            />
            {foodSearchQuery.trim() && (
              <TouchableOpacity
                style={styles.searchAddButton}
                onPress={() => selectFood(foodSearchQuery)}
              >
                <IconSymbol size={20} name="plus" color="#F59E0B" />
              </TouchableOpacity>
            )}
          </View>

          {!foodSearchQuery && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.recentFoodsScroll}
            >
              {recentFoods.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  style={styles.recentFoodItem}
                  onPress={() => selectFood(food.name)}
                >
                  <Text style={styles.recentFoodIcon}>{food.icon}</Text>
                  <Text style={styles.recentFoodName}>{food.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {foodSearchQuery && filteredFoods.length > 0 && (
            <ScrollView
              style={styles.searchResultsScroll}
              showsVerticalScrollIndicator={false}
            >
              {filteredFoods.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  style={styles.searchResultItem}
                  onPress={() => selectFood(food.name)}
                >
                  <View style={styles.searchResultContent}>
                    <Text style={styles.searchResultIcon}>{food.icon}</Text>
                    <Text style={styles.searchResultName}>{food.name}</Text>
                  </View>
                  <IconSymbol size={20} name="plus" color="#F59E0B" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      );
    };

    const renderQuantityText = () => {
      if (item.type === "Sleep") {
        if (sleepTimer.isRunning) {
          return "Sleeping";
        }
        return item.quantity;
      }
      if (item.type === "Bottle") {
        return (
          <Animated.Text
            style={[
              styles.trackingText,
              { color: item.textColor },
              {
                transform: [
                  {
                    scale: bottleAmountAnim.interpolate({
                      inputRange: [0, 0.4, 0.8, 1],
                      outputRange: [0.95, 1.05, 1.02, 1],
                    }),
                  },
                ],
                opacity: bottleAmountAnim.interpolate({
                  inputRange: [0, 0.3, 1],
                  outputRange: [0.6, 1, 1],
                }),
              },
            ]}
          >
            {item.quantity}
          </Animated.Text>
        );
      }
      if (item.type === "Breastfeed") {
        if (breastfeedTimer.isRunning) {
          return (
            <View style={styles.breastfeedTimerContainer}>
              <Text style={[styles.trackingText, { color: item.textColor }]}>
                Total: {formatTime(breastfeedTimer.totalSeconds)}
              </Text>
              <Text style={[styles.trackingText, { color: item.textColor }]}>
                {breastfeedTimer.activeSide === "left" ? "Left" : "Right"}:{" "}
                {formatTime(breastfeedTimer.seconds)}
              </Text>
            </View>
          );
        }
        return item.quantity;
      }
      if (item.type === "Diaper") {
        return (
          <Animated.Text
            style={[
              styles.trackingText,
              { color: item.textColor },
              {
                transform: [
                  {
                    scale: diaperAmountAnim.interpolate({
                      inputRange: [0, 0.4, 0.8, 1],
                      outputRange: [0.95, 1.05, 1.02, 1],
                    }),
                  },
                ],
                opacity: diaperAmountAnim.interpolate({
                  inputRange: [0, 0.3, 1],
                  outputRange: [0.6, 1, 1],
                }),
              },
            ]}
          >
            {item.quantity}
          </Animated.Text>
        );
      }
      if (item.type === "Pumping") {
        return (
          <Animated.Text
            style={[
              styles.trackingText,
              { color: item.textColor },
              {
                transform: [
                  {
                    scale: pumpingAmountAnim.interpolate({
                      inputRange: [0, 0.4, 0.8, 1],
                      outputRange: [0.95, 1.05, 1.02, 1],
                    }),
                  },
                ],
                opacity: pumpingAmountAnim.interpolate({
                  inputRange: [0, 0.3, 1],
                  outputRange: [0.6, 1, 1],
                }),
              },
            ]}
          >
            {item.quantity}
          </Animated.Text>
        );
      }
      return item.quantity;
    };

    const renderSecondaryText = () => {
      if (item.type === "Sleep") {
        if (sleepTimer.isRunning) {
          const hours = Math.floor(sleepTimer.duration / 3600);
          const remainingSeconds = sleepTimer.duration % 3600;
          const minutes = Math.floor(remainingSeconds / 60);
          const seconds = remainingSeconds % 60;
          return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
        }
      }
      if (item.type === "Bottle") {
        return (
          <Animated.Text
            style={[
              styles.trackingText,
              { color: item.textColor },
              {
                transform: [
                  {
                    scale: timeAnim.interpolate({
                      inputRange: [0, 0.4, 0.8, 1],
                      outputRange: [0.95, 1.05, 1.02, 1],
                    }),
                  },
                ],
                opacity: timeAnim.interpolate({
                  inputRange: [0, 0.3, 1],
                  outputRange: [0.6, 1, 1],
                }),
              },
            ]}
          >
            {item.lastTime}
          </Animated.Text>
        );
      }
      if (item.type === "Breastfeed") {
        return breastfeedTimer.isRunning ? null : item.lastTime;
      }
      if (item.type === "Diaper") {
        return (
          <Animated.Text
            style={[
              styles.trackingText,
              { color: item.textColor },
              {
                transform: [
                  {
                    scale: diaperTimeAnim.interpolate({
                      inputRange: [0, 0.4, 0.8, 1],
                      outputRange: [0.95, 1.05, 1.02, 1],
                    }),
                  },
                ],
                opacity: diaperTimeAnim.interpolate({
                  inputRange: [0, 0.3, 1],
                  outputRange: [0.6, 1, 1],
                }),
              },
            ]}
          >
            {item.lastTime}
          </Animated.Text>
        );
      }
      if (item.type === "Pumping") {
        return (
          <Animated.Text
            style={[
              styles.trackingText,
              { color: item.textColor },
              {
                transform: [
                  {
                    scale: pumpingTimeAnim.interpolate({
                      inputRange: [0, 0.4, 0.8, 1],
                      outputRange: [0.95, 1.05, 1.02, 1],
                    }),
                  },
                ],
                opacity: pumpingTimeAnim.interpolate({
                  inputRange: [0, 0.3, 1],
                  outputRange: [0.6, 1, 1],
                }),
              },
            ]}
          >
            {item.lastTime}
          </Animated.Text>
        );
      }
      return item.lastTime;
    };

    return (
      <View
        key={`${item.type}-${item.lastTime}`}
        style={[
          styles.trackingCard,
          { backgroundColor: item.color },
          isLastCard && isOddCount && styles.fullWidthCard,
          isExpanded && styles.expandedCard,
        ]}
      >
        <View>
          <View style={styles.cardHeader}>
            <Text style={[styles.trackingType, { color: item.textColor }]}>
              {item.type}
            </Text>
            {item.isDue && (
              <View style={styles.dueTag}>
                <Text style={styles.dueText}>Due</Text>
              </View>
            )}
          </View>
          {item.type === "Sleep" && sleepTimer.isRunning && (
            <Animated.View
              style={[
                styles.ongoingIndicator,
                { transform: [{ scale: pulseAnim }] },
                styles.sleepIndicator,
              ]}
            >
              <IconSymbol size={16} name="moon.fill" color="#DC2626" />
            </Animated.View>
          )}
          {item.type === "Breastfeed" && breastfeedTimer.isRunning && (
            <Animated.View
              style={[
                styles.ongoingIndicator,
                { transform: [{ scale: pulseAnim }] },
                styles.breastfeedIndicator,
              ]}
            >
              <IconSymbol size={16} name="heart.fill" color="#DC2626" />
            </Animated.View>
          )}
          <Text style={[styles.trackingText, { color: item.textColor }]}>
            {item.type === "Sleep" && "😴"}
            {renderQuantityText()}
          </Text>
          <Text style={[styles.trackingText, { color: item.textColor }]}>
            {item.type === "Sleep" && "⏰"}
            {renderSecondaryText()}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          {item.type === "Sleep" ? (
            <>
              <TouchableOpacity
                style={[
                  styles.iconButton,
                  sleepTimer.isRunning && styles.activeButton,
                ]}
                onPress={toggleSleep}
              >
                <IconSymbol
                  size={20}
                  name={sleepTimer.isRunning ? "stop.fill" : "moon.fill"}
                  color={sleepTimer.isRunning ? "#DC2626" : "#6B7280"}
                />
              </TouchableOpacity>
              {sleepTimer.isRunning &&
                (sleepTimer.showWakeInput ? (
                  <View style={styles.wakeAlarmContainer}>
                    <TextInput
                      style={styles.wakeAlarmInput}
                      value={sleepTimer.wakeAlarmMinutes?.toString() || "30"}
                      onChangeText={(text) => {
                        const minutes = parseInt(text) || 30;
                        updateWakeAlarmMinutes(minutes);
                      }}
                      keyboardType="numeric"
                      maxLength={3}
                      autoFocus
                    />
                    <Text style={styles.wakeAlarmUnit}>min</Text>
                    <TouchableOpacity
                      style={styles.tickButton}
                      onPress={saveWakeMinutes}
                    >
                      <IconSymbol size={16} name="checkmark" color="#10B981" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.iconButton,
                      sleepTimer.isAlarmSet && styles.alarmSetButton,
                      sleepTimer.showWakeInput && styles.alarmActiveButton,
                    ]}
                    onPress={toggleWakeInput}
                  >
                    {sleepTimer.isAlarmSet ? (
                      <>
                        <IconSymbol size={16} name="clock" color="#10B981" />
                        <Text style={styles.alarmSetText}>
                          {sleepTimer.wakeAlarmMinutes}m
                        </Text>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() => {
                            setSleepTimer((prev) => ({
                              ...prev,
                              isAlarmSet: false,
                              wakeAlarmMinutes: 30,
                            }));
                          }}
                        >
                          <IconSymbol size={8} name="xmark" color="#DC2626" />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <IconSymbol
                        size={20}
                        name="alarm"
                        color={sleepTimer.showWakeInput ? "#10B981" : "#6B7280"}
                      />
                    )}
                  </TouchableOpacity>
                ))}
            </>
          ) : item.isDiaper ? (
            <View style={styles.diaperButtons}>
              <TouchableOpacity
                style={styles.diaperButton}
                onPress={() => updateDiaperStatus("Poop")}
              >
                <Text style={styles.diaperButtonText}>💩</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.diaperButton}
                onPress={() => updateDiaperStatus("Wet")}
              >
                <Text style={styles.diaperButtonText}>💧</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.diaperButton}
                onPress={() => updateDiaperStatus("Mixed")}
              >
                <Text style={styles.diaperButtonText}>♻️</Text>
              </TouchableOpacity>
            </View>
          ) : item.type === "Breastfeed" ? (
            <View style={styles.breastfeedButtons}>
              <TouchableOpacity
                style={[
                  styles.breastfeedButton,
                  breastfeedTimer.isRunning &&
                    breastfeedTimer.activeSide === "left" &&
                    styles.highlightedButton,
                  !breastfeedTimer.isRunning &&
                    breastfeedTimer.activeSide === null &&
                    item.startSide === "left" &&
                    styles.startSideButton,
                ]}
                onPress={() => startTimer("left")}
              >
                <View style={styles.breastfeedButtonContent}>
                  <Text style={styles.breastfeedButtonLabel}>L</Text>
                  {breastfeedTimer.isRunning &&
                    breastfeedTimer.activeSide === "left" && (
                      <IconSymbol size={14} name="play.fill" color="#1F2937" />
                    )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.breastfeedButton,
                  breastfeedTimer.isRunning &&
                    breastfeedTimer.activeSide === "right" &&
                    styles.highlightedButton,
                  !breastfeedTimer.isRunning &&
                    breastfeedTimer.activeSide === null &&
                    item.startSide === "right" &&
                    styles.startSideButton,
                ]}
                onPress={() => startTimer("right")}
              >
                <View style={styles.breastfeedButtonContent}>
                  <Text style={styles.breastfeedButtonLabel}>R</Text>
                  {breastfeedTimer.isRunning &&
                    breastfeedTimer.activeSide === "right" && (
                      <IconSymbol size={14} name="play.fill" color="#1F2937" />
                    )}
                </View>
              </TouchableOpacity>
            </View>
          ) : item.isBottle ? (
            <>
              {bottleInput.showInput ? (
                <View style={styles.wakeAlarmContainer}>
                  <TextInput
                    style={styles.wakeAlarmInput}
                    value={bottleInput.amount?.toString() || "110"}
                    onChangeText={(text) => {
                      const amount = parseInt(text) || 110;
                      updateBottleAmount(amount);
                    }}
                    keyboardType="numeric"
                    maxLength={4}
                    autoFocus
                  />
                  <Text style={styles.wakeAlarmUnit}>ml</Text>
                  <TouchableOpacity
                    style={[
                      styles.milkTypeButton,
                      bottleInput.milkType === "Breastmilk" &&
                        styles.milkTypeButtonActive,
                    ]}
                    onPress={toggleMilkType}
                  >
                    <Text
                      style={[
                        styles.milkTypeText,
                        bottleInput.milkType === "Breastmilk" &&
                          styles.milkTypeTextActive,
                      ]}
                    >
                      {bottleInput.milkType === "Formula" ? "🍼" : "🤱"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.tickButton}
                    onPress={saveBottleAmount}
                  >
                    <IconSymbol size={16} name="checkmark" color="#10B981" />
                  </TouchableOpacity>
                </View>
              ) : (
                !breastInput.showInput && (
                  <TouchableOpacity
                    style={[
                      styles.iconButton,
                      bottleInput.showInput && styles.alarmActiveButton,
                    ]}
                    onPress={toggleBottleInput}
                  >
                    <Text>🍼</Text>
                  </TouchableOpacity>
                )
              )}
              {breastInput.showInput ? (
                <View style={styles.wakeAlarmContainer}>
                  <TextInput
                    style={styles.wakeAlarmInput}
                    value={breastInput.amount?.toString() || "120"}
                    onChangeText={(text) => {
                      const amount = parseInt(text) || 120;
                      updateBreastAmount(amount);
                    }}
                    keyboardType="numeric"
                    maxLength={4}
                    autoFocus
                  />
                  <Text style={styles.wakeAlarmUnit}>ml</Text>
                  <View
                    style={[styles.milkTypeButton, styles.milkTypeButtonActive]}
                  >
                    <Text
                      style={[styles.milkTypeText, styles.milkTypeTextActive]}
                    >
                      🤱
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.tickButton}
                    onPress={saveBreastAmount}
                  >
                    <IconSymbol size={16} name="checkmark" color="#10B981" />
                  </TouchableOpacity>
                </View>
              ) : (
                !bottleInput.showInput && (
                  <TouchableOpacity
                    style={[
                      styles.iconButton,
                      breastInput.showInput && styles.alarmActiveButton,
                    ]}
                    onPress={toggleBreastInput}
                  >
                    <Text>🤱</Text>
                  </TouchableOpacity>
                )
              )}
            </>
          ) : item.type === "Pumping" ? (
            <>
              {pumpingInput.showInput ? (
                <View style={styles.wakeAlarmContainer}>
                  <TextInput
                    style={styles.wakeAlarmInput}
                    value={pumpingInput.amount?.toString() || "150"}
                    onChangeText={(text) => {
                      const amount = parseInt(text) || 150;
                      updatePumpingAmount(amount);
                    }}
                    keyboardType="numeric"
                    maxLength={4}
                    autoFocus
                  />
                  <Text style={styles.wakeAlarmUnit}>ml</Text>
                  <TouchableOpacity
                    style={styles.tickButton}
                    onPress={savePumpingAmount}
                  >
                    <IconSymbol size={16} name="checkmark" color="#10B981" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.iconButton,
                    pumpingInput.showInput && styles.alarmActiveButton,
                  ]}
                  onPress={togglePumpingInput}
                >
                  <IconSymbol size={20} name="plus" color="#991B1B" />
                </TouchableOpacity>
              )}
            </>
          ) : item.type === "Solids" ? (
            isExpanded ? (
              renderFoodSelection()
            ) : (
              <TouchableOpacity
                style={styles.plusButton}
                onPress={() => {
                  setExpandedCard("Solids");
                  setFoodSearchQuery("");
                }}
              >
                <IconSymbol size={24} name="plus" color="#1F2937" />
              </TouchableOpacity>
            )
          ) : (
            <TouchableOpacity style={styles.plusButton}>
              <IconSymbol size={24} name="plus" color="#1F2937" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderSummaryCard = () => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.analyticsButton}
            activeOpacity={0.7}
            onPress={() => router.push("/screens/NursingAnalyticsScreen")}
          >
            <IconSymbol size={20} name="chart.bar.fill" color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewAllButton}
            activeOpacity={0.7}
            onPress={() => router.push("/(tabs)/daily-logs")}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <IconSymbol size={14} name="chevron.right" color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>
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

  const renderActivityModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showActivitiesModal}
      onRequestClose={() => setShowActivitiesModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Activities</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowActivitiesModal(false)}
            >
              <IconSymbol size={24} name="xmark" color="#4B5563" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScrollView}
            showsVerticalScrollIndicator={false}
          >
            {Object.entries(activities).map(([activity, isEnabled]) => (
              <View key={activity} style={styles.activityRow}>
                <Text style={styles.activityText}>{activity}</Text>
                <Switch
                  trackColor={{ false: "#E5E7EB", true: "#FCD34D" }}
                  thumbColor={"#FFFFFF"}
                  ios_backgroundColor="#E5E7EB"
                  onValueChange={() => toggleActivity(activity)}
                  value={isEnabled}
                  style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
                />
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => setShowActivitiesModal(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  useEffect(() => {
    let interval;
    if (sleepTimer.isRunning) {
      interval = setInterval(() => {
        setSleepTimer((prev) => ({
          ...prev,
          duration: Math.floor((Date.now() - prev.startTime) / 1000),
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sleepTimer.isRunning]);

  const toggleSleep = () => {
    setSleepTimer((prev) => {
      const newState = {
        ...prev,
        isRunning: !prev.isRunning,
        startTime: !prev.isRunning ? Date.now() : null,
        duration: 0,
        showWakeInput: false,
        isAlarmSet: false,
      };

      if (newState.isRunning) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.3,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();
      } else {
        pulseAnim.setValue(1);
      }

      return newState;
    });
  };

  const toggleWakeInput = () => {
    setSleepTimer((prev) => ({
      ...prev,
      showWakeInput: !prev.showWakeInput,
      isAlarmSet: false,
    }));
  };

  const updateWakeAlarmMinutes = (minutes) => {
    const newMinutes = Math.max(1, Math.min(120, minutes || 30));
    setSleepTimer((prev) => ({
      ...prev,
      wakeAlarmMinutes: newMinutes,
    }));
  };

  const saveWakeMinutes = () => {
    setSleepTimer((prev) => ({
      ...prev,
      showWakeInput: false,
      isAlarmSet: true,
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.childSelector}>
          <View style={styles.childInfo}>
            <Text style={styles.childName} numberOfLines={1}>
              Om
            </Text>
            <Text style={styles.childAge}>20m 15d</Text>
          </View>
          <IconSymbol size={16} name="chevron.down" color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/CoddleLogo.jpg")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <IconSymbol size={24} name="bell" color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={toggleExpoBar}>
            <IconSymbol
              size={24}
              name="gear"
              color={showExpoBar ? "#FCD34D" : "#4B5563"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          <View style={styles.trackingGrid}>
            {visibleTrackingData.map((item, index) =>
              renderTrackingCard(item, index)
            )}
          </View>

          <View style={styles.promptsContainer}>
            <Text style={styles.sectionTitle}>Suggestions</Text>
            {prompts.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.promptCard,
                  prompt.type === "question" && styles.questionCard,
                  prompt.type === "recommendation" && styles.recommendationCard,
                  prompt.type === "log" && styles.logCard,
                ]}
                activeOpacity={0.7}
                onPress={() => handlePromptClick(prompt)}
              >
                <View style={[styles.promptIconContainer]}>
                  <Text style={[styles.promptIcon]}>{prompt.icon}</Text>
                </View>
                <Text style={[styles.promptText]}>{prompt.text}</Text>
                {prompt.type === "log" && (
                  <View style={styles.logPromptButton}>
                    <IconSymbol size={16} name="plus" color="#F59E0B" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {renderSummaryCard()}
          <View style={styles.editActivitiesContainer}>
            <TouchableOpacity
              style={styles.editActivitiesButton}
              activeOpacity={0.7}
              onPress={() => setShowActivitiesModal(true)}
            >
              <View style={styles.editActivitiesIconContainer}>
                <IconSymbol size={16} name="pencil" color="#1F2937" />
              </View>
              <Text style={styles.editActivitiesText}>Edit Activities</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
          <IconSymbol size={24} name="house" color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <IconSymbol size={24} name="list.bullet" color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push("/screens/NursingAnalyticsScreen")}
        >
          <IconSymbol size={24} name="chart.bar" color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <IconSymbol size={24} name="person" color="#4B5563" />
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.combinedFabContainer,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
            position: "absolute",
            right: null, // Remove default right position
            bottom: null, // Remove default bottom position
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity style={styles.assistantFabButton}>
          <IconSymbol size={20} name="waveform.path" color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.fabDivider} />
        <TouchableOpacity style={styles.assistantFabButton}>
          <IconSymbol size={20} name="message.fill" color="#1F2937" />
        </TouchableOpacity>
      </Animated.View>
      {renderActivityModal()}
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
    height: 60,
  },
  childSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    width: 110,
    zIndex: 1,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    lineHeight: 16,
  },
  childAge: {
    fontSize: 10,
    color: "#6B7280",
    lineHeight: 12,
  },
  logoContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 120,
  },
  logoImage: {
    width: 90,
    height: 28,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 8,
    zIndex: 1,
    width: 130,
    justifyContent: "flex-end",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollViewContent: {
    paddingBottom: Platform.OS === "ios" ? 90 : 70,
    width: "100%",
  },
  mainContent: {
    padding: 16,
    gap: 12,
    width: "100%",
  },
  trackingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  trackingCard: {
    width: "48.2%",
    borderRadius: 16,
    padding: 14,
    height: 150,
    justifyContent: "space-between",
    backgroundColor: "white",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  trackingType: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    marginBottom: 0,
    letterSpacing: 0.2,
  },
  trackingText: {
    fontSize: 13,
    marginBottom: 2,
    opacity: 1,
    lineHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    letterSpacing: 0.1,
  },
  promptsContainer: {
    gap: 6,
    marginTop: 8,
  },
  promptCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 10,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6",
  },
  recommendationCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
  },
  logCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  promptIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.03)",
    justifyContent: "center",
    alignItems: "center",
  },
  promptIcon: {
    fontSize: 14,
  },
  promptText: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    gap: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  viewAllText: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
  },
  summarySection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  summaryText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  dueTag: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  dueText: {
    fontSize: 11,
    color: "#92400E",
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  ongoingIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "white",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    minHeight: 44,
    alignItems: "center",
  },
  iconButton: {
    width: 48,
    height: 36,
    borderRadius: 18,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  plusButton: {
    backgroundColor: "white",
    width: 40,
    height: 40,
    borderRadius: 20,
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
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
    paddingBottom: Platform.OS === "ios" ? 40 : 30,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
  },
  combinedFabContainer: {
    flexDirection: "column",
    backgroundColor: "#FCD34D",
    borderRadius: 24,
    padding: 4,
    zIndex: 999,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  assistantFabButton: {
    backgroundColor: "#FCD34D",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  fabDivider: {
    height: 1,
    backgroundColor: "rgba(31, 41, 55, 0.1)",
    marginVertical: 4,
  },
  editActivitiesContainer: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  editActivitiesButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
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
  editActivitiesIconContainer: {
    backgroundColor: "#F3F4F6",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  editActivitiesText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  sleepIndicator: {
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    borderColor: "rgba(220, 38, 38, 0.2)",
  },
  logPromptButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  logActionsContainer: undefined,
  logActionButton: undefined,
  logActionIconContainer: undefined,
  logActionIcon: undefined,
  logActionText: undefined,
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "85%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
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
    paddingHorizontal: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1F2937",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  modalScrollView: {
    marginBottom: 24,
  },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  activityText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#1F2937",
  },
  saveButton: {
    backgroundColor: "#FCD34D",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 8,
    marginHorizontal: 4,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
  },
  fullWidthCard: {
    width: "100%",
  },
  breastfeedButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 8,
    alignItems: "center",
    height: 36,
  },
  breastfeedButton: {
    flex: 1,
    height: 36,
    backgroundColor: "white",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    maxWidth: 48,
    paddingVertical: 0,
  },
  highlightedButton: {
    backgroundColor: "#FCD34D",
    borderColor: "#F59E0B",
    borderWidth: 1,
  },
  startSideButton: {
    borderColor: "#F59E0B",
    borderWidth: 1,
  },
  breastfeedButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: "100%",
    justifyContent: "center",
  },
  breastfeedButtonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    letterSpacing: 0.2,
  },
  nextSideIndicator: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#F59E0B",
  },
  breastfeedIndicator: {
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    borderColor: "rgba(220, 38, 38, 0.2)",
  },
  activeButton: {
    backgroundColor: "#FEE2E2",
  },
  wakeAlarmContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  wakeAlarmInput: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    width: 30,
    textAlign: "center",
    marginHorizontal: 4,
  },
  wakeAlarmUnit: {
    fontSize: 12,
    color: "#6B7280",
  },
  tickButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  alarmSetButton: {
    backgroundColor: "#D1FAE5",
    borderColor: "#10B981",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    position: "relative",
  },
  alarmActiveButton: {
    backgroundColor: "#D1FAE5",
    borderColor: "#10B981",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    position: "relative",
  },
  alarmSetText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  cancelButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
    borderWidth: 0.5,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  alarmButtonContainer: {
    position: "relative",
  },
  alarmPulseBorder: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#10B981",
    opacity: 0.5,
  },
  milkTypeButton: {
    width: 32,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  milkTypeButtonActive: {
    backgroundColor: "#FCE7F3",
  },
  milkTypeText: {
    fontSize: 14,
  },
  milkTypeTextActive: {
    color: "#9D174D",
  },
  breastfeedTimerContainer: {
    gap: 2,
    marginBottom: 2,
  },
  diaperButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 8,
    alignItems: "center",
    height: 36,
  },
  diaperButton: {
    flex: 1,
    height: 36,
    backgroundColor: "white",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  diaperButtonText: {
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingLeft: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 12,
  },
  searchAddButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
  },
  foodScrollView: {
    marginBottom: 16,
  },
  foodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 4,
  },
  foodItem: {
    width: "22%",
    aspectRatio: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  foodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    position: "relative",
  },
  foodIcon: {
    fontSize: 20,
  },
  addIconButton: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "white",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  foodName: {
    fontSize: 12,
    color: "#1F2937",
    textAlign: "center",
    marginTop: 4,
  },
  addNewFoodRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 4,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    justifyContent: "space-between",
  },
  addNewFoodContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  addNewFoodTextContainer: {
    gap: 2,
  },
  addNewFoodText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  addNewFoodSubtext: {
    fontSize: 13,
    color: "#6B7280",
  },
  continueButton: {
    backgroundColor: "#F59E0B",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 8,
    marginHorizontal: 4,
    marginBottom: Platform.OS === "ios" ? 40 : 24,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  recentFoodsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 4,
  },
  recentFoodItem: {
    width: "22%",
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  recentFoodIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  recentFoodName: {
    fontSize: 12,
    color: "#1F2937",
    textAlign: "center",
  },
  searchResultsContainer: {
    paddingHorizontal: 4,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    justifyContent: "space-between",
  },
  searchResultContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchResultIcon: {
    fontSize: 24,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  searchResultCategory: {
    fontSize: 13,
    color: "#6B7280",
  },
  expandedCard: {
    width: "100%",
    height: "auto",
    minHeight: 200,
  },
  foodSelectionContainer: {
    width: "100%",
    paddingTop: 12,
    gap: 12,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingLeft: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 12,
  },
  searchAddButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
  },
  recentFoodsScroll: {
    marginHorizontal: -14,
    paddingHorizontal: 14,
  },
  recentFoodItem: {
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 8,
    width: 72,
  },
  recentFoodIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  recentFoodName: {
    fontSize: 12,
    color: "#1F2937",
    textAlign: "center",
  },
  searchResultsScroll: {
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    justifyContent: "space-between",
  },
  searchResultContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchResultIcon: {
    fontSize: 24,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  analyticsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
});
