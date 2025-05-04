"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import TabBar from "../components/TabBar";
import { supabase } from "@/app/lib/supabase"; // 수정된 Supabase 클라이언트 경로
import { User } from "@supabase/supabase-js"; // 사용자 타입 (필요시 경로 확인)

// 메시지 타입 정의
interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  conversationId?: string; // Dify conversation ID
}

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // 사용자 정보 상태
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null); // Dify Conversation ID
  const [currentChatRoomId, setCurrentChatRoomId] = useState<string | null>(
    null
  ); // Supabase chat_rooms ID

  const messagesEndRef = useRef<HTMLDivElement>(null); // 메시지 목록 맨 아래로 스크롤하기 위한 ref

  // 사용자 정보 및 오늘 채팅방 정보 가져오기
  useEffect(() => {
    const fetchUserAndChatRoom = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayStartISO = todayStart.toISOString();

        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);
        const tomorrowStartISO = tomorrowStart.toISOString();

        // 오늘 날짜로 생성된 채팅방 조회
        const { data: chatRoom, error } = await supabase
          .from("chat_rooms")
          .select("id, dify_conversation_id")
          .eq("user_id", user.id)
          .gte("created_at", todayStartISO)
          .lt("created_at", tomorrowStartISO)
          .order("created_at", { ascending: false })
          .maybeSingle();

        if (error) {
          console.error("Error fetching chat room:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));
          console.warn(
            "Supabase RLS 정책을 확인하여 chat_rooms 테이블에 대한 SELECT 권한이 올바르게 설정되었는지 확인하세요."
          );
        } else if (chatRoom) {
          console.log("Found existing chat room for today:", chatRoom);
          setCurrentChatRoomId(chatRoom.id);
          setCurrentConversationId(chatRoom.dify_conversation_id);
          // TODO: 기존 대화 내용 로드 (필요한 경우)
          // 예: fetchMessages(chatRoom.id);
        } else {
          console.log(
            "No chat room found for today. Will create one on first message."
          );
        }
      }
    };
    fetchUserAndChatRoom();
  }, [supabase]);

  // 메시지 목록 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === "chat") {
      window.location.href = "/chat";
    } else if (tab === "calendar") {
      window.location.href = "/calendar";
    } else if (tab === "location") {
      window.location.href = "/location";
    } else if (tab === "mypage") {
      window.location.href = "/mypage";
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // 메시지 전송 핸들러
  const handleSendMessage = async (
    e: FormEvent<HTMLFormElement> | FormEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    const messageText = inputValue.trim();
    if (!messageText || isLoading || !currentUser) return;

    const newUserMessage: Message = {
      id: Date.now().toString() + "-user",
      text: messageText,
      sender: "user",
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    let aiMessageId: string | null = null; // try 블록 외부에서 선언

    try {
      aiMessageId = Date.now().toString() + "-ai"; // 여기서 할당
      const currentAiMessageId = aiMessageId; // 클로저 문제 방지 위해 상수 복사

      // AI 메시지 초기 상태 추가 (placeholder)
      setMessages((prev) => [
        ...prev,
        { id: currentAiMessageId, text: "...", sender: "ai" },
      ]);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          userId: currentUser.id,
          conversationId: currentConversationId,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedAiResponse = "";
      let firstChunk = true;
      let receivedConversationId: string | null = currentConversationId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonString = line.substring(5);
              if (jsonString.trim() === "[DONE]") {
                continue;
              }
              const data = JSON.parse(jsonString);

              if (firstChunk && data.conversation_id) {
                receivedConversationId = data.conversation_id;
                console.log(
                  "Received Dify Conversation ID:",
                  receivedConversationId
                );
                if (
                  !currentConversationId &&
                  receivedConversationId &&
                  currentUser
                ) {
                  setCurrentConversationId(receivedConversationId);

                  if (!currentChatRoomId) {
                    const todayTitle =
                      new Date().toLocaleDateString("ko-KR") + " 대화";
                    const { data: newRoom, error: insertError } = await supabase
                      .from("chat_rooms")
                      .insert({
                        user_id: currentUser.id,
                        dify_conversation_id: receivedConversationId,
                        chat_title: todayTitle,
                      })
                      .select("id")
                      .single();

                    if (insertError) {
                      console.error(
                        "Error creating new chat room:",
                        insertError
                      );
                    } else if (newRoom) {
                      console.log("Created new chat room:", newRoom);
                      setCurrentChatRoomId(newRoom.id);
                    }
                  }
                }
                firstChunk = false;
              }

              if (data.event === "agent_message" && data.answer) {
                accumulatedAiResponse += data.answer;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === currentAiMessageId
                      ? {
                          ...msg,
                          text: accumulatedAiResponse,
                          conversationId: receivedConversationId ?? undefined,
                        }
                      : msg
                  )
                );
              }
            } catch (e) {
              console.error("Error parsing stream data:", e, "Raw line:", line);
            }
          }
        }
      }
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === currentAiMessageId
            ? {
                ...msg,
                text: accumulatedAiResponse || "응답을 받지 못했습니다.",
                conversationId: receivedConversationId ?? undefined,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-err",
          text: "메시지 전송 중 오류가 발생했습니다.",
          sender: "ai",
        },
      ]);
      if (aiMessageId) {
        setMessages((prev) => prev.filter((msg) => msg.id !== aiMessageId));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#FFF4BB" }}
    >
      {/* 상단 바 및 사이드바 (기존 코드 유지) */}
      <div
        className="w-full h-[80px] relative flex items-center justify-center px-4"
        onClick={closeSidebar}
      >
        {/* 배경 장식 요소 */}
        <div className="w-32 h-20 left-[-63px] top-[1px] absolute bg-white rounded-full blur-[2px]" />
        <div className="w-32 h-20 left-[-52px] top-[-10px] absolute bg-white rounded-full blur-[2px]" />
        <div className="w-28 h-16 left-[-100px] top-[24.58px] absolute bg-white rounded-full blur-[2px]" />
        <div className="w-28 h-14 left-[-80px] top-[54.05px] absolute bg-white rounded-full blur-[2px]" />
        <div className="w-24 h-14 left-[-30px] top-[46px] absolute bg-white rounded-full blur-[2px]" />
        <div className="w-28 h-16 left-0 top-[21px] absolute bg-white rounded-full blur-[2px]" />

        <svg
          className="w-10 h-10 text-gray-800 absolute left-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          onClick={(e) => {
            e.stopPropagation();
            toggleSidebar();
          }}
          fill="#a6a6a6"
        >
          <path d="M8 9h6q.425 0 .713-.288T15 8t-.288-.712T14 7H8q-.425 0-.712.288T7 8t.288.713T8 9m0 4h3q.425 0 .713-.288T12 12t-.288-.712T11 11H8q-.425 0-.712.288T7 12t.288.713T8 13m9 4h-2q-.425 0-.712-.288T14 16t.288-.712T15 15h2v-2q0-.425.288-.712T18 12t.713.288T19 13v2h2q.425 0 .713.288T22 16t-.288.713T21 17h-2v2q0 .425-.288.713T18 20t-.712-.288T17 19zM6 17l-2.15 2.15q-.25.25-.55.125T3 18.8V5q0-.825.588-1.412T5 3h12q.825 0 1.413.588T19 5v4.35q0 .3-.213.488t-.512.162q-1.275-.05-2.437.388T13.75 11.75q-.9.925-1.35 2.088t-.4 2.437q.025.3-.175.513T11.35 17z" />
        </svg>
        <div className="text-center text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
          채팅
        </div>
      </div>

      {/* 채팅 메시지 표시 영역 */}
      <div className="flex-grow overflow-y-auto px-4 pt-4 pb-32">
        {" "}
        {/* 아래 입력창 높이만큼 padding-bottom */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex mb-4 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-lg shadow ${
                msg.sender === "user"
                  ? "bg-yellow-300 text-neutral-800 rounded-br-none"
                  : "bg-white text-neutral-700 rounded-bl-none"
              }`}
              style={{ fontFamily: "Do Hyeon, sans-serif" }} // 글꼴 적용
            >
              {/* AI 응답 중 로딩 표시 */}
              {msg.sender === "ai" && msg.text === "..." && isLoading ? (
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                </div>
              ) : (
                // 줄바꿈 처리
                msg.text.split("\n").map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))
              )}
            </div>
          </div>
        ))}
        {/* 스크롤 타겟 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력창과 전송 버튼 - 하단 고정 */}
      <form
        onSubmit={handleSendMessage}
        className="fixed bottom-[85px] left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 flex items-center z-10 bg-[#FFF4BB] pb-2 pt-1"
      >
        {" "}
        {/* 배경색 및 패딩 추가 */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
          className="flex-grow h-12 px-5 py-2 text-neutral-700 text-lg font-normal font-['Do_Hyeon'] bg-white rounded-full border-2 border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-md placeholder-gray-400 disabled:opacity-50"
          placeholder={
            isLoading ? "답변 생성 중..." : "궁금한 점을 물어보세요!"
          }
        />
        <button
          type="submit"
          aria-label="메시지 전송"
          disabled={isLoading || !inputValue.trim()}
          className="ml-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white shadow-md hover:bg-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.5 19.5l19-7-19-7v7l13 0-13 0v7z"
              />
            </svg>
          )}
        </button>
      </form>

      {/* 사이드바 (기존 코드 유지) */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40" // 반투명 오버레이 추가
            onClick={closeSidebar}
          />
          <div
            className="w-64 h-full bg-white shadow-lg fixed left-0 top-0 z-50 rounded-r-[20px]"
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            {/* 오른쪽 라운드 */}
            {/* 사이드바 내용 */}
            <div className="p-5">
              <button
                onClick={closeSidebar}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  ></path>
                </svg>
              </button>
              <h2 className="text-xl font-semibold font-['Do_Hyeon'] mt-10 mb-6">
                대화 목록
              </h2>
              {/* TODO: 지난 대화 목록 불러와서 표시 */}
              <div className="space-y-2">
                <p className="text-gray-600 font-['Do_Hyeon'] p-2 rounded hover:bg-gray-100 cursor-pointer">
                  2024-07-29 대화
                </p>
                <p className="text-gray-600 font-['Do_Hyeon'] p-2 rounded hover:bg-gray-100 cursor-pointer">
                  2024-07-28 대화
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TabBar Component */}
      <TabBar
        activeTab={activeTab}
        tabs={["chat", "calendar", "location", "mypage"]}
        onTabClick={handleTabClick}
      />
    </div>
  );
}
