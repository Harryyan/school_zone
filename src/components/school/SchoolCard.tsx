'use client';

import Link from 'next/link';
import { MapPinIcon, GlobeAltIcon, PhoneIcon } from '@heroicons/react/24/outline';
import type { School } from '@/types';

interface SchoolCardProps {
  school: School;
  showDistance?: boolean;
}

export function SchoolCard({ school, showDistance = false }: SchoolCardProps) {
  const formatDistance = (meters?: number) => {
    if (!meters) return '';
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Primary': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Secondary': return 'bg-purple-100 text-purple-800';
      case 'Composite': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <Link 
            href={`/schools/${school.id}`}
            className="block group"
          >
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {school.name}
            </h3>
          </Link>
          
          {/* School details */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(school.type)}`}>
              {school.type}
            </span>
            
            {school.yearLevels && (
              <span className="text-gray-600">
                {school.yearLevels}
              </span>
            )}
            
            <span className="text-gray-600">
              {school.gender}
            </span>
            
            <span className="text-gray-600">
              {school.proprietor}
            </span>

            {school.boarding && (
              <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Boarding
              </span>
            )}

            {school.hasZone && (
              <span className="inline-flex px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                Zoned
              </span>
            )}
          </div>

          {/* Address and distance */}
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
            {school.address && (
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{school.address}</span>
              </div>
            )}
            
            {showDistance && school.distanceMeters && (
              <span className="font-medium text-blue-600">
                {formatDistance(school.distanceMeters)} away
              </span>
            )}
          </div>

          {/* Contact info */}
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
            {school.phone && (
              <div className="flex items-center gap-1">
                <PhoneIcon className="h-4 w-4 flex-shrink-0" />
                <span>{school.phone}</span>
              </div>
            )}
            
            {school.websiteUrl && (
              <a 
                href={school.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <GlobeAltIcon className="h-4 w-4 flex-shrink-0" />
                <span>Website</span>
              </a>
            )}
          </div>

          {/* Additional info */}
          {(school.roll || school.equityIndexBand || school.decile) && (
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {school.roll && (
                <span>Roll: {school.roll}</span>
              )}
              
              {school.equityIndexBand && (
                <span>Equity Index: Band {school.equityIndexBand}</span>
              )}
              
              {school.decile && (
                <span>Decile: {school.decile}</span>
              )}
            </div>
          )}

          {school.specialCharacter && (
            <div className="mt-2">
              <span className="inline-flex px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                {school.specialCharacter}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}