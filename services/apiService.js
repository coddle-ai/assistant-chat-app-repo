import axios from "axios";

// API URL configuration
const API_URL = "https://assistant-apis-272735216503.us-central1.run.app/api";
const DEFAULT_THREAD_ID = "thread_bEw0qtsKdrGwYWGIGlfzEJie";

// Default IDs based on the example
const DEFAULT_ASSISTANT_ID = "asst_7vAxgRy81ppKGzs2hjBvnHvT";
const DEFAULT_PARENT_ID = "parent123";
const DEFAULT_CHILD_ID = "child123";

/**
 * Create a new thread
 */
export const createThread = async () => {
  try {
    const response = await axios.post(`${API_URL}/threads/create`, {
      parentId: DEFAULT_PARENT_ID,
      childId: DEFAULT_CHILD_ID,
    });

    console.log("Thread created:", response.data);
    return response.data.data; // Return the thread object
  } catch (error) {
    console.error(
      "Error creating thread:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Send a message to a thread
 */
export const sendThreadMessage = async (threadId, messageContent) => {
  try {
    // Prepare request payload
    const requestPayload = {
      threadId,
      content: messageContent,
      role: "user",
      parentId: DEFAULT_PARENT_ID,
      childId: DEFAULT_CHILD_ID,
    };

    console.log(
      "Sending message with payload:",
      JSON.stringify(requestPayload, null, 2)
    );

    const response = await axios.post(
      `${API_URL}/messages/create`,
      requestPayload
    );

    console.log("Message sent:", response.data);
    return response.data.data; // Return the message object
  } catch (error) {
    console.error(
      "Error sending message:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Create a run to get assistant responses
 */
export const createRun = async (threadId) => {
  try {
    // Log which assistant ID we're using
    console.log(
      `Creating run for assistant ${DEFAULT_ASSISTANT_ID} on thread ${threadId}`
    );

    const response = await axios.post(`${API_URL}/runs/create`, {
      assistantId: DEFAULT_ASSISTANT_ID,
      threadId,
    });

    if (!response.data || !response.data.data) {
      console.error("Run created but response data is invalid:", response.data);
      throw new Error("Invalid response format from createRun");
    }

    console.log(`Run created successfully with ID: ${response.data.data.id}`);
    console.log(`Run status: ${response.data.data.status}`);
    return response.data.data; // Return the run object
  } catch (error) {
    // Check for specific error types
    const errorMessage = error.response?.data?.error || error.message;

    if (
      errorMessage.includes("assistant") &&
      errorMessage.includes("not found")
    ) {
      console.error(
        `Assistant ID ${DEFAULT_ASSISTANT_ID} not found. Verify your assistant ID.`
      );
      throw new Error(
        `Assistant ID ${DEFAULT_ASSISTANT_ID} not found. Please verify your configuration.`
      );
    }

    if (errorMessage.includes("thread") && errorMessage.includes("not found")) {
      console.error(
        `Thread ID ${threadId} not found. The thread may have been deleted.`
      );
      throw new Error(
        `Thread ID ${threadId} not found. The thread may have been deleted.`
      );
    }

    console.error("Error creating run:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get messages from a thread
 */
export const getMessages = async (threadId, maxRetries = 2) => {
  let retriesLeft = maxRetries;

  while (retriesLeft >= 0) {
    try {
      console.log(`Fetching messages for thread ${threadId}`);
      const response = await axios.get(
        `${API_URL}/messages/thread/${threadId}`
      );

      if (!response.data || !response.data.data) {
        console.warn("API returned no data or data.data is empty");
        if (retriesLeft > 0) {
          console.log(
            `Retrying message retrieval (${retriesLeft} retries left)...`
          );
          retriesLeft--;
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
          continue;
        }
        return []; // Return empty array after all retries
      }

      console.log(`Messages retrieved: ${response.data.data.length}`);

      // If no messages were returned and we have retries left, try again
      if (response.data.data.length === 0 && retriesLeft > 0) {
        console.log(
          `No messages found, retrying (${retriesLeft} retries left)...`
        );
        retriesLeft--;
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        continue;
      }

      return response.data.data; // Return the messages array
    } catch (error) {
      console.error(
        "Error getting messages:",
        error.response?.data || error.message
      );

      // If we have retries left, try again
      if (retriesLeft > 0) {
        console.log(
          `Error retrieving messages, retrying (${retriesLeft} retries left)...`
        );
        retriesLeft--;
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
      } else {
        throw error; // Throw after all retries
      }
    }
  }

  console.warn("All message retrieval attempts failed, returning empty array");
  return []; // Final fallback - return empty array
};

/**
 * Extract readable content from message objects
 */
export const extractReadableContent = (message) => {
  // Log the message structure for debugging
  console.log(
    "Extracting content from message:",
    JSON.stringify(message, null, 2)
  );

  const isUser = message.role === "user";

  // Handle undefined or null message
  if (!message) {
    console.error("Message is undefined or null");
    return "";
  }

  try {
    // Special case: Handle new thread messages or system messages
    if (message.content === null || message.content === undefined) {
      console.log("Message content is null or undefined");
      // Check if there's a fallback field (e.g. text or value) on the message itself
      return message.text || message.value || "";
    }

    // If content is an array (common format for API responses)
    if (Array.isArray(message.content)) {
      // If the array is empty
      if (message.content.length === 0) {
        console.log("Message content array is empty");
        return "";
      }

      // Find the first text content
      for (const contentItem of message.content) {
        console.log("Processing content item:", contentItem);

        // Handle different content types
        if (contentItem.type === "text") {
          const textValue = contentItem.text?.value || "";
          console.log(`Found text content: "${textValue}"`);

          // For user messages, check if it's JSON
          if (isUser && textValue.startsWith("{")) {
            try {
              const contentObj = JSON.parse(textValue);
              return (
                contentObj.question ||
                contentObj.content ||
                contentObj.text ||
                textValue
              );
            } catch (err) {
              console.log("Not valid JSON, returning as is");
              return textValue;
            }
          }
          return textValue;
        }
        // Add support for image or other content types if needed
      }

      // If no text content was found but there's something in the array
      if (message.content[0]) {
        console.log("No text content found, using first content item");
        // Try to extract from the first content item
        const firstItem = message.content[0];
        return firstItem.text?.value || JSON.stringify(firstItem);
      }
    }
    // If content is a string directly
    else if (typeof message.content === "string") {
      console.log(`Content is a string: "${message.content}"`);
      return message.content;
    }
    // If content is an object with a text property
    else if (message.content?.text) {
      console.log("Content has text property");
      return message.content.text.value || message.content.text;
    }

    // Fallback 1: Try to stringify the content
    if (message.content) {
      const contentStr =
        typeof message.content === "object"
          ? JSON.stringify(message.content)
          : String(message.content);
      console.log(`Fallback content string: "${contentStr}"`);
      return contentStr;
    }

    // Final fallback
    console.warn("Could not extract content from message");
    return "";
  } catch (err) {
    console.error("Error extracting content:", err);
    // Multiple fallback attempts in case of error
    try {
      if (Array.isArray(message.content) && message.content.length > 0) {
        return (
          message.content[0]?.text?.value || JSON.stringify(message.content[0])
        );
      }
      return typeof message.content === "string"
        ? message.content
        : JSON.stringify(message.content);
    } catch (e) {
      console.error("Error in fallback extraction:", e);
      return "";
    }
  }
};

/**
 * Get the status of a run - tries multiple endpoint formats with fallback
 */
export const getRunStatus = async (threadId, runId) => {
  // Array of endpoint formats to try, in order of preference
  const endpointFormats = [
    // Method 1: REST-style path parameters
    `${API_URL}/runs/thread/${threadId}/run/${runId}`,

    // Method 2: Query parameters approach
    `${API_URL}/runs/thread-run?threadId=${threadId}&runId=${runId}`,

    // Method 3: Generic run endpoint with query
    `${API_URL}/runs/${runId}?threadId=${threadId}`,
  ];

  let lastError = null;

  // Try each endpoint format until one works
  for (const endpoint of endpointFormats) {
    try {
      console.log(`Trying to get run status using endpoint: ${endpoint}`);
      const response = await axios.get(endpoint);

      if (response.data && response.data.data) {
        console.log(`Run status: ${response.data.data.status}`);
        return response.data.data;
      } else {
        console.warn("API returned success but with invalid data format");
      }
    } catch (error) {
      console.error(
        `Error with endpoint ${endpoint}:`,
        error.response?.data || error.message
      );
      lastError = error;
      // Continue to next endpoint format
    }
  }

  // If all GET requests fail, try the POST method (Method 4)
  try {
    console.log(`Trying POST method as fallback`);
    const response = await axios.post(`${API_URL}/runs/get-with-thread`, {
      threadId,
      runId,
    });

    if (response.data && response.data.data) {
      console.log(`Run status from POST method: ${response.data.data.status}`);
      return response.data.data;
    }
  } catch (error) {
    console.error(
      "Error with POST method:",
      error.response?.data || error.message
    );
  }

  // If all methods fail, throw the last error
  throw lastError || new Error("All run status retrieval methods failed");
};

/**
 * Wait for a run to complete with polling
 */
export const waitForRunCompletion = async (
  threadId,
  runId,
  maxAttempts = 10
) => {
  console.log(`Waiting for run ${runId} to complete...`);
  let consecutiveErrors = 0;
  const MAX_CONSECUTIVE_ERRORS = 3;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const run = await getRunStatus(threadId, runId);

      // Reset error counter on successful API call
      consecutiveErrors = 0;

      if (run.status === "completed") {
        console.log("Run completed successfully");
        return run;
      } else if (run.status === "failed" || run.status === "cancelled") {
        console.error(`Run ended with status: ${run.status}`);
        throw new Error(`Run ${runId} ended with status: ${run.status}`);
      }

      // Wait before checking again - exponential backoff
      const delay = Math.min(1000 * Math.pow(1.5, i), 8000); // Cap at 8 seconds
      console.log(
        `Run still in progress (${run.status}), waiting ${delay}ms before checking again...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      console.error(
        `Error polling run status (attempt ${i + 1}/${maxAttempts}):`,
        error
      );

      // Count consecutive errors
      consecutiveErrors++;

      // If we've hit too many consecutive errors, use fallback approach
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.log(
          "Too many consecutive errors, switching to fallback timeout approach"
        );
        // Wait a reasonable time (10 seconds) and hope the run completes
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return { status: "unknown", id: runId, thread_id: threadId };
      }

      // Wait before retrying after an error
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log(
    "Maximum polling attempts reached, assuming run eventually completed"
  );
  // Return a minimal object so the flow can continue
  return { status: "unknown", id: runId, thread_id: threadId };
};

/**
 * Complete process to send a message and get a response
 * This function handles the entire flow:
 * 1. Sends a message to the thread
 * 2. Creates a run to get the assistant's response
 * 3. Waits for processing
 * 4. Retrieves the latest messages
 */
export const sendMessage = async (message, threadId = DEFAULT_THREAD_ID) => {
  const startTime = Date.now();
  let firstResponseTime = null;

  try {
    console.log(`Sending message to thread ${threadId}: "${message}"`);
    console.log(`Using API URL: ${API_URL}`);
    console.log(`Assistant ID: ${DEFAULT_ASSISTANT_ID}`);

    // Step 1: Send the user message
    const sentMessage = await sendThreadMessage(threadId, message);
    console.log(`Message sent successfully with ID: ${sentMessage.id}`);

    // Step 2: Create a run to process the message
    const run = await createRun(threadId);
    console.log(`Run created with ID: ${run.id}`);

    // Step 3: Wait for the run to complete instead of using a fixed timeout
    let waitSuccessful = true;
    try {
      await waitForRunCompletion(threadId, run.id);
    } catch (error) {
      console.error("Error waiting for run completion:", error);
      waitSuccessful = false;
    }

    // If waitForRunCompletion failed for any reason, ensure we still wait a reasonable time
    if (!waitSuccessful) {
      console.log(
        "Waiting additional fixed time (12 seconds) to allow run to complete..."
      );
      await new Promise((resolve) => setTimeout(resolve, 12000));
    }

    // Step 4: Get the messages from the thread
    const messages = await getMessages(threadId);
    firstResponseTime = Date.now() - startTime;
    console.log(`Time to first response: ${firstResponseTime}ms`);

    console.log(`Retrieved ${messages.length} messages from thread`);

    // Log all messages in the thread for debugging
    messages.forEach((msg, index) => {
      console.log(`Message ${index + 1}:`);
      console.log(`- Role: ${msg.role}`);
      console.log(`- Created At: ${new Date(msg.created_at).toLocaleString()}`);
      console.log(`- ID: ${msg.id}`);
      if (Array.isArray(msg.content) && msg.content.length > 0) {
        console.log(
          `- Content: ${JSON.stringify(msg.content[0], null, 2).substring(
            0,
            200
          )}...`
        );
      } else {
        console.log(
          `- Content: ${JSON.stringify(msg.content, null, 2).substring(
            0,
            200
          )}...`
        );
      }
    });

    // Step 5: Find the latest assistant message
    const assistantMessages = messages
      .filter((msg) => msg.role === "assistant")
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    console.log(`Found ${assistantMessages.length} assistant messages`);

    if (assistantMessages.length > 0) {
      try {
        // Debugging: Log the full assistantMessage
        console.log(
          "Latest assistant message:",
          JSON.stringify(assistantMessages[0], null, 2)
        );

        const latestResponse = extractReadableContent(assistantMessages[0]);
        console.log(`Assistant response: "${latestResponse}"`);

        if (!latestResponse || latestResponse.trim() === "") {
          console.warn(
            "Empty response detected - the assistant didn't generate content"
          );
          return {
            content:
              "I received your message but couldn't generate a response. This could be due to processing limitations or content policy restrictions.",
            timeToFirstResponse: firstResponseTime,
          };
        }

        return {
          content: latestResponse,
          timeToFirstResponse: firstResponseTime,
        };
      } catch (error) {
        console.error("Error extracting response content:", error);
        return {
          content:
            "I received your message but had trouble processing the response. Please try again.",
          timeToFirstResponse: firstResponseTime,
        };
      }
    } else {
      console.warn("No assistant response found in the thread");
      return {
        content:
          "I didn't receive a response. Please try again with a different question.",
        timeToFirstResponse: firstResponseTime,
      };
    }
  } catch (error) {
    console.error("Error in sendMessage flow:", error);
    throw error;
  }
};
