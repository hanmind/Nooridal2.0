import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import ChatContainer from "../ChatContainer"; // Adjust path as necessary
import * as chatRoomService from "../../lib/chatRoomService"; // Adjust path
import * as difyService from "../../lib/difyService"; // Adjust path
import { ChatRoom, LLMConversation } from "@/types/db"; // Updated alias path
import { Message } from "@/types/chat"; // Updated alias path
import userEvent from "@testing-library/user-event";

// --- Mock Child Components ---
// Mocking with simple divs or spans to focus on ChatContainer logic
jest.mock(
  "../ChatInput",
  () =>
    ({ initialPrompt = "", onSubmit, disabled }: any) =>
      (
        <form
          data-testid="mock-chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit("test message");
          }}
        >
          <input
            placeholder="Mock Input"
            defaultValue={initialPrompt}
            disabled={disabled}
          />
          <button type="submit">Send</button>
        </form>
      )
);

jest.mock(
  "../ChatSidebar",
  () =>
    ({ chatRooms, onSelectChatRoom, currentRoomId }: any) =>
      (
        <div data-testid="mock-chat-sidebar">
          <button onClick={() => onSelectChatRoom("room-1")}>Room 1</button>
          <button onClick={() => onSelectChatRoom("room-2")}>Room 2</button>
          <span>Current: {currentRoomId}</span>
        </div>
      )
);

jest.mock("../UserMessage", () => ({ children }: any) => (
  <div data-testid="mock-user-message">{children}</div>
));
jest.mock("../AIMessage", () => ({ children, isStreaming }: any) => (
  <div data-testid="mock-ai-message">
    {children}
    {isStreaming && <span>(Streaming...)</span>}
  </div>
));
jest.mock("../ErrorMessage", () => ({ children }: any) => (
  <div data-testid="mock-error-message">{children}</div>
));

// --- Mock Services ---
jest.mock("../../lib/chatRoomService");
jest.mock("../../lib/difyService");

// --- Type Aliases (Example - Define based on actual types) ---
type ChatRoom = chatRoomService.ChatRoom;
type Conversation = chatRoomService.Conversation;

// --- Mocks ---
// Mock chatRoomService functions
jest.mock("../../lib/chatRoomService", () => ({
  getTodaysChatRoom: jest.fn(),
  getAllChatRooms: jest.fn(),
  getChatRoomConversations: jest.fn(),
  saveConversation: jest.fn(), // Also mock saveConversation if it's used directly or indirectly
}));

// Mock difyService (specifically handleStreamingResponse is complex, mock simply for now)
// Mock fetch within sendChatRequest tests if needed, or mock sendChatRequest itself
// For simplicity, we'll mock the main interaction points for ChatContainer
global.fetch = jest.fn(); // Mock global fetch used by the API route called by container

const mockedChatRoomService = chatRoomService as jest.Mocked<
  typeof chatRoomService
>;
const mockedFetch = global.fetch as jest.Mock;

// Mock data
const mockRooms: ChatRoom[] = [
  { id: 1, created_at: "2023-10-27T10:00:00Z", user_id: "user1" },
  { id: 2, created_at: "2023-10-26T09:00:00Z", user_id: "user1" },
];
const mockConversations: LLMConversation[] = [
  {
    id: 10,
    room_id: 1,
    request_data: JSON.stringify({ query: "Hello" }),
    response_data: JSON.stringify({ answer: "Hi there!" }),
    created_at: "2023-10-27T10:05:00Z",
    user_id: "user1",
  },
  {
    id: 11,
    room_id: 1,
    request_data: JSON.stringify({ query: "How are you?" }),
    response_data: JSON.stringify({ answer: "I am well." }),
    created_at: "2023-10-27T10:10:00Z",
    user_id: "user1",
  },
];

describe("ChatContainer Integration Tests", () => {
  const mockUserId = "test-user-id";
  let mockGetTodaysChatRoom: jest.SpyInstance;
  let mockGetChatRoomConversations: jest.SpyInstance;
  let mockCreateConversation: jest.SpyInstance;
  let mockSendChatRequest: jest.SpyInstance;

  // Sample Data
  const todayRoom: ChatRoom = {
    id: "today-room",
    created_at: new Date().toISOString(),
    user_id: mockUserId,
    name: "Today",
  };
  const initialConversations: Conversation[] = [
    {
      id: "conv-1",
      chat_room_id: "today-room",
      content: "Hello AI",
      sender: "user",
      created_at: new Date().toISOString(),
      user_id: mockUserId,
    },
    {
      id: "conv-2",
      chat_room_id: "today-room",
      content: "Hello User",
      sender: "assistant",
      created_at: new Date().toISOString(),
      user_id: mockUserId,
    },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    mockGetTodaysChatRoom = jest
      .spyOn(chatRoomService, "getTodaysChatRoom")
      .mockResolvedValue(todayRoom);
    mockGetChatRoomConversations = jest
      .spyOn(chatRoomService, "getChatRoomConversations")
      .mockResolvedValue(initialConversations);
    mockCreateConversation = jest
      .spyOn(chatRoomService, "createConversation")
      .mockImplementation(async (roomId, content, sender, userId) => ({
        id: `new-conv-${Math.random()}`,
        chat_room_id: roomId,
        content,
        sender,
        created_at: new Date().toISOString(),
        user_id: userId,
      }));

    // Mock sendChatRequest to return a simple stream
    const mockStream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(
          encoder.encode(`data: {"event": "message", "answer": "Streaming response part 1"}

`)
        );
        controller.enqueue(
          encoder.encode(`data: {"event": "message", "answer": " part 2"}

`)
        );
        controller.enqueue(
          encoder.encode(`data: [DONE]

`)
        );
        controller.close();
      },
    });
    mockSendChatRequest = jest
      .spyOn(difyService, "sendChatRequest")
      .mockResolvedValue(mockStream);

    // Provide default successful mock implementations
    mockedChatRoomService.getTodaysChatRoom.mockResolvedValue(1);
    mockedChatRoomService.getAllChatRooms.mockResolvedValue(mockRooms);
    mockedChatRoomService.getChatRoomConversations.mockResolvedValue(
      mockConversations
    );
    mockedFetch.mockResolvedValue({
      ok: true,
      body: new ReadableStream({
        // Mock a simple successful streaming response
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(
            encoder.encode('event: message\ndata: {"answer": "Test "}\n\n')
          );
          controller.enqueue(
            encoder.encode('event: message\ndata: {"answer": "response"}\n\n')
          );
          controller.enqueue(
            encoder.encode("event: agent_message_end\ndata: {}\n\n")
          );
          controller.close();
        },
      }),
      headers: new Headers({ "Content-Type": "text/event-stream" }),
    });
  });

  test("renders correctly and loads initial data", async () => {
    render(<ChatContainer userId={mockUserId} />);

    // Check for loading state (optional, depends on implementation)
    // expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for data loading to complete
    await waitFor(() => {
      expect(mockGetTodaysChatRoom).toHaveBeenCalledWith(mockUserId);
      expect(mockGetChatRoomConversations).toHaveBeenCalledWith("today-room");
    });

    // Check if initial messages are rendered (using mocked components)
    expect(screen.getByTestId("mock-user-message")).toHaveTextContent(
      "Hello AI"
    );
    expect(screen.getByTestId("mock-ai-message")).toHaveTextContent(
      "Hello User"
    );
    expect(screen.queryByTestId("mock-error-message")).not.toBeInTheDocument();

    // Check if sidebar and input are rendered
    expect(screen.getByTestId("mock-chat-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("mock-chat-input")).toBeInTheDocument();
    expect(screen.getByTestId("mock-chat-sidebar")).toHaveTextContent(
      "Current: today-room"
    );
  });

  it("should render loading state initially", () => {
    // Prevent mocks from resolving immediately to see loading state
    mockedChatRoomService.getTodaysChatRoom.mockImplementation(
      () => new Promise(() => {})
    ); // Never resolves
    mockedChatRoomService.getAllChatRooms.mockImplementation(
      () => new Promise(() => {})
    );
    mockedChatRoomService.getChatRoomConversations.mockImplementation(
      () => new Promise(() => {})
    );

    render(<ChatContainer />);
    expect(screen.getByText(/loading chat/i)).toBeInTheDocument(); // Check for loading text/spinner
  });

  it("should render error state if initial data loading fails", async () => {
    const loadError = "Failed to load initial data";
    mockedChatRoomService.getTodaysChatRoom.mockRejectedValue(
      new Error(loadError)
    ); // Simulate error

    render(<ChatContainer />);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(loadError)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("should render chat messages and sidebar after successful loading", async () => {
    render(<ChatContainer />);

    // Wait for loading to complete and messages/sidebar to render
    await waitFor(() => {
      // Check sidebar rooms
      expect(
        screen.getByText(`Chat ${mockRooms[0].created_at.split("T")[0]}`)
      ).toBeInTheDocument();
      expect(
        screen.getByText(`Chat ${mockRooms[1].created_at.split("T")[0]}`)
      ).toBeInTheDocument();
      // Check initial messages from mockConversations
      expect(screen.getByText("Hello")).toBeInTheDocument(); // User message
      expect(screen.getByText("Hi there!")).toBeInTheDocument(); // AI message
      expect(screen.getByText("How are you?")).toBeInTheDocument(); // User message
      expect(screen.getByText("I am well.")).toBeInTheDocument(); // AI message
    });

    // Check input is rendered
    expect(
      screen.getByPlaceholderText("Type your message...")
    ).toBeInTheDocument();
  });

  it("should send message and update chat when send button is clicked", async () => {
    render(<ChatContainer />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("I am well.")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Type your message...");
    const sendButton = screen.getByRole("button", { name: /send/i });
    const testMessage = "New test message";

    // Type and send message
    await userEvent.type(input, testMessage);
    await act(async () => {
      // Wrap state update and async fetch in act
      await userEvent.click(sendButton);
      // Allow time for fetch mock and stream processing
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Assertions
    await waitFor(() => {
      // Check if the new user message appeared
      expect(screen.getByText(testMessage)).toBeInTheDocument();
      // Check if the fetch was called
      expect(mockedFetch).toHaveBeenCalledTimes(1);
      expect(mockedFetch).toHaveBeenCalledWith(
        "/api/chat",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining(testMessage), // Check body contains the message
        })
      );
      // Check if the streamed AI response appeared (concatenated)
      expect(screen.getByText("Test response")).toBeInTheDocument(); // Check combined streamed text
    });
  });

  it("should select a different chat room from sidebar and load its conversations", async () => {
    const otherRoomConversations: LLMConversation[] = [
      {
        id: 20,
        room_id: 2,
        request_data: JSON.stringify({ query: "Old query" }),
        response_data: JSON.stringify({ answer: "Old answer" }),
        created_at: "2023-10-26T09:05:00Z",
        user_id: "user1",
      },
    ];
    // Mock getChatRoomConversations to return different data for room 2
    mockedChatRoomService.getChatRoomConversations
      .mockResolvedValueOnce(mockConversations) // Initial load for room 1
      .mockResolvedValueOnce(otherRoomConversations); // Load for room 2

    render(<ChatContainer />);

    // Wait for initial load (room 1)
    await waitFor(() => {
      expect(screen.getByText("I am well.")).toBeInTheDocument(); // Message from room 1
    });

    // Find and click the second chat room in the sidebar
    const room2Button = screen.getByText(
      `Chat ${mockRooms[1].created_at.split("T")[0]}`
    );
    await userEvent.click(room2Button);

    // Wait for the new conversations to load and render
    await waitFor(() => {
      expect(
        mockedChatRoomService.getChatRoomConversations
      ).toHaveBeenCalledTimes(2);
      expect(
        mockedChatRoomService.getChatRoomConversations
      ).toHaveBeenLastCalledWith(mockRooms[1].id, expect.any(String)); // Check correct room ID was requested
      expect(screen.getByText("Old query")).toBeInTheDocument(); // Message from room 2
      expect(screen.getByText("Old answer")).toBeInTheDocument(); // Message from room 2
      // Ensure messages from room 1 are gone
      expect(screen.queryByText("I am well.")).not.toBeInTheDocument();
    });
  });

  // Add more tests: error handling during send, empty states, scrolling behavior (might need more setup)
});
