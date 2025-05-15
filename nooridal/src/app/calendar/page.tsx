"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Calendar from "./Calendar";
import TabBar from "../components/TabBar";
import { supabase } from "../../utils/supabase"; // Import Supabase client
import HeaderBar from "../components/HeaderBar";

// Generate random invitation code (copied from register/pregnant/page.tsx)
const generateInvitationCode = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

type Tab = "chat" | "calendar" | "location" | "mypage";

export default function CalendarPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("calendar");
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);
  const months = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];
  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setIsMonthSelectorOpen(false);
  };

  useEffect(() => {
    setActiveTab("calendar");

    // Renamed function for clarity
    const checkUserAndPregnancy = async () => {
      setIsLoading(true); // Start loading
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session:", sessionError);
        setIsLoading(false); // Stop loading on error
        return;
      }

      const user = sessionData?.session?.user;

      if (user) {
        console.log("[Auth Check] User found. ID:", user.id);

        try {
          const { data: profileData, error: profileError } = await supabase
            .from("users")
            .select("id, user_type")
            .eq("id", user.id)
            .maybeSingle();

          if (profileError) {
            console.error(
              "Detailed profileError:",
              JSON.stringify(profileError, null, 2)
            );
          }

          if (profileError && profileError.code !== "PGRST116") {
            console.error(
              "Error checking for profile (non-PGRST116):",
              profileError
            );
            setIsLoading(false);
            return;
          }

          if (!profileData) {
            // Profile does not exist, create it
            console.log(
              "[Auth Check] Profile not found for user:",
              user.id,
              "Creating profile..."
            );
            const newUserProfile = {
              id: user.id,
              email: user.email,
              name:
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email ||
                "새 사용자",
              username: user.email || `user_${user.id.substring(0, 8)}`,
              user_type: "pregnant" as const,
              invitation_code: generateInvitationCode(),
            };

            const { error: insertError } = await supabase
              .from("users")
              .insert(newUserProfile);

            if (insertError) {
              console.error("Error creating profile:", insertError);
              setIsLoading(false);
              return;
            } else {
              console.log(
                "[Auth Check] Profile created successfully for user:",
                user.id
              );
            }
          } else {
            console.log("[Auth Check] Profile found for user:", user.id);
          }

          // --- Add Pregnancy Info Check ---
          // Only check/redirect for pregnant users
          if (profileData && profileData.user_type === "pregnant") {
            console.log(
              "[Pregnancy Check] Checking for pregnancy record for user:",
              user.id
            );
            const {
              data: pregnancyData,
              error: pregnancyError,
              count,
            } = await supabase
              .from("pregnancies")
              .select("id", { count: "exact", head: true }) // Efficiently check for existence
              .eq("user_id", user.id);

            if (pregnancyError) {
              console.error(
                "[Pregnancy Check] Error fetching pregnancy info:",
                pregnancyError
              );
              setIsLoading(false); // Stop loading on error
              return; // Don't redirect if fetching fails
            }

            console.log("[Pregnancy Check] Pregnancy record count:", count);

            if (count === 0) {
              console.log(
                "[Pregnancy Check] No pregnancy record found. Redirecting..."
              );
              router.push("/register/pregnant/pregnancy-info");
              return;
            }
          }
          setIsLoading(false); // Stop loading only if staying
        } catch (e) {
          console.error("Unexpected error during profile/pregnancy check:", e);
          setIsLoading(false);
          return;
        }
      } else {
        console.log("[Auth Check] No user session found.");
        setIsLoading(false); // Stop loading if no user
      }
    };

    checkUserAndPregnancy();

    // Optional: Auth listener cleanup remains commented out unless needed
    /* 
    return () => {
      authListener?.subscription.unsubscribe();
    };
    */
  }, [router]); // Add router to dependency array

  // Render loading indicator while checking
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center relative">
        {/* Blurred overlay with reduced opacity */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex flex-col justify-center items-center">
          {/* Loading Icon */}
          <svg
            className="animate-spin h-8 w-8 text-neutral-700 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <div className="text-center text-neutral-700 font-['Do_Hyeon'] text-2xl">
            로딩 중...
          </div>
        </div>
      </div>
    );
  }

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === "chat") {
      router.push("/agent");
    } else if (tab === "calendar") {
      router.push("/calendar");
    } else if (tab === "location") {
      router.push("/location");
    } else if (tab === "mypage") {
      router.push("/mypage");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex flex-col items-center relative pt-20">
      <HeaderBar
        title={
          <div className="select-none">
            {currentDate.getFullYear()}.
            {String(currentDate.getMonth() + 1).padStart(2, "0")}
            <svg
              width="25"
              height="30"
              viewBox="0 4 30 25"
              fill="none"
              className="inline ml-2 cursor-pointer transition-transform duration-300 hover:scale-110"
              onClick={() => setIsMonthSelectorOpen(!isMonthSelectorOpen)}
            >
              <path
                d="M15 22C15 22 6 11 6 11C6 11 24 11 24 11C24 11 15 22 15 22Z"
                fill="#FCD34D"
                stroke="#FCD34D"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        }
        showBackButton={false}
      />

      {/* Month selector dropdown */}
      {isMonthSelectorOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[90px] w-[220px] bg-gray-50 rounded-3xl shadow-2xl p-5 grid grid-cols-3 gap-3 z-50 border-2 border-gray-200">
          {months.map((month, index) => (
            <div
              key={month}
              onClick={() => handleMonthSelect(index)}
              className={`p-2 text-base cursor-pointer rounded-xl transition-colors duration-150 text-center select-none
                ${
                  currentDate.getMonth() === index
                    ? "bg-gray-300 text-gray-800 font-bold border-2 border-gray-400"
                    : "text-gray-700 border-2 border-transparent"
                }
                hover:bg-gray-200 hover:text-gray-900`}
            >
              {month}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-1 items-center justify-center w-full px-2 sm:px-4">
        <div className="w-full max-w-md">
          <Calendar currentDate={currentDate} setCurrentDate={setCurrentDate} />
        </div>
      </div>
      <TabBar
        activeTab={activeTab as Tab}
        tabs={["chat", "calendar", "location", "mypage"]}
        onTabClick={handleTabClick}
      />
    </div>
  );
}
