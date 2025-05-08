import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event"; // For simulating typing
import ChatInput from "../ChatInput"; // Relative path

describe("ChatInput Component", () => {
  it("should render the input field and send button", () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSendMessage={mockOnSend} />);

    expect(
      screen.getByPlaceholderText("Type your message...")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("should update input value on change", async () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSendMessage={mockOnSend} />);
    const input = screen.getByPlaceholderText("Type your message...");

    await userEvent.type(input, "Hello there");

    expect(input).toHaveValue("Hello there");
  });

  it("should call onSendMessage with the input value when send button is clicked and input is not empty", async () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSendMessage={mockOnSend} />);
    const input = screen.getByPlaceholderText("Type your message...");
    const sendButton = screen.getByRole("button", { name: /send/i });
    const testMessage = "Test message to send";

    await userEvent.type(input, testMessage);
    await userEvent.click(sendButton);

    expect(mockOnSend).toHaveBeenCalledTimes(1);
    expect(mockOnSend).toHaveBeenCalledWith(testMessage);
    expect(input).toHaveValue(""); // Input should be cleared after sending
  });

  it("should call onSendMessage when Enter key is pressed and input is not empty", async () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSendMessage={mockOnSend} />);
    const input = screen.getByPlaceholderText("Type your message...");
    const testMessage = "Send via Enter";

    await userEvent.type(input, testMessage);
    await userEvent.type(input, "{enter}"); // Simulate pressing Enter

    expect(mockOnSend).toHaveBeenCalledTimes(1);
    expect(mockOnSend).toHaveBeenCalledWith(testMessage);
    expect(input).toHaveValue("");
  });

  it("should NOT call onSendMessage if input is empty when send button is clicked", async () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSendMessage={mockOnSend} />);
    const sendButton = screen.getByRole("button", { name: /send/i });

    await userEvent.click(sendButton);

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it("should NOT call onSendMessage if input is empty when Enter key is pressed", async () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSendMessage={mockOnSend} />);
    const input = screen.getByPlaceholderText("Type your message...");

    await userEvent.type(input, "{enter}"); // Simulate pressing Enter on empty input

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it("should disable input and button when disabled prop is true", () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSendMessage={mockOnSend} disabled={true} />);

    const input = screen.getByPlaceholderText("Type your message...");
    const sendButton = screen.getByRole("button", { name: /send/i });

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });
});
