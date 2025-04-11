import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Ionicons } from "@expo/vector-icons";

export default function MessageItem({ message }) {
  const isUser = message.sender === "user";
  const isError = message.isError === true;

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      {!isUser && (
        <View style={styles.avatarContainer}>
          <ThemedView style={[styles.avatar, isError && styles.errorAvatar]}>
            {isError ? (
              <Ionicons name="warning" size={16} color="white" />
            ) : (
              <ThemedText style={styles.avatarText}>AI</ThemedText>
            )}
          </ThemedView>
        </View>
      )}

      <ThemedView
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          isError && styles.errorBubble,
        ]}
      >
        <ThemedText
          style={[
            isUser ? styles.userText : styles.assistantText,
            isError && styles.errorText,
          ]}
        >
          {message.text}
        </ThemedText>
        <ThemedText style={[styles.timestamp, isUser && styles.userTimestamp]}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </ThemedText>
      </ThemedView>

      {isUser && <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    marginVertical: 6,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  userContainer: {
    justifyContent: "flex-end",
  },
  assistantContainer: {
    justifyContent: "flex-start",
  },
  bubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
    marginLeft: 40,
  },
  assistantBubble: {
    backgroundColor: "#F0F0F0",
    borderBottomLeftRadius: 4,
    marginRight: 8,
  },
  errorBubble: {
    backgroundColor: "#FFF0F0",
    borderColor: "#FFCCCC",
    borderWidth: 1,
  },
  userText: {
    color: "#FFFFFF",
  },
  assistantText: {
    color: "#000000",
  },
  errorText: {
    color: "#D32F2F",
  },
  timestamp: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: "flex-end",
    opacity: 0.7,
    color: "#555555",
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  avatarContainer: {
    marginRight: 8,
    width: 32,
    height: 32,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#636AF6",
    alignItems: "center",
    justifyContent: "center",
  },
  errorAvatar: {
    backgroundColor: "#D32F2F",
  },
  avatarText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  spacer: {
    width: 32,
  },
});
