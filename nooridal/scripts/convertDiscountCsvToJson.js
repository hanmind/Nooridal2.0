const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

const inputFile = path.join(__dirname, '../../rawdata/편의 시설_할인업소.csv');
const outputFile = path.join(__dirname, '../public/data/discount_shops.json');

async function convertDiscountCsvToJson() {
  try {
    const jsonArray = await csv().fromFile(inputFile);

    // 필요한 필드만 추출
    const shops = jsonArray.map((item, idx) => ({
      id: `${item['업소명']}_${item['주소']}`.replace(/\s+/g, '_'),
      region: item['지역'],
      category: item['업종'],
      name: item['업소명'],
      address: item['주소'],
      phone: item['전화번호'],
      discountInfo: item['할인정보'],
      discountType: item['할인유형'],
      lat: item['위도'] ? parseFloat(item['위도']) : null,
      lng: item['경도'] ? parseFloat(item['경도']) : null,
      updatedAt: item['업데이트일자'],
      sourceFile: item['원본파일'],
      dataType: item['데이터유형']
    }));

    // 지역별 그룹화
    const shopsByRegion = {};
    shops.forEach(shop => {
      if (!shopsByRegion[shop.region]) shopsByRegion[shop.region] = [];
      shopsByRegion[shop.region].push(shop);
    });

    // 업종별 그룹화
    const shopsByCategory = {};
    shops.forEach(shop => {
      if (!shopsByCategory[shop.category]) shopsByCategory[shop.category] = [];
      shopsByCategory[shop.category].push(shop);
    });

    const finalData = {
      totalCount: shops.length,
      shops,
      shopsByRegion,
      shopsByCategory,
      meta: {
        description: '임신부/가족 배려 할인업소 정보',
        source: '공공데이터포털',
        lastUpdated: new Date().toISOString().split('T')[0]
      }
    };

    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputFile, JSON.stringify(finalData, null, 2), 'utf8');
    console.log(`변환 완료: ${outputFile}`);
  } catch (err) {
    console.error('변환 실패:', err);
  }
}

convertDiscountCsvToJson(); 