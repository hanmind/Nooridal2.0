import React from "react";
import { render, screen } from "@testing-library/react";
import AIMessage from "../AIMessage"; // Relative path

describe("AIMessage Component", () => {
  it("should render the AI message content when not streaming", () => {
    const testMessage = "This is an AI message.";
    render(<AIMessage message={testMessage} isStreaming={false} />);

    expect(screen.getByText(testMessage)).toBeInTheDocument();
    // Cursor should not be present
    expect(screen.queryByText("|")).not.toBeInTheDocument();
    expect(screen.queryByTestId("streaming-cursor")).not.toBeInTheDocument();
  });

  it("should render the AI message content and a streaming cursor when streaming", () => {
    const testMessage = "Streaming AI response...";
    render(<AIMessage message={testMessage} isStreaming={true} />);

    // Check if the partial message text is rendered
    expect(screen.getByText(testMessage)).toBeInTheDocument();

    // Check if the streaming cursor is present (using a data-testid)
    const cursor = screen.getByTestId("streaming-cursor");
    expect(cursor).toBeInTheDocument();
    expect(cursor).toHaveTextContent("|");
    expect(cursor).toHaveClass("animate-blink"); // Check for blinking animation class
  });

  it("should apply AI message specific styling", () => {
    const testMessage = "AI styling test.";
    const { container } = render(
      <AIMessage message={testMessage} isStreaming={false} />
    );

    const messageDiv = container.firstChild;
    // Check for specific classes associated with AI messages
    expect(messageDiv).toHaveClass("bg-gray-200"); // Example class
    expect(messageDiv).toHaveClass("text-black"); // Example class
    expect(messageDiv).toHaveClass("self-start"); // Example class
  });

  it("should render only the streaming cursor if message is empty and streaming", () => {
    render(<AIMessage message="" isStreaming={true} />);

    // Message text should not be present or should be empty container
    // Depending on implementation, might need to check for absence of text nodes
    expect(screen.queryByText(/.+/)).not.toBeInTheDocument(); // Check no text content

    const cursor = screen.getByTestId("streaming-cursor");
    expect(cursor).toBeInTheDocument();
    expect(cursor).toHaveTextContent("|");
  });

  it("should render nothing if message is empty and not streaming", () => {
    const { container } = render(<AIMessage message="" isStreaming={false} />);

    // Expect the container to be empty or have minimal structure without visible content
    expect(container.firstChild).toBeNull(); // Or check for specific empty structure
  });
});
