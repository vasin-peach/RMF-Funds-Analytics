import React from 'react';
import { RMFData } from '../types/rmf';
import {
  formatPercentage,
  formatCurrency,
  formatFundSize,
  getRiskColor,
  getReturnColor,
} from '../utils/rmfUtils';
import { TrendingUp, TrendingDown, Minus, Star } from 'lucide-react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RMFCardProps {
  fund: RMFData;
  rank?: number;
  showValueScore?: boolean;
  valueScore?: number;
  radar?: { pastNorm: number; sharpeNorm: number; drawdownNorm: number };
  maxValueScore?: number;
}

// RadarChart inline component
const RadarChart: React.FC<{
  past: number;
  sharpe: number;
  drawdown: number;
}> = ({ past, sharpe, drawdown }) => {
  const data = {
    labels: ['Performance', 'Risk Return', 'Drawdown'],
    datasets: [
      {
        label: 'Score',
        data: [past, sharpe, drawdown],
        backgroundColor: 'rgba(30, 136, 229, 0.35)',
        borderColor: 'rgba(30, 136, 229, 0.95)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(255, 193, 7, 1)',
        pointBorderColor: '#fff',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        min: 0,
        max: 1,
        angleLines: { color: '#b0bec5' },
        grid: { color: '#e3eaf2' },
        pointLabels: { font: { size: 10, weight: 700 }, color: '#263238' },
        ticks: { display: false },
      },
    },
  };
  return (
    <div
      style={{
        background: 'rgba(227,234,242,0.5)',
        borderRadius: 16,
        padding: 8,
        width: '100%',
        height: '100%',
        margin: '0 auto',
      }}
    >
      <Radar data={data} options={options} />
    </div>
  );
};

const RMFCard: React.FC<RMFCardProps> = ({
  fund,
  rank,
  showValueScore = true,
  valueScore = 0,
  radar,
  maxValueScore = 1,
}) => {
  // ฟังก์ชันแปลงคะแนนเป็นดาว 0-3 โดยอันดับ 1 ได้ 3 ดาวเต็ม
  const getStarCount = (score: number) => {
    // ใช้ maxValueScore เพื่อให้คะแนนสูงสุดได้ 3 ดาวเต็ม
    const normalized = Math.max(0, Math.min(3, (score / maxValueScore) * 3));
    return normalized;
  };

  const renderStars = (score: number) => {
    const stars = [];
    const starCount = getStarCount(score);
    for (let i = 1; i <= 3; i++) {
      if (starCount >= i) {
        stars.push(
          <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
        );
      } else if (starCount > i - 1 && starCount < i) {
        stars.push(
          <Star
            key={i}
            className="w-5 h-5 text-yellow-300 fill-current opacity-60"
          />
        ); // ครึ่งดาว
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-gray-300" />);
      }
    }
    return stars;
  };

  const getReturnIcon = (returnValue: number) => {
    if (returnValue > 0)
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (returnValue < 0)
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getRiskLabelEn = (risk: string): string => {
    switch (risk) {
      case 'ต่ำ':
        return 'Low';
      case 'ต่ำถึงปานกลาง':
        return 'Low to Moderate';
      case 'ปานกลาง':
        return 'Moderate';
      case 'ปานกลางถึงสูง':
        return 'Moderate to High';
      case 'สูง':
        return 'High';
      default:
        return risk;
    }
  };

  return (
    <div className="card bg-white shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 rounded-lg overflow-hidden">
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            {rank && (
              <div className="flex justify-between">
                <div className="badge badge-primary mb-2 text-sm px-3 py-1 rounded-full bg-blue-600 border-0">
                  #{rank}
                </div>
                {showValueScore && (
                  <div className="flex flex-row items-center gap-1 min-w-[60px]">
                    <div className="flex gap-0.5">
                      {renderStars(valueScore)}
                    </div>
                    <span className="font-bold text-lg text-gray-800">
                      {getStarCount(valueScore).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            )}
            <h3 className="card-title text-xl font-bold text-gray-900 truncate mb-2 leading-tight">
              {fund.name}
            </h3>
            <p className="text-sm text-gray-500 truncate mb-1 font-mono">
              #{fund.fundCode}
            </p>
            <p className="text-sm font-semibold text-blue-600 truncate mb-2">
              {fund.company}
            </p>
            {/* Fund details */}
            <div className="flex gap-2 mt-1 text-xs text-gray-600">
              <span className="bg-gray-100 px-2 py-1 rounded font-medium">
                NAV: {formatCurrency(fund.nav)}
              </span>
              <span className="bg-gray-100 px-2 py-1 rounded font-medium">
                Size: {formatFundSize(fund.fundSize)}
              </span>
            </div>
            {/* Category badge */}
            <div className="mt-2">
              <span className="badge badge-outline text-xs px-2 py-1 border-gray-300 text-gray-600">
                {fund.category}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 my-2" />

        {/* Performance Returns */}
        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
          <div className="text-center bg-gray-50 p-2 rounded-lg border border-gray-200">
            <div className="font-semibold text-gray-700 mb-1">1Y Return</div>
            <div
              className={`flex items-center justify-center gap-1 ${getReturnColor(fund.return1Y)}`}
            >
              {getReturnIcon(fund.return1Y)}
              <span className="font-bold">
                {formatPercentage(fund.return1Y)}
              </span>
            </div>
          </div>
          <div className="text-center bg-gray-50 p-2 rounded-lg border border-gray-200">
            <div className="font-semibold text-gray-700 mb-1">3Y Return</div>
            <div
              className={`flex items-center justify-center gap-1 ${getReturnColor(fund.return3Y)}`}
            >
              {getReturnIcon(fund.return3Y)}
              <span className="font-bold">
                {formatPercentage(fund.return3Y)}
              </span>
            </div>
          </div>
          <div className="text-center bg-gray-50 p-2 rounded-lg border border-gray-200">
            <div className="font-semibold text-gray-700 mb-1">5Y Return</div>
            <div
              className={`flex items-center justify-center gap-1 ${getReturnColor(fund.return5Y)}`}
            >
              {getReturnIcon(fund.return5Y)}
              <span className="font-bold">
                {formatPercentage(fund.return5Y)}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Level and Fees */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3">
          <div className="grid grid-cols-1 gap-3 text-xs">
            <div className="flex items-center justify-between min-w-0">
              <span className="font-semibold text-gray-700 truncate mr-2">
                Risk Level
              </span>
              <span
                className={`${getRiskColor(getRiskLabelEn(fund.risk))} font-medium py-1 flex-shrink-0`}
              >
                {getRiskLabelEn(fund.risk)}
              </span>
            </div>
            <div className="flex items-center justify-between min-w-0">
              <span className="font-semibold text-gray-700 truncate mr-2">
                Expense Ratio
              </span>
              <span className="font-bold text-red-600 flex-shrink-0">
                {formatPercentage(fund.expenseRatio)}
              </span>
            </div>
            <div className="flex items-center justify-between min-w-0">
              <span className="font-semibold text-gray-700 truncate mr-2">
                Management Fee
              </span>
              <span className="font-bold text-gray-800 flex-shrink-0">
                {formatPercentage(fund.managementFee)}
              </span>
            </div>
            <div className="flex items-center justify-between min-w-0">
              <span className="font-semibold text-gray-700 truncate mr-2">
                Min Investment
              </span>
              <span className="font-bold text-gray-800 flex-shrink-0 text-right">
                {formatCurrency(fund.minInvestment)}
              </span>
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="flex justify-center items-center my-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          {radar && (
            <RadarChart
              past={radar.pastNorm}
              sharpe={radar.sharpeNorm}
              drawdown={radar.drawdownNorm}
            />
          )}
        </div>

        {/* Calculation Scores */}
        {radar && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-xs font-semibold text-gray-800 mb-3 text-center">
              Ranking Analysis
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-600 font-medium">Performance</span>
                <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                  {radar.pastNorm.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-600 font-medium">Risk Return</span>
                <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                  {radar.sharpeNorm.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-600 font-medium">Drawdown</span>
                <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                  {radar.drawdownNorm.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-600 font-medium">Expense</span>
                <span className="font-bold text-red-600 bg-gray-100 px-2 py-1 rounded">
                  {fund.expenseRatio.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-300 bg-white p-3 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-800 font-semibold">Final Score</span>
                <span className="font-bold text-xl text-blue-600 bg-blue-50 px-3 py-1 rounded">
                  {valueScore.toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RMFCard;
