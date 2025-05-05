// Remove the duplicate import at the top
/*
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
*/

// Remove reading env vars at the top level
// const DIFY_API_KEY = process.env.DIFY_API_KEY;
// const DIFY_API_URL = process.env.DIFY_API_URL;

export interface ChatRequest {
  query: string;
  conversation_id: string;
  user?: string;
  response_mode?: "streaming" | "blocking";
  // Add other potential fields like 'files' if needed
}

/**
 * Sends a chat request to the Dify API and returns a streaming response.
 *
 * @param {string} query The user's query.
 * @param {string} userId The user's identifier.
 * @param {string} [conversationId] Optional conversation ID for context.
 * @returns {Promise<ReadableStream<Uint8Array>>} A promise that resolves with the streaming response body.
 * @throws {Error} If the API key/URL is not configured or if the fetch operation fails.
 */
export async function sendChatRequest(
  query: string,
  userId: string,
  conversationId: string = "" // Provide default value
): Promise<ReadableStream<Uint8Array>> {
  // Read environment variables inside the function
  const DIFY_API_KEY = process.env.DIFY_API_KEY;
  const DIFY_API_URL = process.env.DIFY_API_URL;

  // Check for API key and URL inside the function
  if (!DIFY_API_KEY || !DIFY_API_URL) {
    console.error("Dify API key or URL is not configured.");
    throw new Error("Dify API key or URL is not configured.");
  }

  console.log(
    `Sending request to Dify: User=${userId}, Conversation=${
      conversationId || "new"
    }`
  );

  try {
    const response = await fetch(DIFY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DIFY_API_KEY}`,
      },
      body: JSON.stringify({
        inputs: {},
        query,
        user: userId,
        response_mode: "streaming",
        conversation_id: conversationId,
      }),
    });

    // Check for basic fetch errors (network issues, etc.) handled by fetch itself

    // Check if the response status indicates an API error (like 4xx or 5xx)
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Dify API error: ${response.status} ${errorText}`);
      // Throw a more specific error or handle based on status code
      throw new Error(
        `Dify API request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    // Check if the body is null after checking response.ok
    if (!response.body) {
      console.error("Dify API response body is null.");
      throw new Error("Response body is null");
    }

    console.log(`Received response from Dify API: Status ${response.status}`);
    return response.body; // Return the stream
  } catch (error) {
    console.error("Error sending request to Dify API:", error);
    // Re-throw the error or handle it as needed
    if (error instanceof Error) {
      throw error; // Re-throw the original error
    }
    throw new Error("An unknown error occurred while contacting the Dify API.");
  }
}

// Define interfaces for expected SSE event data
interface MessageEventData {
  answer: string;
  // Add other potential fields from the 'message' event if needed
  id?: string;
  task_id?: string;
  conversation_id?: string;
}

interface MessageEndEventData {
  // Define fields expected in the 'message_end' event if needed
  id?: string;
  metadata?: any; // Or a more specific type for metadata
}

// Remove the @ts-expect-error directive as we are providing types/handling
import {
  createParser,
  // ParsedEvent, // Import specific types if available and correct
  // ReconnectInterval, // Import specific types if available and correct
} from "eventsource-parser";

/**
 * Processes the streaming response from the Dify API.
 * Uses eventsource-parser to handle Server-Sent Events (SSE).
 *
 * @param {Response} response The raw Response object from fetch.
 * @param {(chunk: string) => void} onChunk Callback function for each received data chunk (answer).
 * @param {(fullResponse: string) => void} onComplete Callback function when the stream is finished.
 * @param {(error: Error) => void} onError Callback function for handling errors during parsing.
 */
export async function handleStreamingResponse(
  response: Response,
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string) => void,
  onError: (error: Error) => void
) {
  if (!response.body) {
    onError(new Error("Response body is null"));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = "";

  // Use the imported types if they are correct, otherwise use a broader type like 'any'
  // Assuming ParsedEvent and ReconnectInterval might not be correct based on previous errors,
  // let's define a callback type or use a more generic approach for now.
  type EventSourceEvent =
    | { type: "event"; event?: string; data: string }
    | { type: "reconnect-interval"; value: number };

  const parser = createParser((event: EventSourceEvent) => {
    // Use the defined type
    if (event.type === "event") {
      console.log("SSE Event:", event.event, ", Data:", event.data); // Log raw data

      // Handle specific Dify events
      if (event.event === "message") {
        try {
          // Trim data in case of leading/trailing whitespace
          const jsonData = event.data.trim();
          if (!jsonData) return; // Skip empty data payloads

          const parsedData: MessageEventData = JSON.parse(jsonData);

          if (parsedData.answer && typeof parsedData.answer === "string") {
            onChunk(parsedData.answer);
            fullResponse += parsedData.answer;
          } else {
            // Log if 'answer' is missing or not a string, but don't necessarily throw error
            console.warn(
              "Received message event without valid 'answer' string:",
              parsedData
            );
          }
        } catch (e) {
          console.error("Error parsing message event data:", event.data, e);
          onError(
            new Error(
              `Error parsing stream data: ${
                e instanceof Error ? e.message : String(e)
              }`
            )
          );
        }
      } else if (
        event.event === "agent_message_end" ||
        event.event === "message_end"
      ) {
        // Handle potential end event names
        console.log("Stream end event received.");
        onComplete(fullResponse);
        // You might parse event.data here for final metadata if needed
        // try { const finalData: MessageEndEventData = JSON.parse(event.data); ... } catch(e) {}
      } else if (event.data === "[DONE]") {
        // Handle common alternative end signal
        console.log("Received [DONE] signal.");
        onComplete(fullResponse);
      }
      // Add handling for other event types if necessary
    } else if (event.type === "reconnect-interval") {
      console.log("SSE reconnect interval received:", event.value);
    }
  });

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("Reader finished.");
        // It's generally safer to rely on the 'message_end' or '[DONE]' signal
        // If neither is guaranteed, you might call onComplete here as a fallback.
        // onComplete(fullResponse);
        break;
      }
      parser.feed(decoder.decode(value));
    }
  } catch (error) {
    console.error("Error reading stream:", error);
    onError(
      error instanceof Error ? error : new Error("Unknown stream reading error")
    );
  } finally {
    console.log("Finished processing stream.");
  }
}
