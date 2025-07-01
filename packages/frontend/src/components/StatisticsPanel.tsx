import React, { useState } from 'react';
import { RMFData } from '../types/rmf';
import { formatPercentage } from '../utils/rmfUtils';

interface StatisticsPanelProps {
  funds: RMFData[];
}

interface AssetAllocationRecommendation {
  age: string;
  riskLevel: string;
  fixedIncome: number;
  moneyMarket: number;
  mixed: number;
  flexible: number;
  description: string;
  color: string;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ funds }) => {
  const [selectedAge, setSelectedAge] = useState<string>('25-35');
  const [selectedRisk, setSelectedRisk] = useState<string>('ปานกลาง');

  const topPerformers = [...funds]
    .sort((a, b) => b.return1Y - a.return1Y)
    .slice(0, 5);

  // แนะนำ Asset Allocation ตามอายุและความเสี่ยง (ไม่มี Thai Equity)
  const assetAllocationRecommendations: AssetAllocationRecommendation[] = [
    {
      age: '25-35',
      riskLevel: 'สูง',
      fixedIncome: 30,
      moneyMarket: 10,
      mixed: 40,
      flexible: 20,
      description: 'Focus on long-term growth with global diversification.',
      color: 'bg-red-100 text-red-800'
    },
    {
      age: '25-35',
      riskLevel: 'ปานกลาง',
      fixedIncome: 40,
      moneyMarket: 15,
      mixed: 30,
      flexible: 15,
      description: 'Balanced between growth and safety, no Thai equity.',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      age: '25-35',
      riskLevel: 'ต่ำ',
      fixedIncome: 50,
      moneyMarket: 20,
      mixed: 20,
      flexible: 10,
      description: 'Emphasis on safety and stability, no Thai equity.',
      color: 'bg-green-100 text-green-800'
    },
    {
      age: '36-50',
      riskLevel: 'สูง',
      fixedIncome: 35,
      moneyMarket: 10,
      mixed: 35,
      flexible: 20,
      description: 'Still growth-oriented but more cautious, no Thai equity.',
      color: 'bg-red-100 text-red-800'
    },
    {
      age: '36-50',
      riskLevel: 'ปานกลาง',
      fixedIncome: 45,
      moneyMarket: 15,
      mixed: 25,
      flexible: 15,
      description: 'More balanced for retirement preparation, no Thai equity.',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      age: '36-50',
      riskLevel: 'ต่ำ',
      fixedIncome: 55,
      moneyMarket: 20,
      mixed: 15,
      flexible: 10,
      description: 'Focus on safety, no Thai equity.',
      color: 'bg-green-100 text-green-800'
    },
    {
      age: '51+',
      riskLevel: 'สูง',
      fixedIncome: 40,
      moneyMarket: 15,
      mixed: 30,
      flexible: 15,
      description: 'Reduce risk to preserve capital, no Thai equity.',
      color: 'bg-red-100 text-red-800'
    },
    {
      age: '51+',
      riskLevel: 'ปานกลาง',
      fixedIncome: 50,
      moneyMarket: 20,
      mixed: 20,
      flexible: 10,
      description: 'Emphasis on capital preservation and income, no Thai equity.',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      age: '51+',
      riskLevel: 'ต่ำ',
      fixedIncome: 60,
      moneyMarket: 25,
      mixed: 10,
      flexible: 5,
      description: 'Maximum safety, no Thai equity.',
      color: 'bg-green-100 text-green-800'
    }
  ];

  // หา recommendation ที่ตรงกับอายุและความเสี่ยงที่เลือก
  const currentRecommendation = assetAllocationRecommendations.find(
    rec => rec.age === selectedAge && rec.riskLevel === selectedRisk
  ) || assetAllocationRecommendations[0];



  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Top Performers */}
      <div className="bg-base-100 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold mb-4">Top Performers (1Y Return)</h3>
        <div className="space-y-3">
          {topPerformers.map((fund, index) => (
            <div
              key={fund.id || `top-performer-${index}`}
              className="flex justify-between items-center p-3 bg-base-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="badge badge-primary">{index + 1}</div>
                <div>
                  <div className="font-medium text-sm">{fund.name}</div>
                  <div className="text-xs text-gray-600">{fund.company}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-success">
                  {formatPercentage(fund.return1Y)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Asset Allocation Recommendation */}
      <div className="card bg-white shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 rounded-lg overflow-hidden">
        <div className="card-body p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="card-title text-xl font-bold text-gray-900 mb-2">
                Asset Allocation Recommendation
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Personalized portfolio allocation based on your age and risk tolerance
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 my-2" />

          {/* Age and Risk Selection */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
            <div className="text-xs font-semibold text-gray-700 mb-3">Portfolio Settings</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between min-w-0">
                <span className="font-semibold text-gray-700 truncate mr-2">Age Group</span>
                <select
                  className="select select-xs select-bordered bg-white border-gray-200 text-xs"
                  value={selectedAge}
                  onChange={(e) => setSelectedAge(e.target.value)}
                >
                  <option value="25-35">25-35 years</option>
                  <option value="36-50">36-50 years</option>
                  <option value="51+">51+ years</option>
                </select>
              </div>
              <div className="flex items-center justify-between min-w-0">
                <span className="font-semibold text-gray-700 truncate mr-2">Risk Level</span>
                <select
                  className="select select-xs select-bordered bg-white border-gray-200 text-xs"
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                >
                  <option value="ต่ำ">Conservative</option>
                  <option value="ปานกลาง">Moderate</option>
                  <option value="สูง">Aggressive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Current Recommendation */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
            <div className="text-xs font-semibold text-gray-700 mb-3">Recommended Allocation</div>
            <div className="text-sm text-gray-600 mb-3">{currentRecommendation.description}</div>
            {/* Allocation Chart */}
            <div className="grid grid-cols-4 gap-2 text-xs mb-3">
              <div className="text-center bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                <div className="font-semibold text-yellow-700 mb-1">Fixed Income</div>
                <div className="font-bold text-yellow-600 text-lg">
                  {currentRecommendation.fixedIncome}%
                </div>
              </div>
              <div className="text-center bg-green-50 p-2 rounded-lg border border-green-200">
                <div className="font-semibold text-green-700 mb-1">Money Market</div>
                <div className="font-bold text-green-600 text-lg">
                  {currentRecommendation.moneyMarket}%
                </div>
              </div>
              <div className="text-center bg-orange-50 p-2 rounded-lg border border-orange-200">
                <div className="font-semibold text-orange-700 mb-1">Mixed Fund</div>
                <div className="font-bold text-orange-600 text-lg">
                  {currentRecommendation.mixed}%
                </div>
              </div>
              <div className="text-center bg-indigo-50 p-2 rounded-lg border border-indigo-200">
                <div className="font-semibold text-indigo-700 mb-1">Flexible Fund</div>
                <div className="font-bold text-indigo-600 text-lg">
                  {currentRecommendation.flexible}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;
