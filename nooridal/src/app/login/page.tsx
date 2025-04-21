"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [showIdFindModal, setShowIdFindModal] = useState(false);
  const [showPwFindModal, setShowPwFindModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [foundId, setFoundId] = useState("");
  const [showFoundId, setShowFoundId] = useState(false);
  const [email, setEmail] = useState("");
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [showPwReset, setShowPwReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    // 로그인 버튼 클릭 시 캘린더 화면으로 이동
    router.push('/calendar');
  };

  const handleIdFind = () => {
    // 실제로는 서버에서 아이디를 조회하는 로직이 들어갈 것입니다.
    // 여기서는 예시로 "test123"이라는 아이디를 찾았다고 가정합니다.
    const id = "test123";
    setFoundId(id);
    setShowFoundId(true);
  };

  const handlePwFindRequest = () => {
    // 실제로는 서버에 이메일 전송 요청을 보내는 로직이 들어갈 것입니다.
    setShowVerificationCode(true);
  };

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
        <div 
          className="w-80 h-9 left-[51px] top-[430px] absolute bg-yellow-200 rounded-[20px] cursor-pointer"
          onClick={handleLogin}
        >
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
        <div className="absolute w-full flex justify-center items-center gap-4 top-[522px]">
          <button 
            onClick={() => setShowIdFindModal(true)}
            className="text-black text-base font-['Do_Hyeon']"
          >
            ID 찾기
          </button>
          <div className="w-0.5 h-5 bg-neutral-400"></div>
          <button 
            onClick={() => setShowPwFindModal(true)}
            className="text-black text-base font-['Do_Hyeon']"
          >
            PW 찾기
          </button>
          <div className="w-0.5 h-5 bg-neutral-400"></div>
          <button 
            onClick={() => router.push('/register')}
            className="text-yellow-400 text-base font-['Do_Hyeon']"
          >
            회원가입
          </button>
        </div>

        {/* ID 찾기 모달 */}
        {showIdFindModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="w-96 h-[874px] relative bg-[#FFF4BB] overflow-hidden flex justify-center items-center">
              <Image
                className="w-full h-full object-cover absolute"
                src="/images/logo/아이디찾기 배경.png"
                alt="ID 찾기 배경"
                width={384}
                height={874}
              />
              <div className="w-32 h-14 left-[132px] top-[86.85px] absolute bg-white rounded-full" />
              <div className="w-24 h-14 left-[210px] top-[97.63px] absolute bg-white rounded-full" />
              <div className="w-24 h-14 left-[111px] top-[79px] absolute bg-white rounded-full" />
              <div className="w-24 h-14 left-[174px] top-[79px] absolute bg-white rounded-full" />
              <div className="w-24 h-14 left-[185px] top-[116.27px] absolute bg-white rounded-full" />
              <div className="w-20 h-14 left-[78px] top-[97.63px] absolute bg-white rounded-full" />
              <div className="w-20 h-14 left-[145px] top-[121.17px] absolute bg-white rounded-full" />
              <div className="w-20 h-14 left-[93px] top-[116.27px] absolute bg-white rounded-full" />
              <div className="w-24 h-12 left-[147px] top-[107.44px] absolute text-center justify-start text-black text-lg font-normal font-['Do_Hyeon'] leading-[50px]">아이디 찾기</div>
              <div className="w-96 h-80 left-[0px] top-[305px] absolute bg-white rounded-[20px] border-[3px] border-neutral-400" />
              <div className="w-14 h-9 left-[42px] top-[326px] absolute text-center justify-start text-black text-xl font-normal font-['Do_Hyeon'] leading-[50px]">닉네임</div>
              <div className="w-80 h-9 left-[41px] top-[368.68px] absolute bg-white rounded-[20px] border border-neutral-400" />
              <div className="w-36 h-9 left-[37px] top-[363px] absolute text-center justify-start text-neutral-400 text-base font-normal font-['Do_Hyeon'] leading-[50px]">닉네임을 입력하세요</div>
              <div className="w-20 h-9 left-[42px] top-[417px] absolute text-center justify-start text-black text-xl font-normal font-['Do_Hyeon'] leading-[50px]">전화번호</div>
              <div className="w-80 h-9 left-[41px] top-[458.68px] absolute bg-white rounded-[20px] border border-neutral-400" />
              <div className="w-72 h-9 left-[32px] top-[454px] absolute text-center justify-start text-neutral-400 text-base font-normal font-['Do_Hyeon'] leading-[50px]">전화번호를 입력하세요 (예:01012345678)</div>

              {/* 아이디 찾기 버튼 */}
              <div className="w-[300px] h-12 left-[42px] top-[540px] absolute">
                <button 
                  onClick={handleIdFind}
                  className="w-full h-full bg-[#FFE999] rounded-[15px] hover:bg-[#FFD966] transition-colors flex items-center justify-center"
                >
                  <div className="text-black text-lg font-['Do_Hyeon']">아이디 찾기</div>
                </button>
              </div>

              {/* 아이디 찾기 결과 */}
              {showFoundId && (
                <div className="w-[350px] h-[100px] left-[17px] top-[200px] absolute bg-[#FFE999] rounded-[30px] flex flex-col items-center justify-center shadow-md">
                  <div className="text-center">
                    <span className="text-black text-lg font-['Do_Hyeon']">아이디</span>
                    <br />
                    <span className="text-black text-2xl font-['Do_Hyeon']">
                      {foundId.substring(0, 2) + '*'.repeat(foundId.length - 2)}
                    </span>
                  </div>
                </div>
              )}

              {/* 로그인으로 돌아가기 버튼 */}
              <button
                onClick={() => {
                  setShowIdFindModal(false);
                  setNickname("");
                  setPhoneNumber("");
                  setFoundId("");
                  setShowFoundId(false);
                }}
                className="w-[300px] text-center left-[42px] top-[600px] absolute text-neutral-700 text-base font-['Do_Hyeon'] hover:text-neutral-900 cursor-pointer"
              >
                로그인으로 돌아가기
              </button>
            </div>
          </div>
        )}

        {/* 비밀번호 찾기 모달 */}
        {showPwFindModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="w-96 h-[874px] relative bg-[#FFF4BB] overflow-hidden">
              <Image
                className="w-full h-full object-cover absolute"
                src="/images/logo/아이디찾기 배경.png"
                alt="비밀번호 찾기 배경"
                width={384}
                height={874}
              />

              {/* 상단 로고 배경 효과들 */}
              <div className="w-32 h-14 left-[132px] top-[86.85px] absolute bg-white rounded-full" />
              <div className="w-24 h-14 left-[210px] top-[97.63px] absolute bg-white rounded-full" />
              <div className="w-24 h-14 left-[111px] top-[79px] absolute bg-white rounded-full" />
              <div className="w-24 h-14 left-[174px] top-[79px] absolute bg-white rounded-full" />
              <div className="w-24 h-14 left-[185px] top-[116.27px] absolute bg-white rounded-full" />
              <div className="w-20 h-14 left-[78px] top-[97.63px] absolute bg-white rounded-full" />
              <div className="w-20 h-14 left-[145px] top-[121.17px] absolute bg-white rounded-full" />
              <div className="w-20 h-14 left-[93px] top-[116.27px] absolute bg-white rounded-full" />
              <div className="w-32 h-12 left-[126px] top-[107px] absolute text-center justify-start text-black text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">비밀번호 찾기</div>

              {/* 비밀번호 재설정 영역 */}
              {showPwReset && (
                <>
                  <div className="w-96 h-[350px] left-0 top-[250px] absolute bg-white rounded-[20px] border-[3px] border-neutral-400" />
                  
                  <div className="w-full flex flex-col items-center absolute top-[250px]">
                    <div className="w-full px-12 mt-8">
                      <div className="text-black text-xl font-['Do_Hyeon'] mb-2">새 비밀번호</div>
                      <div className="w-full">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="새 비밀번호를 입력하세요"
                          className="w-full h-10 px-4 text-neutral-400 text-base font-['Do_Hyeon'] rounded-[20px] border border-neutral-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="w-full px-12 mt-6">
                      <div className="text-black text-xl font-['Do_Hyeon'] mb-2">새 비밀번호 확인</div>
                      <div className="w-full">
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="새 비밀번호를 한 번 더 입력해주세요"
                          className="w-full h-10 px-4 text-neutral-400 text-base font-['Do_Hyeon'] rounded-[20px] border border-neutral-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="w-[300px] mt-6">
                      <button 
                        className="w-full h-12 bg-[#FFE999] rounded-[15px] hover:bg-[#FFD966] transition-colors flex items-center justify-center"
                        onClick={() => {
                          setShowPwFindModal(false);
                          setEmail("");
                          setShowVerificationCode(false);
                          setShowPwReset(false);
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                      >
                        <div className="text-black text-lg font-['Do_Hyeon']">비밀번호 변경</div>
                      </button>
                      <button
                        onClick={() => {
                          setShowPwReset(false);
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                        className="w-full text-center mt-4 text-neutral-700 text-base font-['Do_Hyeon'] hover:text-neutral-900 cursor-pointer"
                      >
                        이전으로
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* 인증번호 입력 영역 */}
              {showVerificationCode && !showPwReset && (
                <>
                  <div className="w-96 h-[250px] left-0 top-[250px] absolute bg-white rounded-[20px] border-[3px] border-neutral-400" />
                  
                  <div className="w-full flex flex-col items-center absolute top-[250px]">
                    <div className="w-full px-12 mt-8">
                      <div className="text-black text-xl font-['Do_Hyeon'] mb-2">인증번호</div>
                      <div className="w-full">
                        <input
                          type="text"
                          placeholder="인증번호를 입력하세요"
                          className="w-full h-10 px-4 text-neutral-400 text-base font-['Do_Hyeon'] rounded-[20px] border border-neutral-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="w-[300px] mt-6">
                      <button 
                        onClick={() => setShowPwReset(true)}
                        className="w-full h-12 bg-[#FFE999] rounded-[15px] hover:bg-[#FFD966] transition-colors flex items-center justify-center"
                      >
                        <div className="text-black text-lg font-['Do_Hyeon']">확인</div>
                      </button>
                      <button
                        onClick={() => {
                          setShowVerificationCode(false);
                        }}
                        className="w-full text-center mt-4 text-neutral-700 text-base font-['Do_Hyeon'] hover:text-neutral-900 cursor-pointer"
                      >
                        이전으로
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* 이메일 입력 영역 */}
              {!showVerificationCode && !showPwReset && (
                <>
                  <div className="w-96 h-[250px] left-0 top-[250px] absolute bg-white rounded-[20px] border-[3px] border-neutral-400" />
                  
                  <div className="w-full flex flex-col items-center absolute top-[250px]">
                    <div className="w-full px-12 mt-8">
                      <div className="text-black text-xl font-['Do_Hyeon'] mb-2">이메일</div>
                      <div className="w-full">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="이메일을 입력하세요"
                          className="w-full h-10 px-4 text-neutral-400 text-base font-['Do_Hyeon'] rounded-[20px] border border-neutral-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="w-[300px] mt-6">
                      <button 
                        onClick={handlePwFindRequest}
                        className="w-full h-12 bg-[#FFE999] rounded-[15px] hover:bg-[#FFD966] transition-colors flex items-center justify-center"
                      >
                        <div className="text-black text-lg font-['Do_Hyeon']">인증요청</div>
                      </button>
                      <button
                        onClick={() => {
                          setShowPwFindModal(false);
                          setEmail("");
                          setShowVerificationCode(false);
                          setShowPwReset(false);
                        }}
                        className="w-full text-center mt-4 text-neutral-700 text-base font-['Do_Hyeon'] hover:text-neutral-900 cursor-pointer"
                      >
                        로그인으로 돌아가기
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 회원가입 분기 모달 */}
        {showSignupModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="w-96 h-[874px] relative bg-[#FFF4BB] overflow-hidden">
              <Image
                className="w-full h-full object-cover absolute"
                src="/images/logo/아이디찾기 배경.png"
                alt="회원가입 배경"
                width={384}
                height={874}
              />

              {/* 흰색 원형 배경 효과들 */}
              <div className="w-32 h-16 left-[135px] top-[96px] absolute bg-white rounded-full blur-[2px]" />
              <div className="w-24 h-16 left-[213px] top-[107px] absolute bg-white rounded-full blur-[2px]" />
              <div className="w-24 h-16 left-[114px] top-[88px] absolute bg-white rounded-full blur-[2px]" />
              <div className="w-24 h-16 left-[177px] top-[88px] absolute bg-white rounded-full blur-[2px]" />
              <div className="w-24 h-16 left-[188px] top-[126px] absolute bg-white rounded-full blur-[2px]" />
              <div className="w-20 h-16 left-[81px] top-[107px] absolute bg-white rounded-full blur-[2px]" />
              <div className="w-20 h-16 left-[148px] top-[131px] absolute bg-white rounded-full blur-[2px]" />
              <div className="w-20 h-16 left-[96px] top-[126px] absolute bg-white rounded-full blur-[2px]" />
              
              {/* 누리달 로고 */}
              <Image
                className="w-32 h-14 left-[135px] top-[109px] absolute"
                src="/images/logo/누리달.png"
                alt="누리달 로고"
                width={134}
                height={55}
              />

              {/* 회원가입 선택 버튼들 */}
              <div className="w-full flex flex-col items-center absolute top-[300px] gap-8">
                <button 
                  onClick={() => {
                    setShowSignupModal(false);
                    // 임산부 회원가입 페이지로 이동하는 로직 추가
                  }}
                  className="w-[300px] h-16 bg-[#B7E5FF] rounded-[30px] hover:bg-[#A3D9F9] transition-all flex items-center justify-center shadow-lg"
                >
                  <div className="text-black text-xl font-['Do_Hyeon']">임산부</div>
                </button>

                <button 
                  onClick={() => {
                    setShowSignupModal(false);
                    // 보호자 회원가입 페이지로 이동하는 로직 추가
                  }}
                  className="w-[300px] h-16 bg-[#B7E5FF] rounded-[30px] hover:bg-[#A3D9F9] transition-all flex items-center justify-center shadow-lg"
                >
                  <div className="text-black text-xl font-['Do_Hyeon']">보호자</div>
                </button>

                <button
                  onClick={() => setShowSignupModal(false)}
                  className="mt-4 text-neutral-700 text-base font-['Do_Hyeon'] hover:text-neutral-900 cursor-pointer"
                >
                  로그인으로 돌아가기
                </button>
              </div>
            </div>
          </div>
        )}

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