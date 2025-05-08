"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import TabBar from "../components/TabBar";
import { supabase } from "@/app/lib/supabase"; // 수정된 Supabase 클라이언트 경로
import { User } from "@supabase/supabase-js"; // 사용자 타입 (필요시 경로 확인)

// 메시지 타입 정의
interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  conversationId?: string; // Dify conversation ID
  time?: string; // 추가
}

export type Tab = "chat" | "calendar" | "location" | "mypage";

export default function ChatPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("chat");
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
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expectedDate, setExpectedDate] = useState<string | null>(null);
  const [selectedDateMessages, setSelectedDateMessages] = useState<Message[]>(
    []
  );
  const [currentWeek, setCurrentWeek] = useState<string>("*");

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

  useEffect(() => {
    // Supabase에서 current_week 가져오기
    const fetchCurrentWeek = async () => {
      const { data, error } = await supabase
        .from("pregnancies")
        .select("current_week")
        .maybeSingle();
      if (data?.current_week) setCurrentWeek(data.current_week);
    };
    fetchCurrentWeek();

    // 인삿말 메시지 추가 (최초 1회)
    setMessages((prev) => [
      {
        id: "welcome",
        text:
          `안녕하세요. AI에이전트 플로렌스 입니다.\n` +
          `나이팅게일의 풀네임은 플로렌스 나이팅게일이라고 하네요. 그분의 정신을 닮아 성심성의껏 도움을 드리겠습니다.\n` +
          `아기는 현재 *주차이시군요 !\n` +
          `임신과 출산에 관한 궁금한 점을 물어보세요!`,
        sender: "ai",
        time: getCurrentTime(),
      },
    ]);
  }, []);

  // 메시지 목록 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === "chat") {
      router.push("/agent");
    } else if (tab === "calendar") {
      router.push("/calendar");
    } else if (tab === "location") {
      router.push("/location");
    } else if (tab === "mypage") {
      router.push("/mypage");
    }
  };

  const blurs = [
    { w: 24, h: 14, left: 260.61, top: 229 },
    { w: 24, h: 14, left: 208, top: 241.8 },
    { w: 24, h: 14, left: 267.63, top: 255.94 },
    { w: 24, h: 14, left: 298.49, top: 237.75 },
    { w: 12, h: 7, left: 333.57, top: 274.12 },
    { w: 16, h: 14, left: 235.36, top: 252.57 },
    { w: 16, h: 14, left: 232.55, top: 233.04 },
  ];

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
      time: getCurrentTime(),
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

  // Define 'closeSidebar' and 'toggleSidebar' as placeholders
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  const toggleSidebar = () => {};

  // Function to generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const prevMonthLastDate = new Date(year, month, 0).getDate();
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDate - i),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  // Function to format year and month
  const formatYearMonth = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  // Update handleDateSelect function to connect with chat_rooms
  const handleDateSelect = async (date: Date) => {
    const selectedDate = date.toISOString().split("T")[0];
    setExpectedDate(selectedDate);
    setShowCalendar(false);

    // Fetch messages for the selected date from chat_rooms
    const { data: chatRoom, error: chatRoomError } = await supabase
      .from("chat_rooms")
      .select("id")
      .eq("created_at", selectedDate)
      .maybeSingle();

    if (chatRoomError) {
      console.error("Error fetching chat room:", chatRoomError);
      return;
    }

    if (chatRoom) {
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_room_id", chatRoom.id);

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
      } else {
        setSelectedDateMessages(messages || []);
      }
    } else {
      console.log("No chat room found for the selected date.");
      setSelectedDateMessages([]);
    }
  };

  // 시간 포맷 함수 추가
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#FFF4BB" }}
    >
      {/* Header with rounded bottom */}
      <div className="w-full h-[140px] flex items-center justify-center bg-white shadow-md rounded-b-3xl relative mt-[-10px]">
        <div className="absolute left-[60px] top-[80px] flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-8 h-8 mr-2 cursor-pointer"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H7l-4 4V7a2 2 0 012-2z"
            />
          </svg>
        </div>
        <div className="left-[175px] top-[75px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
          채팅
        </div>
      </div>

      {/* Message Bubbles */}
      <div className="flex-grow overflow-y-auto px-4 pt-8 pb-32">
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
                  ? "bg-white text-black rounded-br-none"
                  : "bg-blue-200 text-neutral-700 rounded-bl-none"
              }`}
              style={{ fontFamily: "Do Hyeon, sans-serif" }}
            >
              {msg.sender === "ai" && msg.id === "welcome"
                ? msg.text.replace("*주차", `${currentWeek}주차`)
                : msg.text.split("\n").map((line, index) => (
                    <span key={index}>
                      {line}
                      <br />
                    </span>
                  ))}
            </div>
            <div className="text-xs text-gray-400 ml-2 mb-1 self-end">
              {msg.time}
              </div>
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field and Button */}
      <form className="fixed bottom-28 left-0 w-full bg-transparent p-4 flex items-center justify-center">
        <div className="flex items-center bg-white w-full max-w-lg rounded-full border border-gray-300">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-grow h-10 px-5 py-2 text-neutral-700 text-base font-normal font-['Do_Hyeon'] bg-transparent rounded-full focus:outline-none placeholder-gray-400 disabled:opacity-50"
            placeholder={
              isLoading ? "답변 생성 중..." : "궁금한 점을 물어보세요!"
            }
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="ml-2 w-16 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="메시지 전송"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.5 19.5l19-7-19-7v7l13 0-13 0v7z"
              />
            </svg>
          </button>
        </div>
      </form>

      {/* TabBar Component */}
      <TabBar
        activeTab={activeTab}
        tabs={["chat", "calendar", "location", "mypage"]}
        onTabClick={handleTabClick}
      />

      {showCalendar && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowCalendar(false)}
          />
          <div className="bg-white p-4 rounded-2xl shadow-lg w-full max-w-lg relative z-10 mx-4 mt-20 mb-28">
            <div className="text-center mb-4">
              <div className="text-base font-light font-['Do_Hyeon'] text-gray-500">
                원하시는 날짜의 대화 내역을 확인해보세요
        </div>
      </div>

            <div className="flex justify-between items-center mb-3">
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
                  )
                }
                aria-label="이전 달 보기"
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                fill="none"
                  stroke="currentColor"
                viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="text-base font-['Do_Hyeon'] text-gray-900">
                {formatYearMonth(currentMonth)}
              </div>
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
                  )
                }
                aria-label="다음 달 보기"
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
              </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
                <div
                  key={day}
                  className={`text-center text-sm font-['Do_Hyeon'] py-1 ${
                    index === 0
                      ? "text-red-500"
                      : index === 6
                      ? "text-blue-500"
                      : "text-gray-600"
                  }`}
                >
                  {day}
          </div>
        ))}
      </div>

            <div className="grid grid-cols-7 gap-0.5">
              {generateCalendarDays().map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDateSelect(day.date)}
                  disabled={!day.isCurrentMonth}
                  className={`
                    w-10 h-10 flex items-center justify-center text-sm font-['Do_Hyeon'] rounded-full
                    ${
                      day.isCurrentMonth
                        ? day.date.toISOString().split("T")[0] === expectedDate
                          ? "bg-[#FFE999] text-gray-900 font-bold"
                          : "hover:bg-gray-100 text-gray-900"
                        : "text-gray-400"
                    }
                    ${day.date.getDay() === 0 ? "text-red-500" : ""}
                    ${day.date.getDay() === 6 ? "text-blue-500" : ""}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {day.date.getDate()}
                </button>
              ))}
            </div>

            <div className="mt-3 flex justify-center">
              <button
                onClick={() => setShowCalendar(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-['Do_Hyeon'] hover:bg-gray-300 transition-colors text-sm"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
