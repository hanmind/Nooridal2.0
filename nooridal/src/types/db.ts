import { Json } from "../../types_db";

export type PregnancyStatus = "active" | "inactive" | "done";

export interface ChatRoom {
  id: string;
  user_id: string | null;
  pregnancy_id?: string | null;
  chat_title?: string | null;
  topic?: string | null;
  message_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  status: PregnancyStatus;
  dify_conversation_id?: string | null;

  // 클라이언트 측 호환성을 위한 임시 필드 (데이터베이스에는 없음)
  created_date?: string;
}

export interface LLMConversation {
  id: string;
  chat_room_id: string | null;
  user_id: string | null;
  query: string;
  response: string;
  created_at?: string | null;
  updated_at?: string | null;
  source_documents?: Json | null;
  user_info?: Json | null;
  using_rag?: boolean | null;
}
