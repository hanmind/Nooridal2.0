import { Json, Tables, Enums } from "../types_db";

export type PregnancyStatus = Enums<"pregnancy_status">;

export type ChatRoom = Tables<"chat_rooms"> & {
  created_date?: string;
};

export type LLMConversation = Tables<"llm_conversations">;
