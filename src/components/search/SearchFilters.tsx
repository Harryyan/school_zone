'use client';

import { useState } from 'react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import type { SearchFilters as FilterType } from '@/types';

interface SearchFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  onClearFilters: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export function SearchFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  isExpanded,
  onToggleExpanded
}: SearchFiltersProps) {
  const handleFilterChange = (key: keyof FilterType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.type?.length) count++;
    if (filters.gender?.length) count++;
    if (filters.proprietor?.length) count++;
    if (filters.boarding !== undefined) count++;
    if (filters.hasZone !== undefined) count++;
    if (filters.equityIndexBand?.length) count++;
    if (filters.decile?.length) count++;
    return count;
  };

  const activeCount = getActiveFilterCount();

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onToggleExpanded}
            className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-gray-900"
          >
            Filters
            {activeCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                {activeCount}
              </span>
            )}
            <ChevronDownIcon 
              className={`h-4 w-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </Button>
          
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          )}
        </div>

        {isExpanded && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* School Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                School Type
              </label>
              <Select
                value={filters.type?.[0] || ''}
                onChange={(e) => 
                  handleFilterChange('type', e.target.value ? [e.target.value] : undefined)
                }
              >
                <option value="">Any type</option>
                <option value="Primary">Primary</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Secondary">Secondary</option>
                <option value="Composite">Composite</option>
              </Select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Gender
              </label>
              <Select
                value={filters.gender?.[0] || ''}
                onChange={(e) => 
                  handleFilterChange('gender', e.target.value ? [e.target.value] : undefined)
                }
              >
                <option value="">Any</option>
                <option value="Co-ed">Co-ed</option>
                <option value="Boys">Boys only</option>
                <option value="Girls">Girls only</option>
              </Select>
            </div>

            {/* Proprietor */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Type of School
              </label>
              <Select
                value={filters.proprietor?.[0] || ''}
                onChange={(e) => 
                  handleFilterChange('proprietor', e.target.value ? [e.target.value] : undefined)
                }
              >
                <option value="">Any</option>
                <option value="State">State</option>
                <option value="State-Integrated">State-Integrated</option>
                <option value="Private">Private</option>
              </Select>
            </div>

            {/* Boarding */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Boarding
              </label>
              <Select
                value={filters.boarding === undefined ? '' : filters.boarding.toString()}
                onChange={(e) => 
                  handleFilterChange('boarding', e.target.value === '' ? undefined : e.target.value === 'true')
                }
              >
                <option value="">Any</option>
                <option value="true">Boarding available</option>
                <option value="false">No boarding</option>
              </Select>
            </div>

            {/* Has Zone */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Enrolment Zone
              </label>
              <Select
                value={filters.hasZone === undefined ? '' : filters.hasZone.toString()}
                onChange={(e) => 
                  handleFilterChange('hasZone', e.target.value === '' ? undefined : e.target.value === 'true')
                }
              >
                <option value="">Any</option>
                <option value="true">Has enrolment zone</option>
                <option value="false">No enrolment zone</option>
              </Select>
            </div>

            {/* Equity Index Band */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Equity Index
              </label>
              <Select
                value={filters.equityIndexBand?.[0]?.toString() || ''}
                onChange={(e) => 
                  handleFilterChange('equityIndexBand', e.target.value ? [parseInt(e.target.value)] : undefined)
                }
              >
                <option value="">Any</option>
                <option value="1">Band 1 (Most disadvantaged)</option>
                <option value="2">Band 2</option>
                <option value="3">Band 3</option>
                <option value="4">Band 4 (Least disadvantaged)</option>
              </Select>
            </div>

            {/* Decile */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Decile (Legacy)
              </label>
              <Select
                value={filters.decile?.[0]?.toString() || ''}
                onChange={(e) => 
                  handleFilterChange('decile', e.target.value ? [parseInt(e.target.value)] : undefined)
                }
              >
                <option value="">Any</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Decile {i + 1}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}