"use client";

import React from "react";
// import ChatContainer from "../components/ChatContainer"; // Use relative path from agent page to components directory
import ChatContainer from "@/app/components/ChatContainer"; // Use absolute path alias

export default function AgentPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* Render the ChatContainer component, which fills the screen */}
      <ChatContainer />
    </main>
  );
}
