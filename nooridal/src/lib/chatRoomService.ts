import { supabase } from "../app/lib/supabase";
import { LLMConversation } from "@/types/db";

/**
 * llm_conversation 테이블에 새로운 대화 기록을 추가합니다.
 * @param roomId 현재 채팅방 ID
 * @param userId 사용자 ID
 * @param query 사용자 질문
 * @param response AI 답변
 * @param difyConversationId Dify 대화 ID (있을 경우)
 * @returns 삽입된 대화 데이터 또는 null (오류 시)
 */
export const addConversation = async (
  roomId: string,
  userId: string,
  query: string,
  response: string,
  difyConversationId: string | null
): Promise<LLMConversation | null> => {
  console.log("[addConversation] Attempting to add:", {
    roomId,
    userId,
    queryLength: query.length,
    responseLength: response.length,
    difyConversationId,
  });
  if (!roomId || !userId || !query || !response) {
    console.error("[addConversation] Invalid parameters received.", {
      roomId,
      userId,
      query,
      response,
    });
    return null;
  }
  try {
    const { data, error } = await supabase
      .from("llm_conversations")
      .insert([
        {
          chat_room_id: roomId,
          user_id: userId,
          query: query,
          response: response,
          dify_conversation_id: difyConversationId,
          // created_at은 데이터베이스에서 자동으로 생성됩니다.
        },
      ])
      .select() // 삽입된 데이터를 반환받습니다.
      .single(); // 단일 행만 반환합니다.

    if (error) {
      console.error("[addConversation] Error from Supabase insert:", error);
      throw error; // 에러를 다시 던져 상위에서 처리하도록 합니다.
    }

    console.log("[addConversation] Successfully added to Supabase:", data);
    return data;
  } catch (error) {
    console.error("[addConversation] Failed inside catch block:", error);
    return null; // 오류 발생 시 null 반환
  }
};
