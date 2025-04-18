import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white flex justify-center items-center">
      <main className="w-96 h-[874px] relative bg-white overflow-hidden">
        {/* 배경 이미지 */}
        <div className="relative w-full h-full">
          <Image
            src="/images/logo/Group 226.png"
            alt="누리달 배경"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* 시작하기 버튼 */}
        <Link href="/login" className="absolute left-1/2 transform -translate-x-1/2 top-[446px]">
          <Image
            src="/images/logo/시작하기 버튼.png"
            alt="시작하기"
            width={128}
            height={48}
            className="cursor-pointer hover:opacity-90 transition-opacity"
          />
        </Link>
      </main>
    </div>
  );
}
