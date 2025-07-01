import React from 'react';
import { RMFData } from '../types/rmf';
import { formatPercentage } from '../utils/rmfUtils';

interface StatisticsPanelProps {
  funds: RMFData[];
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ funds }) => {
  const topPerformers = [...funds]
    .sort((a, b) => b.return1Y - a.return1Y)
    .slice(0, 5);

  const lowestExpense = [...funds]
    .filter((fund) => fund.expenseRatio > 0)
    .sort((a, b) => a.expenseRatio - b.expenseRatio)
    .slice(0, 5);

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

      {/* Lowest Expense Ratio */}
      <div className="bg-base-100 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold mb-4">Lowest Expense Ratio</h3>
        {lowestExpense.length > 0 ? (
          <div className="space-y-3">
            {lowestExpense.map((fund, index) => (
              <div
                key={fund.id || `lowest-expense-${index}`}
                className="flex justify-between items-center p-3 bg-base-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="badge badge-secondary">{index + 1}</div>
                  <div>
                    <div className="font-medium text-sm">{fund.name}</div>
                    <div className="text-xs text-gray-600">{fund.company}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-info">
                    {formatPercentage(fund.expenseRatio)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No expense ratio data</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsPanel;
