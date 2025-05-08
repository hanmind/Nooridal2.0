const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

// 입력 및 출력 파일 경로 설정
const inputFile = path.join(__dirname, '../../rawdata/복지_여성새로일하기센터 현황_20240802.csv');
const outputFile = path.join(__dirname, '../public/data/women_reemployment_centers.json');

// CSV를 JSON으로 변환
async function convertCsvToJson() {
  try {
    // CSV 파일 읽기 및 변환
    const jsonArray = await csv({
      colParser: {
        // 필드 파싱 옵션 설정
        '연번': 'string',
        '시도': 'string',
        '기초': 'string',
        '센터명': 'string',
        '리플릿 번호': 'string',
        '주소': 'string'
      }
    }).fromFile(inputFile);
    
    // 필요한 필드만 추출하여 정리
    const centers = jsonArray.map(item => ({
      id: item['연번'],
      province: item['시도'],
      city: item['기초'],
      name: item['센터명'],
      phone: item['리플릿 번호'],
      address: item['주소']
    }));

    // 지역별로 그룹화
    const centersByProvince = {};
    centers.forEach(center => {
      if (!centersByProvince[center.province]) {
        centersByProvince[center.province] = [];
      }
      centersByProvince[center.province].push(center);
    });

    // 최종 JSON 구조 생성
    const finalData = {
      totalCount: centers.length,
      centers: centers,
      centersByProvince: centersByProvince,
      meta: {
        description: "여성새로일하기센터 정보 (Women's Re-employment Centers)",
        source: "복지_여성새로일하기센터 현황_20240802.csv",
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