// pages/api/chat.js (Pages Router 기준)
// App Router 사용 시 app/api/chat/route.ts 로 변경하고 Request/Response 객체 사용

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, userId, conversationId } = await request.json();

    if (!message || !userId) {
      return NextResponse.json(
        { message: "메시지 또는 사용자 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 환경 변수 디버깅
    console.log("모든 환경 변수:", Object.keys(process.env));
    console.log("DIFY_API_KEY 존재 여부:", !!process.env.DIFY_API_KEY);

    const DIFY_API_KEY = process.env.DIFY_API_KEY;
    const DIFY_CHAT_API_URL =
      process.env.DIFY_API_URL || "https://api.dify.ai/v1/chat-messages";

    if (!DIFY_API_KEY) {
      console.error("Dify API 키가 환경 변수에 설정되지 않았습니다.");
      return NextResponse.json(
        { message: "서버 설정 오류입니다. DIFY_API_KEY를 확인하세요." },
        { status: 500 }
      );
    }

    const payload = {
      inputs: {},
      query: message,
      user: userId,
      response_mode: "streaming",
      conversation_id: conversationId || undefined,
    };

    console.log("Sending to Dify:", JSON.stringify(payload));

    const difyResponse = await fetch(DIFY_CHAT_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      // @ts-expect-error Next.js fetch와 웹 fetch API 차이로 타입 에러 발생 가능
      duplex: "half",
    });

    console.log("Dify Response Status:", difyResponse.status);

    if (!difyResponse.ok) {
      const errorBody = await difyResponse.text();
      console.error("Dify API 오류:", difyResponse.status, errorBody);
      return NextResponse.json(
        { message: `Dify API 오류 (${difyResponse.status})` },
        { status: difyResponse.status }
      );
    }

    // 스트리밍 응답 생성
    const stream = new ReadableStream({
      async start(controller) {
        if (!difyResponse.body) {
          controller.close();
          return;
        }

        const reader = difyResponse.body.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            controller.enqueue(value);
          }
        } catch (error) {
          console.error("Stream reading error:", error);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("API Route 내부 오류:", error);
    return NextResponse.json(
      { message: "내부 서버 오류입니다." },
      { status: 500 }
    );
  }
}
