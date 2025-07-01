export interface RMFData {
  id: string;
  name: string;
  fundCode: string;
  company: string;
  nav: number;
  navDate: string;
  expenseRatio: number;
  return1Y: number;
  return3Y: number;
  return5Y: number;
  risk: 'Low' | 'Low to Moderate' | 'Moderate' | 'Moderate to High' | 'High';
  category: string;
  minInvestment: number;
  managementFee: number;
  trusteeFee: number;
  custodianFee: number;
  totalExpenseRatio: number;
  benchmark: string;
  inceptionDate: string;
  fundSize: number;
  dividendYield?: number;
  volatility?: number;
  sharpeRatio?: number;
  maxDrawdown?: number;
}

export interface RMFComparisonCriteria {
  expenseRatio: number;
  return1Y: number;
  return3Y: number;
  return5Y: number;
  risk: number;
  fundSize: number;
  managementFee: number;
  minInvestment: number;
  name: string;
  company: string;
}

export interface SortOption {
  label: string;
  value: keyof RMFComparisonCriteria;
  direction: 'asc' | 'desc';
}

export interface FilterOption {
  category?: string;
  company?: string;
  risk?: string;
  minInvestment?: number;
} 