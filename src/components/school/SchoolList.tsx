'use client';

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { SchoolCard } from './SchoolCard';
import { Button } from '@/components/ui/Button';
import type { School, SearchResponse } from '@/types';

interface SchoolListProps {
  searchResponse: SearchResponse;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  showDistance?: boolean;
}

export function SchoolList({ 
  searchResponse, 
  onPageChange, 
  isLoading = false,
  showDistance = false 
}: SchoolListProps) {
  const { results, total, page, pageSize } = searchResponse;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

  const handlePreviousPage = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  };

  const handlePageClick = (pageNum: number) => {
    onPageChange(pageNum);
  };

  const getVisiblePages = () => {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-4">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex-1 p-4">
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No schools found</div>
          <div className="text-gray-400 text-sm">
            Try adjusting your search criteria or filters
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Results header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex}-{endIndex} of {total} schools
          </div>
          {/* Could add sort controls here */}
        </div>
      </div>

      {/* School list */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {results.map(school => (
          <SchoolCard 
            key={school.id} 
            school={school} 
            showDistance={showDistance}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {getVisiblePages().map(pageNum => (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handlePageClick(pageNum)}
                  className="min-w-[2.5rem]"
                >
                  {pageNum}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}