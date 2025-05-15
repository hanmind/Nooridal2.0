"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const handleGuardianClick = () => {
    router.push("/register/guardian/invitation");
  };

  const handlePregnantClick = () => {
    router.push("/register/pregnant");
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-8 bg-pink-50">
      <main className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center space-y-8">
        {/* 누리달 로고 */}
        <Image
          src="/images/logo/로고 구름.png"
          alt="누리달"
          width={144}
          height={58}
        />

        <div className="text-2xl font-['Do_Hyeon']">회원가입</div>
        <button
          onClick={handlePregnantClick}
          className="w-64 h-16 bg-[#FADADD] rounded-[30px] shadow-lg hover:bg-[#F8C8DC] hover:scale-105 transition-transform duration-300 text-black text-xl font-['Do_Hyeon']"
        >
          임산부
        </button>
        <button
          onClick={handleGuardianClick}
          className="w-64 h-16 bg-white border-2 border-[#FADADD] rounded-[30px] shadow-lg hover:bg-[#F8C8DC] hover:scale-105 transition-transform duration-300 text-black text-xl font-['Do_Hyeon']"
        >
          보호자
        </button>
        <div className="flex items-center space-x-2 pt-4">
          <span className="text-black text-sm font-['Do_Hyeon']">
            이미 계정이 있으신가요?
          </span>
          <button
            onClick={() => router.push("/login")}
            className="text-yellow-500 text-sm font-['Do_Hyeon'] hover:underline"
          >
            로그인하기
          </button>
        </div>
      </main>
    </div>
  );
}
