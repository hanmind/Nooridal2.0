"use client";

import React, { useState, useRef, useEffect } from "react";

export default function TestApiPage() {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingText, setStreamingText] = useState<string>("");
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [useDifyDirect, setUseDifyDirect] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("test-user-id");
  const [conversationId, setConversationId] = useState<string>(
    "8a6ea99a-7e14-4551-852e-85236904aa62"
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 스크롤을 항상 아래로 유지
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, eventLog]);

  // Dify API 요청 함수
  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    // 사용자 메시지 추가
    setMessages((prev) => [...prev, `사용자: ${input}`]);

    // 로그 초기화 및 스트리밍 상태 설정
    setEventLog([]);
    setStreamingText("");
    setIsStreaming(true);

    try {
      let response;

      if (useDifyDirect) {
        // Dify API 직접 호출
        setEventLog((prev) => [...prev, "Dify API 직접 호출"]);
        response = await fetch("https://api.dify.ai/v1/chat-messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer app-AHbg5SN6JV2jqf306jV00qBc",
          },
          body: JSON.stringify({
            inputs: {},
            query: input,
            user: userId,
            conversation_id: conversationId || "",
            response_mode: "streaming",
            files: [],
          }),
        });
      } else {
        // 자체 API 경유 호출
        setEventLog((prev) => [...prev, "자체 API 경유 호출"]);
        response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inputs: {},
            query: input,
            user: userId,
            conversation_id: conversationId || "",
            response_mode: "streaming",
            files: [],
          }),
        });
      }

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status} ${response.statusText}`);
      }

      // 스트림 처리
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("스트림 리더를 생성할 수 없습니다");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let responseText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // 스트림 종료
          setEventLog((prev) => [...prev, "스트림 읽기 완료"]);
          break;
        }

        // 데이터 처리
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // SSE 형식 파싱 (data: {...} 형식)
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.substring(6);
            setEventLog((prev) => [
              ...prev,
              `Raw 데이터: ${
                data.length > 30 ? data.substring(0, 30) + "..." : data
              }`,
            ]);

            // [DONE] 신호 처리
            if (data === "[DONE]") {
              setEventLog((prev) => [...prev, "Stream completed [DONE]"]);
              continue;
            }

            try {
              const parsedData = JSON.parse(data);
              const eventType = parsedData.event;

              setEventLog((prev) => [...prev, `이벤트 타입: ${eventType}`]);

              if (eventType === "message") {
                const answer = parsedData.answer || "";
                if (answer) {
                  responseText += answer;
                  setStreamingText(responseText);
                }
              } else if (eventType === "message_end") {
                setEventLog((prev) => [...prev, "메시지 종료 이벤트 수신"]);
                // conversation_id 캡처 (새 대화인 경우)
                if (parsedData.conversation_id && !conversationId) {
                  setConversationId(parsedData.conversation_id);
                  setEventLog((prev) => [
                    ...prev,
                    `대화 ID 설정: ${parsedData.conversation_id}`,
                  ]);
                }
              }
            } catch (e) {
              setEventLog((prev) => [...prev, `파싱 오류: ${e}`]);
            }
          }
        }
      }

      // 스트리밍 완료 후 메시지 추가
      setMessages((prev) => [...prev, `AI: ${responseText}`]);
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      setEventLog((prev) => [
        ...prev,
        `오류: ${error instanceof Error ? error.message : String(error)}`,
      ]);
    } finally {
      setIsStreaming(false);
      setInput(""); // 입력 필드 초기화
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dify API 스트리밍 테스트</h1>

      <div className="mb-4 flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <label className="font-semibold">사용자 ID:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="flex-1 p-2 border rounded-lg"
            placeholder="사용자 ID 입력"
          />
        </div>

        <div className="flex gap-2 items-center">
          <label className="font-semibold">대화 ID:</label>
          <input
            type="text"
            value={conversationId}
            onChange={(e) => setConversationId(e.target.value)}
            className="flex-1 p-2 border rounded-lg"
            placeholder="대화 ID 입력 (없으면 새 대화)"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="useDifyDirect"
            checked={useDifyDirect}
            onChange={(e) => setUseDifyDirect(e.target.checked)}
            className="h-5 w-5"
          />
          <label htmlFor="useDifyDirect" className="font-semibold">
            Dify API 직접 호출 (프록시 우회)
          </label>
        </div>
      </div>

      <div className="flex flex-1 gap-4">
        {/* 메시지 및 스트리밍 섹션 */}
        <div className="flex-1 flex flex-col border rounded-lg p-4 overflow-hidden">
          <h2 className="font-semibold mb-2">메시지 및 응답</h2>
          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg ${
                  message.startsWith("사용자") ? "bg-blue-100" : "bg-green-100"
                }`}
              >
                {message}
              </div>
            ))}

            {isStreaming && (
              <div className="p-2 rounded-lg bg-green-100 animate-pulse">
                <span>AI: {streamingText}</span>
                <span className="inline-block w-2 h-4 ml-1 bg-green-500 animate-blink"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="메시지를 입력하세요..."
              className="flex-1 p-2 border rounded-lg"
              disabled={isStreaming}
            />
            <button
              onClick={sendMessage}
              disabled={isStreaming || !input.trim()}
              className={`px-4 py-2 rounded-lg ${
                isStreaming || !input.trim()
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isStreaming ? "처리 중..." : "전송"}
            </button>
          </div>
        </div>

        {/* 이벤트 로그 섹션 */}
        <div className="w-1/2 border rounded-lg p-4 overflow-hidden">
          <h2 className="font-semibold mb-2">이벤트 로그</h2>
          <div className="h-full overflow-y-auto bg-gray-100 p-2 rounded text-sm font-mono">
            {eventLog.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        .animate-blink {
          animation: blink 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
