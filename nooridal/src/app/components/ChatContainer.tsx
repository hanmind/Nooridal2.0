"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import UserMessage from "./UserMessage";
import AIMessage from "./AIMessage";
import ChatInput from "./ChatInput";
import ChatSidebar from "./ChatSidebar";
import ErrorMessage from "./ErrorMessage";
import {
  getAllChatRooms,
  getChatRoomConversations,
  getTodaysChatRoom,
  updateRoomWithDifyConversationId,
} from "../lib/chatRoomService";
import { addConversation } from "../../lib/chatRoomService";
import { Message } from "@/types/chat";
import { ChatRoom, LLMConversation } from "@/types/db";
import { supabase } from "../lib/supabase";

// 로컬 스토리지 키 생성 함수
const getLocalStorageKey = (roomId: string) => `chatMessages_${roomId}`;

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
  const [userId, setUserId] = useState<string | null>(null);
  // 사용자 정보와 임신 정보를 위한 상태 추가
  const [userInfo, setUserInfo] = useState<{
    name: string | null;
    address: string | null;
  }>({
    name: null,
    address: null,
  });
  const [pregnancyInfo, setPregnancyInfo] = useState<{
    baby_name: string | null;
    due_date: string | null;
  }>({
    baby_name: null,
    due_date: null,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 사용자 ID 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();

        if (user && user.user) {
          setUserId(user.user.id);
        } else {
          throw new Error("사용자 정보를 찾을 수 없습니다.");
        }
      } catch (err) {
        console.error("사용자 정보를 가져오는데 실패했습니다:", err);
        // 오류 발생 시 임시 ID 사용하지 않고 인증 문제 표시
        setError("사용자 인증에 실패했습니다. 다시 로그인해주세요.");
      }
    };

    fetchUser();
  }, []);

  // 사용자 상세 정보와 임신 정보 가져오기
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;

      try {
        // 1. users 테이블에서 사용자 정보 가져오기
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("name, address")
          .eq("id", userId)
          .single();

        if (userError) {
          console.error(
            "사용자 상세 정보를 가져오는데 실패했습니다:",
            userError
          );
        } else {
          setUserInfo({
            name: userData?.name || "사용자",
            address: userData?.address || "미정",
          });
        }

        // 2. pregnancies 테이블에서 임신 정보 가져오기
        const { data: pregnancyData, error: pregnancyError } = await supabase
          .from("pregnancies")
          .select("baby_name, due_date")
          .eq("user_id", userId)
          .eq("status", "active") // 활성화된 임신 정보만 가져오기
          .order("created_at", { ascending: false }) // 최신 정보 우선
          .limit(1)
          .single();

        if (pregnancyError && pregnancyError.code !== "PGRST116") {
          // PGRST116: 결과 없음
          console.error("임신 정보를 가져오는데 실패했습니다:", pregnancyError);
        } else {
          setPregnancyInfo({
            baby_name: pregnancyData?.baby_name || "아기",
            due_date: pregnancyData?.due_date || null,
          });
        }
      } catch (err) {
        console.error("사용자 및 임신 정보를 가져오는데 실패했습니다:", err);
      }
    };

    fetchUserDetails();
  }, [userId]);

  // 채팅방 목록 가져오기
  const fetchChatRooms = useCallback(async () => {
    if (!userId) return;

    setIsLoadingRooms(true);
    setError(null);
    try {
      // 현재 사용자의 채팅방 가져오기
      const rooms = await getAllChatRooms(userId);
      setChatRooms(rooms);

      // 룸이 있으면 첫번째 룸 선택, 없으면 오늘의 채팅방 생성
      if (rooms.length > 0 && !currentRoomId) {
        setCurrentRoomId(rooms[0].id);
      } else if (rooms.length === 0 && !currentRoomId) {
        // 오늘의 채팅방이 없으면 새로 생성 (dify_conversation_id는 null)
        const todaysRoom = await getTodaysChatRoom(userId);
        // 오늘의 방이 이미 목록에 있는지 확인 (중복 방지)
        if (!rooms.some((room) => room.id === todaysRoom.id)) {
          setChatRooms((prev) => [todaysRoom, ...prev]); // 새 방을 맨 앞에 추가
        } else {
          setChatRooms(rooms); // 이미 있으면 기존 목록 유지
        }
        setCurrentRoomId(todaysRoom.id);
      }
    } catch (err) {
      console.error("Error fetching chat rooms:", err);
      setError("채팅방 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingRooms(false);
    }
  }, [userId, currentRoomId]);

  // 데이터베이스에서 메시지 로드 (함수 분리)
  const loadMessagesFromDB = useCallback(async (roomId: string) => {
    setIsLoadingMessages(true);
    setError(null);
    try {
      const conversations: LLMConversation[] = await getChatRoomConversations(
        roomId
      );
      const filteredConversations = conversations.filter(
        (conv) => conv.query !== "_initialize_conversation_"
      );
      const formattedMessages: Message[] = filteredConversations.flatMap(
        (conv: LLMConversation): Message[] => [
          {
            id: `${conv.id}-query`,
            role: "user",
            content: conv.query || "Missing query",
            timestamp: conv.created_at ?? new Date().toISOString(),
          },
          {
            id: `${conv.id}-response`,
            role: "assistant",
            content: conv.response || "Missing answer",
            timestamp: conv.created_at ?? new Date().toISOString(),
          },
        ]
      );

      // 중요: DB에서 메시지를 성공적으로 가져온 경우에만 상태 업데이트
      if (formattedMessages.length > 0) {
        setMessages(formattedMessages); // DB에서 가져온 최신 메시지로 상태 업데이트
        console.log(
          `Loaded ${formattedMessages.length} messages from DB for room ${roomId} (state updated)`
        );
      } else {
        // DB에 메시지가 없으면 로컬 스토리지에서 로드한 상태를 유지 (setMessages 호출 안 함)
        console.log(
          `Loaded 0 messages from DB for room ${roomId}. Keeping state from localStorage if any.`
        );
      }
    } catch (err) {
      console.error(`Error loading conversations for room ${roomId}:`, err);
      setError("대화 내용을 불러오는데 실패했습니다.");
      // DB 로드 에러 시에도 로컬 스토리지 상태 유지 (setMessages 호출 안 함)
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // 로컬 스토리지에서 메시지 로드
  const loadMessagesFromLocalStorage = useCallback((roomId: string) => {
    const key = getLocalStorageKey(roomId);
    try {
      const savedMessages = localStorage.getItem(key);
      if (savedMessages) {
        const parsedMessages: Message[] = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages)) {
          // 로컬 스토리지 데이터로 상태 우선 업데이트 (빠른 표시용)
          setMessages(parsedMessages);
          console.log(
            `Loaded ${parsedMessages.length} messages from localStorage for room ${roomId}`
          );
          return true; // 로드 성공
        }
      }
    } catch (error) {
      console.error(
        `Error loading messages from localStorage for room ${roomId}:`,
        error
      );
      localStorage.removeItem(key); // 파싱 오류 시 해당 키 제거
    }
    return false; // 데이터 없음 또는 로드 실패
  }, []);

  // userId 변경 시 채팅방 목록 로드
  useEffect(() => {
    if (userId) {
      fetchChatRooms();
    }
  }, [userId, fetchChatRooms]);

  // currentRoomId 변경 시 메시지 로드 (수정된 부분)
  useEffect(() => {
    if (currentRoomId) {
      console.log(
        `Room changed to ${currentRoomId}, attempting to load messages...`
      );
      // 1. 로컬 스토리지에서 데이터 로드 시도 및 임시 표시
      loadMessagesFromLocalStorage(currentRoomId);
      // 2. DB에서 최신 데이터 로드 (로컬 데이터 덮어씀)
      loadMessagesFromDB(currentRoomId);
    } else {
      // 선택된 방이 없으면 메시지 비움
      setMessages([]);
    }
    // 의존성 배열에 currentRoomId, loadMessagesFromDB, loadMessagesFromLocalStorage 포함
  }, [currentRoomId, loadMessagesFromDB, loadMessagesFromLocalStorage]);

  // messages 상태 변경 시 로컬 스토리지에 저장 (추가)
  useEffect(() => {
    // 로딩 중이 아니고, 현재 방 ID가 있으며, 메시지가 존재할 때 저장
    if (
      !isLoadingMessages &&
      currentRoomId &&
      messages &&
      messages.length > 0
    ) {
      const key = getLocalStorageKey(currentRoomId);
      try {
        console.log(
          `Saving ${messages.length} messages to localStorage for room ${currentRoomId}`
        );
        localStorage.setItem(key, JSON.stringify(messages));
      } catch (error) {
        console.error(
          `Error saving messages to localStorage for room ${currentRoomId}:`,
          error
        );
        // 예를 들어 QuotaExceededError 처리 로직 추가 가능
      }
    }
    // 초기 로드 시 DB 로딩 중에 저장되지 않도록 isLoadingMessages 조건 추가
  }, [messages, currentRoomId, isLoadingMessages]);

  // 스크롤 맨 아래로 (동일)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Handlers (Placeholders - To be implemented in later tasks) ---
  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isProcessing) return;

    // 사용자 ID와 현재 방 ID 유효성 검사
    if (!userId) {
      setError("사용자 ID가 유효하지 않습니다. 다시 로그인해주세요.");
      console.error("handleSendMessage: userId is null or undefined");
      return;
    }
    if (!currentRoomId) {
      setError("현재 채팅방 ID가 유효하지 않습니다. 채팅방을 선택해주세요.");
      console.error("handleSendMessage: currentRoomId is null or undefined");
      return;
    }

    console.log(
      `handleSendMessage: Sending message from user: ${userId} in room: ${currentRoomId}`
    ); // userId 로깅 추가

    setIsProcessing(true);
    setError(null);

    // Find the current room
    const currentRoom = chatRooms.find((room) => room.id === currentRoomId);
    if (!currentRoom) {
      setError(
        "현재 채팅방 정보를 찾을 수 없습니다. 새로고침 후 다시 시도해주세요."
      );
      console.error(
        "Could not find currentRoomId:",
        currentRoomId,
        "in chatRooms:",
        chatRooms
      );
      return;
    }

    // Check if the room has a conversation ID
    let conversationId = currentRoom.dify_conversation_id;

    // If no conversation ID, get one from Dify API
    if (!conversationId) {
      setIsProcessing(true);
      try {
        console.log(
          "채팅방에 대화 ID가 없습니다. Dify API에서 새로운 대화 ID를 가져옵니다."
        );
        conversationId = await updateRoomWithDifyConversationId(
          currentRoomId,
          userId
        );

        // UI 상태 업데이트
        setChatRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === currentRoomId
              ? { ...room, dify_conversation_id: conversationId }
              : room
          )
        );
      } catch (err) {
        console.error("Dify conversation_id 획득 실패:", err);
        setError("대화 초기화 실패. 새로고침 후 다시 시도해주세요.");
        setIsProcessing(false);
        return;
      }
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

    let finalStreamedContent = "";
    let saveConversationAttempted = false; // 저장 시도 플래그

    try {
      // --- API Call ---
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: {
            username: userInfo.name || "사용자",
            baby_nickname: pregnancyInfo.baby_name || "아기",
            due_date: pregnancyInfo.due_date || "미정",
            address: userInfo.address || "미정",
          },
          query: messageContent,
          user: userId, // 로그인한 사용자 ID 사용
          conversation_id: conversationId, // Dify API conversation ID
          response_mode: "streaming",
          files: [], // 빈 배열로 files 필드 추가
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
        } catch {
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
      const decoder = new TextDecoder();
      const reader = response.body.getReader();

      // 타입 정의 개선
      interface BaseEventData {
        event: string;
        conversation_id?: string;
        message_id?: string;
        created_at?: number;
        task_id?: string;
        id?: string;
      }

      interface MessageEventDataClient extends BaseEventData {
        event: "message";
        answer: string;
      }

      interface MessageEndDataClient extends BaseEventData {
        event: "message_end";
        metadata?: Record<string, unknown>;
      }

      interface ErrorEventDataClient extends BaseEventData {
        event: "error";
        message: string;
      }

      interface OtherEventDataClient extends BaseEventData {
        event:
          | "workflow_started"
          | "node_started"
          | "node_finished"
          | "workflow_finished";
        data?: Record<string, unknown>;
      }

      type DifyEventDataClient =
        | MessageEventDataClient
        | MessageEndDataClient
        | ErrorEventDataClient
        | OtherEventDataClient;

      // Read the stream
      try {
        // 불완전한 데이터 청크를 처리하기 위한 버퍼
        let dataBuffer = "";
        let currentStreamedContent = ""; // 현재 스트리밍 중인 컨텐츠 조각 저장

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("클라이언트: 스트림 읽기 완료");
            // If processing is still true, stream ended unexpectedly
            if (isProcessing) {
              console.warn("스트림이 명시적인 종료 신호 없이 종료되었습니다.");
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === thinkingMessageId && !msg.error
                    ? {
                        ...msg,
                        error: true,
                        errorMessage: "스트림 비정상 종료",
                        isStreaming: false,
                      }
                    : { ...msg, isStreaming: false }
                )
              );
              setIsProcessing(false);
            }
            break; // Exit loop when done
          }

          // 데이터를 직접 처리
          const chunk = decoder.decode(value, { stream: true });
          console.debug(`클라이언트: 청크 수신 (${chunk.length} 바이트)`);

          // 이전 청크에서 넘어온 불완전한 데이터가 있을 수 있으므로 버퍼에 추가
          dataBuffer += chunk;

          // SSE 형식 파싱 (data: {...} 형식)
          // 완전한 이벤트만 처리하기 위해 줄바꿈 기준으로 분리
          const lines = dataBuffer.split("\n");

          // 마지막 줄은 불완전할 수 있으므로 버퍼에 남겨둠
          dataBuffer = lines.pop() || "";

          let eventCount = 0;
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              eventCount++;
              const data = line.substring(6); // 'data: ' 이후의 문자열

              // Handle [DONE] signal
              if (data.trim() === "[DONE]") {
                console.log("클라이언트: [DONE] 신호 수신");
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === thinkingMessageId
                      ? {
                          ...msg,
                          content: currentStreamedContent,
                          isStreaming: false,
                        } // 최종 컨텐츠로 업데이트
                      : msg
                  )
                );
                finalStreamedContent = currentStreamedContent; // 최종 컨텐츠 저장
                setIsProcessing(false);

                // --- Save conversation on [DONE] ---
                if (!saveConversationAttempted && userId && currentRoomId) {
                  saveConversationAttempted = true;
                  console.log(
                    "[handleSendMessage] Attempting to save conversation on [DONE]",
                    {
                      currentRoomId,
                      userId,
                      query: messageContent,
                      responseLength: finalStreamedContent.length,
                      conversationId,
                    }
                  ); // 로그 추가
                  addConversation(
                    currentRoomId,
                    userId,
                    messageContent,
                    finalStreamedContent,
                    conversationId
                  )
                    .then((result: LLMConversation | null) => {
                      console.log(
                        "[handleSendMessage] addConversation result on [DONE]:",
                        result
                      );
                    })
                    .catch((err: Error) => {
                      console.error(
                        "[handleSendMessage] addConversation error on [DONE]:",
                        err
                      );
                    });
                }
                // --- End Save conversation ---
                continue;
              }

              // Parse JSON data from the event
              try {
                const parsedData = JSON.parse(data) as DifyEventDataClient;

                // 타입가드를 사용하여 안전하게 처리
                if (parsedData.event === "message") {
                  const messageData = parsedData as MessageEventDataClient;
                  const newContent = messageData.answer || "";

                  // 중요: 내용이 비어있지 않은 경우에만 누적
                  if (newContent.length > 0) {
                    currentStreamedContent += newContent;
                    console.debug(`클라이언트: 메시지 내용: ${newContent}`);

                    // 상태 업데이트를 통해 UI 렌더링
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === thinkingMessageId
                          ? {
                              ...msg,
                              content: currentStreamedContent,
                              isStreaming: true,
                              error: false,
                              errorMessage: undefined,
                            }
                          : msg
                      )
                    );
                  }
                } else if (parsedData.event === "message_end") {
                  console.log("클라이언트: message_end 이벤트 수신");
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === thinkingMessageId
                        ? {
                            ...msg,
                            content: currentStreamedContent, // 최종 컨텐츠로 업데이트
                            isStreaming: false,
                          }
                        : msg
                    )
                  );
                  finalStreamedContent = currentStreamedContent; // 최종 컨텐츠 저장
                  setIsProcessing(false);

                  // --- Save conversation on message_end ---
                  if (!saveConversationAttempted && userId && currentRoomId) {
                    saveConversationAttempted = true;
                    console.log(
                      "[handleSendMessage] Attempting to save conversation on message_end",
                      {
                        currentRoomId,
                        userId,
                        query: messageContent,
                        responseLength: finalStreamedContent.length,
                        conversationId,
                      }
                    ); // 로그 추가
                    addConversation(
                      currentRoomId,
                      userId,
                      messageContent,
                      finalStreamedContent,
                      conversationId
                    )
                      .then((result: LLMConversation | null) => {
                        console.log(
                          "[handleSendMessage] addConversation result on message_end:",
                          result
                        );
                      })
                      .catch((err: Error) => {
                        console.error(
                          "[handleSendMessage] addConversation error on message_end:",
                          err
                        );
                      });
                  }
                  // --- End Save conversation ---
                } else if (parsedData.event === "error") {
                  const errorData = parsedData as ErrorEventDataClient;
                  const errorMessage =
                    errorData.message || "Stream error event received";
                  console.error("스트림 오류 이벤트 수신:", errorMessage);
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
                  saveConversationAttempted = true; // Don't attempt saving on error
                }
              } catch (e) {
                // Handle JSON parsing error
                console.error(
                  "클라이언트: 데이터 파싱 오류:",
                  e,
                  "데이터:",
                  data
                );
              }
            }
          }

          console.debug(
            `클라이언트: 처리된 이벤트 수: ${eventCount}, 버퍼 길이: ${dataBuffer.length}`
          );
        }

        // 버퍼에 남아있는 마지막 데이터 처리
        if (dataBuffer.trim()) {
          if (dataBuffer.startsWith("data: ")) {
            const data = dataBuffer.substring(6); // 'data: ' 이후의 문자열
            console.debug("클라이언트: 버퍼에 남은 마지막 이벤트 처리");

            // Handle [DONE] signal
            if (data.trim() === "[DONE]") {
              console.log("클라이언트: 마지막 [DONE] 신호 수신");
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === thinkingMessageId
                    ? {
                        ...msg,
                        content: currentStreamedContent,
                        isStreaming: false,
                      }
                    : msg
                )
              );
              finalStreamedContent = currentStreamedContent; // 최종 컨텐츠 저장
              setIsProcessing(false);

              // --- Save conversation on [DONE] ---
              if (!saveConversationAttempted && userId && currentRoomId) {
                saveConversationAttempted = true;
                console.log(
                  "[handleSendMessage] Attempting to save conversation on [DONE]",
                  {
                    currentRoomId,
                    userId,
                    query: messageContent,
                    responseLength: finalStreamedContent.length,
                    conversationId,
                  }
                ); // 로그 추가
                addConversation(
                  currentRoomId,
                  userId,
                  messageContent,
                  finalStreamedContent,
                  conversationId
                )
                  .then((result: LLMConversation | null) => {
                    console.log(
                      "[handleSendMessage] addConversation result on [DONE]:",
                      result
                    );
                  })
                  .catch((err: Error) => {
                    console.error(
                      "[handleSendMessage] addConversation error on [DONE]:",
                      err
                    );
                  });
              }
              // --- End Save conversation ---
            } else {
              try {
                const parsedData = JSON.parse(data) as DifyEventDataClient;

                if (parsedData.event === "message") {
                  const messageData = parsedData as MessageEventDataClient;
                  const newContent = messageData.answer || "";

                  if (newContent.length > 0) {
                    currentStreamedContent += newContent;
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === thinkingMessageId
                          ? {
                              ...msg,
                              content: currentStreamedContent,
                              isStreaming: false, // 마지막 데이터이므로 스트리밍 종료
                            }
                          : msg
                      )
                    );
                  }
                } else if (parsedData.event === "message_end") {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === thinkingMessageId
                        ? {
                            ...msg,
                            content: currentStreamedContent, // 최종 컨텐츠로 업데이트
                            isStreaming: false,
                          }
                        : msg
                    )
                  );
                  finalStreamedContent = currentStreamedContent; // 최종 컨텐츠 저장
                  setIsProcessing(false);

                  // --- Save conversation on message_end ---
                  if (!saveConversationAttempted && userId && currentRoomId) {
                    saveConversationAttempted = true;
                    console.log(
                      "[handleSendMessage] Attempting to save conversation on message_end",
                      {
                        currentRoomId,
                        userId,
                        query: messageContent,
                        responseLength: finalStreamedContent.length,
                        conversationId,
                      }
                    ); // 로그 추가
                    addConversation(
                      currentRoomId,
                      userId,
                      messageContent,
                      finalStreamedContent,
                      conversationId
                    )
                      .then((result: LLMConversation | null) => {
                        console.log(
                          "[handleSendMessage] addConversation result on message_end:",
                          result
                        );
                      })
                      .catch((err: Error) => {
                        console.error(
                          "[handleSendMessage] addConversation error on message_end:",
                          err
                        );
                      });
                  }
                  // --- End Save conversation ---
                }
              } catch (e) {
                console.error("마지막 데이터 파싱 오류:", e);
              }
            }
          } else {
            console.warn("버퍼에 남은 불완전한 데이터:", dataBuffer);
          }
        }
      } catch (streamError) {
        // Handle errors during stream reading
        const err = streamError as Error;
        console.error("클라이언트: 스트림 읽기 오류:", err);
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
        saveConversationAttempted = true; // Don't attempt saving on error
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

      // Update the thinking message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === thinkingMessageId
            ? {
                ...msg,
                content: "",
                error: true,
                errorMessage,
                isStreaming: false,
              }
            : msg
        )
      );
      setIsProcessing(false);
      saveConversationAttempted = true; // Don't attempt saving on error
    } finally {
      // 작업 완료 후 상태 초기화 및 정리
      if (thinkingMessageId && isProcessing) {
        console.log("메시지 처리 완료 후 상태 정리 (finally)");
        setIsProcessing(false);

        // 최종 상태 확인 및 업데이트 (메시지가 스트리밍 상태로 남아있는 경우 처리)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === thinkingMessageId
              ? { ...msg, content: finalStreamedContent, isStreaming: false }
              : msg
          )
        );
      } else if (thinkingMessageId) {
        // isProcessing이 false가 된 후에도 최종 컨텐츠 업데이트
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === thinkingMessageId && msg.isStreaming // 스트리밍 상태였던 메시지만
              ? { ...msg, content: finalStreamedContent, isStreaming: false }
              : msg
          )
        );
      }

      // Ensure saving happens if somehow missed earlier
      if (
        !saveConversationAttempted &&
        userId &&
        currentRoomId &&
        finalStreamedContent
      ) {
        console.log("Saving conversation in finally block as a fallback.");
        saveConversationAttempted = true; // Ensure flag is set here too
        console.log(
          "[handleSendMessage] Attempting to save conversation in finally",
          {
            currentRoomId,
            userId,
            query: messageContent,
            responseLength: finalStreamedContent.length,
            conversationId,
          }
        ); // 로그 추가
        addConversation(
          currentRoomId,
          userId,
          messageContent,
          finalStreamedContent,
          conversationId
        )
          .then((result: LLMConversation | null) => {
            console.log(
              "[handleSendMessage] addConversation result in finally:",
              result
            );
          })
          .catch((err: Error) => {
            console.error(
              "[handleSendMessage] addConversation error in finally:",
              err
            );
          });
      }
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

  // 새 채팅방 생성 함수
  const handleCreateNewChat = async () => {
    if (!userId) {
      setError("로그인이 필요합니다.");
      return;
    }

    setIsLoadingRooms(true);
    setError(null);
    setMessages([]); // 메시지 목록 초기화

    try {
      // 오늘의 새 채팅방 생성
      const newRoom = await getTodaysChatRoom(userId);
      console.log("New chat room created:", newRoom);

      // 채팅방 목록 새로고침
      const updatedRooms = await getAllChatRooms(userId);
      setChatRooms(updatedRooms);

      // 새 채팅방 선택
      setCurrentRoomId(newRoom.id);

      // 사이드바 닫기 (모바일 화면에서)
      setIsSidebarOpen(false);
    } catch (err) {
      console.error("Error creating new chat room:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "새 채팅방을 생성하는데 실패했습니다.";
      setError(errorMessage);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  // --- Render ---
  return (
    <div className="flex h-full bg-yellow-50 overflow-hidden">
      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chatRooms={chatRooms}
        onSelectRoom={handleSelectRoom}
        currentRoomId={currentRoomId}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onCreateNewChat={handleCreateNewChat}
      />

      <div className="flex-1 flex flex-col relative">
        <div className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10 border-b border-yellow-200">
          <button
            aria-label="Toggle sidebar"
            onClick={() => setIsSidebarOpen(true)}
            className="text-yellow-600 hover:text-yellow-800 mr-4 lg:hidden"
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
          <h1 className="text-xl font-semibold text-yellow-800">
            누리달 AI챗봇
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-yellow-50 pb-48">
          {isLoadingRooms && (
            <p className="text-center text-yellow-600 opacity-75">
              채팅방 목록 로딩 중...
            </p>
          )}
          {isLoadingMessages && (
            <p className="text-center text-yellow-600 opacity-75">
              대화 내용을 불러오는 중...
            </p>
          )}
          {!isLoadingRooms && !isLoadingMessages && chatRooms.length === 0 && (
            <p className="text-center text-yellow-600 opacity-75">
              채팅 기록이 없습니다.
            </p>
          )}
          {!isLoadingRooms &&
            currentRoomId &&
            !isLoadingMessages &&
            messages.length === 0 &&
            !error && (
              <p className="text-center text-yellow-600 opacity-75">
                대화를 시작해보세요.
              </p>
            )}
          {error && (
            <ErrorMessage
              message={error}
              onRetry={
                currentRoomId
                  ? () => loadMessagesFromDB(currentRoomId)
                  : fetchChatRooms
              }
            />
          )}

          {!isLoadingMessages &&
            messages.map((message) =>
              message.role === "user" ? (
                <UserMessage
                  key={message.id}
                  message={message.content}
                  timestamp={message.timestamp}
                />
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
                  isStreaming={message.isStreaming}
                  timestamp={message.timestamp}
                />
              )
            )}
          <div ref={messagesEndRef} />
        </div>

        <div className="absolute bottom-[7rem] left-0 right-0 p-4 border-t border-yellow-200 bg-white z-20">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={
              !userId ||
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
