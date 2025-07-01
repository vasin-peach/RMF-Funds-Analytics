import { RMFData } from '../types/rmf';

// ฟังก์ชันสำหรับแปลงข้อมูลให้ตรงกับ interface
const transformFundData = (rawFund: any): RMFData => {
  const overview = rawFund.overviewInfo || {};
  const performance = rawFund.performanceInfo || {};
  const fee = rawFund.feeInfo || {};

  // Map risk level to English
  const getRiskText = (riskLevel: string): 'Low' | 'Low to Moderate' | 'Moderate' | 'Moderate to High' | 'High' => {
    const riskMap: Record<string, 'Low' | 'Low to Moderate' | 'Moderate' | 'Moderate to High' | 'High'> = {
      '1': 'Low',
      '2': 'Low',
      '3': 'Low to Moderate',
      '4': 'Low to Moderate',
      '5': 'Moderate',
      '6': 'Moderate',
      '7': 'Moderate to High',
      '8': 'Moderate to High',
      '9': 'High',
      '10': 'High'
    };
    return riskMap[riskLevel] || 'Moderate';
  };

  const managementFee = parseFloat(fee.actualManagementFee) || 0;
  const trusteeFee = parseFloat(fee.actualTrusteeFee) || 0;
  const totalExpenseRatio = managementFee + trusteeFee;

  // ฟังก์ชันวิเคราะห์หมวดหมู่กองทุนจากชื่อ
  function inferCategory(name: string, symbol: string): string {
    const n = (name || '').toLowerCase();
    const s = (symbol || '').toLowerCase();
    
    // International/Global funds
    if (/global|world|inter|international/.test(n)) return 'Global';
    if (/usa|us|america/.test(n) || /usa|us/.test(s)) return 'USA';
    if (/emerging|em|ตลาดเกิดใหม่/.test(n)) return 'Emerging Markets';
    if (/china|จีน/.test(n)) return 'China';
    if (/japan|ญี่ปุ่น/.test(n)) return 'Japan';
    if (/europe|eu/.test(n)) return 'Europe';
    
    // Fixed Income funds
    if (/fixed income|ตราสารหนี้|bond|debt/.test(n)) return 'Fixed Income';
    if (/money market|ตลาดเงิน/.test(n)) return 'Money Market';
    
    // Equity funds
    if (/equity|หุ้น|stock/.test(n)) return 'Equity';
    if (/set|ตลาดหลักทรัพย์/.test(n)) return 'SET Index';
    if (/thai|ไทย/.test(n)) return 'Thai Equity';
    
    // Mixed funds
    if (/mixed|ผสม|balanced/.test(n)) return 'Mixed Fund';
    if (/flexible|ยืดหยุ่น/.test(n)) return 'Flexible Fund';
    
    // Property funds
    if (/property|อสังหา|real estate/.test(n)) return 'Property';
    if (/reit|real estate investment trust/.test(n)) return 'REIT';
    
    // Sector funds
    if (/technology|tech/.test(n)) return 'Technology';
    if (/healthcare|medical/.test(n)) return 'Healthcare';
    if (/energy|พลังงาน/.test(n)) return 'Energy';
    if (/financial|การเงิน/.test(n)) return 'Financial';
    if (/consumer|บริโภค/.test(n)) return 'Consumer';
    
    // Alternative investments
    if (/commodity|สินค้าโภคภัณฑ์/.test(n)) return 'Commodity';
    if (/infrastructure|โครงสร้างพื้นฐาน/.test(n)) return 'Infrastructure';
    
    // Default categories based on common patterns
    if (/rmf|retirement/.test(n)) return 'RMF Fund';
    if (/ssf|super/.test(n)) return 'SSF Fund';
    
    return 'Other';
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
    category: inferCategory(overview.name, overview.symbol),
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

    // แปลงข้อมูลให้ตรงกับ interface
    const funds = rawFunds.map(transformFundData);

    console.log('Transformed funds:', funds);
    console.log('First transformed fund:', funds[0]);

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
  const categories = [...new Set(funds.map((fund) => fund.category))];
  const companies = [...new Set(funds.map((fund) => fund.company))];
  const risks = [...new Set(funds.map((fund) => fund.risk))];

  return { categories, companies, risks };
};
