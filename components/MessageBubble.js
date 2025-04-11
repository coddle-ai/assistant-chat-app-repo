import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

const MessageBubble = ({ message, isStreaming }) => {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const [showCursor, setShowCursor] = useState(true);

  // Blinking cursor effect for streaming messages
  useEffect(() => {
    if (!isStreaming) return;

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, [isStreaming]);

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
        isSystem && styles.systemContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          isSystem && styles.systemBubble,
          isStreaming && styles.streamingBubble,
        ]}
      >
        <Text
          style={[
            styles.text,
            isUser ? styles.userText : styles.assistantText,
            isSystem && styles.systemText,
          ]}
        >
          {message.content}
          {isStreaming && showCursor && <Text style={styles.cursor}>|</Text>}
        </Text>
      </View>

      <Text style={styles.time}>
        {new Date(message.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
        {isStreaming && " • typing..."}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: "80%",
  },
  userContainer: {
    alignSelf: "flex-end",
  },
  assistantContainer: {
    alignSelf: "flex-start",
  },
  systemContainer: {
    alignSelf: "center",
    maxWidth: "90%",
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: "#0084ff",
  },
  assistantBubble: {
    backgroundColor: "#e9e9eb",
  },
  systemBubble: {
    backgroundColor: "#ffcc00",
  },
  streamingBubble: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "solid",
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "#fff",
  },
  assistantText: {
    color: "#000",
  },
  systemText: {
    color: "#333",
    fontStyle: "italic",
  },
  time: {
    fontSize: 12,
    color: "#8e8e93",
    marginTop: 4,
    marginRight: 4,
    alignSelf: "flex-end",
  },
  cursor: {
    color: "#666",
  },
});

export default MessageBubble;
