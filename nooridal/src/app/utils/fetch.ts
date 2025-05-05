/**
 * 지정된 시간 내에 완료되지 않으면 중단되는 fetch 요청을 수행합니다.
 *
 * @param resource - 가져올 리소스 URL 또는 Request 객체
 * @param options - fetch 옵션 (signal 포함)
 * @param timeout - 타임아웃 시간 (밀리초)
 * @returns {Promise<Response>} - fetch 응답 Promise
 */
export async function fetchWithTimeout(
  resource: RequestInfo | URL,
  options: RequestInit = {},
  timeout: number = 60000 // 기본 타임아웃 60초
): Promise<Response> {
  const controller = new AbortController();
  const { signal } = controller;

  // 기존 옵션에 signal 추가
  options.signal = signal;

  // 타임아웃 설정
  const timeoutId = setTimeout(() => {
    console.warn(
      `Fetch request timed out after ${timeout}ms for resource:`,
      resource
    );
    controller.abort();
  }, timeout);

  try {
    // fetch 요청 수행
    const response = await fetch(resource, options);
    return response;
  } catch (error) {
    // AbortError는 타임아웃 또는 외부 취소로 인한 것이므로 구분
    if (error instanceof DOMException && error.name === "AbortError") {
      // 타임아웃으로 인한 중단인지 확인
      if (!signal.aborted) {
        console.error("Fetch aborted externally, not due to timeout.");
      }
      throw new Error(`Request timed out after ${timeout}ms`);
    } else {
      // 다른 네트워크 오류 등
      console.error("Fetch error:", error);
      throw error;
    }
  } finally {
    // 타임아웃 타이머 제거
    clearTimeout(timeoutId);
  }
}
