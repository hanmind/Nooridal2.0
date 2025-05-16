/**
 * 타임스탬프를 포맷팅하는 유틸리티 함수
 * @param timestamp 포맷팅할 타임스탬프 (ISO 문자열, Date 객체 또는 null)
 * @returns 포맷팅된 시간 문자열 (예: "14:30")
 */
export const formatTimestamp = (timestamp: string | Date | null): string => {
  if (!timestamp) return "";

  try {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;

    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24시간 표기
    });
  } catch (error) {
    console.error("타임스탬프 포맷팅 오류:", error);
    return "";
  }
};
