import React, { useState } from 'react';
import { FiSearch, FiX, FiFilter } from 'react-icons/fi';

const JobFilters = ({ onFilterChange, jobCount }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priority: 'all',
    jobType: 'all',
    dateRange: 'all'
  });

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onFilterChange({ searchTerm: value, ...filters });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange({ searchTerm, ...newFilters });
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({
      priority: 'all',
      jobType: 'all',
      dateRange: 'all'
    });
    onFilterChange({ searchTerm: '', priority: 'all', jobType: 'all', dateRange: 'all' });
  };

  const hasActiveFilters = searchTerm || filters.priority !== 'all' || filters.jobType !== 'all' || filters.dateRange !== 'all';

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by customer name, address, or phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-4 py-2 rounded-lg transition ${
            showFilters 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FiFilter className="mr-2" />
          Filters
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
          >
            <FiX className="mr-2" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Type
            </label>
            <select
              value={filters.jobType}
              onChange={(e) => handleFilterChange('jobType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
            >
              <option value="all">All Types</option>
              <option value="installation">Installation</option>
              <option value="repair">Repair</option>
              <option value="maintenance">Maintenance</option>
              <option value="inspection">Inspection</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="thisWeek">This Week</option>
              <option value="nextWeek">Next Week</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      )}

      {/* Results Count */}
      {hasActiveFilters && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {jobCount} job{jobCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default JobFilters;
