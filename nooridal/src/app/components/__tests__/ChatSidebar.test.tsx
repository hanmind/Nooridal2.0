import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatSidebar from "../ChatSidebar"; // Relative path
import { ChatRoom } from "@/app/types/db"; // Use alias

const mockChatRooms: ChatRoom[] = [
  { id: 1, created_at: "2023-10-27T10:00:00Z", user_id: "user1" },
  { id: 2, created_at: "2023-10-26T09:00:00Z", user_id: "user1" },
  { id: 3, created_at: "2023-10-25T08:00:00Z", user_id: "user1" },
];

// Helper function to format date as YYYY-MM-DD
const formatDate = (dateString: string) => {
  return new Date(dateString).toISOString().split("T")[0];
};

describe("ChatSidebar Component", () => {
  it("should render chat rooms and toggle button when open", () => {
    const mockOnSelect = jest.fn();
    const mockOnToggle = jest.fn();
    render(
      <ChatSidebar
        chatRooms={mockChatRooms}
        selectedRoomId={1}
        isOpen={true}
        onSelectRoom={mockOnSelect}
        onToggleSidebar={mockOnToggle}
      />
    );

    // Check toggle button
    expect(
      screen.getByRole("button", { name: /close sidebar/i })
    ).toBeInTheDocument();

    // Check if chat room list is rendered
    expect(screen.getByRole("list")).toBeInTheDocument();

    // Check if chat room items are rendered (check text content - format date)
    mockChatRooms.forEach((room) => {
      expect(
        screen.getByText(`Chat ${formatDate(room.created_at)}`)
      ).toBeInTheDocument();
    });

    // Check if the selected room has an active state (e.g., specific class)
    const selectedRoomElement = screen
      .getByText(`Chat ${formatDate(mockChatRooms[0].created_at)}`)
      .closest("li");
    expect(selectedRoomElement).toHaveClass("bg-blue-100"); // Example active class
  });

  it("should render only the toggle button when closed", () => {
    const mockOnSelect = jest.fn();
    const mockOnToggle = jest.fn();
    render(
      <ChatSidebar
        chatRooms={mockChatRooms}
        selectedRoomId={1}
        isOpen={false} // Sidebar is closed
        onSelectRoom={mockOnSelect}
        onToggleSidebar={mockOnToggle}
      />
    );

    // Check toggle button (should show "open" text or icon)
    expect(
      screen.getByRole("button", { name: /open sidebar/i })
    ).toBeInTheDocument();

    // Chat room list should NOT be rendered
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    mockChatRooms.forEach((room) => {
      expect(
        screen.queryByText(`Chat ${formatDate(room.created_at)}`)
      ).not.toBeInTheDocument();
    });
  });

  it("should call onToggleSidebar when toggle button is clicked", async () => {
    const mockOnSelect = jest.fn();
    const mockOnToggle = jest.fn();
    render(
      <ChatSidebar
        chatRooms={mockChatRooms}
        selectedRoomId={1}
        isOpen={true}
        onSelectRoom={mockOnSelect}
        onToggleSidebar={mockOnToggle}
      />
    );

    const toggleButton = screen.getByRole("button", { name: /close sidebar/i });
    await userEvent.click(toggleButton);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it("should call onSelectRoom with the correct room ID when a chat room is clicked", async () => {
    const mockOnSelect = jest.fn();
    const mockOnToggle = jest.fn();
    render(
      <ChatSidebar
        chatRooms={mockChatRooms}
        selectedRoomId={1} // Room 1 is initially selected
        isOpen={true}
        onSelectRoom={mockOnSelect}
        onToggleSidebar={mockOnToggle}
      />
    );

    // Click on the second chat room (ID: 2)
    const roomToClick = screen.getByText(
      `Chat ${formatDate(mockChatRooms[1].created_at)}`
    );
    await userEvent.click(roomToClick);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(mockChatRooms[1].id); // Should be called with ID 2
  });

  it("should render empty state message if chatRooms array is empty", () => {
    const mockOnSelect = jest.fn();
    const mockOnToggle = jest.fn();
    render(
      <ChatSidebar
        chatRooms={[]} // Empty array
        selectedRoomId={null}
        isOpen={true}
        onSelectRoom={mockOnSelect}
        onToggleSidebar={mockOnToggle}
      />
    );

    expect(screen.getByText(/no chat history/i)).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
