# 누리달 (Nooridal)

임산부와 보호자를 위한 통합 케어 플랫폼

---

## 소개

**누리달**은 임산부와 보호자를 위한 AI 기반 챗봇, 위치 기반 지원 서비스, 캘린더, 마이페이지 등 다양한 기능을 제공하는 통합 케어 플랫폼입니다.  
임신/출산 관련 궁금증 상담, 임신 주차별 맞춤 정보, 주변 지원 시설 안내, 일정 관리, 임신 정보 관리 등  
임산부와 가족의 건강하고 편안한 생활을 돕는 서비스를 제공합니다.

---

## 주요 기능

### 1. AI 챗봇 상담
- 임신, 출산, 건강, 육아 등 다양한 주제에 대해 AI 챗봇과 실시간 대화
- 임신 주차별 맞춤 정보 제공
- 대화 내용은 안전하게 관리

### 2. 위치 기반 지원 서비스
- 내 위치 기반으로 이동 지원(교통), 나들이 장소, 무장애 관광지, 병원, 복지시설 등 안내
- 카카오맵 연동 및 마커 클러스터링 지원
- 각 시설 상세 정보, 길찾기, 전화 연결 등 제공

### 3. 캘린더 & 일정 관리
- 임신/출산 관련 주요 일정, 다이어리, 메모 관리
- FullCalendar 기반의 직관적인 UI

### 4. 마이페이지
- 프로필, 임신 정보(주차, 출산예정일, 고위험 여부 등) 관리
- 자주 묻는 질문(FAQ), 앱 정보, 로그아웃 등

### 5. 회원가입
- 임산부/보호자 유형별 회원가입
- 임신 정보 등록 및 관리

---

## 기술 스택

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Backend**: Supabase (인증, DB, 스토리지)
- **지도/위치**: Kakao Maps JS API (clusterer, services)
- **AI 챗봇**: Dify API 연동
- **기타**: FullCalendar, Jest, Testing Library

---

## 개발 및 실행

1. 환경 변수 설정  
   `.env.local` 파일에 Supabase, Kakao API 키 등 필수 환경변수를 입력하세요.

2. 의존성 설치
   ```bash
   npm install
   ```

3. 개발 서버 실행
   ```bash
   npm run dev
   ```

4. 빌드 및 배포
   ```bash
   npm run build
   npm start
   ```

---

## 폴더 구조

nooridal/
├── README.md
├── package.json
├── src/
│   └── app/
│       ├── agent/
│       ├── api/
│       ├── calendar/
│       │   ├── Calendar.tsx
│       │   ├── DatePopup.tsx
│       │   ├── DiaryPopup.tsx
│       │   ├── SchedulePopup.tsx
│       │   └── page.tsx
│       ├── chat/
│       │   └── page.tsx
│       ├── components/
│       │   ├── AIMessage.tsx
│       │   ├── ChatContainer.tsx
│       │   ├── ChatInput.tsx
│       │   ├── ChatSidebar.tsx
│       │   ├── ErrorMessage.tsx
│       │   ├── TabBar.tsx
│       │   └── UserMessage.tsx
│       ├── context/
│       ├── lib/
│       ├── location/
│       │   ├── facilities/
│       │   ├── hospital/
│       │   ├── page.tsx
│       │   ├── transport/
│       │   └── welfare/
│       ├── login/
│       ├── mypage/
│       │   ├── app-info/
│       │   ├── faq/
│       │   ├── page.tsx
│       │   ├── pregnancy-info/
│       │   └── profile/
│       ├── pages/
│       ├── register/
│       │   ├── guardian/
│       │   ├── page.tsx
│       │   └── pregnant/
│       ├── test-api/
│       ├── utils/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── favicon.ico
│       └── globals.css

---

## 라이선스

본 프로젝트는 사내/기관 내부용으로만 사용되며, 별도의 라이선스가 적용될 수 있습니다.

---

## 문의

- 서비스 개선/오류 문의: [담당자 이메일: noorimoon2025@gmail.com]
