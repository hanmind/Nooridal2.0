import React from "react";
import { render, screen } from "@testing-library/react";
import UserMessage from "../UserMessage"; // Relative path

describe("UserMessage Component", () => {
  it("should render the user message content", () => {
    const testMessage = "This is a user message.";
    render(<UserMessage message={testMessage} />);

    // Check if the message text is rendered
    expect(screen.getByText(testMessage)).toBeInTheDocument();

    // Check for user icon/avatar if applicable (add specific selector/test id)
    // expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
  });

  it("should apply user message specific styling", () => {
    const testMessage = "Styling test.";
    const { container } = render(<UserMessage message={testMessage} />);

    // Check if a specific class associated with user messages is present
    // This depends on your actual CSS/Tailwind classes
    const messageDiv = container.firstChild;
    expect(messageDiv).toHaveClass("bg-blue-500"); // Example class check
    expect(messageDiv).toHaveClass("text-white"); // Example class check
    expect(messageDiv).toHaveClass("self-end"); // Example class check
  });
});
