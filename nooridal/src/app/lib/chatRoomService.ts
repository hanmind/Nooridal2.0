import { supabase } from "./supabase";
import { Database } from "../../../types_db"; // Assuming types_db is at the root
import { v4 as uuidv4 } from "uuid";

// Define types based on your Database definition
type ChatRoomInsert = Database["public"]["Tables"]["chat_rooms"]["Insert"];
type ChatRoomRow = Database["public"]["Tables"]["chat_rooms"]["Row"];
type ConversationRow = Database["public"]["Tables"]["llm_conversations"]["Row"];
type ConversationInsert =
  Database["public"]["Tables"]["llm_conversations"]["Insert"]; // Add insert type

/**
 * Gets the chat room ID for today. If one exists, returns its ID.
 * If not, creates a new chat room for today and returns its ID.
 * Assumes a simple daily chat room logic without user or pregnancy context for now.
 * @returns {Promise<string>} The chat room ID for today.
 * @throws {Error} If there's an error fetching or creating the chat room.
 */
export async function getTodaysChatRoom(): Promise<string> {
  // Get today's date boundaries in UTC
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); // Start of today UTC
  const startOfDay = today.toISOString();

  today.setUTCHours(23, 59, 59, 999); // End of today UTC
  const endOfDay = today.toISOString();

  console.log(`Checking for chat room between ${startOfDay} and ${endOfDay}`);

  // Check if a chat room already exists for today
  const { data: existingRooms, error: fetchError } = await supabase
    .from("chat_rooms")
    .select("id")
    .gte("created_at", startOfDay)
    .lte("created_at", endOfDay)
    .order("created_at", { ascending: false })
    .limit(1);

  if (fetchError) {
    console.error("Error fetching chat rooms:", fetchError);
    throw new Error(`Error fetching chat rooms: ${fetchError.message}`);
  }

  // If a room exists, return its ID
  if (existingRooms && existingRooms.length > 0) {
    console.log(`Found existing room for today: ${existingRooms[0].id}`);
    return existingRooms[0].id;
  }

  // Otherwise, create a new room
  console.log("No existing room found for today. Creating a new one.");
  const newRoomId = uuidv4();
  const newRoomData: ChatRoomInsert = {
    id: newRoomId,
    chat_title: `Chat ${new Date().toLocaleDateString("ko-KR")}`, // Use Korean date format
    created_at: new Date().toISOString(),
    // Add user_id and pregnancy_id if needed based on auth context
    status: "active", // Default status
  };

  const { error: insertError } = await supabase
    .from("chat_rooms")
    .insert(newRoomData);

  if (insertError) {
    console.error("Error creating chat room:", insertError);
    throw new Error(`Error creating chat room: ${insertError.message}`);
  }

  console.log(`Successfully created new chat room: ${newRoomId}`);
  return newRoomId;
}

/**
 * Gets all chat rooms, ordered by creation date descending.
 * @returns {Promise<ChatRoomRow[]>} A list of all chat rooms.
 * @throws {Error} If there's an error fetching chat rooms.
 */
export async function getAllChatRooms(): Promise<ChatRoomRow[]> {
  console.log("Fetching all chat rooms...");
  const { data, error } = await supabase
    .from("chat_rooms")
    .select("*") // Select all columns for the list view
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all chat rooms:", error);
    throw new Error(`Error fetching all chat rooms: ${error.message}`);
  }

  console.log(`Fetched ${data?.length || 0} chat rooms.`);
  return data || [];
}

/**
 * Gets all conversations for a specific chat room, ordered by creation date ascending.
 * @param {string} roomId The ID of the chat room.
 * @returns {Promise<ConversationRow[]>} A list of conversations for the given room.
 * @throws {Error} If there's an error fetching conversations.
 */
export async function getChatRoomConversations(
  roomId: string
): Promise<ConversationRow[]> {
  console.log(`Fetching conversations for room ID: ${roomId}`);
  if (!roomId) {
    console.warn("getChatRoomConversations called with invalid roomId");
    return []; // Return empty array if roomId is invalid
  }

  const { data, error } = await supabase
    .from("llm_conversations")
    .select("*")
    .eq("chat_room_id", roomId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching conversations:", error);
    throw new Error(`Error fetching conversations: ${error.message}`);
  }

  console.log(`Fetched ${data?.length || 0} conversations for room ${roomId}.`);
  return data || [];
}

/**
 * Creates a new conversation record in the database.
 * @param {string} roomId The ID of the chat room.
 * @param {string} query The user's query.
 * @param {string} response The AI's response.
 * @param {string | null | undefined} userId The ID of the user (required).
 * @returns {Promise<ConversationRow>} The newly created conversation object.
 * @throws {Error} If user_id is missing or if there's an error inserting the conversation.
 */
export async function createConversation(
  roomId: string,
  query: string,
  response: string,
  userId: string | null | undefined
): Promise<ConversationRow> {
  console.log(`Creating conversation in room ${roomId} for user ${userId}`);

  if (!userId) {
    console.error("User ID is required to create a conversation.");
    throw new Error("User ID is required to create a conversation");
  }

  const newConversation: ConversationInsert = {
    chat_room_id: roomId,
    query,
    response,
    user_id: userId,
    // created_at will be set by the database by default
  };

  const { data, error } = await supabase
    .from("llm_conversations")
    .insert(newConversation)
    .select()
    .single(); // Return the created row

  if (error) {
    console.error("Error creating conversation:", error);
    throw new Error(`Error creating conversation: ${error.message}`);
  }

  if (!data) {
    console.error("No data returned after creating conversation");
    throw new Error("No data returned after creating conversation");
  }

  console.log(`Successfully created conversation ${data.id}`);
  return data;
}
