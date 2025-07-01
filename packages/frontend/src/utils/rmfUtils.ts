import { RMFData, RMFComparisonCriteria, SortOption, FilterOption } from '../types/rmf';

// คำนวณค่าเฉลี่ยถ่วงน้ำหนักของผลตอบแทนย้อนหลัง
const weightedAvgReturn = (fund: RMFData) => {
  return (
    (fund.return1Y * 0.4 + fund.return3Y * 0.35 + fund.return5Y * 0.25)
  );
};

// คำนวณ Sharpe Ratio แบบง่าย (Risk Adjusted Return)
const calcSharpe = (fund: RMFData) => {
  const returns = [fund.return1Y, fund.return3Y, fund.return5Y];
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const riskFree = 1; // สมมติ
  const std = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length) || 1;
  return (mean - riskFree) / std;
};

// คำนวณ Maximum Drawdown แบบง่าย
const calcMaxDrawdown = (fund: RMFData) => {
  return Math.min(fund.return1Y, fund.return3Y, fund.return5Y) * -1;
};

// ฟังก์ชัน normalize array (min-max)
const normalize = (value: number, min: number, max: number) => {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
};

// คำนวณความคุ้มค่าของกองทุน (ใหม่)
export const calculateValueScore = (fund: RMFData, allFunds?: RMFData[]): number => {
  // ถ้าผลตอบแทนย้อนหลังติดลบทั้งหมด หรือ past performance < 0 ไม่ควรแนะนำ
  const returns = [fund.return1Y, fund.return3Y, fund.return5Y];
  const pastPerformance = (fund.return1Y * 0.4 + fund.return3Y * 0.35 + fund.return5Y * 0.25);
  if (returns.every(r => r < 0) || pastPerformance < 0) {
    return 0;
  }
  // เตรียมข้อมูล normalize
  let all = allFunds;
  if (!all) all = [fund];
  const pasts = all.map(weightedAvgReturn);
  const sharpes = all.map(calcSharpe);
  const drawdowns = all.map(calcMaxDrawdown);

  const pastNorm = normalize(weightedAvgReturn(fund), Math.min(...pasts), Math.max(...pasts));
  const sharpeNorm = normalize(calcSharpe(fund), Math.min(...sharpes), Math.max(...sharpes));
  const drawdownNorm = 1 - normalize(calcMaxDrawdown(fund), Math.min(...drawdowns), Math.max(...drawdowns)); // drawdown ยิ่งน้อยยิ่งดี

  // รวมคะแนน (น้ำหนักเท่าๆ กัน)
  const score = (pastNorm + sharpeNorm + drawdownNorm) / 3;

  // หักคะแนนด้วย expense ratio (penalty)
  const expensePenalty = Math.min(0.2, (fund.expenseRatio || 0) / 10); // สูงสุดหัก 0.2
  const finalScore = Math.max(0, score - expensePenalty);
  return finalScore;
};

// แปลงระดับความเสี่ยงเป็นตัวเลข
export const getRiskScore = (risk: string): number => {
  const riskMap: Record<string, number> = {
    'ต่ำ': 1,
    'ต่ำถึงปานกลาง': 2,
    'ปานกลาง': 3,
    'ปานกลางถึงสูง': 4,
    'สูง': 5
  };
  return riskMap[risk] || 3;
};

// จัดอันดับกองทุนตามความคุ้มค่า
export const rankFundsByValue = (funds: RMFData[]): RMFData[] => {
  // คำนวณคะแนนของทุกกองทุนใน filteredFunds เพียงครั้งเดียว
  const scored = funds.map(fund => ({ fund, score: calculateValueScore(fund, funds) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.fund);
};

// กรองกองทุนตามเงื่อนไข
export const filterFunds = (funds: RMFData[], filters: FilterOption): RMFData[] => {
  return funds.filter(fund => {
    if (filters.category && fund.category !== filters.category) return false;
    if (filters.company && fund.company !== filters.company) return false;
    if (filters.risk && fund.risk !== filters.risk) return false;
    if (filters.minInvestment && fund.minInvestment < filters.minInvestment) return false;
    return true;
  });
};

// เรียงลำดับกองทุน
export const sortFunds = (funds: RMFData[], sortOption: SortOption): RMFData[] => {
  return [...funds].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortOption.value) {
      case 'expenseRatio':
        aValue = a.expenseRatio;
        bValue = b.expenseRatio;
        break;
      case 'return1Y':
        aValue = a.return1Y;
        bValue = b.return1Y;
        break;
      case 'return3Y':
        aValue = a.return3Y;
        bValue = b.return3Y;
        break;
      case 'return5Y':
        aValue = a.return5Y;
        bValue = b.return5Y;
        break;
      case 'risk':
        aValue = getRiskScore(a.risk);
        bValue = getRiskScore(b.risk);
        break;
      case 'fundSize':
        aValue = a.fundSize;
        bValue = b.fundSize;
        break;
      case 'managementFee':
        aValue = a.managementFee;
        bValue = b.managementFee;
        break;
      case 'minInvestment':
        aValue = a.minInvestment;
        bValue = b.minInvestment;
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'company':
        aValue = a.company.toLowerCase();
        bValue = b.company.toLowerCase();
        break;
      default:
        return 0;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOption.direction === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOption.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });
};

// จัดรูปแบบตัวเลข
export const formatNumber = (num: number, decimals: number = 2): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

// จัดรูปแบบเปอร์เซ็นต์
export const formatPercentage = (num: number): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return 'N/A';
  }
  return `${formatNumber(num, 2)}%`;
};

// จัดรูปแบบเงิน
export const formatCurrency = (amount: number): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2
  }).format(amount);
};

// จัดรูปแบบขนาดกองทุน
export const formatFundSize = (size: number): string => {
  if (size === null || size === undefined || isNaN(size)) {
    return 'N/A';
  }
  if (size >= 1000000000) {
    return `${formatNumber(size / 1000000000, 2)} billion baht`;
  } else if (size >= 1000000) {
    return `${formatNumber(size / 1000000, 2)} million baht`;
  } else {
    return formatCurrency(size);
  }
};

// สีสำหรับระดับความเสี่ยง
export const getRiskColor = (risk: string): string => {
  const colorMap: Record<string, string> = {
    'Low': 'text-green-600',
    'Low to Moderate': 'text-blue-600',
    'Moderate': 'text-yellow-600',
    'Moderate to High': 'text-orange-600',
    'High': 'text-red-600',
  };
  return colorMap[risk] || 'text-gray-600';
};

// สีสำหรับผลตอบแทน
export const getReturnColor = (returnValue: number): string => {
  if (returnValue > 0) return 'text-green-600';
  if (returnValue < 0) return 'text-red-600';
  return 'text-gray-600';
};
