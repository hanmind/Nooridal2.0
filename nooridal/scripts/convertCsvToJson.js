const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

// 입력 및 출력 파일 경로 설정
const inputFile = path.join(__dirname, '../../임산부를 위한 나들이 데이터.csv');
const outputFile = path.join(__dirname, '../public/data/outing_locations.json');

// CSV를 JSON으로 변환
async function convertCsvToJson() {
  try {
    // CSV 파일 읽기 및 변환
    const jsonArray = await csv().fromFile(inputFile);
    
    // 필요한 필드만 추출하여 정리
    const cleanedData = jsonArray.map(item => ({
      id: item.ESNTL_ID,
      name: item.FCLTY_NM,
      category: item.MLSFC_NM,
      mainCategory: item.LCLAS_NM,
      province: item.CTPRVN_NM,
      district: item.SIGNGU_NM,
      dong: item.LEGALDONG_NM,
      address: item.FCLTY_ROAD_NM_ADDR || item.LNM_ADDR,
      phone: item.TEL_NO,
      website: item.HMPG_URL,
      latitude: parseFloat(item.FCLTY_LA) || 0,
      longitude: parseFloat(item.FCLTY_LO) || 0,
      additionalInfo: item.ADIT_DC,
      updatedAt: item.UPDT_DT
    }));

    // 출력 디렉토리가 없으면 생성
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // JSON 파일로 저장
    fs.writeFileSync(outputFile, JSON.stringify(cleanedData, null, 2), 'utf8');
    console.log(`변환 완료: ${outputFile}`);
  } catch (error) {
    console.error('변환 실패:', error);
  }
}

convertCsvToJson(); 