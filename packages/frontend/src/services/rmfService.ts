import { RMFData } from '../types/rmf';

// ฟังก์ชันสำหรับตรวจสอบว่ากองทุนเป็น RMF หรือไม่
const isRMF = (rawFund: any): boolean => {
  // ตรวจสอบทั้ง root และ overviewInfo
  if (rawFund.taxAllowance === 'RMF' || rawFund.overviewInfo?.taxAllowance === 'RMF') {
    return true;
  }
  const name = (rawFund.overviewInfo?.name || '').toLowerCase();
  const symbol = (rawFund.overviewInfo?.symbol || '').toLowerCase();
  if (name.includes('rmf') || symbol.includes('rmf')) {
    return true;
  }
  return false;
};

// ฟังก์ชันสำหรับแปลงข้อมูลให้ตรงกับ interface
const transformFundData = (rawFund: any): RMFData => {
  const overview = rawFund.overviewInfo || {};
  const performance = rawFund.performanceInfo || {};
  const fee = rawFund.feeInfo || {};

  // Map risk level to English
  const getRiskText = (
    riskLevel: string
  ): 'Low' | 'Low to Moderate' | 'Moderate' | 'Moderate to High' | 'High' => {
    const riskMap: Record<
      string,
      'Low' | 'Low to Moderate' | 'Moderate' | 'Moderate to High' | 'High'
    > = {
      '1': 'Low',
      '2': 'Low',
      '3': 'Low to Moderate',
      '4': 'Low to Moderate',
      '5': 'Moderate',
      '6': 'Moderate',
      '7': 'Moderate to High',
      '8': 'Moderate to High',
      '9': 'High',
      '10': 'High',
    };
    return riskMap[riskLevel] || 'Moderate';
  };

  const managementFee = parseFloat(fee.actualManagementFee) || 0;
  const trusteeFee = parseFloat(fee.actualTrusteeFee) || 0;
  const totalExpenseRatio = managementFee + trusteeFee;



  // ฟังก์ชันวิเคราะห์หมวดหมู่กองทุน RMF จากชื่อ
  function inferCategory(name: string): string {
    const n = (name || '').toLowerCase();

    // หมวดหมู่หลักของ RMF ตามประกาศ ก.ล.ต.
    
    // กองทุนรวมหุ้นไทย (Thai Equity)
    if (/หุ้นไทย|thai equity|thai stock|set|ตลาดหลักทรัพย์|หุ้นในประเทศ/.test(n)) {
      return 'หุ้นไทย';
    }
    
    // กองทุนรวมหุ้นต่างประเทศ (Foreign Equity)
    if (/หุ้นต่างประเทศ|foreign equity|global equity|world equity|international equity|หุ้นโลก/.test(n)) {
      return 'หุ้นต่างประเทศ';
    }
    
    // กองทุนรวมหุ้นสหรัฐอเมริกา (US Equity)
    if (/หุ้นสหรัฐ|หุ้นอเมริกา|us equity|usa equity|american equity|หุ้นอเมริกัน/.test(n)) {
      return 'หุ้นสหรัฐอเมริกา';
    }
    
    // กองทุนรวมหุ้นจีน (China Equity)
    if (/หุ้นจีน|china equity|chinese equity|หุ้นประเทศจีน/.test(n)) {
      return 'หุ้นจีน';
    }
    
    // กองทุนรวมหุ้นญี่ปุ่น (Japan Equity)
    if (/หุ้นญี่ปุ่น|japan equity|japanese equity|หุ้นประเทศญี่ปุ่น/.test(n)) {
      return 'หุ้นญี่ปุ่น';
    }
    
    // กองทุนรวมหุ้นยุโรป (Europe Equity)
    if (/หุ้นยุโรป|europe equity|european equity|หุ้นประเทศยุโรป/.test(n)) {
      return 'หุ้นยุโรป';
    }
    
    // กองทุนรวมหุ้นตลาดเกิดใหม่ (Emerging Markets)
    if (/หุ้นตลาดเกิดใหม่|emerging markets|emerging equity|หุ้นประเทศกำลังพัฒนา/.test(n)) {
      return 'หุ้นตลาดเกิดใหม่';
    }
    
    // กองทุนรวมตราสารหนี้ (Fixed Income)
    if (/ตราสารหนี้|fixed income|bond|debt|พันธบัตร|หุ้นกู้/.test(n)) {
      return 'ตราสารหนี้';
    }
    
    // กองทุนรวมตลาดเงิน (Money Market)
    if (/ตลาดเงิน|money market|เงินฝาก|deposit/.test(n)) {
      return 'ตลาดเงิน';
    }
    
    // กองทุนรวมผสม (Mixed Fund)
    if (/ผสม|mixed|balanced|สมดุล|ผสมหุ้นและตราสารหนี้/.test(n)) {
      return 'กองทุนรวมผสม';
    }
    
    // กองทุนรวมยืดหยุ่น (Flexible Fund)
    if (/ยืดหยุ่น|flexible|ปรับตัว|ปรับสัดส่วน/.test(n)) {
      return 'กองทุนรวมยืดหยุ่น';
    }
    
    // กองทุนรวมอสังหาริมทรัพย์ (Property)
    if (/อสังหา|property|real estate|ที่ดิน|อาคาร/.test(n)) {
      return 'อสังหาริมทรัพย์';
    }
    
    // กองทุนรวมโครงสร้างพื้นฐาน (Infrastructure)
    if (/โครงสร้างพื้นฐาน|infrastructure|สาธารณูปโภค|พลังงาน|คมนาคม/.test(n)) {
      return 'โครงสร้างพื้นฐาน';
    }
    
    // กองทุนรวมสินค้าโภคภัณฑ์ (Commodity)
    if (/สินค้าโภคภัณฑ์|commodity|ทองคำ|ทอง|ทองคำขาว|น้ำมัน/.test(n)) {
      return 'สินค้าโภคภัณฑ์';
    }
    
    // กองทุนรวมเทคโนโลยี (Technology)
    if (/เทคโนโลยี|technology|tech|ดิจิทัล|digital|ai|artificial intelligence/.test(n)) {
      return 'เทคโนโลยี';
    }
    
    // กองทุนรวมการเงิน (Financial)
    if (/การเงิน|financial|ธนาคาร|banking|ประกัน|insurance/.test(n)) {
      return 'การเงิน';
    }
    
    // กองทุนรวมบริโภค (Consumer)
    if (/บริโภค|consumer|อาหาร|เครื่องดื่ม|retail|ค้าปลีก/.test(n)) {
      return 'บริโภค';
    }
    
    // กองทุนรวมพลังงาน (Energy)
    if (/พลังงาน|energy|น้ำมัน|gas|ไฟฟ้า|พลังงานทดแทน/.test(n)) {
      return 'พลังงาน';
    }
    
    // กองทุนรวมสุขภาพ (Healthcare)
    if (/สุขภาพ|healthcare|medical|ยา|โรงพยาบาล|biotech/.test(n)) {
      return 'สุขภาพ';
    }
    
    // กองทุนรวม REIT (Real Estate Investment Trust)
    if (/reit|real estate investment trust/.test(n)) {
      return 'REIT';
    }
    
    // กองทุนรวมตลาดเงิน (Money Market) - รอง
    if (/เงินฝาก|deposit|ตลาดเงิน|money/.test(n)) {
      return 'ตลาดเงิน';
    }
    
    // Default สำหรับ RMF ที่ไม่สามารถระบุหมวดหมู่ได้
    return 'อื่นๆ';
  }

  return {
    id: overview.symbol || `fund-${Math.random()}`,
    name: overview.name || 'ไม่ระบุชื่อ',
    fundCode: overview.symbol || 'ไม่ระบุรหัส',
    company: overview.amcName || 'ไม่ระบุบริษัท',
    nav: parseFloat(performance.navPerUnit) || 0,
    navDate: performance.date
      ? performance.date.split('T')[0]
      : new Date().toISOString().split('T')[0],
    expenseRatio: totalExpenseRatio,
    return1Y: parseFloat(performance.oneYearPercentChange) || 0,
    return3Y: parseFloat(performance.threeYearPercentChange) || 0,
    return5Y: parseFloat(performance.fiveYearPercentChange) || 0,
    risk: getRiskText(overview.riskLevel),
    category: inferCategory(overview.name),
    minInvestment: 1000, // ค่าเริ่มต้น
    managementFee: managementFee,
    trusteeFee: trusteeFee,
    custodianFee: 0, // ไม่มีข้อมูลใน JSON
    totalExpenseRatio: totalExpenseRatio,
    benchmark: 'ไม่ระบุ',
    inceptionDate: 'ไม่ระบุ',
    fundSize: parseFloat(performance.nav) || 0,
    dividendYield: undefined,
    volatility: undefined,
    sharpeRatio: undefined,
    maxDrawdown: undefined,
  };
};

// ฟังก์ชันสำหรับอ่านข้อมูลจากไฟล์ jsonformatter.json
export const loadRMFData = async (): Promise<RMFData[]> => {
  try {
    // อ่านไฟล์จาก public/data/jsonformatter.json
    const response = await fetch('/data/jsonformatter.json');
    if (!response.ok) {
      throw new Error(
        `Failed to load RMF data: ${response.status} ${response.statusText}`
      );
    }
    // const data = await response.json();
    const rawFunds = (await response.json())?.filterFunds;

    // Debug: ตรวจสอบข้อมูลที่โหลดมา
    console.log('Raw data loaded:', rawFunds);
    console.log('First fund sample:', rawFunds?.[0]);

    // ตรวจสอบว่าเป็น array และมีข้อมูล
    if (!Array.isArray(rawFunds) || rawFunds.length === 0) {
      throw new Error('Invalid data format: expected non-empty array');
    }

    // กรองเฉพาะกองทุน RMF
    const rmfFunds = rawFunds.filter(isRMF);
    
    console.log(`Total funds: ${rawFunds.length}`);
    console.log(`RMF funds: ${rmfFunds.length}`);
    console.log(`Non-RMF funds filtered out: ${rawFunds.length - rmfFunds.length}`);
    
    // Debug: แสดงตัวอย่างกองทุนที่ไม่ผ่านการกรอง
    if (rmfFunds.length === 0) {
      console.log('No RMF funds found! Debugging...');
      console.log('Sample of first 5 funds:');
      rawFunds.slice(0, 5).forEach((fund, index) => {
        console.log(`Fund ${index + 1}:`, {
          name: fund.overviewInfo?.name,
          symbol: fund.overviewInfo?.symbol,
          taxAllowance: fund.taxAllowance,
          overviewTax: fund.overviewInfo?.taxAllowance,
          isRMF: isRMF(fund)
        });
      });
      // ไม่ใช้ fallback อีกต่อไป
      return [];
    }

    // แปลงข้อมูลให้ตรงกับ interface
    const funds = rmfFunds.map(transformFundData);

    console.log('Transformed RMF funds:', funds);
    console.log('First transformed RMF fund:', funds[0]);

    return funds;
  } catch (error) {
    console.error('Error loading RMF data:', error);
    throw new Error(
      'ไม่สามารถโหลดข้อมูลกองทุน RMF ได้ กรุณาตรวจสอบไฟล์ public/data/jsonformatter.json'
    );
  }
};

// ฟังก์ชันสำหรับดึงข้อมูล unique values สำหรับ filters
export const getUniqueValues = (funds: RMFData[]) => {
  // ดึงหมวดหมู่ที่มีอยู่จริงและเรียงลำดับ (ไม่รวม "อื่นๆ")
  const categories = [...new Set(funds.map((fund) => fund.category))]
    .filter(category => category !== 'อื่นๆ')
    .sort();
  
  // ดึงบริษัทที่มีอยู่จริงและเรียงลำดับ
  const companies = [...new Set(funds.map((fund) => fund.company))].sort();
  
  // ดึงระดับความเสี่ยงที่มีอยู่จริงและเรียงลำดับตามความเสี่ยง
  const riskOrder = ['Low', 'Low to Moderate', 'Moderate', 'Moderate to High', 'High'];
  const risks = [...new Set(funds.map((fund) => fund.risk))].sort((a, b) => {
    return riskOrder.indexOf(a) - riskOrder.indexOf(b);
  });

  // เพิ่มสถิติ
  console.log('Available categories:', categories);
  console.log('Available companies:', companies.length);
  console.log('Available risk levels:', risks);

  // แสดงสถิติของแต่ละหมวดหมู่
  const categoryStats = categories.map(category => {
    const count = funds.filter(fund => fund.category === category).length;
    return { category, count };
  }).sort((a, b) => b.count - a.count);
  
  console.log('Category statistics:', categoryStats);

  return { 
    categories, 
    companies, 
    risks
  };
};
