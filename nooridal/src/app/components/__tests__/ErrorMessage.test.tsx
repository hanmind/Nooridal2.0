import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorMessage from "../ErrorMessage"; // Relative path

describe("ErrorMessage Component", () => {
  it("should render the error message and retry button", () => {
    const errorMessage = "Failed to load messages.";
    const mockOnRetry = jest.fn();
    render(<ErrorMessage message={errorMessage} onRetry={mockOnRetry} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("should call onRetry when the retry button is clicked", async () => {
    const errorMessage = "Another error occurred.";
    const mockOnRetry = jest.fn();
    render(<ErrorMessage message={errorMessage} onRetry={mockOnRetry} />);

    const retryButton = screen.getByRole("button", { name: /retry/i });
    await userEvent.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it("should not render the retry button if onRetry is not provided", () => {
    const errorMessage = "No retry possible.";
    render(<ErrorMessage message={errorMessage} />); // No onRetry prop

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /retry/i })
    ).not.toBeInTheDocument();
  });

  it("should render nothing if message is null or empty", () => {
    const mockOnRetry = jest.fn();
    const { container, rerender } = render(
      <ErrorMessage message={null} onRetry={mockOnRetry} />
    );

    // Check for null message
    expect(container.firstChild).toBeNull();

    // Check for empty string message
    rerender(<ErrorMessage message="" onRetry={mockOnRetry} />);
    expect(container.firstChild).toBeNull();
  });
});
