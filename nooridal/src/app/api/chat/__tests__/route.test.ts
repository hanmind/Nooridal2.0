import { POST } from "../route"; // Adjust the import path based on your file structure
import { NextRequest } from "next/server";
import { ReadableStream } from "stream/web"; // Import ReadableStream

// Mock dependencies using relative paths as a workaround
jest.mock("../../../lib/chatRoomService", () => ({
  getTodaysChatRoom: jest.fn(),
  createConversation: jest.fn(),
}));
jest.mock("../../../lib/difyService", () => ({
  sendChatRequest: jest.fn(),
}));

describe("POST /api/chat", () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-require mocks using relative paths inside beforeEach or tests if needed
  });

  it("should return a streaming response on valid request", async () => {
    // Arrange
    const mockChatRoomId = "mock-room-id";
    const mockConversationId = "mock-conv-id";
    const mockQuery = "Hello, world!";

    // Mock service responses using relative paths
    const {
      getTodaysChatRoom,
      createConversation,
    } = require("../../../lib/chatRoomService");
    getTodaysChatRoom.mockResolvedValue({
      id: mockChatRoomId,
      created_at: new Date().toISOString(),
      user_id: "test-user",
    });
    createConversation.mockResolvedValue({
      id: mockConversationId,
      chat_room_id: mockChatRoomId,
      query: mockQuery,
      response: "",
      created_at: new Date().toISOString(),
      user_id: "test-user",
    });

    const { sendChatRequest } = require("../../../lib/difyService");
    // Create a mock ReadableStream for the Dify response
    const mockStream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(
          encoder.encode('data: {"event": "message", "answer": "Hello!"}\n\n')
        );
        controller.enqueue(
          encoder.encode(
            'data: {"event": "message", "answer": " How are you?"}\n\n'
          )
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });
    sendChatRequest.mockResolvedValue(mockStream);

    // Create a mock NextRequest
    const requestBody = { query: mockQuery, conversation_id: mockChatRoomId }; // Use mockChatRoomId or let it be determined
    const request = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Act
    const response = await POST(request);

    // Assert
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/event-stream");

    // Assert streaming content (basic check)
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = "";
    let chunk;
    while (reader && !(chunk = await reader.read()).done) {
      result += decoder.decode(chunk.value);
    }

    expect(result).toContain('data: {"event": "message", "answer": "Hello!"}');
    expect(result).toContain(
      'data: {"event": "message", "answer": " How are you?"}'
    );
    expect(result).toContain("data: [DONE]");

    // Verify service calls
    // expect(getTodaysChatRoom).toHaveBeenCalledTimes(1); // If conversation_id is not provided
    expect(createConversation).toHaveBeenCalledWith(
      expect.any(String),
      mockQuery,
      expect.any(String)
    ); // Adjust based on actual implementation
    expect(sendChatRequest).toHaveBeenCalledWith(mockQuery, expect.any(String)); // Adjust based on actual implementation
  });

  it("should return 400 if query is missing", async () => {
    // Arrange
    const requestBody = { conversation_id: "some-id" }; // Missing query
    const request = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Act
    const response = await POST(request);
    const responseBody = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(responseBody).toEqual({ error: "Query is required" });
  });

  // Add more tests for other scenarios:
  // - Error from getTodaysChatRoom
  // - Error from createConversation
  // - Error from sendChatRequest
  // - Handling request without conversation_id (if applicable)
});
