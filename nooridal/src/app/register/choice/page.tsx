"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RegisterChoice() {
  const router = useRouter();

  const handleTypeSelect = (type: 'pregnant' | 'guardian') => {
    // TODO: 선택된 타입에 따라 회원가입 페이지로 이동
    router.push(`/register/${type}`);
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[874px] relative bg-[#FFF4BB] overflow-hidden flex justify-center items-center">
        <Image
          className="w-full h-full object-cover absolute"
          src="/images/logo/분기 배경.png"
          alt="회원가입 분기 배경"
          width={384}
          height={874}
        />
        <div className="w-32 h-16 left-[135px] top-[96px] absolute bg-white rounded-full blur-[2px]" />
        <div className="w-24 h-16 left-[213px] top-[107px] absolute bg-white rounded-full blur-[2px]" />
        <div className="w-24 h-16 left-[114px] top-[88px] absolute bg-white rounded-full blur-[2px]" />
        <div className="w-24 h-16 left-[177px] top-[88px] absolute bg-white rounded-full blur-[2px]" />
        <div className="w-24 h-16 left-[188px] top-[126px] absolute bg-white rounded-full blur-[2px]" />
        <div className="w-20 h-16 left-[81px] top-[107px] absolute bg-white rounded-full blur-[2px]" />
        <div className="w-20 h-16 left-[148px] top-[131px] absolute bg-white rounded-full blur-[2px]" />
        <div className="w-20 h-16 left-[96px] top-[126px] absolute bg-white rounded-full blur-[2px]" />
        <Image
          className="w-32 h-14 left-[135px] top-[109px] absolute"
          src="/images/logo/누리달.png"
          alt="누리달 로고"
          width={134}
          height={55}
        />

        {/* 임산부 선택 버튼 */}
        <button
          onClick={() => handleTypeSelect('pregnant')}
          className="absolute left-[115px] top-[382px] w-[208px] h-[288px] bg-transparent"
        >
          <Image
            src="/images/logo/임산부 버튼.png"
            alt="임산부 선택"
            width={208}
            height={288}
            className="w-full h-full object-contain"
          />
        </button>

        {/* 보호자 선택 버튼 */}
        <button
          onClick={() => handleTypeSelect('guardian')}
          className="absolute left-[115px] top-[630px] w-[208px] h-[288px] bg-transparent"
        >
          <Image
            src="/images/logo/보호자 버튼.png"
            alt="보호자 선택"
            width={208}
            height={288}
            className="w-full h-full object-contain"
          />
        </button>

        {/* 로그인으로 돌아가기 버튼 */}
        <button
          onClick={() => router.push('/login')}
          className="w-[300px] text-center left-[35px] top-[800px] absolute text-neutral-700 text-base font-['Do_Hyeon'] hover:text-neutral-900 cursor-pointer"
        >
          로그인으로 돌아가기
        </button>
      </div>
    </div>
  );
} 