import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createThread,
  sendThreadMessage,
  streamRun,
  checkApiConnection,
  getAssistants,
} from "../services/streamingApiService";
import MessageBubble from "../components/MessageBubble";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { ThemedView, ThemedText } from "../components/ThemedComponents";

const StreamChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [threadId, setThreadId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [streamController, setStreamController] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [apiStatus, setApiStatus] = useState("unknown");
  const [diagnosticMode, setDiagnosticMode] = useState(false);
  const [diagInfo, setDiagInfo] = useState({});

  const flatListRef = useRef(null);

  // Initialize thread when component mounts
  useEffect(() => {
    checkApiAndInit();

    // Clean up streaming when component unmounts
    return () => {
      if (streamController) {
        streamController.cancel();
      }
    };
  }, []);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Function to check API and initialize
  const checkApiAndInit = async () => {
    try {
      setLoading(true);
      // First check if the API is reachable
      const isApiConnected = await checkApiConnection();
      setApiStatus(isApiConnected ? "connected" : "disconnected");

      if (!isApiConnected) {
        setMessages([
          {
            id: uuidv4(),
            content:
              "Cannot connect to the assistant API. Please check your internet connection and try again.",
            role: "system",
            createdAt: new Date().toISOString(),
          },
        ]);
        setLoading(false);
        return;
      }

      // Continue with thread initialization
      await initializeThread();
    } catch (error) {
      console.error("API check failed:", error);
      setApiStatus("error");
      setMessages([
        {
          id: uuidv4(),
          content: `Connection error: ${error.message}`,
          role: "system",
          createdAt: new Date().toISOString(),
        },
      ]);
      setLoading(false);
    }
  };

  const initializeThread = async () => {
    try {
      setLoading(true);
      console.log("Attempting to create thread...");
      const thread = await createThread();
      console.log("Thread created successfully:", thread);
      setThreadId(thread.id);

      // Add a welcome message
      setMessages([
        {
          id: uuidv4(),
          content: "Hello! I'm your AI assistant. How can I help you today?",
          role: "assistant",
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Failed to initialize thread:", error);

      // Save error details for diagnostics
      const apiError = {
        message: error.message || "Unknown error",
        timestamp: new Date().toISOString(),
      };

      if (error.response) {
        console.error("API Error Response:", error.response.data);
        console.error("API Error Status:", error.response.status);
        apiError.status = error.response.status;
        apiError.details = error.response.data;
      }

      setDiagInfo((prev) => ({
        ...prev,
        lastApiError: apiError,
      }));

      // Add a fallback message with a retry button
      setMessages([
        {
          id: uuidv4(),
          content: "Failed to connect to the assistant. Please try again.",
          role: "system",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Add a retry function
  const handleRetry = () => {
    setMessages([]);
    setApiStatus("unknown");
    checkApiAndInit();
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !threadId || loading) {
      console.log("Message send prevented:", {
        hasText: !!inputText.trim(),
        hasThreadId: !!threadId,
        isLoading: loading,
      });
      return;
    }

    const messageText = inputText.trim();
    console.log("Sending message:", {
      text:
        messageText.substring(0, 50) + (messageText.length > 50 ? "..." : ""),
      threadId,
    });

    setInputText("");
    Keyboard.dismiss();

    // Add user message to UI
    const userMessage = {
      id: uuidv4(),
      content: messageText,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    console.log("Adding user message to UI:", {
      id: userMessage.id,
      contentLength: messageText.length,
    });

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Send message to API
      console.log("Sending message to API...");
      await sendThreadMessage(threadId, messageText);
      console.log("Message sent to API successfully");

      // Start streaming the response
      console.log("Starting streaming response...");
      startStreamingResponse();
    } catch (error) {
      console.error("Error in handleSendMessage:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          content: "Failed to send your message. Please try again.",
          role: "system",
          createdAt: new Date().toISOString(),
        },
      ]);

      setLoading(false);
    }
  };

  const startStreamingResponse = () => {
    console.log("Starting streaming response...");

    if (streamController) {
      console.log("Cancelling existing stream controller");
      streamController.cancel();
    }

    setIsStreaming(true);
    setLoading(true);

    // Set up stream callbacks
    const controller = streamRun(threadId, {
      onRunCreated: (data) => {
        console.log("Run created:", {
          runId: data.runId,
          timestamp: new Date().toISOString(),
        });
      },
      onStatusUpdate: (data) => {
        console.log("Run status update:", {
          status: data.status,
          timestamp: new Date().toISOString(),
        });
        // If run fails but we have content, don't treat it as an error
        if (
          data.status === "failed" &&
          messages.some((msg) => msg.role === "assistant" && msg.isStreaming)
        ) {
          console.log(
            "Run failed after receiving content, finishing gracefully"
          );
          finishStreaming();
        }
      },
      onMessageCreated: (data) => {
        if (!data.content) {
          console.log("Received empty message content, skipping");
          return;
        }

        // Skip the thinking message
        if (data.content === "Thinking...") {
          console.log("Skipping thinking message");
          return;
        }

        console.log("New message chunk received:", {
          isFirstChunk: data.isFirstChunk,
          contentLength: data.content.length,
          hasTimeToFirstResponse: !!data.timeToFirstResponse,
        });

        setMessages((prevMessages) => {
          // Remove any existing streaming message
          const filteredMessages = prevMessages.filter(
            (msg) => !msg.isStreaming
          );

          // Add the new message or update existing streaming message
          const newMessage = {
            id: uuidv4(),
            content:
              data.content +
              (data.isFirstChunk
                ? `\n\nTime to first response: ${data.timeToFirstResponse}ms`
                : ""),
            role: "assistant",
            createdAt: new Date().toISOString(),
            isStreaming: true,
          };

          console.log("Updating messages with new chunk:", {
            messageId: newMessage.id,
            isStreaming: true,
          });

          return [...filteredMessages, newMessage];
        });

        // Ensure we scroll to the bottom as content streams in
        if (flatListRef.current) {
          setTimeout(() => {
            console.log("Scrolling to bottom after message update");
            flatListRef.current.scrollToEnd({ animated: true });
          }, 50);
        }
      },
      onRunCompleted: (data) => {
        console.log("Run completed:", {
          status: data.status,
          timestamp: new Date().toISOString(),
        });
        finishStreaming();
      },
      onError: (error) => {
        console.error("Stream error:", {
          error: error.message,
          response: error.response?.data,
          status: error.response?.status,
          timestamp: new Date().toISOString(),
        });
        // Only treat as error if we haven't received any content
        if (
          !messages.some((msg) => msg.role === "assistant" && msg.isStreaming)
        ) {
          console.log(
            "No content received before error, showing error message"
          );
          setMessages((prev) => [
            ...prev,
            {
              id: uuidv4(),
              content:
                "Sorry, I encountered an error while processing your request. Please try again.",
              role: "system",
              createdAt: new Date().toISOString(),
            },
          ]);
        }
        finishStreaming();
      },
      onDone: () => {
        console.log("Stream done", { timestamp: new Date().toISOString() });
        finishStreaming();
      },
    });

    setStreamController(controller);
  };

  const finishStreaming = () => {
    console.log("Finishing streaming:", {
      isStreaming: isStreaming,
      loading: loading,
      timestamp: new Date().toISOString(),
    });

    setIsStreaming(false);
    setLoading(false);

    // Mark any streaming message as complete
    setMessages((prevMessages) => {
      const updatedMessages = prevMessages.map((msg) =>
        msg.isStreaming ? { ...msg, isStreaming: false } : msg
      );

      console.log("Marked streaming messages as complete:", {
        updatedCount: updatedMessages.filter((msg) => !msg.isStreaming).length,
        totalMessages: updatedMessages.length,
      });

      return updatedMessages;
    });

    // Final scroll to bottom
    if (flatListRef.current) {
      setTimeout(() => {
        console.log("Performing final scroll to bottom");
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Render loading indicator
  const renderLoader = () => {
    if (!loading && apiStatus !== "connecting") return null;

    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="#0084ff" />
        <Text style={styles.loaderText}>
          {apiStatus === "connecting"
            ? "Connecting to API..."
            : isStreaming
            ? "Assistant is responding..."
            : "Sending..."}
        </Text>
      </View>
    );
  };

  // Long press handler for the header to toggle diagnostic mode
  const handleHeaderLongPress = async () => {
    setDiagnosticMode(!diagnosticMode);

    if (!diagnosticMode) {
      await collectDiagnosticInfo();
      Alert.alert(
        "Diagnostic Mode Enabled",
        "Showing detailed API information. Long press header again to disable."
      );
    }
  };

  // Function to render diagnostic panel
  const renderDiagnosticPanel = () => {
    if (!diagnosticMode) return null;

    return (
      <View style={styles.diagnosticPanel}>
        <Text style={styles.diagnosticTitle}>Diagnostic Information</Text>
        <Text style={styles.diagnosticText}>
          API Connected: {String(diagInfo.apiConnected)}
        </Text>
        <Text style={styles.diagnosticText}>API Status: {apiStatus}</Text>
        <Text style={styles.diagnosticText}>
          Thread ID: {threadId || "None"}
        </Text>
        <Text style={styles.diagnosticText}>
          Assistants Available: {diagInfo.assistants?.length || 0}
        </Text>
        <Text style={styles.diagnosticText}>
          API URL: {diagInfo.apiUrl || "Not available"}
        </Text>
        <Text style={styles.diagnosticText}>
          Last Updated: {diagInfo.timestamp}
        </Text>

        {diagInfo.lastApiError && (
          <View style={styles.errorSection}>
            <Text style={styles.diagnosticErrorTitle}>Last API Error:</Text>
            <Text style={styles.diagnosticError}>
              {diagInfo.lastApiError.message}
            </Text>
            {diagInfo.lastApiError.status && (
              <Text style={styles.diagnosticError}>
                Status: {diagInfo.lastApiError.status}
              </Text>
            )}
            {diagInfo.lastApiError.details && (
              <Text style={styles.diagnosticError}>
                Details:{" "}
                {JSON.stringify(diagInfo.lastApiError.details, null, 2)}
              </Text>
            )}
          </View>
        )}

        {diagInfo.error && (
          <Text style={styles.diagnosticError}>Error: {diagInfo.error}</Text>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.refreshDiagButton}
            onPress={collectDiagnosticInfo}
          >
            <Text style={styles.refreshDiagButtonText}>Refresh Info</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testConnectionButton}
            onPress={testConnection}
          >
            <Text style={styles.testConnectionButtonText}>Test API</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Function to collect diagnostic info
  const collectDiagnosticInfo = async () => {
    try {
      const isConnected = await checkApiConnection();
      let assistants = [];
      if (isConnected) {
        try {
          assistants = await getAssistants();
        } catch (error) {
          console.error("Error fetching assistants:", error);
        }
      }

      const info = {
        apiConnected: isConnected,
        apiStatus,
        threadId,
        assistants: assistants.map((a) => ({ id: a.id, name: a.name })),
        timestamp: new Date().toISOString(),
        apiUrl: createThread.toString().includes("API_URL")
          ? createThread
              .toString()
              .match(/API_URL\s*=\s*["']([^"']+)["']/)?.[1] ||
            "Not found in code"
          : "Not available",
      };

      setDiagInfo(info);
    } catch (error) {
      console.error("Error collecting diagnostic info:", error);
      setDiagInfo((prev) => ({
        ...prev,
        error: error.message,
        timestamp: new Date().toISOString(),
      }));
    }
  };

  // Function to test the API connection
  const testConnection = async () => {
    try {
      setLoading(true);
      setApiStatus("connecting");

      const isConnected = await checkApiConnection();

      // Try to create a test thread to verify permissions
      if (isConnected) {
        try {
          const thread = await createThread();
          setDiagInfo((prev) => ({
            ...prev,
            threadCreationTest: {
              success: true,
              threadId: thread.id,
              time: new Date().toISOString(),
            },
          }));

          Alert.alert(
            "Connection Test Successful",
            `API is connected and thread creation works!\nThread ID: ${thread.id}`,
            [{ text: "OK" }]
          );
        } catch (error) {
          setDiagInfo((prev) => ({
            ...prev,
            threadCreationTest: {
              success: false,
              error: error.message,
              time: new Date().toISOString(),
            },
            lastApiError: {
              message: error.message,
              status: error.response?.status,
              details: error.response?.data,
              time: new Date().toISOString(),
            },
          }));

          Alert.alert(
            "Thread Creation Failed",
            `API is connected but thread creation failed: ${error.message}`,
            [{ text: "OK" }]
          );
        }
      } else {
        Alert.alert(
          "Connection Test Failed",
          "Could not connect to the API. Check your internet connection and API URL.",
          [{ text: "OK" }]
        );
      }

      setApiStatus(isConnected ? "connected" : "disconnected");
    } catch (error) {
      console.error("Connection test failed:", error);
      setDiagInfo((prev) => ({
        ...prev,
        error: error.message,
        lastApiError: {
          message: error.message,
          time: new Date().toISOString(),
        },
      }));

      Alert.alert(
        "Connection Test Error",
        `Error testing connection: ${error.message}`,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    return <MessageBubble message={item} isStreaming={item.isStreaming} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stream Assistant</Text>
        <Text style={styles.threadIdText}>
          Thread: {threadId ? threadId.slice(-8) : "Connecting..."}
        </Text>
      </View>

      <View style={styles.messagesContainer}>
        {messages.length === 0 && loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Initializing chat...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 110 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#A0A0A0"
            multiline={false}
            maxLength={4000}
            autoCapitalize="none"
            editable={!loading && !!threadId}
            onSubmitEditing={handleSendMessage}
            blurOnSubmit={true}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            style={[
              styles.sendButton,
              (!inputText.trim() || loading || !threadId) &&
                styles.sendButtonDisabled,
            ]}
            disabled={!inputText.trim() || loading || !threadId}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {diagnosticMode && renderDiagnosticPanel()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingBottom: Platform.OS === "ios" ? 30 : 60,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
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
  messagesContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? 0 : 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    minHeight: 36,
    marginRight: 8,
    color: "#000000",
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#B0B0B0",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  loaderContainer: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: {
    marginLeft: 8,
    color: "#666",
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#0084ff",
    borderRadius: 20,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  diagnosticPanel: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  diagnosticTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  diagnosticText: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  diagnosticError: {
    fontSize: 12,
    color: "red",
    marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  errorSection: {
    marginTop: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "red",
    paddingLeft: 8,
  },
  diagnosticErrorTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "red",
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  refreshDiagButton: {
    flex: 1,
    marginRight: 8,
    padding: 10,
    backgroundColor: "#0084ff",
    borderRadius: 8,
    alignItems: "center",
  },
  refreshDiagButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  testConnectionButton: {
    flex: 1,
    marginLeft: 8,
    padding: 10,
    backgroundColor: "#4caf50",
    borderRadius: 8,
    alignItems: "center",
  },
  testConnectionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default StreamChatScreen;
