const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');
const proj4 = require('proj4');

// 입력 및 출력 파일 경로 설정
const inputFile = path.join(__dirname, '../../rawdata/산후조리원.csv');
const outputFile = path.join(__dirname, '../public/data/postpartum_centers.json');

/**
 * @typedef {object} PostpartumCenter
 * @property {string} id - Unique identifier (name_address)
 * @property {string} name - Center name
 * @property {string} address - Road name address (도로명전체주소) or Lot number address (소재지전체주소)
 * @property {string} phone - Phone number
 * @property {number | null} lat - Latitude (WGS84) - Placeholder
 * @property {number | null} lng - Longitude (WGS84) - Placeholder
 * @property {number} motherCapacity - Capacity for mothers (임산부정원수)
 * @property {number} infantCapacity - Capacity for infants (영유아정원수)
 * @property {number | null} nurseCount - Number of nurses (간호사수)
 * @property {number | null} nurseAidCount - Number of nurse aids (간호조무사수)
 */

// 좌표 변환 함수 (EPSG:5174 -> WGS84)
// Node.js 환경에서는 proj4js 같은 라이브러리 사용 가능
function convertCoordinates(x, y) {
  if (!x || !y) return { lat: null, lng: null };
  // 실제 변환 로직 구현 필요
  // 예: const proj4 = require('proj4');
  proj4.defs('EPSG:5174', '+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs');
  try { // Added try-catch for potential conversion errors
    const [lng, lat] = proj4('EPSG:5174', 'EPSG:4326', [x, y]);
    // Round coordinates to a reasonable precision
    return { 
      lat: parseFloat(lat.toFixed(7)), 
      lng: parseFloat(lng.toFixed(7)) 
    };
  } catch (error) {
    console.warn(`Coordinate conversion failed for x=${x}, y=${y}: ${error.message}`);
    return { lat: null, lng: null };
  }
  // 임시: 변환 로직 없으므로 null 반환 - Removed this section
  // console.warn(`Coordinate conversion needed for x=${x}, y=${y}`);
  // return { lat: null, lng: null };
}

// CSV를 JSON으로 변환
async function convertCsvToJson() {
  try {
    // CSV 파일 읽기 및 변환
    const jsonArray = await csv({
      colParser: {
        '좌표정보x(epsg5174)': 'number',
        '좌표정보y(epsg5174)': 'number',
        '임산부정원수': 'number',
        '영유아정원수': 'number',
        '간호사수': 'number',
        '간호조무사수': 'number',
      },
      checkType: true
    }).fromFile(inputFile);

    // 데이터 필터링 및 변환
    const filteredData = jsonArray
      .filter(item => item['영업상태명'] === '영업/정상') // 영업중인 곳만 필터링
      .map(item => {
        const address = item['도로명전체주소'] || item['소재지전체주소'] || '주소 정보 없음';
        const name = item['사업장명'] || '이름 없음';
        
        // 좌표 변환
        const { lat, lng } = convertCoordinates(item['좌표정보x(epsg5174)'], item['좌표정보y(epsg5174)']);

        /** @type {PostpartumCenter} */
        const center = {
          id: `${name}_${address}`.replace(/\s+/g, '_'), // 간단한 ID 생성
          name: name,
          address: address,
          phone: item['소재지전화'] || '',
          lat: lat, // 변환된 위도
          lng: lng, // 변환된 경도
          motherCapacity: item['임산부정원수'] || 0,
          infantCapacity: item['영유아정원수'] || 0,
          nurseCount: item['간호사수'], // null 가능
          nurseAidCount: item['간호조무사수'], // null 가능
        };
        return center;
      })
      .filter(center => center.address !== '주소 정보 없음'); // 주소가 없는 데이터 제외

    // 최종 JSON 데이터 구조
    const jsonData = {
      totalCount: filteredData.length,
      centers: filteredData,
      meta: {
        description: "전국 산후조리원 현황 데이터",
        source: "공공데이터포털 (rawdata/산후조리원.csv)",
        lastUpdated: new Date().toISOString()
      }
    };

    // JSON 파일로 저장
    fs.writeFileSync(outputFile, JSON.stringify(jsonData, null, 2), 'utf-8');
    console.log(`Successfully converted ${inputFile} to ${outputFile}`);
    console.log(`Total centers processed: ${jsonData.totalCount}`);

  } catch (error) {
    console.error('Error converting CSV to JSON:', error);
  }
}

// 스크립트 실행
convertCsvToJson(); 