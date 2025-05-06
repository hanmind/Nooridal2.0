import { supabase, createServerSupabaseClient } from "./supabase";
import { initializeConversation } from "./difyService";
import { ChatRoom, LLMConversation, PregnancyStatus } from "@/types/db";
import { v4 as uuidv4 } from "uuid";

/**
 * Get today's chat room for a specific user, creating one if it doesn't exist
 */
export async function getTodaysChatRoom(userId: string): Promise<ChatRoom> {
  const supabaseClient = createServerSupabaseClient();

  // 유효한 UUID 형태의 사용자 ID 확인
  if (!userId || typeof userId !== "string" || userId.length < 10) {
    throw new Error("유효하지 않은 사용자 ID입니다.");
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];
  const todayStart = new Date(today).toISOString();
  const todayEnd = new Date(
    new Date(today).setDate(new Date(today).getDate() + 1)
  ).toISOString();

  try {
    // Check if a room already exists for today and this user
    const { data: existingRooms, error: fetchError } = await supabaseClient
      .from("chat_rooms")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", todayStart)
      .lt("created_at", todayEnd)
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Error fetching today's chat room:", fetchError);
      throw new Error("채팅방을 불러오는데 실패했습니다.");
    }

    // If a room exists for today, return it
    if (existingRooms && existingRooms.length > 0) {
      // 클라이언트 측 호환성을 위해 created_date 필드 추가
      const roomWithDate = {
        ...existingRooms[0],
        created_date: today,
      } as ChatRoom;

      return roomWithDate;
    }

    // Otherwise, create a new room (초기에는 dify_conversation_id를 null로 설정)
    const { data, error: insertError } = await supabaseClient
      .from("chat_rooms")
      .insert([
        {
          id: uuidv4(),
          user_id: userId,
          chat_title: `Chat ${today}`,
          dify_conversation_id: null, // 초기에는 null로 설정
          status: "inactive" as PregnancyStatus,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (insertError) {
      console.error("Error creating today's chat room:", insertError);

      // 좀 더 구체적인 오류 메시지 제공
      if (insertError.message.includes("Foreign key violation")) {
        throw new Error(
          "유효하지 않은 사용자 ID입니다. 데이터베이스 제약조건 위반."
        );
      }

      throw new Error("새 채팅방을 생성하는데 실패했습니다.");
    }

    if (!data || data.length === 0) {
      throw new Error("채팅방 생성 후 데이터를 가져오는데 실패했습니다.");
    }

    // 클라이언트 측 호환성을 위해 created_date 필드 추가
    const roomWithDate = {
      ...data[0],
      created_date: today,
    } as ChatRoom;

    return roomWithDate;
  } catch (error) {
    console.error("Error during chat room creation:", error);

    // 오류 전파
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("채팅방 생성에 실패했습니다.");
  }
}

/**
 * Get all chat rooms for a specific user
 */
export async function getAllChatRooms(userId: string): Promise<ChatRoom[]> {
  // 유효한 UUID 형태의 사용자 ID 확인
  if (!userId || typeof userId !== "string" || userId.length < 10) {
    throw new Error("유효하지 않은 사용자 ID입니다.");
  }

  try {
    // 클라이언트 측에서는 supabase 인스턴스 사용
    const { data: rooms, error } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("user_id", userId) // 사용자 ID로 필터링
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching chat rooms:", error);
      throw new Error("채팅방 목록을 불러오는데 실패했습니다.");
    }

    if (!rooms) {
      return [];
    }

    // 클라이언트 측 호환성을 위해 created_date 필드 추가
    return rooms.map((room) => ({
      ...room,
      created_date: room.created_at
        ? new Date(room.created_at).toISOString().split("T")[0]
        : undefined,
    })) as ChatRoom[];
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("채팅방 목록을 불러오는데 실패했습니다.");
  }
}

/**
 * Get all conversations for a specific chat room
 */
export async function getChatRoomConversations(
  roomId: string
): Promise<LLMConversation[]> {
  // 클라이언트 측에서는 supabase 인스턴스 사용
  const { data: conversations, error } = await supabase
    .from("llm_conversations")
    .select("*")
    .eq("chat_room_id", roomId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching conversations:", error);
    throw new Error("대화 내역을 불러오는데 실패했습니다.");
  }

  return conversations as LLMConversation[];
}

/**
 * Dify API에서 새 conversation_id를 가져와 채팅방 정보 업데이트하고 로컬 스토리지 초기화
 */
export async function updateRoomWithDifyConversationId(
  roomId: string,
  userId: string
): Promise<string> {
  try {
    // Dify API에서 새 대화 ID 초기화
    const conversationId = await initializeConversation(userId);
    console.log(`Retrieved conversation_id from Dify: ${conversationId}`);

    // 채팅방 정보 업데이트
    // createServerSupabaseClient는 서버와 클라이언트 양쪽에서 호출될 수 있으므로,
    // 로컬 스토리지 접근은 클라이언트 사이드인지 확인 후 진행합니다.
    const supabaseClient = supabase; // 클라이언트에서 호출된다고 가정하고 supabase 직접 사용 또는 적절한 클라이언트 사용
    // 만약 이 함수가 서버에서만 실행된다면 로컬 스토리지 로직은 여기서 제거하고 호출부로 옮겨야 합니다.

    const { data, error: updateError } = await supabaseClient
      .from("chat_rooms")
      .update({ dify_conversation_id: conversationId })
      .eq("id", roomId)
      .select();

    if (updateError || !data || data.length === 0) {
      console.error(
        "Error updating chat room with conversation ID:",
        updateError
      );
      throw new Error("채팅방 정보 업데이트에 실패했습니다.");
    }

    // 로컬 스토리지 초기화 (브라우저 환경에서만 실행)
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const localStorageKey = `chatMessages_${conversationId}`;
        // 기존 메시지가 있을 수도 있으므로, 덮어쓰기 전에 확인하거나
        // 새로운 채팅방이므로 항상 빈 배열로 시작하는 것이 맞는지 확인 필요.
        // 여기서는 새로운 채팅방이므로 빈 배열로 초기화한다고 가정합니다.
        localStorage.setItem(localStorageKey, JSON.stringify([]));
        console.log(
          `Local storage initialized for new chat room: ${localStorageKey}`
        );
      } catch (localStorageError) {
        console.error(
          "Error initializing local storage for new chat room:",
          localStorageError
        );
        // 로컬 스토리지 오류가 전체 기능을 막지 않도록 여기서 오류를 throw하지 않을 수 있습니다.
        // 필요에 따라 오류 처리 정책을 결정하세요.
      }
    }

    return conversationId;
  } catch (error) {
    console.error("Error during conversation ID update:", error);
    if (error instanceof Error) {
      throw new Error(`Dify 대화 ID 업데이트 실패: ${error.message}`);
    }
    throw new Error("Dify 대화 ID 업데이트에 실패했습니다.");
  }
}

/**
 * Save a conversation to the database
 * @param conversationId Dify API의 대화 ID (chat_rooms 테이블에서 매칭을 위해 필요)
 * @param userId 사용자 ID
 * @param userQuery 사용자 메시지
 * @param aiResponse AI 응답
 */
export async function saveConversation(
  conversationId: string,
  userId: string,
  userQuery: string,
  aiResponse: string
): Promise<void> {
  // 서버 측에서는 createServerSupabaseClient 사용
  const supabaseClient = createServerSupabaseClient();

  // dify_conversation_id로 채팅방 ID 조회
  const { data: chatRoom, error: roomError } = await supabaseClient
    .from("chat_rooms")
    .select("id")
    .eq("dify_conversation_id", conversationId)
    .single();

  if (roomError) {
    console.error(
      "Error finding chat room by dify_conversation_id:",
      roomError
    );
    throw new Error("대화 ID에 해당하는 채팅방을 찾을 수 없습니다.");
  }

  // 대화 내용 저장 - 필드명을 스키마에 맞게 수정
  const { error } = await supabaseClient.from("llm_conversations").insert({
    id: uuidv4(),
    chat_room_id: chatRoom.id,
    user_id: userId,
    query: userQuery,
    response: aiResponse,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error saving conversation:", error);
    throw new Error("대화 내용을 저장하는데 실패했습니다.");
  }

  console.log(`Conversation saved successfully for room ${chatRoom.id}`);
}
