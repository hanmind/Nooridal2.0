import Image from "next/image";

export default function Login() {
  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[874px] relative bg-[#FFF4BB] overflow-hidden">
        <Image
          className="w-40 h-20 left-[-686px] top-[354px] absolute"
          src="/images/logo/누리달.png"
          alt="누리달 로고"
          width={163}
          height={84}
        />
        
        {/* 흰색 배경 카드 */}
        <div className="w-96 h-[507px] left-[23px] top-[229px] absolute bg-white rounded-[20px] blur-[2px]" />
        
        {/* 로그인 버튼 */}
        <div className="w-80 h-9 left-[51px] top-[430px] absolute bg-yellow-200 rounded-[20px]">
          <div className="w-64 h-10 left-[23px] top-[-4px] absolute text-center text-neutral-700 text-lg font-['Do_Hyeon'] leading-[50px]">로그인</div>
        </div>

        {/* 입력 필드 레이블 */}
        <div className="w-14 h-8 left-[50px] top-[245.65px] absolute text-black/70 text-lg font-['Do_Hyeon'] leading-[50px]">아이디</div>
        <div className="w-20 h-9 left-[43px] top-[323px] absolute text-black/70 text-lg font-['Do_Hyeon'] leading-[50px]">비밀번호</div>

        {/* 입력 필드 */}
        <div className="w-80 h-8 left-[50px] top-[288px] absolute bg-white rounded-[20px] border border-zinc-300">
          <input 
            type="text"
            placeholder="아이디를 입력하세요"
            className="w-full h-full px-4 text-neutral-400 text-base font-['Do_Hyeon'] rounded-[20px] focus:outline-none"
          />
        </div>
        <div className="w-80 h-8 left-[51px] top-[367px] absolute bg-white rounded-[20px] border border-zinc-300">
          <input 
            type="password"
            placeholder="비밀번호를 입력하세요"
            className="w-full h-full px-4 text-neutral-400 text-base font-['Do_Hyeon'] rounded-[20px] focus:outline-none"
          />
        </div>

        {/* 로그인 유지 체크박스 */}
        <div className="flex items-center gap-2 absolute left-[59px] top-[489px]">
          <input type="checkbox" className="w-4 h-4 rounded-[3px] border border-neutral-700" />
          <span className="text-black text-sm font-['Do_Hyeon']">로그인 유지</span>
        </div>

        {/* 간편 로그인 섹션 */}
        <div className="w-full absolute top-[585px]">
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-0.5 bg-zinc-300"></div>
            <div className="px-4 text-stone-500 text-base font-['Do_Hyeon']">간편 로그인</div>
            <div className="w-24 h-0.5 bg-zinc-300"></div>
          </div>
          
          {/* 소셜 로그인 버튼들 */}
          <div className="flex justify-center items-center gap-8 mt-8">
            <button className="w-12 h-12 flex items-center justify-center">
              <Image
                src="/images/logo/구글.png"
                alt="구글 로그인"
                width={47}
                height={47}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>
            <button className="w-12 h-12 flex items-center justify-center">
              <Image
                src="/images/logo/카카오.png"
                alt="카카오 로그인"
                width={47}
                height={47}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>
            <button className="w-12 h-12 flex items-center justify-center">
              <Image
                src="/images/logo/네이버.png"
                alt="네이버 로그인"
                width={47}
                height={47}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>
          </div>
        </div>

        {/* 하단 링크들 */}
        <div className="absolute w-full flex justify-center gap-4 top-[522px]">
          <button className="text-black text-base font-['Do_Hyeon']">ID 찾기</button>
          <div className="w-0.5 h-5 bg-neutral-400"></div>
          <button className="text-black text-base font-['Do_Hyeon']">PW 찾기</button>
          <div className="w-0.5 h-5 bg-neutral-400"></div>
          <button className="text-yellow-400 text-base font-['Do_Hyeon']">회원가입</button>
        </div>

        {/* 상단 로고 배경 효과 */}
        <div className="absolute top-[88px] left-[81px] w-[200px]">
          <div className="relative">
            <div className="absolute w-32 h-16 bg-white rounded-full blur-[2px]" style={{left: '54px', top: '8px'}} />
            <div className="absolute w-24 h-16 bg-white rounded-full blur-[2px]" style={{left: '132px', top: '19px'}} />
            <div className="absolute w-24 h-16 bg-white rounded-full blur-[2px]" style={{left: '33px', top: '0px'}} />
            <div className="absolute w-24 h-16 bg-white rounded-full blur-[2px]" style={{left: '96px', top: '0px'}} />
            <div className="absolute w-24 h-16 bg-white rounded-full blur-[2px]" style={{left: '107px', top: '38px'}} />
            <div className="absolute w-20 h-16 bg-white rounded-full blur-[2px]" style={{left: '0px', top: '19px'}} />
            <div className="absolute w-20 h-16 bg-white rounded-full blur-[2px]" style={{left: '67px', top: '43px'}} />
            <div className="absolute w-20 h-16 bg-white rounded-full blur-[2px]" style={{left: '15px', top: '38px'}} />
            <Image
              className="absolute w-32 h-14"
              style={{left: '54px', top: '21px'}}
              src="/images/logo/누리달.png"
              alt="누리달 로고"
              width={134}
              height={55}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 