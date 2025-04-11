import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  FlatList,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  Keyboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

import MessageItem from "../../components/MessageItem";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { sendMessage, createThread } from "../../services/apiService";

// Constant for thread ID - we'll try to create a new one or use this as fallback
const DEFAULT_THREAD_ID = "thread_bEw0qtsKdrGwYWGIGlfzEJie";

// Fallback function to generate IDs in case UUID has issues
const generateId = () => {
  try {
    return uuidv4();
  } catch (error) {
    // Fallback to a timestamp-based ID with random suffix
    return `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
};

// Function to get a user-friendly error message
const getErrorMessage = (error) => {
  if (error.response) {
    // The request was made and the server responded with an error status
    if (error.response.status === 400) {
      let errorDetail = "";
      if (error.response.data) {
        // Try to extract more detailed error information
        if (typeof error.response.data === "string") {
          errorDetail = error.response.data;
        } else if (error.response.data.error) {
          errorDetail = error.response.data.error;
        } else if (error.response.data.message) {
          errorDetail = error.response.data.message;
        }
      }

      if (errorDetail) {
        return `Bad request error: ${errorDetail}. Please try a different message.`;
      }
      return "The server couldn't understand the request. Please try a different message format.";
    } else if (error.response.status === 401 || error.response.status === 403) {
      return "Authentication error. Please restart the app and try again.";
    } else if (error.response.status === 404) {
      return "The API service could not be found. Please check your connection.";
    } else if (error.response.status >= 500) {
      return "The server encountered an error. Please try again later.";
    }
    return `Server error (${error.response.status}): ${
      error.response.data?.message ||
      error.response.statusText ||
      "Unknown error"
    }`;
  } else if (error.request) {
    // The request was made but no response was received
    return "No response from server. Please check your internet connection.";
  } else {
    // Something happened in setting up the request
    return `Error: ${error.message || "An unknown error occurred"}`;
  }
};

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(DEFAULT_THREAD_ID);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize thread when component mounts
  useEffect(() => {
    initializeThread();
  }, []);

  // Initialize a new thread or use default
  const initializeThread = async () => {
    setIsLoading(true);
    try {
      // Try to create a new thread
      const thread = await createThread();
      if (thread && thread.id) {
        setThreadId(thread.id);
        console.log(`New thread created: ${thread.id}`);

        // Add a welcome message with the thread ID
        setMessages([
          {
            id: generateId(),
            text: `Hello! I'm your AI assistant. How can I help you today? (Thread ID: ${thread.id})`,
            sender: "assistant",
            timestamp: new Date(),
          },
        ]);
      } else {
        // Fallback to default thread ID
        console.log(`Using default thread ID: ${DEFAULT_THREAD_ID}`);
        setMessages([
          {
            id: generateId(),
            text: `Hello! I'm your AI assistant. How can I help you today? (Thread ID: ${DEFAULT_THREAD_ID})`,
            sender: "assistant",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error initializing thread:", error);
      // Fallback to default thread ID
      setThreadId(DEFAULT_THREAD_ID);
      setMessages([
        {
          id: generateId(),
          text: `Hello! I'm your AI assistant. How can I help you today? (Using default thread)`,
          sender: "assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: generateId(),
      text: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // Send the message to the API with the current thread ID
      const response = await sendMessage(userMessage.text, threadId);

      // Add AI response to messages
      const assistantMessage = {
        id: generateId(),
        text:
          response.content +
          (response.timeToFirstResponse
            ? `\n\nTime to first response: ${response.timeToFirstResponse}ms`
            : ""),
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.log("Chat error details:", error);

      // Try to extract and log more error details
      if (error.response) {
        console.log(`Error status: ${error.response.status}`);
        console.log(`Error data:`, error.response.data);
      }

      // Get user-friendly error message
      const errorMsg = getErrorMessage(error);

      // Add error message to chat
      const errorMessage = {
        id: generateId(),
        text: errorMsg,
        sender: "assistant",
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);

      // For serious connection errors, show an alert
      if (!error.response || error.response.status >= 500) {
        Alert.alert(
          "Connection Error",
          "There was a problem connecting to the AI service. Please check your internet connection and try again.",
          [{ text: "OK" }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>Coddle Assistant</ThemedText>
        <ThemedText style={styles.threadIdText}>
          Thread: {threadId.slice(-8)}
        </ThemedText>
      </ThemedView>

      {/* Content container */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.container}>
          {messages.length === 0 && isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <ThemedText style={styles.loadingText}>
                Initializing chat...
              </ThemedText>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <MessageItem message={item} />}
              style={styles.messageList}
              contentContainerStyle={styles.messageListContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Input area - moved outside of scrollable area */}
        <ThemedView style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor="#A0A0A0"
            multiline={false}
            maxLength={500}
            autoCapitalize="none"
            accessible={true}
            accessibilityLabel="Message input field"
            editable={!isLoading}
            onSubmitEditing={handleSend}
            blurOnSubmit={true}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sendButton,
              (!input.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            disabled={!input.trim() || isLoading}
            accessible={true}
            accessibilityLabel="Send message"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={24} color="white" />
            )}
          </TouchableOpacity>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  threadIdText: {
    fontSize: 12,
    color: "#888888",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    paddingBottom: 24, // Add extra padding at bottom for better appearance
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 70,
    zIndex: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
    color: "#000000",
    fontSize: 16,
    minHeight: 46,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#007AFF",
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#B0B0B0",
  },
});
