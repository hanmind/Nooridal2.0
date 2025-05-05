import React from "react";
import { ChatRoom } from "@/types/db"; // 커스텀 타입 사용

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chatRooms: ChatRoom[];
  onSelectRoom: (roomId: string) => void;
  currentRoomId: string | null;
  onToggleSidebar: () => void; // 이 prop은 현재 사용되지 않지만 인터페이스 일관성을 위해 유지
  onCreateNewChat: () => void; // 새 채팅 버튼 클릭 핸들러
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  chatRooms,
  onSelectRoom,
  currentRoomId,
  // onToggleSidebar는 현재 사용되지 않음
  onCreateNewChat,
}) => {
  // Simple date formatter
  const formatDate = (dateString: string | null | undefined) => {
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

        {/* 새 채팅 버튼 */}
        <div className="mb-4">
          <button
            onClick={onCreateNewChat}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            새 채팅
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
