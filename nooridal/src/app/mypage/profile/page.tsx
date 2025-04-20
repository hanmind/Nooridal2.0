"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useProfile } from "@/app/context/ProfileContext";

declare global {
  interface Window {
    daum: any;
  }
}

export default function ProfileManagement() {
  const router = useRouter();
  const { profileImage, setProfileImage } = useProfile();
  const [idDuplicate, setIdDuplicate] = useState<boolean | null>(null);
  const [phoneDuplicate, setPhoneDuplicate] = useState<boolean | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [address, setAddress] = useState("경기도 땡땡시 땡땡구");
  const inviteCode = "fkdi38fshl12";
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showEditOptions, setShowEditOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Daum 우편번호 서비스 스크립트 로드
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.head.appendChild(script);

    // 저장된 프로필 이미지 불러오기
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleAddressSearch = () => {
    if (window.daum) {
      new window.daum.Postcode({
        oncomplete: function(data: any) {
          let fullAddress = data.address;
          let extraAddress = '';

          if (data.addressType === 'R') {
            if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
              extraAddress += data.bname;
            }
            if (data.buildingName !== '' && data.apartment === 'Y') {
              extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            if (extraAddress !== '') {
              fullAddress += ` (${extraAddress})`;
            }
          }

          setAddress(fullAddress);
        }
      }).open();
    }
  };

  const checkIdDuplicate = () => {
    // 실제로는 API 호출을 통해 중복 여부를 확인해야 합니다.
    // 여기서는 예시로 랜덤하게 중복 여부를 결정합니다.
    const isDuplicate = Math.random() > 0.5;
    setIdDuplicate(isDuplicate);
    
    // 3초 후에 상태 초기화
    setTimeout(() => {
      setIdDuplicate(null);
    }, 3000);
  };

  const checkPhoneDuplicate = () => {
    // 실제로는 API 호출을 통해 중복 여부를 확인해야 합니다.
    // 여기서는 예시로 랜덤하게 중복 여부를 결정합니다.
    const isDuplicate = Math.random() > 0.5;
    setPhoneDuplicate(isDuplicate);
    
    // 3초 후에 상태 초기화
    setTimeout(() => {
      setPhoneDuplicate(null);
    }, 3000);
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const handleProfileClick = () => {
    if (profileImage) {
      // 이미 프로필 이미지가 있는 경우 편집 옵션 표시
      setShowEditOptions(!showEditOptions);
      setShowProfileOptions(false);
    } else {
      // 프로필 이미지가 없는 경우 등록 옵션 표시
      setShowProfileOptions(!showProfileOptions);
      setShowEditOptions(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setProfileImage(imageData);
        setShowProfileOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteProfile = () => {
    setProfileImage(null);
    setShowEditOptions(false);
  };

  const handleEditProfile = () => {
    setShowEditOptions(false);
    setShowProfileOptions(true);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSaveChanges = () => {
    // 여기에 저장 로직을 추가할 수 있습니다.
    router.push('/mypage'); // 마이페이지로 이동
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[874px] relative bg-[#FFF4BB] overflow-hidden">
        <div className="w-96 h-[550px] left-[0px] top-[126px] absolute bg-white rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)]" />
        <div className="left-[148px] top-[65px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">내 정보 관리</div>
        <button 
          onClick={() => router.back()}
          className="left-[24px] top-[63px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Inter'] leading-[50px]"
        >
          &lt;
        </button>

        {/* 프로필 사진 영역 */}
        <div 
          className="w-16 h-16 left-[52px] top-[163px] absolute bg-gray-200 rounded-full relative cursor-pointer"
          onClick={handleProfileClick}
        >
          {profileImage ? (
            <img 
              src={profileImage} 
              alt="프로필 이미지" 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#9CA3AF"/>
            </svg>
          )}
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15.2C13.7673 15.2 15.2 13.7673 15.2 12C15.2 10.2327 13.7673 8.8 12 8.8C10.2327 8.8 8.8 10.2327 8.8 12C8.8 13.7673 10.2327 15.2 12 15.2Z" fill="#6B7280"/>
              <path d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z" fill="#6B7280"/>
            </svg>
          </div>
          
          {/* 프로필 옵션 팝업 */}
          {showProfileOptions && (
            <div className="absolute left-0 top-20 w-32 bg-white rounded-lg shadow-lg z-10">
              <div 
                className="p-2 text-center text-sm font-['Do_Hyeon'] hover:bg-green-50 cursor-pointer text-emerald-400"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
              >
                사진 등록
              </div>
              <div 
                className="p-2 text-center text-sm font-['Do_Hyeon'] hover:bg-gray-100 cursor-pointer text-gray-400"
                onClick={() => setShowProfileOptions(false)}
              >
                취소
              </div>
            </div>
          )}
          
          {/* 편집 옵션 팝업 */}
          {showEditOptions && (
            <div className="absolute left-0 top-20 w-32 bg-white rounded-lg shadow-lg z-10">
              <div 
                className="p-2 text-center text-sm font-['Do_Hyeon'] hover:bg-blue-50 cursor-pointer text-sky-400"
                onClick={handleEditProfile}
              >
                수정
              </div>
              <div 
                className="p-2 text-center text-sm font-['Do_Hyeon'] hover:bg-red-50 cursor-pointer text-rose-400"
                onClick={handleDeleteProfile}
              >
                삭제
              </div>
              <div 
                className="p-2 text-center text-sm font-['Do_Hyeon'] hover:bg-gray-100 cursor-pointer text-gray-400"
                onClick={() => setShowEditOptions(false)}
              >
                취소
              </div>
            </div>
          )}
          
          {/* 숨겨진 파일 입력 */}
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {/* 이름과 초대 코드 */}
        <div className="w-32 h-9 left-[200px] top-[156px] absolute bg-white rounded-lg border border-zinc-300" />
        <div className="w-32 h-9 left-[200px] top-[198px] absolute bg-gray-200 rounded-lg border border-zinc-300" />
        <div className="left-[143px] top-[150px] absolute text-center justify-start text-black text-base font-normal font-['Do_Hyeon'] leading-[50px]">이     름</div>
        <div className="left-[142px] top-[191px] absolute text-center justify-start text-black text-sm font-normal font-['Do_Hyeon'] leading-[50px]">초대 코드</div>
        <div className="w-16 h-4 left-[192px] top-[150px] absolute text-center justify-start text-black text-base font-normal font-['Do_Hyeon'] leading-[50px]">홍길동</div>
        <div className="w-20 h-4 left-[209px] top-[191px] absolute text-center justify-start text-black text-base font-normal font-['Do_Hyeon'] leading-[50px]">{inviteCode}</div>
        <button 
          onClick={copyInviteCode}
          className="w-6 h-6 left-[335px] top-[207px] absolute cursor-pointer"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="#6366F1"/>
          </svg>
        </button>
        {copySuccess && (
          <div className="absolute left-[200px] top-[240px] text-sm text-green-600 font-['Do_Hyeon']">
            복사 완료
          </div>
        )}

        {/* 아이디 */}
        <div className={`w-[280px] h-9 left-[60px] top-[283px] absolute rounded-[10px] border ${idDuplicate === true ? 'bg-red-100 border-red-300' : idDuplicate === false ? 'bg-green-100 border-green-300' : 'bg-white border-zinc-300'}`} />
        <div className="w-24 h-5 left-[60px] top-[248px] absolute text-left justify-start text-neutral-700 text-sm font-normal font-['Do_Hyeon'] leading-[50px]">아이디</div>
        <div className="w-52 h-11 left-[-4px] top-[275px] absolute text-center justify-start text-neutral-400 text-xs font-normal font-['Do_Hyeon'] leading-[50px]">nooridal</div>
        <div data-property-1="Default" className="w-16 h-9 left-[274px] top-[275px] absolute" onClick={checkIdDuplicate}>
          <div className="w-16 h-6 left-0 top-[13px] absolute bg-yellow-200 rounded-[10px]" />
          <div className="w-14 h-3.5 left-[4px] top-0 absolute text-center justify-start text-black text-xs font-normal font-['Do_Hyeon'] leading-[50px]">중복확인</div>
        </div>

        {/* 비밀번호 */}
        <div className="w-[280px] h-9 left-[60px] top-[344px] absolute bg-white rounded-[10px] border border-zinc-300" />
        <div className="w-24 h-5 left-[60px] top-[309px] absolute text-left justify-start text-neutral-700 text-sm font-normal font-['Do_Hyeon'] leading-[50px]">비밀번호</div>
        <div className="w-52 h-11 left-[5px] top-[338px] absolute text-center justify-start text-neutral-400 text-xs font-normal font-['Do_Hyeon'] leading-[50px]">********</div>

        {/* 이메일 */}
        <div className="w-[280px] h-9 left-[60px] top-[406px] absolute bg-gray-200 rounded-[10px] border border-zinc-300" />
        <div className="w-28 h-5 left-[60px] top-[371px] absolute text-left justify-start text-neutral-700 text-sm font-normal font-['Do_Hyeon'] leading-[50px]">이메일</div>
        <div className="w-52 h-2 left-[22px] top-[399px] absolute text-center justify-start text-stone-500 text-xs font-normal font-['Do_Hyeon'] leading-[50px]">user@example.com</div>
        <div className="w-44 h-8 left-[43px] top-[426px] absolute text-center justify-start text-neutral-400 text-xs font-normal font-['Do_Hyeon'] leading-[50px]">이메일은 변경할 수 없습니다</div>

        {/* 전화번호 */}
        <div className={`w-[280px] h-9 left-[60px] top-[483px] absolute rounded-[10px] border ${phoneDuplicate === true ? 'bg-red-100 border-red-300' : phoneDuplicate === false ? 'bg-green-100 border-green-300' : 'bg-white border-zinc-300'}`} />
        <div className="w-24 h-5 left-[60px] top-[448px] absolute text-left justify-start text-neutral-700 text-sm font-normal font-['Do_Hyeon'] leading-[50px]">전화번호</div>
        <div className="w-52 h-11 left-[15px] top-[476px] absolute text-center justify-start text-neutral-400 text-xs font-normal font-['Do_Hyeon'] leading-[50px]">010-1234-5678</div>
        <div data-property-1="Default" className="w-16 h-9 left-[274px] top-[475px] absolute" onClick={checkPhoneDuplicate}>
          <div className="w-16 h-6 left-0 top-[13px] absolute bg-yellow-200 rounded-[10px]" />
          <div className="w-14 h-3.5 left-[4px] top-0 absolute text-center justify-start text-black text-xs font-normal font-['Do_Hyeon'] leading-[50px]">중복확인</div>
        </div>

        {/* 주소 */}
        <div className="w-24 h-5 left-[60px] top-[525px] absolute text-left justify-start text-neutral-700 text-sm font-normal font-['Do_Hyeon'] leading-[50px]">주소</div>
        <div className="w-[280px] h-9 left-[60px] top-[560px] absolute bg-white rounded-[10px] border border-zinc-300" />
        <div className="w-44 h-4 left-[40px] top-[554px] absolute text-center justify-start text-neutral-400 text-xs font-normal font-['Do_Hyeon'] leading-[50px]">{address}</div>
        <div data-property-1="Default" className="w-16 h-9 left-[274px] top-[552px] absolute">
          <div className="w-16 h-6 left-0 top-[13px] absolute bg-yellow-200 rounded-[10px]" />
          <div 
            className="w-14 h-3.5 left-[4px] top-0 absolute text-center justify-start text-black text-xs font-normal font-['Do_Hyeon'] leading-[50px] cursor-pointer"
            onClick={handleAddressSearch}
          >
            검색
          </div>
        </div>

        {/* 수정 버튼 */}
        <div 
          className="w-11 h-10 left-[177.58px] top-[615px] absolute bg-sky-200 rounded-full cursor-pointer"
          onClick={handleSaveChanges}
        />
        <div className="w-9 h-7 left-[161px] top-[622.49px] absolute bg-sky-200 rounded-full" />
        <div className="w-9 h-7 left-[173.67px] top-[634.26px] absolute bg-sky-200 rounded-full" />
        <div className="w-9 h-7 left-[195.12px] top-[634.26px] absolute bg-sky-200 rounded-full" />
        <div className="w-9 h-7 left-[204.88px] top-[622.49px] absolute bg-sky-200 rounded-full" />
        <div 
          className="w-6 h-9 left-[188px] top-[614px] absolute text-center justify-start text-black text-sm font-normal font-['Do_Hyeon'] leading-[50px] cursor-pointer"
          onClick={handleSaveChanges}
        >
          수정
        </div>

        {/* 탈퇴하기 */}
        <div className="w-36 h-6 left-[131px] top-[669px] absolute text-center justify-start text-neutral-400/60 text-base font-normal font-['Do_Hyeon'] leading-[50px]">탈퇴하기</div>

        {/* 하단 네비게이션 바 */}
        <div className="absolute bottom-0 w-full">
          <div className="w-[462px] h-52 relative">
            <div className="w-44 h-44 left-[-24px] top-[742px] absolute bg-white rounded-full" />
            <div className="w-44 h-44 left-[109px] top-[742px] absolute bg-white rounded-full" />
            <div className="w-44 h-44 left-[250px] top-[742px] absolute bg-white rounded-full" />
            <div className="w-44 h-44 left-[-28px] top-[723px] absolute bg-white/40 rounded-full" />
            <div className="w-44 h-44 left-[105px] top-[723px] absolute bg-white/40 rounded-full" />
            <div className="w-44 h-44 left-[246px] top-[723px] absolute bg-white/40 rounded-full" />
            
            {/* 채팅 아이콘 */}
            <svg className="w-8 h-8 left-[52.71px] top-[786px] absolute" fill="none" stroke="#979595" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            
            {/* 캘린더 아이콘 */}
            <svg className="w-8 h-8 left-[140.75px] top-[787.34px] absolute" fill="none" stroke="#979595" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            
            {/* 위치 아이콘 */}
            <svg className="w-8 h-8 left-[222px] top-[784px] absolute" fill="none" stroke="#979595" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            
            {/* 마이페이지 아이콘 */}
            <svg className="w-8 h-8 left-[323.75px] top-[787px] absolute" fill="none" stroke="#FDB813" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>

            {/* 네비게이션 텍스트 */}
            <div className="w-20 h-16 left-[25px] top-[803px] absolute text-center justify-start text-[#979595] text-xs font-normal font-['Do_Hyeon'] leading-[50px]">채팅</div>
            <div className="w-9 h-8 left-[138px] top-[803px] absolute text-center justify-start text-[#979595] text-xs font-normal font-['Do_Hyeon'] leading-[50px]">캘린더</div>
            <div className="w-20 h-10 left-[201px] top-[802.60px] absolute text-center justify-start text-[#979595] text-xs font-normal font-['Do_Hyeon'] leading-[50px]">위치</div>
            <div className="w-20 h-10 left-[293px] top-[802.60px] absolute text-center justify-start text-yellow-400 text-xs font-normal font-['Do_Hyeon'] leading-[50px]">마이페이지</div>
          </div>
        </div>
      </div>
    </div>
  );
} 