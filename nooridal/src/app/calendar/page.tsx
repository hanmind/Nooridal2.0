"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Calendar from "./Calendar";
import TabBar from "../components/TabBar";
import { supabase } from "../../utils/supabase"; // Import Supabase client

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

export default function CalendarPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("calendar");
  const [isLoading, setIsLoading] = useState(true);

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
        console.log("[Auth Check] User found:", user.id, user.email);
        // Check if profile exists in public.users
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("id")
          .eq("user_auth_id", user.id)
          .maybeSingle();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error checking for profile:", profileError);
          setIsLoading(false); // Stop loading on error
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
            user_auth_id: user.id,
            email: user.email,
            name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email ||
              "새 사용자",
            user_type: "pregnant" as const,
            invitation_code: generateInvitationCode(),
          };

          const { error: insertError } = await supabase
            .from("users")
            .insert(newUserProfile);

          if (insertError) {
            console.error("Error creating profile:", insertError);
            // Decide how to handle profile creation error, maybe redirect or show message
            setIsLoading(false); // Stop loading on profile creation error
            return; // Prevent further checks if profile creation fails
          } else {
            console.log(
              "[Auth Check] Profile created successfully for user:",
              user.id
            );
          }
        }
        // --- Add Pregnancy Info Check ---
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
          // Maybe show an error message to the user
          return; // Don't redirect if fetching fails
        }

        console.log("[Pregnancy Check] Pregnancy record count:", count);

        if (count === 0) {
          console.log(
            "[Pregnancy Check] No pregnancy record found. Redirecting..."
          );
          router.push("/register/pregnant/pregnancy-info");
          // No need to set isLoading to false as we are navigating away
        } else {
          console.log("[Pregnancy Check] Pregnancy record found. Staying.");
          setIsLoading(false); // Stop loading only if staying
        }
        // --- End Pregnancy Info Check ---
      } else {
        console.log("[Auth Check] No user session found.");
        // Optional: Redirect to login if no user is found
        // router.push('/login');
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
      <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
        <div className="text-center text-neutral-700 font-['Do_Hyeon']">
          로딩 중...
        </div>
      </div>
    );
  }

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === "chat") {
      window.location.href = "/chat";
    } else if (tab === "calendar") {
      window.location.href = "/calendar";
    } else if (tab === "location") {
      window.location.href = "/location";
    } else if (tab === "mypage") {
      window.location.href = "/mypage";
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <Calendar />
      {/* TabBar Component */}
      <TabBar
        activeTab={activeTab}
        tabs={["chat", "calendar", "location", "mypage"]}
        onTabClick={handleTabClick}
      />
    </main>
  );
}
