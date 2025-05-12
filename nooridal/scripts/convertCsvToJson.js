const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

// 입력 및 출력 파일 경로 설정
const inputFile = path.join(__dirname, '../../rawdata/병원_상세병상수.csv');
const outputFile = path.join(__dirname, '../public/data/detailed_bed_count.json');

// CSV를 JSON으로 변환
async function convertCsvToJson() {
  try {
    // CSV 파일 읽기 및 변환
    const jsonArray = await csv({
      colParser: {
        '분만실병상수': 'number',
        '신생아중환자병상수': 'number',
        '일반입원실상급병상수': 'number',
        '일반입원실일반병상수': 'number',
        '수술실병상수': 'number',
        '응급실병상수': 'number'
      }
    }).fromFile(inputFile);
    
    // 필터링: 모든 병상 수가 0인 병원은 제외
    const filteredArray = jsonArray.filter(item => {
      return (
        item['분만실병상수'] > 0 ||
        item['신생아중환자병상수'] > 0 ||
        item['일반입원실상급병상수'] > 0 ||
        item['일반입원실일반병상수'] > 0 ||
        item['수술실병상수'] > 0 ||
        item['응급실병상수'] > 0
      );
    });
    
    console.log(`총 ${jsonArray.length}개 중 ${filteredArray.length}개 항목이 필터링되었습니다. (${jsonArray.length - filteredArray.length}개 항목 제외)`);
    
    // 필요한 필드만 추출하여 정리
    const facilities = filteredArray.map((item, index) => ({
      id: `${item['요양기관명']}_${item['주소']}`.replace(/\s+/g, '_'),
      name: item['요양기관명'],
      type: item['종별코드명'],
      province: item['시도코드명'],
      city: item['시군구코드명'],
      town: item['읍면동'],
      address: item['주소'],
      phone: item['전화번호'],
      bedCounts: {
        delivery: item['분만실병상수'] || 0,
        nicu: item['신생아중환자병상수'] || 0,
        premium: item['일반입원실상급병상수'] || 0,
        general: item['일반입원실일반병상수'] || 0,
        operation: item['수술실병상수'] || 0,
        emergency: item['응급실병상수'] || 0
      }
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
        description: "병원 상세 병상수 현황",
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