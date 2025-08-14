'use client';

import React from 'react';
import type { School } from '@/types';

interface FallbackMapProps {
  school: School;
  className?: string;
  showError?: boolean;
}

export default function FallbackMap({ school, className = '', showError = true }: FallbackMapProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center p-6">
          <div className="text-gray-400 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="font-medium text-gray-700 mb-2">Interactive Map Unavailable</h3>
          {showError && (
            <div className="text-sm text-gray-600 mb-4">
              <p>Map requires a valid Mapbox access token.</p>
              <p className="mt-1">See MAPBOX_SETUP.md for setup instructions.</p>
            </div>
          )}
          
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-left">
            <h4 className="font-medium text-gray-900 mb-2">{school.name}</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {school.address && (
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {school.address}
                </p>
              )}
              <p className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {school.hasZone ? 'Has enrolment zone' : 'No enrolment zone'}
              </p>
              {school.location && (
                <p className="text-xs text-gray-500 mt-2">
                  Location: {school.location.lat.toFixed(4)}, {school.location.lng.toFixed(4)}
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <a 
              href={school.location ? `https://www.google.com/maps/search/?api=1&query=${school.location.lat},${school.location.lng}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View on Google Maps →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}