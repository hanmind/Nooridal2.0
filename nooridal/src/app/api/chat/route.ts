import { NextRequest } from "next/server";
import { streamingMessage } from "@/app/lib/difyService";

/**
 * Dify API 채팅 엔드포인트
 * 이 API 라우트는 클라이언트의 채팅 메시지를 Dify AI에 전달하고 스트리밍 응답을 반환합니다.
 */
export async function POST(req: NextRequest) {
  try {
    // 요청 본문 파싱
    const requestData = await req.json();

    if (!requestData.query) {
      return new Response(
        JSON.stringify({ error: "query 필드는 필수입니다" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 필수 필드 확인
    const { query, user, conversation_id, inputs, files } = requestData;

    // 디버그: 수신된 요청 데이터 로깅
    console.debug(`채팅 API 요청:`, {
      query: query.substring(0, 30) + (query.length > 30 ? "..." : ""),
      user_id: user,
      conversation_id: conversation_id || "(새 대화)",
      inputs_keys: inputs ? Object.keys(inputs) : [],
      files_count: files ? files.length : 0,
    });

    // 메시지 전송 (스트리밍 모드)
    const stream = await streamingMessage({
      query,
      user: user || "anonymous-user",
      conversation_id,
      inputs,
      files,
    });

    // 스트림을 응답으로 반환 (SSE 형식)
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    // 오류 처리
    console.error(`채팅 API 오류:`, error);

    // 오류 응답 생성
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * SSE 형식을 위한 OPTIONS 핸들러 (CORS 대응)
 */
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
