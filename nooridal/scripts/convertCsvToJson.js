const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

// 입력 및 출력 파일 경로 설정
const inputFile = path.join(__dirname, '../../rawdata/병원_인큐베이터 보유.csv');
const outputFile = path.join(__dirname, '../public/data/incubator_hospitals.json');

/**
 * @typedef {object} IncubatorClinic
 * @property {string} id - Unique identifier (name_address)
 * @property {string} name - Hospital name
 * @property {string} type - Hospital type (e.g., 종합병원, 의원)
 * @property {string} province - Province/City name (e.g., 서울, 경기)
 * @property {string} address - Full address
 * @property {string} phone - Phone number
 * @property {number | null} lat - Latitude
 * @property {number | null} lng - Longitude
 * @property {number} incubatorCount - Number of incubators
 */

// CSV를 JSON으로 변환
async function convertCsvToJson() {
  try {
    // CSV 파일 읽기 및 변환
    const jsonArray = await csv({
      colParser: {
        '좌표(X)': 'number',
        '좌표(Y)': 'number',
        '장비대수': 'number'
      }
    }).fromFile(inputFile);
    
    // 필터링: 장비대수가 0보다 크고, 좌표값이 유효한 항목만 포함
    const filteredArray = jsonArray.filter(item => {
      const count = item['장비대수'];
      const lat = item['좌표(Y)'];
      const lng = item['좌표(X)'];
      return count > 0 && typeof lat === 'number' && typeof lng === 'number';
    });
    
    console.log(`총 ${jsonArray.length}개 중 ${filteredArray.length}개 항목이 필터링되었습니다. (${jsonArray.length - filteredArray.length}개 항목 제외 - 인큐베이터 0개 또는 좌표 없음)`);
    
    // 필요한 필드만 추출하여 정리
    /** @type {IncubatorClinic[]} */
    const clinics = filteredArray.map((item, index) => ({
      id: `${item['요양기관명']}_${item['주소']}`.replace(/[\s\/\(\),:]+/g, '_'), // Make ID more file-system friendly
      name: item['요양기관명'],
      type: item['종별코드명'],
      province: item['시도코드명'],
      address: item['주소'],
      phone: item['전화번호'] || '', // Ensure phone is always a string
      lat: item['좌표(Y)'],
      lng: item['좌표(X)'],
      incubatorCount: item['장비대수'] || 0
    }));

    // 지역별(시도)로 그룹화
    const clinicsByProvince = {};
    clinics.forEach(clinic => {
      const province = clinic.province;
      if (!clinicsByProvince[province]) {
        clinicsByProvince[province] = [];
      }
      clinicsByProvince[province].push(clinic);
    });

    // 최종 JSON 구조 생성
    const finalData = {
      totalCount: clinics.length,
      clinics: clinics,
      clinicsByProvince: clinicsByProvince,
      meta: {
        description: "병원별 인큐베이터 보유 현황",
        source: "공공데이터포털 건강보험심사평가원_의료기관별상세정보서비스",
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