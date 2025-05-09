const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

// 입력 및 출력 파일 경로 설정
const inputFile = path.join(__dirname, '../../rawdata/병원_난임시술.csv');
const outputFile = path.join(__dirname, '../public/data/infertility_hospitals.json');

// CSV를 JSON으로 변환
async function convertCsvToJson() {
  try {
    // CSV 파일 읽기 및 변환
    const jsonArray = await csv({
      // colParser: { // 오류 수정: 특별한 파서 설정이 필요 없으면 이 부분을 비우거나, 올바르게 정의합니다.
      //   // 필드 파싱 옵션 설정
      // }
    }).fromFile(inputFile);
    
    // 필요한 필드만 추출하여 정리
    const facilities = jsonArray.map((item, index) => ({
      id: item['암호화요양기호'] || `infertility-${index}`, // 암호화된 ID 또는 고유 ID 생성
      name: item['요양기관명'],
      type: item['종별코드명'], // 병원 유형 (예: 의원, 병원, 종합병원)
      province: item['시도코드명'], // 시도
      city: item['시군구코드명'], // 시군구
      address: item['주소'],
      phone: item['전화번호'],
      doctors: parseInt(item['총의사수'], 10) || 0, // 의사 수 (숫자로 변환)
      servicesArtificial: item['난임시술(인공)'] === '1', // 인공수정 가능 여부 (boolean)
      servicesInVitro: item['난임시술(체외)'] === '1', // 체외수정 가능 여부 (boolean)
      // '난임시술(전체)'는 인공 또는 체외 중 하나라도 하면 1일 것으로 예상되므로, 위 두 boolean으로 판단 가능
      serviceTypesProvided: item['제공시술유형'] // 제공 시술 유형 (문자열)
    }));

    // 시설 유형별로 그룹화
    const facilitiesByType = {};
    facilities.forEach(facility => {
      if (!facilitiesByType[facility.type]) {
        facilitiesByType[facility.type] = [];
      }
      facilitiesByType[facility.type].push(facility);
    });

    // 지역별로 그룹화
    const facilitiesByProvince = {};
    facilities.forEach(facility => {
      if (!facilitiesByProvince[facility.province]) {
        facilitiesByProvince[facility.province] = [];
      }
      facilitiesByProvince[facility.province].push(facility);
    });

    // 최종 JSON 구조 생성
    const finalData = {
      totalCount: facilities.length,
      facilities: facilities,
      facilitiesByType: facilitiesByType,
      facilitiesByProvince: facilitiesByProvince,
      meta: {
        description: "난임시술 병원 세부 현황",
        source: "공공데이터포털",
        lastUpdated: new Date().toISOString().split('T')[0]
      }
    };

    // 출력 디렉토리가 없으면 생성
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // JSON 파일로 저장
    fs.writeFileSync(outputFile, JSON.stringify(finalData, null, 2), 'utf8');
    console.log(`변환 완료: ${outputFile}`);
  } catch (error) {
    console.error('변환 실패:', error);
  }
}

convertCsvToJson(); 