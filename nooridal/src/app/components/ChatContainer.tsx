"use client";

import React, { useState, useEffect, useRef } from "react";
import UserMessage from "./UserMessage";
import AIMessage from "./AIMessage";
import ChatInput from "./ChatInput";
import ChatSidebar from "./ChatSidebar";
import ErrorMessage from "./ErrorMessage";
import {
  getAllChatRooms,
  getChatRoomConversations,
} from "../lib/chatRoomService";
import { Database } from "../../../../types_db";
import { Message } from "../../types/chat";
import { ChatRoom, LLMConversation } from "../../types/db";
// Import parser for client-side SSE handling
// @ts-expect-error -- Using this until eventsource-parser types are confirmed/fixed
import {
  createParser,
  type ParsedEvent,
  type ReconnectInterval,
} from "eventsource-parser";

// --- Placeholder for current user ID ---
// Replace this with actual user authentication logic later
const currentUserId = "user-placeholder-id"; // Use this if needed for fetching rooms, but API needs room's user_id
// --------------------------------------

export default function ChatContainer() {
  // --- State Management (Task 10.2) ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Define fetch/load functions within component scope
  const fetchChatRooms = async () => {
    setIsLoadingRooms(true);
    setError(null);
    try {
      const rooms = await getAllChatRooms();
      setChatRooms(rooms);
      if (rooms.length > 0 && !currentRoomId) {
        setCurrentRoomId(rooms[0].id);
      }
    } catch (err) {
      console.error("Error fetching chat rooms:", err);
      setError("채팅방 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    setIsLoadingMessages(true);
    setError(null);
    setMessages([]);
    try {
      const conversations: LLMConversation[] = await getChatRoomConversations(
        roomId
      );
      const formattedMessages: Message[] = conversations.flatMap(
        (conv: LLMConversation): Message[] => {
          let userQuery = "";
          try {
            const request =
              typeof conv.request_data === "string"
                ? JSON.parse(conv.request_data)
                : conv.request_data;
            userQuery = request?.query ?? "Missing query";
          } catch (e) {
            console.error(
              "Failed to parse request_data:",
              conv.request_data,
              e
            );
            userQuery = "Error parsing query";
          }
          let aiResponse = "";
          try {
            const response =
              typeof conv.response_data === "string"
                ? JSON.parse(conv.response_data)
                : conv.response_data;
            aiResponse = response?.answer ?? "Missing answer";
          } catch (e) {
            console.error(
              "Failed to parse response_data:",
              conv.response_data,
              e
            );
            aiResponse = "Error parsing response";
          }
          return [
            {
              id: `${conv.id}-query`,
              role: "user",
              content: userQuery,
              timestamp: conv.created_at ?? new Date().toISOString(),
            },
            {
              id: `${conv.id}-response`,
              role: "assistant",
              content: aiResponse,
              timestamp: conv.created_at ?? new Date().toISOString(),
            },
          ];
        }
      );
      setMessages(formattedMessages);
    } catch (err) {
      console.error("Error loading conversations:", err);
      setError("대화 내용을 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchChatRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentRoomId) {
      loadMessages(currentRoomId);
    }
  }, [currentRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Handlers (Placeholders - To be implemented in later tasks) ---
  const handleSendMessage = async (messageContent: string) => {
    // Validate inputs and state
    if (!currentRoomId) {
      setError("메시지를 보낼 채팅방이 선택되지 않았습니다.");
      console.error("handleSendMessage called without currentRoomId.");
      return;
    }
    if (!messageContent.trim() || isProcessing) return;

    // Find the user_id associated with the current room
    const currentRoom = chatRooms.find((room) => room.id === currentRoomId);
    const roomUserId = currentRoom?.user_id; // Get the user_id from the room object

    if (!roomUserId) {
      setError(
        "현재 채팅방의 사용자 ID를 찾을 수 없습니다. 새로고침 후 다시 시도해주세요."
      );
      console.error(
        "Could not find user_id for currentRoomId:",
        currentRoomId,
        "in chatRooms:",
        chatRooms
      );
      // Optionally, try fetching rooms again if state might be stale
      // await fetchChatRooms();
      return; // Stop processing if user_id isn't found
    }

    // --- Optimistic UI updates ---
    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageContent,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    setIsProcessing(true);
    setError(null); // Clear previous errors

    const thinkingMessageId = `ai-${Date.now()}`;
    const thinkingMessage: Message = {
      id: thinkingMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, thinkingMessage]);
    // --- End Optimistic UI updates ---

    try {
      // --- API Call ---
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Use the user_id associated with the specific chat room
        body: JSON.stringify({
          query: messageContent,
          user: roomUserId, // Use the user_id from the current chat room
          conversation_id: currentRoomId,
        }),
      });
      // --- End API Call ---

      // --- Error Handling for Fetch ---
      if (!response.ok || !response.body) {
        const errorPayload = { message: `API error: ${response.status}` };
        try {
          const errorJson = await response.json();
          errorPayload.message =
            errorJson.error || `API Error: ${response.statusText}`;
        } catch (_e) {
          try {
            const errorText = await response.text();
            errorPayload.message =
              errorText || `API Error: ${response.statusText}`;
          } catch (finalError) {
            console.error("Could not read error response body", finalError);
            errorPayload.message = `API Error: ${response.statusText} (Could not read body)`;
          }
        }
        throw new Error(errorPayload.message);
      }
      // --- End Error Handling for Fetch ---

      // --- Streaming Response Handling ---
      let streamedContent = "";
      const decoder = new TextDecoder();
      const reader = response.body.getReader();

      // Define event types for parser...
      interface BaseEventData {
        event: string /* ... other common fields */;
      }
      interface MessageEventDataClient extends BaseEventData {
        event: "message";
        answer: string;
      }
      interface MessageEndDataClient extends BaseEventData {
        event: "message_end" /* ... */;
      }
      interface OtherEventDataClient extends BaseEventData {
        event: string /* ... */;
      }
      type DifyEventDataClient =
        | MessageEventDataClient
        | MessageEndDataClient
        | OtherEventDataClient;

      const parser = createParser((event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          if (!event.data) return;

          // Handle [DONE] signal
          if (event.data === "[DONE]") {
            console.log("Client received [DONE] signal.");
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === thinkingMessageId
                  ? { ...msg, content: streamedContent, isStreaming: false }
                  : msg
              )
            );
            setIsProcessing(false);
            return;
          }

          // Parse JSON data from the event
          try {
            const parsedData: DifyEventDataClient = JSON.parse(event.data);

            // Process 'message' event
            if (
              parsedData.event === "message" &&
              typeof parsedData.answer === "string"
            ) {
              streamedContent += parsedData.answer;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === thinkingMessageId
                    ? {
                        ...msg,
                        content: streamedContent,
                        isStreaming: true, // Keep streaming flag true
                        error: false,
                        errorMessage: undefined,
                      }
                    : msg
                )
              );
              // Process 'message_end' event
            } else if (parsedData.event === "message_end") {
              console.log("Client received message_end event.");
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === thinkingMessageId
                    ? { ...msg, content: streamedContent, isStreaming: false } // Final content, stop streaming
                    : msg
                )
              );
              setIsProcessing(false); // Stop processing
              // Handle potential 'error' event from stream
            } else if (parsedData.event === "error") {
              const errorMessage =
                (parsedData as any).message || "Stream error event received";
              console.error("Received error event from stream:", errorMessage);
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === thinkingMessageId
                    ? {
                        ...msg,
                        content: "",
                        error: true,
                        errorMessage: errorMessage,
                        isStreaming: false,
                      }
                    : msg
                )
              );
              setIsProcessing(false);
            }
            // Ignore other event types on client-side for now
          } catch (e) {
            // Handle JSON parsing error
            console.error(
              "Client error parsing stream data:",
              e,
              "Data:",
              event.data
            );
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === thinkingMessageId
                  ? {
                      ...msg,
                      content: "",
                      error: true,
                      errorMessage: "응답 데이터 파싱 오류",
                      isStreaming: false,
                    }
                  : msg
              )
            );
            setIsProcessing(false); // Stop processing
          }
        } else if (event.type === "reconnect-interval") {
          console.log("Client reconnect interval:", event.value);
        }
      });

      // Read the stream
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("Client reader finished.");
            // If processing is still true, stream ended unexpectedly
            if (isProcessing) {
              console.warn(
                "Stream ended without explicit message_end or [DONE] signal."
              );
              setMessages((prev) =>
                prev.map(
                  (msg) =>
                    msg.id === thinkingMessageId && !msg.error
                      ? {
                          ...msg,
                          error: true,
                          errorMessage: "스트림 비정상 종료",
                          isStreaming: false,
                        }
                      : { ...msg, isStreaming: false } // Ensure streaming stops for all messages
                )
              );
              setIsProcessing(false);
            }
            break; // Exit loop when done
          }
          // Feed chunks to the parser
          parser.feed(decoder.decode(value));
        }
      } catch (streamError) {
        // Handle errors during stream reading
        const err = streamError as Error;
        console.error("Client stream reading error:", err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === thinkingMessageId
              ? {
                  ...msg,
                  content: "",
                  error: true,
                  errorMessage: err.message || "스트림 읽기 중 오류",
                  isStreaming: false,
                }
              : msg
          )
        );
        setIsProcessing(false);
      }
      // --- End Streaming Response Handling ---
    } catch (err) {
      // Handle errors from fetch() or initial response check
      const error = err as Error;
      console.error(
        "Error sending message or handling initial response:",
        error
      );
      const errorMessage = error.message || "메시지 전송/처리 중 오류 발생";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === thinkingMessageId
            ? {
                ...msg,
                content: "",
                error: true,
                errorMessage: errorMessage,
                isStreaming: false,
              }
            : msg
        )
      );
      setIsProcessing(false); // Ensure processing stops on error
    }
  };

  const handleSelectRoom = (roomId: string) => {
    if (roomId !== currentRoomId && !isLoadingMessages) {
      console.log("Selecting room:", roomId);
      setCurrentRoomId(roomId);
      setIsSidebarOpen(false);
    }
  };

  const handleRetry = (failedMessageId: string) => {
    if (isProcessing) return;

    const messageIndex = messages.findIndex(
      (msg) => msg.id === failedMessageId
    );

    if (messageIndex > 0 && messages[messageIndex - 1]?.role === "user") {
      const userMessageToRetry = messages[messageIndex - 1];
      console.log("Retrying message:", userMessageToRetry.content);
      setMessages((prev) => prev.filter((msg) => msg.id !== failedMessageId));
      setTimeout(() => {
        handleSendMessage(userMessageToRetry.content);
      }, 100);
    } else {
      console.warn(
        "Could not find user message preceding failed AI message:",
        failedMessageId
      );
      setError("재시도할 이전 사용자 메시지를 찾을 수 없습니다.");
    }
  };

  // --- Render ---
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chatRooms={chatRooms}
        onSelectRoom={handleSelectRoom}
        currentRoomId={currentRoomId}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10">
          <button
            aria-label="Toggle sidebar"
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900 mr-4 lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-xl font-semibold">누리달 AI챗봇</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoadingRooms && (
            <p className="text-center text-gray-500">채팅방 목록 로딩 중...</p>
          )}
          {isLoadingMessages && (
            <p className="text-center text-gray-500">
              대화 내용을 불러오는 중...
            </p>
          )}
          {!isLoadingRooms && !isLoadingMessages && chatRooms.length === 0 && (
            <p className="text-center text-gray-500">채팅 기록이 없습니다.</p>
          )}
          {!isLoadingRooms &&
            currentRoomId &&
            !isLoadingMessages &&
            messages.length === 0 &&
            !error && (
              <p className="text-center text-gray-500">대화를 시작해보세요.</p>
            )}
          {error && (
            <ErrorMessage
              message={error}
              onRetry={
                currentRoomId
                  ? () => loadMessages(currentRoomId)
                  : fetchChatRooms
              }
            />
          )}

          {!isLoadingMessages &&
            messages.map((message) =>
              message.role === "user" ? (
                <UserMessage key={message.id} message={message.content} />
              ) : message.error ? (
                <ErrorMessage
                  key={message.id}
                  message={message.errorMessage || "응답 생성 중 오류 발생"}
                  onRetry={() => handleRetry(message.id)}
                />
              ) : (
                <AIMessage
                  key={message.id}
                  message={message.content}
                  isStreaming={
                    isProcessing &&
                    messages[messages.length - 1].id === message.id
                  }
                />
              )
            )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={
              !currentRoomId ||
              isProcessing ||
              isLoadingMessages ||
              isLoadingRooms
            }
          />
        </div>
      </div>
    </div>
  );
}
