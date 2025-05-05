import React from "react";
import { Database } from "../../../types_db"; // Adjust path if necessary

type ChatRoom = Database["public"]["Tables"]["chat_rooms"]["Row"];

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chatRooms: ChatRoom[];
  onSelectRoom: (roomId: string) => void;
  currentRoomId: string | null;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  chatRooms,
  onSelectRoom,
  currentRoomId,
}) => {
  // Simple date formatter
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown Date";
    // Show Date if not today, otherwise show Time
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("ko-KR");
  };

  return (
    <>
      {/* Overlay for closing sidebar on click outside */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar container */}
      <div
        className={`fixed inset-y-0 left-0 bg-gray-800 text-white w-64 p-4 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 lg:relative lg:translate-x-0 lg:block`}
      >
        {/* Sidebar Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">채팅 목록</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white lg:hidden"
          >
            {/* Close Icon SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Chat Room List */}
        <nav className="mt-4">
          <ul>
            {chatRooms.length === 0 ? (
              <li className="text-gray-400 text-sm">채팅방이 없습니다.</li>
            ) : (
              chatRooms.map((room) => (
                <li key={room.id} className="mb-2">
                  <button
                    onClick={() => onSelectRoom(room.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out ${
                      currentRoomId === room.id
                        ? "bg-gray-700 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {room.chat_title || `Chat ${formatDate(room.created_at)}`}
                  </button>
                </li>
              ))
            )}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default ChatSidebar;
