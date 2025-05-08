import { fetchWithTimeout } from "../utils/fetch";

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

// Dify API 설정
const DIFY_API_BASE_URL =
  process.env.VERCEL_PUBLIC_DIFY_API_BASE_URL || "https://api.dify.ai/v1";
const DIFY_API_KEY =
  process.env.VERCEL_PUBLIC_DIFY_API_KEY || "app-AHbg5SN6JV2jqf306jV00qBc";

// Dify API 요청 인터페이스
interface DifyRequestParams {
  inputs?: Record<string, unknown>;
  query: string;
  user: string;
  conversation_id?: string;
  response_mode?: "streaming" | "blocking";
  files?: Array<{
    type: string;
    transfer_method: string;
    url?: string;
    content?: string;
  }>;
  task_id?: string;
  workflow_run_id?: string;
}

/**
 * Dify API에서 새 대화 ID를 초기화하고 가져옵니다. (스트리밍 방식)
 *
 * @param {string} userId - 사용자 ID
 * @returns {Promise<string>} - Dify API에서 생성된 대화 ID
 */
export async function initializeConversation(userId: string): Promise<string> {
  try {
    console.log(
      `Initializing new conversation (streaming) for user: ${userId}`
    );

    const response = await fetch(DIFY_API_BASE_URL + "/chat-messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DIFY_API_KEY}`,
      },
      body: JSON.stringify({
        inputs: {},
        query: "_initialize_conversation_", // 특수 쿼리
        user: userId,
        response_mode: "streaming", // 스트리밍 모드로 요청
        conversation_id: "", // Dify에서 새 대화 시작을 위해 빈 문자열 사용 가능성
        files: [],
      }),
    });

    if (!response.ok) {
      // HTTP 오류 응답 본문 읽기 시도
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch (e) {
        // 응답 본문 읽기 실패 시 무시
      }
      throw new Error(
        `대화 초기화 실패 (HTTP ${response.status} ${response.statusText}): ${errorBody}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("스트림 리더를 가져올 수 없습니다.");
    }

    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let conversationId: string | null = null;
    let streamCancelled = false;

    // 스트림에서 conversation_id를 포함하는 첫 번째 유효한 JSON을 찾을 때까지 읽기
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        if (!streamCancelled) {
          console.log(
            "Stream ended before conversation_id was found or cancel completed."
          );
        }
        break; // 스트림 종료
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n"); // SSE 이벤트는 보통 \n\n으로 구분됨

      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i];
        if (line.startsWith("data: ")) {
          const jsonData = line.substring(5).trim();
          try {
            const parsedEvent = JSON.parse(jsonData);
            if (parsedEvent.conversation_id) {
              conversationId = parsedEvent.conversation_id;
              console.log(`Conversation ID from stream: ${conversationId}`);
              if (!reader.closed) {
                await reader.cancel();
                streamCancelled = true;
                console.log("Stream cancelled after finding conversation_id.");
              }
              break; // 내부 루프 종료
            }
          } catch (e) {
            console.warn("스트림 데이터 파싱 중 오류 (무시됨):", jsonData, e);
          }
        }
      }
      if (conversationId) break; // 외부 루프 종료

      buffer = lines[lines.length - 1]; // 마지막 불완전한 부분은 다음 처리로 넘김
    }

    // reader.releaseLock(); // 리더 사용 후 락 해제 -> cancel 사용 시 불필요할 수 있음, 확인 필요

    if (!conversationId) {
      throw new Error("스트리밍 응답에서 conversation_id를 찾을 수 없습니다.");
    }

    console.log(`New conversation initialized with ID: ${conversationId}`);
    return conversationId;
  } catch (error) {
    console.error("스트리밍 대화 초기화 중 오류:", error);
    throw new Error(
      `Dify 스트리밍 대화 초기화 실패: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Dify API에 채팅 요청을 보냅니다.
 * @param {DifyRequestParams} params - 채팅 요청 파라미터
 * @returns {Promise<Response>} - Dify API 응답
 */
export async function sendChatRequest(
  params: DifyRequestParams
): Promise<Response> {
  const {
    inputs = {},
    query,
    user,
    conversation_id = "",
    response_mode = "streaming",
    files = [],
  } = params;

  console.log(`Sending request to Dify API: ${query.substring(0, 30)}...`);

  try {
    const response = await fetch(DIFY_API_BASE_URL + "/chat-messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DIFY_API_KEY}`,
      },
      body: JSON.stringify({
        inputs,
        query,
        user,
        conversation_id,
        response_mode,
        files,
      }),
    });

    if (!response.ok) {
      // 에러 응답 처리
      let errorMessage = `Dify API 오류: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // JSON 파싱 실패 시 텍스트로 시도
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch {} // 무시
      }

      throw new Error(errorMessage);
    }

    return response;
  } catch (error) {
    console.error("Dify API 요청 실패:", error);
    throw error;
  }
}

export interface MessageOptions {
  query: string;
  user: string; // 사용자 ID
  conversation_id?: string; // 대화 ID (생략시 새 대화 시작)
  inputs?: Record<string, unknown>; // any 대신 unknown 사용
  files?: unknown[]; // any 대신 unknown 사용
}

// 기본값 설정
const DEFAULT_USER_ID = "anonymous-user";
const FETCH_TIMEOUT_MS = 60000; // 60초

// 스트리밍 응답 처리 (SSE 방식)
async function handleResponse(
  response: Response,
  controller: ReadableStreamController<Uint8Array> // controller를 직접 사용
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    console.error("서버: Dify 응답에서 스트림 리더를 얻을 수 없습니다.");
    controller.close();
    return;
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder("utf-8");
  let buffer = ""; // 데이터 버퍼

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        console.log("서버: Dify API 스트림 완료");

        // 버퍼에 남은 데이터 처리
        if (buffer.trim()) {
          console.log("서버: 남은 버퍼 데이터 처리", buffer.length);
          processBuffer(buffer, encoder, controller);
        }

        // 필요한 경우 스트림 종료 이벤트 전송
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));

        controller.close();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // 버퍼를 줄바꿈 기준으로 분리하여 완전한 이벤트만 처리
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // 마지막 줄은 불완전할 수 있으므로 버퍼에 유지

      // 완성된 라인들 처리
      for (const line of lines) {
        processLine(line, encoder, controller);
      }
    }
  } catch (error) {
    console.error("서버: Dify API 스트림 처리 오류:", error);

    // 오류 이벤트 전송
    const errorEvent = {
      event: "error",
      message: error instanceof Error ? error.message : "알 수 없는 오류",
    };

    controller.enqueue(
      encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`)
    );

    controller.close();
  }
}

// 개별 라인 처리 로직을 분리하여 코드 가독성 향상
function processLine(
  line: string,
  encoder: TextEncoder,
  controller: ReadableStreamController<Uint8Array> // controller를 직접 사용
): void {
  if (!line.trim()) return; // 빈 라인 무시

  if (line.startsWith("data: ")) {
    const data = line.substring(6);

    try {
      // 이벤트 데이터 파싱 및 전달
      const parsedData = JSON.parse(data);
      console.debug(`서버: 이벤트 수신: ${parsedData.event || "unknown"}`);

      // SSE 형식으로 클라이언트에 전달
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(parsedData)}\n\n`)
      );

      // 메시지 이벤트 처리
      if (parsedData.event === "message" && parsedData.answer) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // accumulatedResponse += parsedData.answer; // 값 할당만 하고 사용 안 함 (linter 경고)
        // console.debug(
        //   `서버: 메시지 응답 누적 (현재 길이: ${accumulatedResponse.length})`
        // );
      }
      // 메시지 종료 이벤트 처리
      // else if (parsedData.event === "message_end") {
      //   console.debug(
      //     `서버: 메시지 종료 이벤트 처리 (최종 응답 길이: ${accumulatedResponse.length})`
      //   );
      // }
      // 오류 이벤트 처리
      else if (parsedData.event === "error") {
        console.error(
          `서버: 오류 이벤트 수신: ${
            parsedData.message || "자세한 오류 메시지 없음"
          }`
        );
      }
    } catch (e) {
      console.error("서버: JSON 파싱 오류:", e, "원본 데이터:", data);

      // 파싱 오류가 있더라도 원본 데이터를 클라이언트에 전달 (클라이언트에서 처리)
      controller.enqueue(encoder.encode(`data: ${data}\n\n`));
    }
  } else {
    console.warn("서버: 예상치 못한 형식의 라인:", line);
  }
}

// 버퍼에 남은 데이터 처리
function processBuffer(
  buffer: string,
  encoder: TextEncoder,
  controller: ReadableStreamController<Uint8Array> // controller를 직접 사용
): void {
  if (buffer.startsWith("data: ")) {
    const data = buffer.substring(6);

    try {
      // 마지막 버퍼 데이터 처리
      const parsedData = JSON.parse(data);
      console.debug(
        `서버: 버퍼 마지막 이벤트: ${parsedData.event || "unknown"}`
      );

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(parsedData)}\n\n`)
      );
    } catch (e) {
      console.error("서버: 마지막 버퍼 데이터 파싱 오류:", e);

      // 파싱 오류가 있더라도 원본 데이터를 클라이언트에 전달
      controller.enqueue(encoder.encode(`data: ${data}\n\n`));
    }
  }
}

// SSE 스트리밍 메시지 요청
export async function streamingMessage(
  options: MessageOptions
): Promise<ReadableStream> {
  const stream = new ReadableStream({
    start(controller: ReadableStreamController<Uint8Array>) {
      // controller 사용
      const encoder = new TextEncoder();
      // writer = controller; // 전역 변수 할당 제거

      // 비동기 로직을 즉시 실행 함수로 감싸서 start 함수가 Promise를 반환하지 않도록 함
      (async () => {
        try {
          const response = await fetchWithTimeout(
            `${DIFY_API_BASE_URL}/chat-messages`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${DIFY_API_KEY}`,
              },
              body: JSON.stringify({
                inputs: options.inputs || {},
                query: options.query,
                user: options.user || DEFAULT_USER_ID,
                response_mode: "streaming",
                conversation_id: options.conversation_id || "", // 빈 문자열이면 새 대화 시작
                files: options.files || [],
              }),
            },
            FETCH_TIMEOUT_MS
          );

          if (!response.ok) {
            let errorText = "";
            try {
              const errorData = await response.json();
              errorText =
                errorData.error || errorData.message || response.statusText;
            } catch {
              errorText = `HTTP 오류: ${response.status} ${response.statusText}`;
            }

            console.error(`Dify API 오류: ${errorText}`);

            // 클라이언트에 오류 전달
            const errorEvent = {
              event: "error",
              message: errorText,
            };

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`)
            ); // controller.enqueue 사용

            controller.close();
            return;
          }

          // handleResponse 함수에 controller 전달
          await handleResponse(response, controller);
        } catch (error) {
          console.error(`Dify API 스트리밍 요청 오류:`, error);

          // 오류 이벤트 생성
          const errorEvent = {
            event: "error",
            message:
              error instanceof Error
                ? error.message
                : "알 수 없는 오류가 발생했습니다",
          };

          // 클라이언트에 오류 전달
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`)
          ); // controller.enqueue 사용

          controller.close();
        }
      })(); // 즉시 실행 함수 호출
    },
  });

  return stream;
}
