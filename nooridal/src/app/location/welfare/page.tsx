"use client";

import { useRouter } from "next/navigation";
import { useAddress } from "@/app/context/AddressContext";
import { useState } from "react";
import HeaderBar from "@/app/components/HeaderBar";

// 카카오맵 타입 정의
declare global {
  interface Window {
    kakao: any;
  }
}

export default function WelfarePage() {
  const router = useRouter();
  const { address, setAddress } = useAddress();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [showParentalInfo, setShowParentalInfo] = useState(false);
  const [showCareerInfo, setShowCareerInfo] = useState(false);

  // 주소를 동까지만 표시하는 함수
  const getShortAddress = (fullAddress: string) => {
    if (!fullAddress) return "";

    const match = fullAddress.match(/([가-힣]+(동|읍|면|리))/);
    if (match) {
      const index = fullAddress.indexOf(match[0]) + match[0].length;
      return fullAddress.substring(0, index);
    }

    return fullAddress;
  };

  // 주소 수정 함수
  const handleAddressEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.daum) {
      new window.daum.Postcode({
        oncomplete: function (data: any) {
          let fullAddress = data.jibunAddress;
          if (!fullAddress) {
            fullAddress = data.address;
          }

          let extraAddress = "";
          if (data.addressType === "R") {
            if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
              extraAddress += data.bname;
            }
            if (data.buildingName !== "") {
              extraAddress +=
                extraAddress !== ""
                  ? ", " + data.buildingName
                  : data.buildingName;
            }
            if (extraAddress !== "") {
              fullAddress += ` (${extraAddress})`;
            }
          }

          setAddress(fullAddress);
        },
      }).open();
    }
  };

  const welfareTypes = [
    {
      id: "career",
      title: "여성 경력 단절 사업",
      icon: "💼",
      description: "경력 단절 여성 재취업 지원",
    },
    {
      id: "parental",
      title: "육아 휴직 정보",
      icon: "👶",
      description: "육아 휴직 제도 및 지원 정보",
    },
    {
      id: "center",
      title: "여성새로일하기센터 찾기",
      icon: "🏢",
      description: "취업지원 서비스를 제공하는 여성새로일하기센터 안내",
    },
    {
      id: "single-parent",
      title: "한부모가족복지시설 찾기",
      icon: "👨‍👧",
      description:
        "전국 출산/양육/생활지원시설 및 일시지원복지시설/한부모가족복지상담소 안내",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB]">
      <div className="w-full h-[900px] relative bg-[#FFF4BB] overflow-hidden">
        {/* 헤더 */}
        <HeaderBar title="복지" backUrl="/location" />

        {/* Current Location Section */}
        <div className="w-[360px] h-[100px] mx-auto mt-8 bg-white rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)]">
          <div className="flex items-start p-6">
            <div className="mr-4">
              <svg
                className="w-14 h-14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  fill="#000"
                />
              </svg>
            </div>

            <div className="flex-1 flex flex-col items-center">
              <div className="text-center ml-[-60px] mb-2 -mt-2">
                <span className="text-sm font-['Do_Hyeon'] text-yellow-400">
                  현재 설정 위치
                </span>
              </div>

              <div className="flex ml-[-30px] items-center justify-between w-full">
                <div className="text-xl font-['Do_Hyeon'] text-center flex-1">
                  {getShortAddress(address)}
                </div>
                <button
                  onClick={handleAddressEdit}
                  className="text-sm font-['Do_Hyeon'] cursor-pointer hover:text-yellow-400 ml-2"
                >
                  수정
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 복지 유형 선택 */}
        <div className="mx-auto mt-2 w-[360px] space-y-4">
          {welfareTypes.map((type) => (
            <div key={type.id}>
              {type.id === "career" && (
                <div className="border-t border-dashed border-gray-300 my-6" />
              )}
              <div
                className={`p-6 rounded-3xl shadow-sm cursor-pointer transition-all duration-300 ${
                  selectedType === type.id
                    ? "bg-purple-100 border-2 border-purple-200"
                    : "bg-white hover:bg-purple-50"
                }`}
                onClick={() => {
                  if (type.id === "center") {
                    router.push("/location/welfare/centers");
                  } else if (type.id === "single-parent") {
                    router.push("/location/welfare/single-parent");
                  } else {
                    setSelectedType(type.id);
                  }
                }}
              >
                <div className="flex items-center">
                  <div className="text-4xl mr-4">{type.icon}</div>
                  <div>
                    <div className="text-xl font-['Do_Hyeon']">
                      {type.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">
                      {type.description}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 선택된 복지 유형에 따른 추가 정보 표시 */}
        {selectedType && (
          <>
            {/* 반투명 배경 */}
            <div
              className="fixed inset-0 bg-black/50 z-10"
              onClick={() => {
                setSelectedType(null);
                setShowContactPopup(false);
                setShowParentalInfo(false);
                setShowCareerInfo(false);
              }}
            />
            {/* 정보 상자 */}
            <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[360px] p-8 bg-white rounded-3xl shadow-sm z-20">
              <div className="text-center font-['Do_Hyeon'] text-2xl mb-8">
                {welfareTypes.find((t) => t.id === selectedType)?.title}
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="font-['Do_Hyeon'] flex items-center">
                    <span>🕹️ 정보 찾기</span>
                  </div>
                  {selectedType === "parental" && (
                    <button
                      className="mt-2 px-4 py-2 bg-purple-200 text-gray-900 rounded-[10px] font-['Do_Hyeon'] hover:bg-purple-300 transition-colors"
                      onClick={() => setShowParentalInfo(true)}
                    >
                      육아휴직제도 안내 보기
                    </button>
                  )}
                  {selectedType === "career" && (
                    <button
                      className="mt-2 px-4 py-2 bg-purple-200 text-gray-900 rounded-[10px] font-['Do_Hyeon'] hover:bg-purple-300 transition-colors"
                      onClick={() => setShowCareerInfo(true)}
                    >
                      경력단절 예방 및 재취업 지원 안내
                    </button>
                  )}
                </div>
                {selectedType === "parental" && (
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <div className="font-['Do_Hyeon']">
                      💬 모성보호 신고센터 안내
                    </div>
                    <button
                      className="mt-2 px-4 py-2 bg-purple-200 text-gray-900 rounded-[10px] font-['Do_Hyeon'] hover:bg-purple-300 transition-colors"
                      onClick={() => setShowContactPopup(true)}
                    >
                      전국 모성보호 신고센터 연락처 보기
                    </button>
                  </div>
                )}
              </div>
              {/* 닫기 버튼 */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setSelectedType(null)}
                  className="px-6 py-2 bg-purple-200 text-gray-900 rounded-full font-['Do_Hyeon'] hover:bg-purple-300 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>

            {/* 육아휴직제도 안내 팝업 */}
            {showParentalInfo && (
              <div className="fixed inset-0 flex items-center justify-center z-40">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setShowParentalInfo(false)}
                />
                <div className="relative bg-[#FFF4F4] rounded-3xl shadow-lg p-6 w-[370px] max-h-[80vh] overflow-y-auto border-4 border-pink-200">
                  <div className="flex flex-col items-center mb-2">
                    <div className="text-xl font-['Do_Hyeon'] text-pink-600 mb-2 flex items-center">
                      <span className="mr-2">👶</span> 육아휴직제도 안내
                    </div>
                  </div>
                  <div className="text-left text-sm font-['Do_Hyeon'] text-gray-700 space-y-3">
                    <div>
                      <span className="font-bold text-pink-600">
                        육아휴직제도
                      </span>
                      <br />
                      근로자가 피고용자의 신분을 유지하면서, 일정기간 자녀의
                      양육을 위해 휴직을 할 수 있도록 하는 제도입니다.
                    </div>
                    <div>
                      <span className="font-bold text-pink-600">
                        육아휴직 대상
                      </span>
                      <br />
                      사업주는 <br />
                      ①임신 중인 여성 근로자가 모성을 보호하거나 <br />
                      ②근로자가 만 8세 이하 또는 초등학교 2학년 이하의
                      자녀(입양한 자녀 포함)를 양육하기 위해 휴직(이하
                      '육아휴직'이라 함)을 신청하는 경우에 이를 허용해야 합니다.
                      <br />
                      <span className="text-[10px] text-gray-500">
                        (남녀고용평등과 일·가정 양립 지원에 관한 법률
                        제19조제1항 본문)
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-pink-600">
                        육아휴직의 신청
                      </span>
                      <ul className="list-disc ml-4 mt-1">
                        <li>휴직개시예정일의 30일 전까지 신청서 제출</li>
                        <li>신청서에 인적사항, 자녀 정보, 휴직기간 등 기재</li>
                        <li>
                          특정 사유(유산, 사산, 조기출산 등)는 7일 전까지 신청
                          가능
                        </li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-bold text-pink-600">
                        육아휴직의 기간 및 분할 사용
                      </span>
                      <br />
                      육아휴직의 기간은 1년 이내(특정 조건 시 6개월 추가 가능),
                      3회까지 분할 사용 가능
                    </div>
                    <div>
                      <span className="font-bold text-pink-600">
                        육아휴직 후 불리한 처우 금지
                      </span>
                      <br />
                      사업주는 육아휴직을 이유로 해고나 불리한 처우를 해서는 안
                      됩니다.
                    </div>
                    <div>
                      <span className="font-bold text-pink-600">
                        육아휴직 후 복직
                      </span>
                      <br />
                      복직 시 휴직 전과 같은 업무 또는 같은 수준의 임금 지급
                    </div>
                    <div>
                      <span className="font-bold text-pink-600">
                        육아휴직 급여
                      </span>
                      <ul className="list-disc ml-4 mt-1">
                        <li>
                          육아휴직 1~3개월: 월 통상임금(최대 250만원, 최소
                          70만원)
                        </li>
                        <li>4~6개월: 월 통상임금(최대 200만원, 최소 70만원)</li>
                        <li>
                          7개월~종료: 월 통상임금의 80%(최대 160만원, 최소
                          70만원)
                        </li>
                        <li>부모 동시 육아휴직 등 특례는 별도 규정 적용</li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-bold text-pink-600">
                        급여의 감액 및 지급제한
                      </span>
                      <br />
                      육아휴직 중 이직, 취업, 부정수급 등은 급여 지급이 제한될
                      수 있습니다.
                    </div>
                  </div>
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => setShowParentalInfo(false)}
                      className="px-6 py-2 bg-pink-300 text-white rounded-full font-['Do_Hyeon'] hover:bg-pink-400 transition-colors shadow"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 경력단절 예방 안내 팝업 */}
            {showCareerInfo && (
              <div className="fixed inset-0 flex items-center justify-center z-40">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setShowCareerInfo(false)}
                />
                <div className="relative bg-[#F4F8FF] rounded-3xl shadow-lg p-6 w-[370px] max-h-[80vh] overflow-y-auto border-4 border-blue-200">
                  <div className="flex flex-col items-center mb-2">
                    <div className="text-xl font-['Do_Hyeon'] text-blue-600 mb-2 flex items-center">
                      <span className="mr-2">💼</span> 경력단절
                      예방/재취업/지원센터 안내
                    </div>
                  </div>
                  <div className="text-left text-sm font-['Do_Hyeon'] text-gray-700 space-y-3">
                    <div>
                      <span className="font-bold text-blue-600">
                        여성근로자의 경력단절 예방을 위한 정책지원
                      </span>
                      <br />
                      여성가족부장관과 고용노동부장관은 여성의 경제활동 촉진과
                      경력단절을 예방하기 위하여 다음의 기관이 생애주기별
                      여성경력설계 및 개발 상담 등을 실시할 수 있도록 지원할 수
                      있습니다.
                      <br />
                      <ul className="list-disc ml-4 mt-1">
                        <li>여성인력개발센터</li>
                        <li>여성경제활동지원센터</li>
                        <li>고등교육법 제2조에 따른 학교</li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-bold text-blue-600">
                        경력단절여성의 재취업지원
                      </span>
                      <br />
                      <span className="font-semibold">직업교육훈련</span>
                      <br />
                      여성가족부장관은 경력단절여성등의 경제활동을 촉진하기
                      위하여 여성인력개발기관 등의 기관에 여성에 대한
                      직업교육훈련을 실시하도록 지원할 수 있습니다.
                      <br />
                      지방자치단체의 장은 지역 특성에 맞는 직업교육훈련을 실시할
                      수 있으며, 여성가족부장관과 고용노동부장관은 이에 필요한
                      지원을 할 수 있습니다.
                    </div>
                    <div>
                      <span className="font-semibold">인턴취업지원</span>
                      <br />
                      여성가족부장관은 경력단절여성등의 직업적응을 위하여 기업
                      등을 대상으로 인턴취업지원사업을 실시할 수 있습니다.
                      <br />
                      지방자치단체가 실시하는 일경험 지원 사업 및 취업연계
                      시책도 마련·지원할 수 있습니다.
                    </div>
                    <div>
                      <span className="font-bold text-blue-600">
                        여성경제활동지원센터의 지정 및 운영
                      </span>
                      <br />
                      <span className="font-semibold">
                        여성경제활동지원센터(여성새로일하기센터)
                      </span>
                      <br />
                      여성가족부장관과 고용노동부장관은 여성의 경력단절 예방과
                      경제활동 촉진에 필요한 사업을 수행하기 위하여 각 지역에
                      여성경제활동지원센터를 지정·운영할 수 있습니다.
                      <br />
                      <ul className="list-disc ml-4 mt-1">
                        <li>
                          혼인·임신·출산과 휴직 후 복귀 등에 관한 상담, 정보제공
                          및 경력관리
                        </li>
                        <li>
                          생애주기별 경력개발교육, 멘토링 및 네트워크 형성 등
                          경력단절 예방 프로그램 지원
                        </li>
                        <li>취업·창업 정보 제공 및 상담</li>
                        <li>직업교육훈련, 취업알선 및 취업 후 직장적응 지원</li>
                        <li>보육 지원 등 복지서비스 제공 및 연계</li>
                        <li>
                          여성의 경제활동 촉진과 경력단절 예방을 위한 관련 기관,
                          기업과의 지역단위 네트워크 구축·운영
                        </li>
                        <li>
                          그 밖에 여성의 경제활동 촉진과 경력단절 예방을 위하여
                          필요한 사업
                        </li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold">
                        여성가족부장관과 고용노동부장관은 여성의 경력단절 예방과
                        경제활동 촉진에 관한 정책 및 지원센터의 사업을
                        효율적이고 체계적으로 지원하기 위하여 다음의 업무를
                        수행하는 중앙여성경제활동지원센터(이하 "중앙지원센터"라
                        한다)를 지정·운영할 수 있습니다(「여성의 경제활동 촉진과
                        경력단절 예방법」 제16조제1항 및 제2항).
                      </span>

                      <ul className="list-disc ml-4 mt-1">
                        <li>
                          경력단절 예방에 관한 상담, 교육 등 사업 프로그램의
                          개발·보급
                        </li>
                        <li>사회적·문화적 인식 개선 및 홍보 사업</li>
                        <li>
                          취업·창업지원 등의 상담, 교육 등 사업 프로그램의
                          개발·보급
                        </li>
                        <li>
                          경력단절여성등의 직장 조기 적응 프로그램 개발·보급
                        </li>
                        <li>전국단위 네트워크 구축·운영</li>
                        <li>여성경제활동지원센터에 대한 평가 및 컨설팅</li>
                        <li>센터 인력에 대한 교육훈련 및 근로환경 조사</li>
                        <li>우수사례 발굴 및 홍보</li>
                      </ul>
                    </div>
                    <div className="mt-2 text-xs text-blue-700 bg-blue-50 rounded p-2">
                      여성새로일하기센터는 혼인·임신·출산·육아 등으로 경력이
                      단절된 여성 등에게 취업 상담, 직업교육훈련, 인턴십 및 취업
                      후 사후관리 등 종합적인 취업서비스를 지원하는 기관으로
                      고용노동부와 여성가족부가 공동주관합니다.
                      <br />
                      <span className="text-[10px]">
                        (출처: 고용노동부 홈페이지 참조)
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => setShowCareerInfo(false)}
                      className="px-6 py-2 bg-blue-300 text-white rounded-full font-['Do_Hyeon'] hover:bg-blue-400 transition-colors shadow"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 모성보호 신고센터 팝업 */}
            {showContactPopup && (
              <div className="fixed inset-0 flex items-center justify-center z-30">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setShowContactPopup(false)}
                />
                <div className="relative bg-[#FFE6F2] rounded-3xl shadow-lg p-2 w-[360px] max-h-[60vh] overflow-y-auto border-4 border-pink-200">
                  <div className="flex flex-col items-center mb-1">
                    <div className="text-xl font-['Do_Hyeon'] text-pink-600 mb-3 flex items-center">
                      <span className="mr-2">💌</span> 전국 모성보호 신고센터
                      연락처
                    </div>
                  </div>
                  <table className="w-full text-xs font-['Do_Hyeon'] bg-white rounded-xl overflow-hidden">
                    <thead className="bg-pink-100 text-pink-700">
                      <tr>
                        <th className="py-2 px-2">연번</th>
                        <th className="py-2 px-2">관서명</th>
                        <th className="py-2 px-2">전화번호</th>
                        <th className="py-2 px-2 border-l-2 border-pink-200">
                          연번
                        </th>
                        <th className="py-2 px-2">관서명</th>
                        <th className="py-2 px-2">전화번호</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 표 데이터: 1~25, 26~49 */}
                      {[
                        [
                          1,
                          "서울청",
                          "02-2250-5734",
                          26,
                          "창원",
                          "055-239-6574",
                        ],
                        [
                          2,
                          "서울강남",
                          "02-3465-8459",
                          27,
                          "울산",
                          "052-228-3857",
                        ],
                        [
                          3,
                          "서울동부",
                          "02-2142-8809",
                          28,
                          "양산",
                          "055-330-9534",
                        ],
                        [
                          4,
                          "서울서부",
                          "02-2077-6127",
                          29,
                          "진주",
                          "055-760-6504",
                        ],
                        [
                          5,
                          "서울남부",
                          "02-2639-2243",
                          30,
                          "통영",
                          "055-650-1917",
                        ],
                        [
                          6,
                          "서울북부",
                          "02-950-9760",
                          31,
                          "대구성",
                          "053-667-6221",
                        ],
                        [
                          7,
                          "서울관악",
                          "02-3282-9090",
                          32,
                          "대구서부",
                          "053-605-9103",
                        ],
                        [
                          8,
                          "중부청",
                          "032-460-4567",
                          33,
                          "포항",
                          "054-271-6741",
                        ],
                        [
                          9,
                          "인천북부",
                          "032-540-7936",
                          34,
                          "구미",
                          "054-450-3581",
                        ],
                        [
                          10,
                          "부천",
                          "032-714-8752",
                          35,
                          "영주",
                          "054-639-1162",
                        ],
                        [
                          11,
                          "의정부",
                          "031-850-7625",
                          36,
                          "안동",
                          "054-851-8043",
                        ],
                        [
                          12,
                          "고양",
                          "031-931-2816",
                          37,
                          "광주청",
                          "062-975-6414",
                        ],
                        [
                          13,
                          "경기",
                          "031-259-0367",
                          38,
                          "제주",
                          "064-728-7115",
                        ],
                        [
                          14,
                          "성남",
                          "031-788-1561",
                          39,
                          "전주",
                          "063-240-3363",
                        ],
                        [
                          15,
                          "안양",
                          "031-463-7365",
                          40,
                          "익산",
                          "063-839-0022",
                        ],
                        [
                          16,
                          "안산",
                          "031-412-1982",
                          41,
                          "군산",
                          "063-450-0557",
                        ],
                        [
                          17,
                          "평택",
                          "031-646-1147",
                          42,
                          "목포",
                          "061-280-0149",
                        ],
                        [
                          18,
                          "강원",
                          "033-269-3579",
                          43,
                          "여수",
                          "061-650-0182",
                        ],
                        [
                          19,
                          "강릉",
                          "033-650-2516",
                          44,
                          "대전청",
                          "042-480-6341",
                        ],
                        [
                          20,
                          "원주",
                          "033-769-0816",
                          45,
                          "청주",
                          "043-299-1230",
                        ],
                        [
                          21,
                          "태백",
                          "033-550-8623",
                          46,
                          "천안",
                          "041-560-2846",
                        ],
                        [
                          22,
                          "영월",
                          "033-371-6247",
                          47,
                          "충주",
                          "043-840-4056",
                        ],
                        [
                          23,
                          "부산청",
                          "051-850-6493",
                          48,
                          "보령",
                          "041-930-6122",
                        ],
                        [
                          24,
                          "부산동부",
                          "051-559-6683",
                          49,
                          "서산",
                          "041-661-5639",
                        ],
                        [25, "부산북부", "051-309-1512", null, null, null],
                      ].map((row, idx) => (
                        <tr key={idx} className="even:bg-pink-50">
                          {row.map((cell, i) => (
                            <td
                              key={i}
                              className={`py-1 px-1 text-center border-b border-pink-100${
                                i === 3 ? " border-l-2 border-pink-200" : ""
                              }`}
                            >
                              {cell || ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => setShowContactPopup(false)}
                      className="px-6 py-2 bg-pink-300 text-white rounded-full font-['Do_Hyeon'] hover:bg-pink-400 transition-colors shadow"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
