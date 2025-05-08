"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
// import ChatContainer from "../components/ChatContainer"; // Use relative path from agent page to components directory
import ChatContainer from "@/app/components/ChatContainer"; // Use absolute path alias
import TabBar from "@/app/components/TabBar"; // TabBar import
import { Tab } from "@/app/chat/page"; // Tab 타입 import (chat/page.tsx에서 가져옴)

export default function AgentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("chat"); // 현재 활성 탭 상태

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === "chat") {
      router.push("/agent");
    } else if (tab === "calendar") {
      router.push("/calendar"); // 실제 캘린더 페이지 경로로 수정 필요
    } else if (tab === "location") {
      router.push("/location"); // 실제 위치 페이지 경로로 수정 필요
    } else if (tab === "mypage") {
      router.push("/mypage"); // 실제 마이페이지 경로로 수정 필요
    }
  };

  const tabs: Tab[] = ["chat", "calendar", "location", "mypage"]; // 전체 탭 목록

  return (
    // <main className="flex min-h-screen flex-col items-center justify-between">
    //   {/* Render the ChatContainer component, which fills the screen */}
    //   <ChatContainer />
    // </main>
    <div className="h-screen flex flex-col">
      {/* ChatContainer가 TabBar를 제외한 나머지 공간을 차지하도록 함 */}
      <div className="flex-grow overflow-y-auto">
        {/* ChatContainer는 내부에서 h-full을 사용하여 이 공간을 채움 */}
        <ChatContainer />
      </div>
      {/* TabBar는 하단에 고정된 높이(h-28)를 가짐 */}
      {/* TabBar자체에 style fixed bottom-0이 있으므로 별도 div로 감쌀 필요 없을 수 있음 */}
      {/* TabBar.tsx 확인 필요: w-full h-28 fixed bottom-0 ... */}
      <TabBar activeTab={activeTab} tabs={tabs} onTabClick={handleTabClick} />
    </div>
  );
}
