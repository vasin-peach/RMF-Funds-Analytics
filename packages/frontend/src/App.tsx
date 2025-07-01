import React, { useState, useEffect, useMemo } from 'react';
import { RMFData, FilterOption, SortOption } from './types/rmf';
import { loadRMFData, getUniqueValues } from './services/rmfService';
import { filterFunds, sortFunds, rankFundsByValue, calculateValueScore, getRiskScore } from './utils/rmfUtils';
import RMFCard from './components/RMFCard';
import FilterPanel from './components/FilterPanel';
import StatisticsPanel from './components/StatisticsPanel';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

function App() {
  const [funds, setFunds] = useState<RMFData[]>([]);
  const [filteredFunds, setFilteredFunds] = useState<RMFData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOption>({});
  const [sortOption, setSortOption] = useState<SortOption>({
    label: 'ความคุ้มค่า (สูงสุด)',
    value: 'expenseRatio',
    direction: 'desc'
  });
  const [showValueRanking, setShowValueRanking] = useState(true);
  const [showGraphComparison, setShowGraphComparison] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [fundsPerPage] = useState(30);

  const [filtering, setFiltering] = useState(false);

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await loadRMFData();
        setFunds(data);
        setFilteredFunds(data);
        setError(null);
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลกองทุนได้');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and sort data when filters or sortOption change
  useEffect(() => {
    setFiltering(true);
    let result = [...funds];
    if (Object.keys(filters).length > 0) {
      result = filterFunds(result, filters);
    }
    result = sortFunds(result, sortOption);
    setFilteredFunds(result);
    setCurrentPage(1);
    // Add a small delay for smoothness
    const timer = setTimeout(() => setFiltering(false), 350);
    return () => clearTimeout(timer);
  }, [funds, filters, sortOption]);

  // Turn off value ranking only when sort option changes
  useEffect(() => {
    setShowValueRanking(false);
  }, [sortOption]);

  // Memoize valueScore and radar data for all filteredFunds
  const scoredFunds = useMemo(() => {
    if (filteredFunds.length === 0) return [];
    // Precompute all values for normalization
    const pasts = filteredFunds.map(f => (f.return1Y * 0.4 + f.return3Y * 0.35 + f.return5Y * 0.25));
    const sharpes = filteredFunds.map(f => {
      const returns = [f.return1Y, f.return3Y, f.return5Y];
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const riskFree = 1;
      const std = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length) || 1;
      return (mean - riskFree) / std;
    });
    const drawdowns = filteredFunds.map(f => Math.min(f.return1Y, f.return3Y, f.return5Y) * -1);
    const minPast = Math.min(...pasts), maxPast = Math.max(...pasts);
    const minSharpe = Math.min(...sharpes), maxSharpe = Math.max(...sharpes);
    const minDraw = Math.min(...drawdowns), maxDraw = Math.max(...drawdowns);
    const normalize = (v: number, min: number, max: number) => (max === min ? 0.5 : (v - min) / (max - min));
    return filteredFunds.map((fund, idx) => {
      const past = pasts[idx];
      const sharpe = sharpes[idx];
      const drawdown = drawdowns[idx];
      const pastNorm = normalize(past, minPast, maxPast);
      const sharpeNorm = normalize(sharpe, minSharpe, maxSharpe);
      const drawdownNorm = 1 - normalize(drawdown, minDraw, maxDraw);
      // Value score logic (same as calculateValueScore)
      const returns = [fund.return1Y, fund.return3Y, fund.return5Y];
      if (returns.every(r => r < 0) || past < 0) {
        return { fund, valueScore: 0, radar: { pastNorm, sharpeNorm, drawdownNorm } };
      }
      const score = (pastNorm + sharpeNorm + drawdownNorm) / 3;
      const expensePenalty = Math.min(0.2, (fund.expenseRatio || 0) / 10);
      const valueScore = Math.max(0, score - expensePenalty);
      return { fund, valueScore, radar: { pastNorm, sharpeNorm, drawdownNorm } };
    });
  }, [filteredFunds]);

  // Sort by valueScore for ranking
  const valueRankedFunds = useMemo(() => {
    return [...scoredFunds].sort((a, b) => b.valueScore - a.valueScore);
  }, [scoredFunds]);

  // ดึงข้อมูล unique values สำหรับ filters
  const { categories, companies, risks } = getUniqueValues(funds);

  // Pagination logic
  const totalPages = Math.ceil(filteredFunds.length / fundsPerPage);
  const indexOfLastFund = currentPage * fundsPerPage;
  const indexOfFirstFund = indexOfLastFund - fundsPerPage;
  const pagedFunds = useMemo(() => {
    const arr = showValueRanking ? valueRankedFunds : scoredFunds;
    return arr.slice(indexOfFirstFund, indexOfLastFund);
  }, [showValueRanking, valueRankedFunds, scoredFunds, indexOfFirstFund, indexOfLastFund]);

  // เปลี่ยนหน้า
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // หน้าก่อนหน้า
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  // หน้าถัดไป
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // หน้าก่อนหน้า
  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  // หน้าสุดท้าย
  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  // สร้าง array ของหมายเลขหน้า
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // ก่อน render
  const maxValueScore = filteredFunds.length > 0 ? Math.max(...filteredFunds.map(f => calculateValueScore(f))) : 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">กำลังโหลดข้อมูลกองทุน RMF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-error" />
          <p className="text-lg text-error">{error}</p>
          <button 
            className="btn btn-primary mt-4"
            onClick={() => window.location.reload()}
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-primary text-primary-content">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center">
            🏦 Compare RMF Funds in Thailand
          </h1>
          <p className="text-center mt-2 opacity-90">
            Search and compare RMF funds that suit you best
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Panel */}
        <StatisticsPanel funds={funds} />

        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          sortOption={sortOption}
          onFiltersChange={setFilters}
          onSortChange={setSortOption}
          categories={categories}
          companies={companies}
          risks={risks}
        />

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">
              RMF Funds ({filteredFunds.length} funds)
            </h2>
            <div className="flex items-center gap-4">
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text mr-2">Show Value Ranking</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={showValueRanking}
                    onChange={(e) => setShowValueRanking(e.target.checked)}
                  />
                </label>
              </div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text mr-2">Graph Comparison</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-secondary"
                    checked={showGraphComparison}
                    onChange={(e) => setShowGraphComparison(e.target.checked)}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Funds Grid or Graph Comparison */}
        <div className="relative">
          {filtering && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-base-200 bg-opacity-70">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
            </div>
          )}
          {filteredFunds.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No funds match your criteria
              </h3>
              <p className="text-gray-500">
                Try changing the filter or clear all filters.
              </p>
            </div>
          ) : showGraphComparison ? (
            /* Graph Comparison View */
            <div className="bg-white shadow-md border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Fund Comparison Chart</h3>
                <span className="text-sm text-gray-500">({Math.min(10, pagedFunds.length)} funds shown)</span>
              </div>
              
              {/* Comparison Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expense Ratio Comparison */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Expense Ratio Comparison</h4>
                  <div className="space-y-2">
                    {pagedFunds.slice(0, 10).map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-24 text-xs text-gray-600 truncate">{item.fund.fundCode}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div 
                            className="bg-red-500 h-4 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (item.fund.expenseRatio / 2) * 100)}%` }}
                          ></div>
                        </div>
                        <div className="w-16 text-xs font-medium text-right">{item.fund.expenseRatio.toFixed(2)}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 1Y Return Comparison */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">1Y Return Comparison</h4>
                  <div className="space-y-2">
                    {pagedFunds.slice(0, 10).map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-24 text-xs text-gray-600 truncate">{item.fund.fundCode}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div 
                            className={`h-4 rounded-full transition-all duration-300 ${
                              item.fund.return1Y >= 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.abs(item.fund.return1Y) * 2)}%` }}
                          ></div>
                        </div>
                        <div className={`w-16 text-xs font-medium text-right ${
                          item.fund.return1Y >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.fund.return1Y.toFixed(2)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fund Size Comparison */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Fund Size Comparison</h4>
                  <div className="space-y-2">
                    {pagedFunds.slice(0, 10).map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-24 text-xs text-gray-600 truncate">{item.fund.fundCode}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div 
                            className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (item.fund.fundSize / 1000000000) * 10)}%` }}
                          ></div>
                        </div>
                        <div className="w-20 text-xs font-medium text-right">
                          {(item.fund.fundSize / 1000000).toFixed(0)}M
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Level Comparison */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Risk Level Comparison</h4>
                  <div className="space-y-2">
                    {pagedFunds.slice(0, 10).map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-24 text-xs text-gray-600 truncate">{item.fund.fundCode}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div 
                            className="bg-purple-500 h-4 rounded-full transition-all duration-300"
                            style={{ width: `${(getRiskScore(item.fund.risk) / 5) * 100}%` }}
                          ></div>
                        </div>
                        <div className="w-20 text-xs font-medium text-right">{item.fund.risk}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fund List */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Fund Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pagedFunds.slice(0, 10).map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="text-xs font-semibold text-gray-800 mb-1">{item.fund.fundCode}</div>
                      <div className="text-xs text-gray-600 mb-2">{item.fund.name}</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Expense:</span>
                          <span className="font-medium ml-1">{item.fund.expenseRatio.toFixed(2)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">1Y Return:</span>
                          <span className={`font-medium ml-1 ${item.fund.return1Y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.fund.return1Y.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Regular Cards View */
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pagedFunds.map((item, index) => (
                  <RMFCard
                    key={item.fund.id || `fund-${index}`}
                    fund={item.fund}
                    rank={showValueRanking ? indexOfFirstFund + index + 1 : undefined}
                    showValueScore={showValueRanking}
                    valueScore={item.valueScore}
                    radar={item.radar}
                    maxValueScore={maxValueScore}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  {/* First Page */}
                  <button
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className="btn btn-sm btn-outline"
                  >
                    <ChevronLeft className="w-4 h-4 -mr-2" />
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="btn btn-sm btn-outline"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((page, idx) => (
                    typeof page === 'number' ? (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={`ellipsis-${idx}`} className="px-2">...</span>
                    )
                  ))}

                  {/* Next Page */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="btn btn-sm btn-outline"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className="btn btn-sm btn-outline"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <ChevronRight className="w-4 h-4 -ml-2" />
                  </button>
                </div>
              )}

              {/* Page Info */}
              <div className="text-center mt-4 text-gray-600">
                <p>
                  Showing {indexOfFirstFund + 1} - {Math.min(indexOfLastFund, filteredFunds.length)} of {filteredFunds.length} funds
                </p>
                <p className="text-sm">
                  Page {currentPage} of {totalPages}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600">
          <p>
            Last updated: {new Date().toLocaleDateString('en-US')}
          </p>
          <p className="mt-2 text-sm">
            * Past performance is not indicative of future results.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App; 