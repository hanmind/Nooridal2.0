import {
  getTodaysChatRoom,
  getAllChatRooms,
  getChatRoomConversations,
  createConversation,
} from "../chatRoomService";
import { supabase } from "../supabase"; // Import the actual client to mock it
import { PostgrestFilterBuilder } from "@supabase/postgrest-js"; // Import necessary types for mocking
import { SupabaseClient } from "@supabase/supabase-js";
import { ChatRoom, LLMConversation } from "@/types/db"; // Updated alias path

// Mock the Supabase client
jest.mock("../supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn(),
    insert: jest.fn(),
    eq: jest.fn(),
    gte: jest.fn(),
    order: jest.fn(),
    single: jest.fn(), // Add mock for single() if used
    // Add other Supabase methods used in chatRoomService if necessary
  },
}));

// Helper to cast mock functions
const mockedSupabase = supabase as jest.Mocked<typeof supabase>;

// Helper to reset mocks with proper chaining
const resetSupabaseMocks = () => {
  const mockFrom = jest.fn();
  const mockSelect = jest.fn();
  const mockInsert = jest.fn();
  const mockOrder = jest.fn();
  const mockLimit = jest.fn();
  const mockSingle = jest.fn();
  const mockEq = jest.fn();
  const mockGte = jest.fn();
  const mockLte = jest.fn();

  mockedSupabase.from.mockImplementation(mockFrom);

  // Configure mocks to return 'this' (or other mocks) for chaining *within specific tests* where needed.
  mockFrom.mockImplementation(() => ({
    select: mockSelect,
    insert: mockInsert,
  }));
  mockSelect.mockImplementation(() => ({
    order: mockOrder,
    limit: mockLimit,
    single: mockSingle,
    eq: mockEq,
    gte: mockGte,
  }));
  mockInsert.mockImplementation(() => ({
    select: mockSelect,
    single: mockSingle,
  }));
  mockOrder.mockImplementation(() => ({
    limit: mockLimit,
    single: mockSingle,
  }));
  mockLimit.mockImplementation(() => ({
    single: mockSingle,
  }));
  mockEq.mockImplementation(() => ({
    order: mockOrder,
    select: mockSelect,
    gte: mockGte,
  }));
  mockGte.mockImplementation(() => ({
    lte: mockLte,
    order: mockOrder,
    limit: mockLimit,
  }));
  mockLte.mockImplementation(() => ({
    order: mockOrder,
    limit: mockLimit,
  }));

  // Return the individual mocks so they can be configured in tests
  return {
    mockFrom,
    mockSelect,
    mockInsert,
    mockOrder,
    mockLimit,
    mockSingle,
    mockEq,
    mockGte,
    mockLte,
  };
};

describe("Chat Room Service", () => {
  beforeEach(() => {
    resetSupabaseMocks(); // Reset mocks before each test
    jest.clearAllMocks();

    // Default mock implementations (can be overridden in specific tests)
    mockedSupabase.from.mockReturnThis();
    mockedSupabase.select.mockResolvedValue({ data: [], error: null });
    mockedSupabase.insert.mockResolvedValue({ data: [], error: null });
    mockedSupabase.eq.mockReturnThis();
    mockedSupabase.gte.mockReturnThis();
    mockedSupabase.order.mockReturnThis();
    mockedSupabase.single.mockResolvedValue({ data: null, error: null });
  });

  describe("getTodaysChatRoom", () => {
    it("should fetch today's chat room ID if it exists", async () => {
      // Arrange
      const mockRoom: ChatRoom = {
        id: 1,
        created_at: new Date().toISOString(),
        user_id: "test-user",
      };
      const { mockFrom, mockSelect, mockGte, mockLte, mockOrder, mockLimit } =
        resetSupabaseMocks();

      // Mock the SELECT path - last step returns data
      const mockLimitResult = jest
        .fn()
        .mockResolvedValue({ data: [mockRoom], error: null });
      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ gte: mockGte });
      mockGte.mockReturnValue({ lte: mockLte });
      mockLte.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ limit: mockLimit });
      mockLimit.mockImplementation(mockLimitResult); // Mock the final call returning the promise

      // Act
      const result = await getTodaysChatRoom("test-user");

      // Assert
      expect(result).toEqual(mockRoom.id);
      expect(mockFrom).toHaveBeenCalledWith("chat_rooms");
      expect(mockSelect).toHaveBeenCalledWith("id");
      expect(mockGte).toHaveBeenCalledWith("created_at", expect.any(String));
      expect(mockLte).toHaveBeenCalledWith("created_at", expect.any(String));
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(mockLimitResult).toHaveBeenCalledTimes(1);
      // Ensure insert was not called
      const { mockInsert } = resetSupabaseMocks();
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it("should create and return a new chat room ID if none exists today", async () => {
      // Arrange
      const {
        mockFrom,
        mockSelect,
        mockGte,
        mockLte,
        mockOrder,
        mockLimit,
        mockInsert,
      } = resetSupabaseMocks();

      // Mock the SELECT path finding no rooms
      const mockLimitResultSelect = jest
        .fn()
        .mockResolvedValue({ data: [], error: null });
      const mockFromSelect = jest.fn().mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ gte: mockGte });
      mockGte.mockReturnValue({ lte: mockLte });
      mockLte.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ limit: mockLimit });
      mockLimit.mockImplementation(mockLimitResultSelect);

      // Mock the INSERT path returning success
      const mockInsertResult = jest.fn().mockResolvedValue({ error: null });
      const mockFromInsert = jest.fn().mockReturnValue({ insert: mockInsert });
      mockInsert.mockImplementation(mockInsertResult);

      // Configure mockFrom to handle both calls correctly
      mockedSupabase.from
        .mockImplementationOnce(mockFromSelect) // First call for SELECT
        .mockImplementationOnce(mockFromInsert); // Second call for INSERT

      // Act
      const result = await getTodaysChatRoom("test-user-new");

      // Assert
      expect(result).toEqual(expect.any(String)); // Should return a UUID string
      expect(mockLimitResultSelect).toHaveBeenCalledTimes(1); // Select was called and completed
      expect(mockFromSelect).toHaveBeenCalledWith("chat_rooms");
      expect(mockFromInsert).toHaveBeenCalledWith("chat_rooms"); // Insert was called
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ chat_title: expect.any(String) })
      );
      expect(mockInsertResult).toHaveBeenCalledTimes(1); // Insert completed
    });

    it("should throw an error if SELECT query fails", async () => {
      // Arrange
      const mockError = new Error("Select failed");
      const { mockFrom, mockSelect, mockGte, mockLte, mockOrder, mockLimit } =
        resetSupabaseMocks();
      const mockLimitResult = jest
        .fn()
        .mockResolvedValue({ data: null, error: mockError });
      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ gte: mockGte });
      mockGte.mockReturnValue({ lte: mockLte });
      mockLte.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ limit: mockLimit });
      mockLimit.mockImplementation(mockLimitResult);

      // Act & Assert
      await expect(getTodaysChatRoom("test-user-error")).rejects.toThrow(
        "Failed to get or create chat room"
      );
      expect(mockLimitResult).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if INSERT query fails", async () => {
      // Arrange
      const mockInsertError = new Error("Insert failed");
      const {
        mockFrom,
        mockSelect,
        mockGte,
        mockLte,
        mockOrder,
        mockLimit,
        mockInsert,
      } = resetSupabaseMocks();

      // Mock SELECT path (no rooms)
      const mockLimitResultSelect = jest
        .fn()
        .mockResolvedValue({ data: [], error: null });
      const mockFromSelect = jest.fn().mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ gte: mockGte });
      mockGte.mockReturnValue({ lte: mockLte });
      mockLte.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ limit: mockLimit });
      mockLimit.mockImplementation(mockLimitResultSelect);

      // Mock INSERT path (error)
      const mockInsertResult = jest
        .fn()
        .mockResolvedValue({ error: mockInsertError });
      const mockFromInsert = jest.fn().mockReturnValue({ insert: mockInsert });
      mockInsert.mockImplementation(mockInsertResult);

      // Configure mockFrom for both calls
      mockedSupabase.from
        .mockImplementationOnce(mockFromSelect)
        .mockImplementationOnce(mockFromInsert);

      // Act & Assert
      await expect(getTodaysChatRoom("test-user-insert-error")).rejects.toThrow(
        "Failed to get or create chat room"
      );
      expect(mockInsertResult).toHaveBeenCalledTimes(1);
    });
  });

  // --- Add tests for other functions here --- --- --- --- --- --- ---

  describe("getAllChatRooms", () => {
    it("should fetch all chat rooms successfully", async () => {
      // Arrange
      const mockRooms: ChatRoom[] = [
        { id: 1, created_at: "2023-10-26T10:00:00Z", user_id: "user1" },
        { id: 2, created_at: "2023-10-27T11:00:00Z", user_id: "user1" }, // Yesterday
      ];
      const { mockFrom, mockSelect, mockOrder } = resetSupabaseMocks();

      // Mock the final step (.order) to resolve with data
      const mockOrderResult = jest
        .fn()
        .mockResolvedValue({ data: mockRooms, error: null });
      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ order: mockOrder });
      mockOrder.mockImplementation(mockOrderResult);

      // Act
      const result = await getAllChatRooms("user1");

      // Assert
      expect(result).toEqual(mockRooms);
      expect(mockFrom).toHaveBeenCalledWith("chat_rooms");
      expect(mockSelect).toHaveBeenCalledWith("*"); // Assuming selecting all columns
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(mockOrderResult).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if Supabase query fails", async () => {
      // Arrange
      const mockError = new Error("Failed to fetch rooms");
      const { mockFrom, mockSelect, mockOrder } = resetSupabaseMocks();
      const mockOrderResult = jest
        .fn()
        .mockResolvedValue({ data: null, error: mockError });
      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ order: mockOrder });
      mockOrder.mockImplementation(mockOrderResult);

      // Act & Assert
      await expect(getAllChatRooms("user-error")).rejects.toThrow(
        "Failed to fetch chat rooms"
      );
      expect(mockOrderResult).toHaveBeenCalledTimes(1);
    });
  });

  describe("getChatRoomConversations", () => {
    const roomId = "test-room-id";
    it("should fetch conversations for a room successfully", async () => {
      // Arrange
      const mockConversations: LLMConversation[] = [
        {
          id: 1,
          created_at: "2023-10-27T11:05:00Z",
          room_id: 2,
          request_data: '{"q":"hi"}',
          response_data: '{"a":"hello"}',
          user_id: "user1",
        },
        {
          id: 2,
          created_at: "2023-10-27T11:10:00Z",
          room_id: 2,
          request_data: '{"q":"bye"}',
          response_data: '{"a":"see ya"}',
          user_id: "user1",
        },
      ];
      const { mockFrom, mockSelect, mockEq, mockOrder } = resetSupabaseMocks();
      // Mock the final step (.order) to resolve with data
      const mockOrderResult = jest
        .fn()
        .mockResolvedValue({ data: mockConversations, error: null });
      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });
      mockOrder.mockImplementation(mockOrderResult);

      // Act
      const result = await getChatRoomConversations(2, "user1");

      // Assert
      expect(result).toEqual(mockConversations);
      expect(mockFrom).toHaveBeenCalledWith("llm_conversations");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("room_id", 2);
      expect(mockEq).toHaveBeenCalledWith("user_id", "user1");
      expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: true });
      expect(mockOrderResult).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if Supabase query fails", async () => {
      // Arrange
      const mockError = new Error("Failed to fetch conversations");
      const { mockFrom, mockSelect, mockEq, mockOrder } = resetSupabaseMocks();
      const mockOrderResult = jest
        .fn()
        .mockResolvedValue({ data: null, error: mockError });
      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });
      mockOrder.mockImplementation(mockOrderResult);

      // Act & Assert
      await expect(getChatRoomConversations(1, "user-error")).rejects.toThrow(
        "Failed to fetch conversations"
      );
      expect(mockOrderResult).toHaveBeenCalledTimes(1);
    });
  });

  describe("createConversation", () => {
    const roomId = "test-room-id";
    const query = "Test query";
    const response = "Test response";
    const userId = "test-user-id";
    it("should create a conversation successfully", async () => {
      // Arrange
      const mockNewConversation: LLMConversation = {
        id: 10,
        created_at: new Date().toISOString(),
        room_id: roomId,
        request_data: JSON.stringify({ query }),
        response_data: JSON.stringify({ answer: response }),
        user_id: userId,
      };
      const { mockFrom, mockInsert, mockSelect, mockSingle } =
        resetSupabaseMocks();
      mockFrom.mockReturnValue({ insert: mockInsert });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockSingle.mockResolvedValueOnce({
        data: mockNewConversation,
        error: null,
      });

      // Act
      const result = await createConversation(roomId, query, response, userId);

      // Assert
      expect(result).toEqual(mockNewConversation);
      expect(mockFrom).toHaveBeenCalledWith("llm_conversations");
      expect(mockInsert).toHaveBeenCalledWith({
        room_id: roomId,
        request_data: JSON.stringify({ query }),
        response_data: JSON.stringify({ answer: response }),
        user_id: userId,
      });
      expect(mockSelect).toHaveBeenCalledTimes(1);
      expect(mockSingle).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if Supabase insert fails", async () => {
      // Arrange
      const mockError = new Error("Failed to insert conversation");
      const { mockFrom, mockInsert, mockSelect, mockSingle } =
        resetSupabaseMocks();
      mockFrom.mockReturnValue({ insert: mockInsert });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockSingle.mockResolvedValueOnce({ data: null, error: mockError });

      // Act & Assert
      await expect(
        createConversation(roomId, query, response, userId)
      ).rejects.toThrow("Failed to save conversation");
      expect(mockSingle).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if user_id is missing", async () => {
      // Arrange
      const { mockFrom } = resetSupabaseMocks();

      // Act & Assert
      await expect(
        createConversation(roomId, query, response, undefined)
      ).rejects.toThrow("User ID is required to create a conversation");
      await expect(
        createConversation(roomId, query, response, null)
      ).rejects.toThrow("User ID is required to create a conversation");
      expect(mockFrom).not.toHaveBeenCalled();
    });
  });
});
