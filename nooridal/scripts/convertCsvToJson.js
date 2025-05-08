const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

// 입력 및 출력 파일 경로 설정
const inputFile = path.join(__dirname, '../../rawdata/복지_한부모가족복지시설 세부 현황 원본.csv');
const outputFile = path.join(__dirname, '../public/data/single_parent_family_welfare_facilities.json');

// CSV를 JSON으로 변환
async function convertCsvToJson() {
  try {
    // CSV 파일 읽기 및 변환
    const jsonArray = await csv({
      colParser: {
        // 필드 파싱 옵션 설정
        '구  분': 'string',
        '시도': 'string',
        '시 설 명': 'string',
        '정 원': 'string',
        '단위': 'string',
        '전 화': 'string'
      }
    }).fromFile(inputFile);
    
    // 필요한 필드만 추출하여 정리
    const facilities = jsonArray.map((item, index) => ({
      id: String(index + 1),
      type: item['구  분'],
      province: item['시도'],
      name: item['시 설 명'],
      capacity: item['정 원'],
      unit: item['단위'],
      phone: item['전 화'] || '비공개'
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
        description: "한부모가족복지시설 세부 현황",
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