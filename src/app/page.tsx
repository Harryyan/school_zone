'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SchoolGrid } from '@/components/school/SchoolGrid';
import type { SearchResponse, SearchFilters as FilterType } from '@/types';

export default function HomePage() {
  const [searchResponse, setSearchResponse] = useState<SearchResponse>({
    results: [],
    total: 0,
    page: 1,
    pageSize: 20
  });
  const [filters, setFilters] = useState<FilterType>({});
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async (query?: string, page: number = 1, currentFilters: FilterType = filters) => {
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20'
      });

      if (query) {
        params.append('q', query);
      }

      // Add filters to params
      if (currentFilters.type?.length) {
        params.append('type', currentFilters.type.join(','));
      }
      if (currentFilters.gender?.length) {
        params.append('gender', currentFilters.gender.join(','));
      }
      if (currentFilters.proprietor?.length) {
        params.append('proprietor', currentFilters.proprietor.join(','));
      }
      if (currentFilters.boarding !== undefined) {
        params.append('boarding', currentFilters.boarding.toString());
      }
      if (currentFilters.hasZone !== undefined) {
        params.append('hasZone', currentFilters.hasZone.toString());
      }
      if (currentFilters.equityIndexBand?.length) {
        params.append('equityIndexBand', currentFilters.equityIndexBand.join(','));
      }
      if (currentFilters.decile?.length) {
        params.append('decile', currentFilters.decile.join(','));
      }

      const response = await fetch(`/api/search?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setSearchResponse(data);
      } else {
        console.error('Search failed');
        // You'd handle this error properly in a real app
      }
    } catch (error) {
      console.error('Search error:', error);
      // You'd handle this error properly in a real app
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setHasSearched(true);
    performSearch(query, 1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
    loadDefaultSchools();
  };

  const loadDefaultSchools = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/search?pageSize=12&sortBy=name');
      if (response.ok) {
        const data = await response.json();
        setSearchResponse(data);
      }
    } catch (error) {
      console.error('Error loading default schools:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    if (searchQuery || Object.keys(newFilters).length > 0) {
      setHasSearched(true);
      performSearch(searchQuery, 1, newFilters);
    } else {
      loadDefaultSchools();
    }
  };

  const handleClearFilters = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    if (searchQuery) {
      performSearch(searchQuery, 1, emptyFilters);
    } else {
      loadDefaultSchools();
    }
  };

  const handlePageChange = (page: number) => {
    if (hasSearched) {
      performSearch(searchQuery, page);
    } else {
      // For default view, reload with pagination
      setIsLoading(true);
      fetch(`/api/search?page=${page}&pageSize=12&sortBy=name`)
        .then(res => res.json())
        .then(data => setSearchResponse(data))
        .finally(() => setIsLoading(false));
    }
  };

  // Load default schools on component mount
  useEffect(() => {
    loadDefaultSchools();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">
                🏫 Auckland Schools
              </h1>
            </div>
            <div className="hidden md:flex space-x-6 text-sm">
              <a href="#" className="text-gray-700 hover:text-blue-600">Browse Schools</a>
              <a href="#" className="text-gray-700 hover:text-blue-600">Zone Checker</a>
              <a href="#" className="text-gray-700 hover:text-blue-600">About</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Find the Perfect School in Auckland
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Discover primary and secondary schools, check enrolment zones, and find your ideal educational match
          </p>
          
          {/* Search bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              onClear={handleClearSearch}
              initialValue={searchQuery}
              placeholder="Search by school name, address, or suburb..."
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <SearchFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        isExpanded={isFiltersExpanded}
        onToggleExpanded={() => setIsFiltersExpanded(!isFiltersExpanded)}
      />

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {hasSearched ? 'Search Results' : 'Featured Schools'}
          </h3>
          {!hasSearched && (
            <p className="text-gray-600">
              Explore some of Auckland's top-rated schools or use the search above to find specific schools
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Schools Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : searchResponse.results.length > 0 ? (
              <div>
                <SchoolGrid 
                  schools={searchResponse.results}
                  showDistance={hasSearched && !!searchQuery}
                />

                {/* Pagination */}
                {searchResponse.total > searchResponse.pageSize && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center gap-2">
                      {searchResponse.page > 1 && (
                        <button
                          onClick={() => handlePageChange(searchResponse.page - 1)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Previous
                        </button>
                      )}
                      <span className="px-4 py-2 text-sm text-gray-700">
                        Page {searchResponse.page} of {Math.ceil(searchResponse.total / searchResponse.pageSize)}
                      </span>
                      {searchResponse.page < Math.ceil(searchResponse.total / searchResponse.pageSize) && (
                        <button
                          onClick={() => handlePageChange(searchResponse.page + 1)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Next
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <SchoolGrid schools={[]} />
            )}
          </div>

          {/* Map Sidebar */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Map View</h4>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-2xl mb-2">🗺️</div>
                  <div className="text-sm">Interactive map coming soon</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
