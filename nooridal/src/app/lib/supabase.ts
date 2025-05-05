import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 현재 로그인한 사용자 정보 가져오기
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('사용자 정보를 가져오는데 실패했습니다:', error);
      return null;
    }
    return user;
  } catch (err) {
    console.error('사용자 정보를 가져오는 중 예상치 못한 오류가 발생했습니다:', err);
    return null;
  }
};

// 개발 환경에서만 디버깅 정보 출력
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase 클라이언트가 초기화되었습니다.');
}