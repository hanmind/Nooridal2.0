import { NextRequest, NextResponse } from "next/server";
import { getTodaysChatRoom } from "@/app/lib/chatRoomService"; // Adjust path if needed
import {
  sendChatRequest,
  handleStreamingResponse,
} from "@/app/lib/difyService"; // Adjust path if needed
import { supabase } from "@/app/lib/supabase"; // For saving conversation later
import { v4 as uuidv4 } from "uuid"; // For generating conversation ID

export const runtime = "edge"; // Use Edge Runtime for streaming

export async function POST(req: NextRequest) {
  try {
    const { query, conversation_id, user } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // --- Task 6.2: Integrate Chat Room Logic ---
    // Use conversation_id if provided, otherwise get today's room
    const currentConversationId =
      conversation_id || (await getTodaysChatRoom());
    console.log(`Using conversation ID: ${currentConversationId}`);
    // ---------------------------------------------

    // --- Task 6.3: Integrate Dify Streaming ---
    // Send request to Dify service
    const difyResponse = await sendChatRequest({
      query,
      conversation_id: currentConversationId,
      user: user || "api-user", // Provide a default user from API context
      response_mode: "streaming",
    });
    // ------------------------------------------

    // --- Task 6.4: Manage Streaming Responses ---
    const encoder = new TextEncoder();
    let fullResponse = ""; // To store the full response for saving
    let responseStreamClosed = false;

    const stream = new ReadableStream({
      async start(controller) {
        const onChunk = (chunk: string) => {
          try {
            // Send the chunk back to the client, formatted as SSE
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ answer: chunk })}\n\n`)
            );
          } catch (e) {
            console.error("Error encoding/enqueuing chunk:", e);
            // Handle error, maybe close the stream
            try {
              controller.close();
            } catch {}
            responseStreamClosed = true;
          }
        };

        const onComplete = async (finalResponse: string) => {
          fullResponse = finalResponse;
          console.log("Streaming complete from service.");
          // Send DONE signal
          if (!responseStreamClosed) {
            try {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
            } catch (e) {
              console.error("Error closing stream:", e);
            } finally {
              responseStreamClosed = true;
            }
          }
          // --- Task 6.5: Save Conversation (Trigger) ---
          // Trigger saving logic after stream completion
          await saveConversation(
            currentConversationId,
            query,
            fullResponse,
            user || "api-user"
          );
          // ---------------------------------------------
        };

        const onError = (error: Error) => {
          console.error("Streaming error from service:", error);
          if (!responseStreamClosed) {
            try {
              // Send an error event to the client if possible
              controller.enqueue(
                encoder.encode(
                  `event: error\ndata: ${JSON.stringify({
                    message: error.message,
                  })}\n\n`
                )
              );
              controller.close();
            } catch (e) {
              console.error("Error sending error/closing stream:", e);
            } finally {
              responseStreamClosed = true;
            }
          }
        };

        // Start processing the stream from Dify service
        await handleStreamingResponse(
          difyResponse,
          onChunk,
          onComplete,
          onError
        );
      },
      cancel(reason) {
        console.log("Client cancelled the stream request:", reason);
        // Handle cancellation, maybe close underlying connections if possible
        responseStreamClosed = true;
      },
    });
    // -------------------------------------------

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    // --- Task 6.6: Implement Error Handling ---
    console.error("Error in POST /api/chat:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
    // -------------------------------------------
  }
}

// --- Task 6.5: Save Conversation (Implementation) ---
async function saveConversation(
  chatRoomId: string,
  query: string,
  response: string,
  userId: string
) {
  console.log(`Attempting to save conversation for room ${chatRoomId}`);
  try {
    const { error } = await supabase.from("llm_conversations").insert({
      id: uuidv4(), // Generate a new UUID for the conversation log
      chat_room_id: chatRoomId,
      query: query,
      response: response,
      user_info: { userId: userId }, // Store user identifier
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error saving conversation to Supabase:", error);
      // Decide how to handle save failure - log, retry?
    } else {
      console.log(`Conversation saved successfully for room ${chatRoomId}`);
    }
  } catch (saveError) {
    console.error("Exception during saving conversation:", saveError);
  }
}
// ---------------------------------------------------
