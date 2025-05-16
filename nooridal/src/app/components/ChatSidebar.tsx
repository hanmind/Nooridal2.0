import React from "react";
import { ChatRoom } from "@/types/db"; // 커스텀 타입 사용

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chatRooms: ChatRoom[];
  onSelectRoom: (roomId: string) => void;
  currentRoomId: string | null;
  onToggleSidebar: () => void; // 토글 함수 추가
  onCreateNewChat: () => void; // 새 채팅방 생성 함수 추가
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  chatRooms,
  onSelectRoom,
  currentRoomId,
  // onToggleSidebar, // 토글 버튼은 ChatContainer에 있으므로 여기서 사용 안 함
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
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 backdrop-blur-md z-30 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 flex flex-col border-r border-yellow-200 font-['Do_Hyeon']`}
      >
        {/* Header */}
        <div className="p-4 flex justify-end items-center">
          <button
            onClick={onClose}
            className="text-yellow-600 hover:text-yellow-800 lg:hidden"
          >
            {/* Close Icon */}
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

        {/* New Chat Button */}
        <div className="p-4 border-b border-yellow-100">
          <button
            onClick={onCreateNewChat}
            className="w-full bg-[#FFF4BB] text-[#A67C52] py-2 px-4 rounded-lg shadow hover:bg-[#FFE999] transition duration-200 flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            새 채팅 시작하기
          </button>
        </div>

        {/* Guide Text */}
        <div className="px-4 py-2">
          {chatRooms.length === 0 && !currentRoomId && (
            <p className="text-xs text-black text-center">
              대화 내역을 확인해보세요
            </p>
          )}
        </div>

        {/* Chat Room List */}
        <div className="flex-1 overflow-y-auto">
          {chatRooms.length === 0 ? (
            <p className="p-4 text-center text-yellow-600 opacity-75">
              채팅방이 없습니다.
            </p>
          ) : (
            chatRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={`w-full text-left px-4 py-3 transition duration-150 ease-in-out ${
                  currentRoomId === room.id
                    ? "bg-yellow-100 text-yellow-800 font-semibold"
                    : "text-gray-700 hover:bg-yellow-50"
                }`}
              >
                {room.chat_title ||
                  `Chat ${room.created_at}` ||
                  "Untitled Chat"}
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
