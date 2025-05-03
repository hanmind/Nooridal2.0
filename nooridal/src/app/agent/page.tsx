"use client";

import { useState, useEffect, useRef, useCallback } from "react";

function ChatComponent() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [userId] = useState("user-" + Date.now()); // 데모용 고유 ID
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef(null); // 자동 스크롤용

  // 메시지 목록 변경 시 맨 아래로 스크롤
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 스트림 처리 중단 컨트롤러
  const abortControllerRef = useRef(null);

  // 메시지 전송 함수
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      const userMessage = { role: "user", content: input };
      const currentInput = input;
      setInput("");
      setIsLoading(true);
      // 이전 어시스턴트 메시지 중 로딩 상태 제거 (필요시)
      setMessages((prev) => [
        ...prev.filter((m) => m.content !== "..."),
        userMessage,
        { role: "assistant", content: "..." },
      ]); // 사용자 메시지 + 로딩 표시

      // 이전 요청 중단 (새 요청 시작 시)
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController(); // 새 컨트롤러 생성

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: currentInput,
            userId: userId,
            conversationId: conversationId,
          }),
          signal: abortControllerRef.current.signal, // 중단 신호 연결
        });

        if (!response.ok) {
          // 백엔드 API Route 에서 보낸 오류 메시지 처리
          const errorData = await response
            .json()
            .catch(() => ({ message: `HTTP 오류: ${response.status}` }));
          throw new Error(errorData.message || `API 오류: ${response.status}`);
        }

        // 스트림 처리 시작
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let accumulatedResponse = "";
        let currentConvId = conversationId; // 현재 대화 ID 유지

        // '...' 로딩 메시지를 실제 응답으로 교체 시작
        setMessages((prev) => prev.slice(0, -1)); // 마지막 '...' 제거
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]); // 빈 메시지 추가

        while (true) {
          try {
            const { value, done } = await reader.read();
            if (done) {
              console.log("Stream finished.");
              if (currentConvId) setConversationId(currentConvId); // 최종 대화 ID 저장
              break; // 루프 종료
            }

            const chunk = decoder.decode(value, { stream: true });
            // console.log('Received chunk:', chunk); // 디버깅용 청크 로깅

            // SSE 데이터 파싱 (간단 버전: 'data: ' 라인만 처리)
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const jsonData = JSON.parse(line.substring(6));
                  // console.log('Parsed data:', jsonData); // 디버깅용 파싱 데이터 로깅

                  // Dify 이벤트 구조에 따라 'answer' 필드 추출
                  if (
                    jsonData.event === "agent_message" ||
                    jsonData.event === "message"
                  ) {
                    accumulatedResponse += jsonData.answer;
                    // UI 업데이트 (마지막 메시지 내용 갱신)
                    setMessages((prev) => {
                      const lastMsgIndex = prev.length - 1;
                      if (
                        lastMsgIndex >= 0 &&
                        prev[lastMsgIndex].role === "assistant"
                      ) {
                        const updatedMessages = [...prev];
                        updatedMessages[lastMsgIndex] = {
                          ...updatedMessages[lastMsgIndex],
                          content: accumulatedResponse,
                        };
                        return updatedMessages;
                      }
                      return prev;
                    });
                  }

                  // 대화 ID 추출 (보통 message_end 이벤트 등에서 옴)
                  if (jsonData.conversation_id) {
                    currentConvId = jsonData.conversation_id;
                    // console.log('Conversation ID received:', currentConvId); // 디버깅
                  }

                  // 스트림 종료 이벤트 확인 (선택적)
                  if (jsonData.event === "message_end") {
                    console.log("Message end event received.");
                    // 필요한 경우 여기서 최종 대화 ID 저장 가능
                    // if (currentConvId) setConversationId(currentConvId);
                  }
                  // 다른 이벤트 처리 로직 추가 가능 (예: workflow_started, node_finished 등)
                } catch (parseError) {
                  // console.warn('Could not parse SSE data line:', line, parseError);
                }
              }
            }
          } catch (readError) {
            if (readError.name === "AbortError") {
              console.log("Stream reading aborted.");
            } else {
              console.error("Error reading stream:", readError);
            }
            break; // 오류 발생 시 루프 중단
          }
        } // while loop end
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Fetch aborted.");
          // 로딩 메시지 제거 또는 '취소됨' 상태 표시
          setMessages((prev) => prev.filter((m) => m.content !== "..."));
        } else {
          console.error("메시지 전송/처리 실패:", error);
          // 에러 메시지 표시
          setMessages((prev) => prev.slice(0, -1)); // '...' 메시지 제거
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `오류: ${error.message}` },
          ]);
        }
      } finally {
        setIsLoading(false); // 로딩 상태 해제
        abortControllerRef.current = null; // 컨트롤러 초기화
      }
    },
    [input, isLoading, userId, conversationId]
  ); // useCallback 의존성 배열

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "500px",
        border: "1px solid #ccc",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          flexGrow: 1,
          overflowY: "auto",
          padding: "10px",
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: "12px",
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <span
              style={{
                backgroundColor: msg.role === "user" ? "#007bff" : "#e9ecef",
                color: msg.role === "user" ? "white" : "black",
                padding: "8px 12px",
                borderRadius: "15px",
                maxWidth: "75%",
                lineHeight: "1.4",
                whiteSpace: "pre-wrap", // 줄바꿈 표시
                wordBreak: "break-word", // 긴 단어 줄바꿈
              }}
            >
              {msg.content === "..." ? (
                <span style={{ fontStyle: "italic" }}>응답 생성 중...</span>
              ) : (
                msg.content
              )}
            </span>
          </div>
        ))}
        <div ref={messageEndRef} /> {/* 스크롤 타겟 */}
      </div>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          padding: "10px",
          borderTop: "1px solid #ccc",
          backgroundColor: "white",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flexGrow: 1,
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            marginRight: "5px",
          }}
          placeholder={
            isLoading ? "응답을 기다리는 중..." : "메시지를 입력하세요..."
          }
          disabled={isLoading}
        />
        <button
          type="submit"
          style={{
            padding: "10px 15px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
          disabled={isLoading}
        >
          {isLoading ? "전송 중..." : "전송"}
        </button>
      </form>
    </div>
  );
}

export default ChatComponent;
