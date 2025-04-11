import axios from "axios";

// Streaming API URL configuration
const API_URL = "https://assistant-apis-272735216503.us-central1.run.app/api";
// Default IDs with fallbacks
const DEFAULT_ASSISTANT_ID = "asst_7vAxgRy81ppKGzs2hjBvnHvT";
const DEFAULT_PARENT_ID = "parent123";
const DEFAULT_CHILD_ID = "child123";

// Add a function to check if the API is reachable
export const checkApiConnection = async () => {
  try {
    const response = await axios.get(`${API_URL}/status`);
    console.log("API status check:", response.data);
    return true;
  } catch (error) {
    console.error("API connection check failed:", error.message);
    return false;
  }
};

// Add a function to get available assistants
export const getAssistants = async () => {
  try {
    const response = await axios.get(`${API_URL}/assistants`);
    console.log("Available assistants:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Failed to get assistants:", error.message);
    return [];
  }
};

/**
 * Create a new thread
 */
export const createThread = async () => {
  try {
    // First check if the API is reachable
    await checkApiConnection();

    const requestBody = {
      parentId: DEFAULT_PARENT_ID,
      childId: DEFAULT_CHILD_ID,
      metadata: JSON.stringify({
        parentId: DEFAULT_PARENT_ID,
        childId: DEFAULT_CHILD_ID,
      }),
    };

    console.log(
      "Creating thread with request body:",
      JSON.stringify(requestBody)
    );
    const response = await axios.post(`${API_URL}/threads/create`, requestBody);

    console.log("Thread created successfully:", response.data);
    return response.data.data; // Return the thread object
  } catch (error) {
    console.error("Error creating thread:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
      console.error(
        "Headers:",
        JSON.stringify(error.response.headers, null, 2)
      );
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error:", error.message);
    }
    throw error;
  }
};

/**
 * Send a message to a thread
 */
export const sendThreadMessage = async (threadId, messageContent) => {
  try {
    const requestPayload = {
      threadId,
      content: messageContent,
      role: "user",
      parentId: DEFAULT_PARENT_ID,
      childId: DEFAULT_CHILD_ID,
    };

    console.log(
      "Sending message with payload:",
      JSON.stringify(requestPayload)
    );
    const response = await axios.post(
      `${API_URL}/messages/create`,
      requestPayload
    );

    console.log("Message sent:", response.data);
    return response.data.data; // Return the message object
  } catch (error) {
    console.error("Error sending message:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    throw error;
  }
};

/**
 * Create a run in the thread
 */
export const createRun = async (threadId) => {
  try {
    console.log(
      `Creating run for assistant ${DEFAULT_ASSISTANT_ID} on thread ${threadId}`
    );
    const response = await axios.post(`${API_URL}/runs/create`, {
      threadId,
      assistantId: DEFAULT_ASSISTANT_ID,
    });

    console.log("Run created:", response.data);
    return response.data.data; // Return the run object
  } catch (error) {
    console.error("Error creating run:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get run status
 */
export const getRunStatus = async (threadId, runId) => {
  try {
    const response = await axios.get(
      `${API_URL}/runs/thread/${threadId}/run/${runId}`
    );
    return response.data.data;
  } catch (error) {
    console.error(
      "Error getting run status:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Get thread messages
 */
export const getThreadMessages = async (threadId) => {
  try {
    const response = await axios.get(`${API_URL}/messages/thread/${threadId}`);
    return response.data.data;
  } catch (error) {
    console.error(
      "Error getting messages:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Stream a run using polling approach for React Native
 * @param {string} threadId - Thread ID
 * @param {object} callbacks - Callback functions for handling different events
 * @returns {object} - Controller object with methods to manage the stream
 */
export const streamRun = (threadId, callbacks = {}) => {
  const controller = {
    active: true,
    intervalId: null,
    cancel: () => {},
    runId: null,
    lastMessageTimestamp: 0,
    lastMessageId: null,
    retryCount: 0,
    maxRetries: 3,
    queuedCount: 0,
    maxQueuedChecks: 20,
    isCreatingRun: false,
    lastPollTime: 0,
    minPollInterval: 500,
    currentBackoff: 1000,
    maxBackoff: 5000,
    lastStatusUpdate: null,
    statusCheckCount: 0,
    startTime: Date.now(),
    firstResponseReceived: false,
  };

  const onRunCreated = callbacks.onRunCreated || (() => {});
  const onStatusUpdate = callbacks.onStatusUpdate || (() => {});
  const onMessageCreated = callbacks.onMessageCreated || (() => {});
  const onRunCompleted = callbacks.onRunCompleted || (() => {});
  const onError = callbacks.onError || (() => {});
  const onDone = callbacks.onDone || (() => {});

  // Helper function to check for new messages with rate limiting
  const checkForNewMessages = async () => {
    try {
      const messages = await getThreadMessages(threadId);
      if (!messages || messages.length === 0) return;

      // Get all assistant messages newer than our last timestamp, sorted by creation time
      const newAssistantMessages = messages
        .filter(
          (msg) =>
            msg.role === "assistant" &&
            (!controller.lastMessageTimestamp ||
              msg.created_at > controller.lastMessageTimestamp)
        )
        .sort((a, b) => a.created_at - b.created_at); // Process messages in order

      for (const message of newAssistantMessages) {
        // Handle different content formats
        let content = "";
        if (Array.isArray(message.content)) {
          content = message.content[0]?.text?.value || "";
        } else if (typeof message.content === "string") {
          content = message.content;
        } else if (message.content?.text?.value) {
          content = message.content.text.value;
        } else if (typeof message.content === "object") {
          content =
            message.content?.text ||
            message.content?.value ||
            JSON.stringify(message.content);
        }

        // Only update if we have content and it's different
        if (content && content !== controller.lastMessageId) {
          // Calculate time to first response if this is the first chunk
          if (!controller.firstResponseReceived && content !== "Thinking...") {
            const timeToFirstResponse = Date.now() - controller.startTime;
            console.log(`Time to first response: ${timeToFirstResponse}ms`);
            controller.firstResponseReceived = true;
            onMessageCreated({
              content,
              isFirstChunk: true,
              timeToFirstResponse,
            });
          } else {
            onMessageCreated({
              content,
              isFirstChunk: false,
            });
          }

          console.log("New message content:", content.substring(0, 50) + "...");
          controller.lastMessageId = content;
          controller.lastMessageTimestamp = message.created_at;
        }
      }
    } catch (error) {
      console.error("Error checking for new messages:", error);
      if (error.response?.status === 429) {
        controller.currentBackoff = Math.min(
          controller.maxBackoff,
          controller.currentBackoff * 2
        );
        console.log(
          `Rate limited, increasing backoff to ${controller.currentBackoff}ms`
        );
      }
    }
  };

  const pollRun = async () => {
    if (!controller.active) return;

    // Check if enough time has passed since last poll
    const now = Date.now();
    if (now - controller.lastPollTime < controller.currentBackoff) {
      return;
    }
    controller.lastPollTime = now;

    try {
      // If we don't have a runId yet and we're not already creating a run
      if (!controller.runId && !controller.isCreatingRun) {
        controller.isCreatingRun = true;
        try {
          // Try to get existing runs first
          const runs = await axios.get(`${API_URL}/runs/thread/${threadId}`);
          const activeRun = runs.data.data.find((run) =>
            ["queued", "in_progress"].includes(run.status)
          );

          if (activeRun) {
            controller.runId = activeRun.id;
            console.log("Found existing active run:", controller.runId);
            onRunCreated({ runId: controller.runId });
          } else {
            // No active run found, create a new one
            const run = await createRun(threadId);
            controller.runId = run.id;
            console.log("Created new run:", controller.runId);
            onRunCreated({ runId: run.id });
          }
        } catch (error) {
          console.error("Error managing run:", error);
          if (error.response?.status === 429) {
            controller.currentBackoff = Math.min(
              controller.maxBackoff,
              controller.currentBackoff * 2
            );
            console.log(
              `Rate limited, increasing backoff to ${controller.currentBackoff}ms`
            );
            return; // Skip the rest of this poll cycle
          }
          throw error;
        } finally {
          controller.isCreatingRun = false;
        }
        return;
      }

      // Skip polling if we're still creating a run
      if (controller.isCreatingRun) {
        return;
      }

      // Check run status with rate limiting
      try {
        const runStatus = await getRunStatus(threadId, controller.runId);

        // Only notify of status updates when status changes
        if (runStatus.status !== controller.lastStatusUpdate) {
          controller.lastStatusUpdate = runStatus.status;
          onStatusUpdate({ status: runStatus.status });
        }

        controller.statusCheckCount++;

        // Check for new messages regardless of status
        await checkForNewMessages();

        if (runStatus.status === "completed") {
          // Make one final check for messages
          await checkForNewMessages();
          onRunCompleted(runStatus);
          onDone();
          controller.active = false;
          if (controller.intervalId) {
            clearInterval(controller.intervalId);
          }
          return;
        } else if (runStatus.status === "failed") {
          // Only throw error if we haven't received any content
          if (!controller.firstResponseReceived) {
            throw new Error("Run failed before receiving any content");
          }
          // Otherwise, just complete the run
          onRunCompleted(runStatus);
          onDone();
          controller.active = false;
          if (controller.intervalId) {
            clearInterval(controller.intervalId);
          }
          return;
        }
      } catch (error) {
        console.error("Polling error:", error);
        if (error.response?.status === 429) {
          controller.currentBackoff = Math.min(
            controller.maxBackoff,
            controller.currentBackoff * 2
          );
          console.log(
            `Rate limited, increasing backoff to ${controller.currentBackoff}ms`
          );
          return; // Skip the rest of this poll cycle
        }
        onError(error);
      }
    } catch (error) {
      console.error("Stream error:", error);
      onError(error);
    }
  };

  // Set up polling with dynamic interval
  const startPolling = () => {
    // Poll every 2 seconds initially, rate limiting will control actual request frequency
    controller.intervalId = setInterval(pollRun, 2000);
    pollRun(); // Initial poll
  };

  // Set up cancellation
  controller.cancel = () => {
    controller.active = false;
    if (controller.intervalId) {
      clearInterval(controller.intervalId);
    }
  };

  startPolling();
  return controller;
};
