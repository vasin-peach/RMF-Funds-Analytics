import React from 'react';
import { FilterOption, SortOption } from '../types/rmf';
import { Search, Filter, X } from 'lucide-react';
import { mapCategoryToEnglish } from '../utils/rmfUtils';

interface FilterPanelProps {
  filters: FilterOption;
  sortOption: SortOption;
  onFiltersChange: (filters: FilterOption) => void;
  onSortChange: (sort: SortOption) => void;
  categories: string[];
  companies: string[];
  risks: string[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  sortOption,
  onFiltersChange,
  onSortChange,
  categories,
  companies,
  risks,
}) => {
  const sortOptions: SortOption[] = [
    { label: 'Best Value', value: 'expenseRatio', direction: 'desc' },
    { label: '1Y Return (Highest)', value: 'return1Y', direction: 'desc' },
    { label: '3Y Return (Highest)', value: 'return3Y', direction: 'desc' },
    { label: '5Y Return (Highest)', value: 'return5Y', direction: 'desc' },
    {
      label: 'Expense Ratio (Lowest)',
      value: 'expenseRatio',
      direction: 'asc',
    },
    {
      label: 'Management Fee (Lowest)',
      value: 'managementFee',
      direction: 'asc',
    },
    { label: 'Fund Size (Largest)', value: 'fundSize', direction: 'desc' },
    { label: 'Fund Size (Smallest)', value: 'fundSize', direction: 'asc' },
    { label: 'Risk (Lowest)', value: 'risk', direction: 'asc' },
    { label: 'Risk (Highest)', value: 'risk', direction: 'desc' },
    {
      label: 'Min Investment (Lowest)',
      value: 'minInvestment',
      direction: 'asc',
    },
    { label: 'Fund Name (A-Z)', value: 'name', direction: 'asc' },
    { label: 'Company (A-Z)', value: 'company', direction: 'asc' },
  ];

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="bg-white shadow-md border border-gray-200 rounded-lg p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filter & Sort</h2>
        </div>
        {hasActiveFilters && (
          <button
            className="btn btn-sm btn-outline text-xs"
            onClick={() => onFiltersChange({})}
          >
            <X className="w-3 h-3 mr-1" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Filter Section */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
        <div className="text-xs font-semibold text-gray-700 mb-3">Filters</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Category Filter */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Fund Category
            </label>
            <select
              className="select select-sm select-bordered w-full bg-white border-gray-200 text-xs"
              value={filters.category || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  category: e.target.value || undefined,
                })
              }
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={`category-${index}-${category}`} value={category}>
                  {mapCategoryToEnglish(category)}
                </option>
              ))}
            </select>
          </div>

          {/* Company Filter */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Asset Management
            </label>
            <select
              className="select select-sm select-bordered w-full bg-white border-gray-200 text-xs"
              value={filters.company || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  company: e.target.value || undefined,
                })
              }
            >
              <option value="">All Companies</option>
              {companies.map((company, index) => (
                <option key={`company-${index}-${company}`} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Filter */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Risk Level
            </label>
            <select
              className="select select-sm select-bordered w-full bg-white border-gray-200 text-xs"
              value={filters.risk || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  risk: e.target.value || undefined,
                })
              }
            >
              <option value="">All Risk Levels</option>
              {risks.map((risk, index) => (
                <option key={`risk-${index}-${risk}`} value={risk}>
                  {risk}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Fund name, code..."
                className="input input-sm input-bordered w-full bg-white border-gray-200 text-xs pr-10"
              />
              <button className="absolute right-1 top-1/2 transform -translate-y-1/2 btn btn-sm btn-square bg-gray-100 border-gray-200 min-h-0 h-6 w-6">
                <Search className="w-3 h-3 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sort Section */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="text-xs font-semibold text-gray-700 mb-3">
          Sort Options
        </div>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <button
              key={`${option.value}-${option.direction}`}
              className={`btn btn-xs ${
                sortOption.value === option.value &&
                sortOption.direction === option.direction
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              } border font-medium`}
              onClick={() => onSortChange(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
