"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
// import ChatContainer from "../components/ChatContainer"; // Use relative path from agent page to components directory
import ChatContainer from "@/app/components/ChatContainer"; // Use absolute path alias
import TabBar from "@/app/components/TabBar"; // TabBar import
import { Tab } from "@/types/ui"; // Tab 타입 import 경로 수정

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
      {/* ChatContainer가 TabBar 위에 위치하도록 함 */}
      <div className="flex-grow relative">
        <ChatContainer />
      </div>
      {/* TabBar는 하단에 고정됨 */}
      <TabBar activeTab={activeTab} tabs={tabs} onTabClick={handleTabClick} />
    </div>
  );
}
