import { sendChatRequest, handleStreamingResponse } from "../difyService";
import { Message } from "@/types/chat"; // Updated alias path
import { EventSourceParserStream } from "eventsource-parser/stream"; // Correct import

// Mock environment variables
const OLD_ENV = process.env;
beforeEach(() => {
  jest.resetModules(); // Most important - it clears the cache
  process.env = {
    ...OLD_ENV, // Make a copy
    VERCEL_PUBLIC_DIFY_API_URL: "https://api.dify.ai/v1", // Mock URL
    VERCEL_PUBLIC_DIFY_API_KEY: "test-api-key", // Mock Key
    VERCEL_PUBLIC_DIFY_USER: "test-user", // Mock User
  };
});

afterAll(() => {
  process.env = OLD_ENV; // Restore old environment
});

// Mock global fetch
global.fetch = jest.fn();
const mockedFetch = global.fetch as jest.Mock;

describe("Dify Service", () => {
  beforeEach(() => {
    mockedFetch.mockClear();
  });

  describe("sendChatRequest", () => {
    const messages: Message[] = [{ role: "user", content: "Hello" }];
    const conversationId = "conv-123";

    it("should call fetch with correct parameters for streaming", async () => {
      // Mock fetch to return a readable stream (or simulate one)
      const mockResponse = new Response(null, { status: 200 }); // Empty stream for now
      mockedFetch.mockResolvedValue(mockResponse);

      await sendChatRequest(messages, conversationId, true); // stream = true

      expect(mockedFetch).toHaveBeenCalledTimes(1);
      expect(mockedFetch).toHaveBeenCalledWith(
        `${process.env.VERCEL_PUBLIC_DIFY_API_URL}/chat-messages`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: `Bearer ${process.env.VERCEL_PUBLIC_DIFY_API_KEY}`,
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            inputs: {}, // Assuming empty for now, adjust if needed
            query: "Hello", // Last user message content
            user: process.env.VERCEL_PUBLIC_DIFY_USER,
            response_mode: "streaming",
            conversation_id: conversationId,
          }),
        })
      );
    });

    it("should call fetch with correct parameters for non-streaming", async () => {
      const mockJsonResponse = { answer: "Hi there!" };
      const mockResponse = new Response(JSON.stringify(mockJsonResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
      mockedFetch.mockResolvedValue(mockResponse);

      await sendChatRequest(messages, conversationId, false); // stream = false

      expect(mockedFetch).toHaveBeenCalledTimes(1);
      expect(mockedFetch).toHaveBeenCalledWith(
        `${process.env.VERCEL_PUBLIC_DIFY_API_URL}/chat-messages`,
        expect.objectContaining({
          response_mode: "blocking", // Check non-streaming mode
        })
      );
      // We are not testing the return value processing here, just the fetch call
    });

    it("should throw an error if fetch fails", async () => {
      const mockError = new Error("Network error");
      mockedFetch.mockRejectedValue(mockError);

      await expect(
        sendChatRequest(messages, conversationId, true)
      ).rejects.toThrow("Failed to send chat request");
    });

    it("should throw an error if response status is not ok", async () => {
      const mockResponse = new Response("Unauthorized", { status: 401 });
      mockedFetch.mockResolvedValue(mockResponse);

      await expect(
        sendChatRequest(messages, conversationId, true)
      ).rejects.toThrow("API request failed with status 401");
    });
  });

  describe("handleStreamingResponse", () => {
    it("should parse SSE stream and call onData callback", async () => {
      // Simulate an SSE stream
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode('event: message\ndata: {"answer": "Hello"}\n\n')
          );
          controller.enqueue(
            encoder.encode('event: message\ndata: {"answer": " World"}\n\n')
          );
          controller.enqueue(
            encoder.encode(
              'event: agent_message_end\ndata: {"id": "msg-123"}\n\n'
            )
          ); // Simulate end event
          controller.close();
        },
      });

      const mockResponse = new Response(stream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });

      const onDataMock = jest.fn();
      const getControllerMock = jest
        .fn()
        .mockReturnValue({ signal: new AbortController().signal }); // Mock controller

      await handleStreamingResponse(
        mockResponse,
        onDataMock,
        getControllerMock
      );

      // Wait for stream processing (might need slight delay or better async handling)
      await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay

      expect(onDataMock).toHaveBeenCalledTimes(2);
      expect(onDataMock).toHaveBeenNthCalledWith(1, "Hello");
      expect(onDataMock).toHaveBeenNthCalledWith(2, " World");
      expect(getControllerMock).toHaveBeenCalledTimes(1); // Controller signal should be used
    });

    it("should handle parse errors gracefully", async () => {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode('event: message\ndata: {"answer": "Part 1"}\n\n')
          );
          controller.enqueue(
            encoder.encode("event: message\ndata: invalid json\n\n")
          ); // Invalid data
          controller.enqueue(
            encoder.encode('event: message\ndata: {"answer": "Part 3"}\n\n')
          );
          controller.close();
        },
      });
      const mockResponse = new Response(stream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
      const onDataMock = jest.fn();
      const getControllerMock = jest
        .fn()
        .mockReturnValue({ signal: new AbortController().signal });
      // Mock console.error to suppress expected error output during test
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await handleStreamingResponse(
        mockResponse,
        onDataMock,
        getControllerMock
      );
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(onDataMock).toHaveBeenCalledTimes(2); // Only valid parts processed
      expect(onDataMock).toHaveBeenNthCalledWith(1, "Part 1");
      expect(onDataMock).toHaveBeenNthCalledWith(2, "Part 3");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error parsing SSE data:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore(); // Restore console.error
    });

    // Add more tests: empty stream, stream ending unexpectedly, different event types etc.
  });
});
