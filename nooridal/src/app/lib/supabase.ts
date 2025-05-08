import { createClient } from "@supabase/supabase-js";
import { Database } from "../../../types_db"; // Adjusted path based on potential location

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL or Anon Key is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your environment variables."
  );
  // Optionally, you could throw an error here if Supabase is critical for the app to run
  // throw new Error('Supabase configuration is missing.');
}

// Create a single supabase client instance (usually for client-side)
export const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!); // Use non-null assertion operator

// Function to create a new client (can be used for server components/routes if needed,
// though Supabase SSR helpers might be preferred for server-side auth)
export const createServerSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!url || !key) {
    console.warn("Server Supabase Client: URL or Key missing.");
    // Consider throwing an error or returning a dummy client
  }
  return createClient<Database>(url!, key!); // Use non-null assertion operator
};

// 현재 로그인한 사용자 정보 가져오기
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error("사용자 정보를 가져오는데 실패했습니다:", error);
      return null;
    }
    return user;
  } catch (err) {
    console.error(
      "사용자 정보를 가져오는 중 예상치 못한 오류가 발생했습니다:",
      err
    );
    return null;
  }
};

// 개발 환경에서만 디버깅 정보 출력
if (process.env.NODE_ENV === "development") {
  console.log("Supabase 클라이언트가 초기화되었습니다.");
}
