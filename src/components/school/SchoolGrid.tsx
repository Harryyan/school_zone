'use client';

import Link from 'next/link';
import { MapPinIcon, UserGroupIcon, AcademicCapIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import type { School } from '@/types';

interface SchoolGridProps {
  schools: School[];
  showDistance?: boolean;
}

export function SchoolGrid({ schools, showDistance = false }: SchoolGridProps) {
  const formatDistance = (meters?: number) => {
    if (!meters) return '';
    if (meters < 1000) {
      return `${Math.round(meters)}m away`;
    }
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Primary': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Secondary': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Composite': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSchoolImage = (school: School) => {
    // Mock school images - in production, you'd have actual school photos
    const images = [
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1562774053-701939374585?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=300&h=200&fit=crop'
    ];
    
    // Use school ID hash to consistently assign images
    const index = Math.abs(school.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % images.length;
    return images[index];
  };

  if (schools.length === 0) {
    return (
      <div className="text-center py-12">
        <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
        <p className="text-gray-500">Try adjusting your search criteria or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {schools.map((school) => (
        <Link
          key={school.id}
          href={`/schools/${school.id}`}
          className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
        >
          {/* School Image */}
          <div className="relative h-48 overflow-hidden bg-gray-200">
            <img
              src={getSchoolImage(school)}
              alt={school.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 right-3">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getTypeColor(school.type)}`}>
                {school.type}
              </span>
            </div>
            {showDistance && school.distanceMeters && (
              <div className="absolute bottom-3 left-3">
                <span className="px-2 py-1 text-xs font-medium bg-black bg-opacity-70 text-white rounded-full">
                  {formatDistance(school.distanceMeters)}
                </span>
              </div>
            )}
          </div>

          {/* School Info */}
          <div className="p-5">
            {/* School Name */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {school.name}
            </h3>

            {/* Location */}
            <div className="flex items-center text-gray-600 mb-3">
              <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm truncate">
                {school.address || `${school.suburb}, Auckland`}
              </span>
            </div>

            {/* Key Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  <span>{school.gender}</span>
                </div>
                {school.yearLevels && (
                  <span className="text-gray-600 text-xs">
                    {school.yearLevels}
                  </span>
                )}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                <span>{school.proprietor}</span>
              </div>

              {school.roll && (
                <div className="flex items-center text-sm text-gray-600">
                  <AcademicCapIcon className="h-4 w-4 mr-2" />
                  <span>Roll: {school.roll} students</span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {school.hasZone && (
                <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-md border border-yellow-200">
                  Zoned
                </span>
              )}
              {school.boarding && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200">
                  Boarding
                </span>
              )}
              {school.specialCharacter && (
                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md border border-indigo-200">
                  {school.specialCharacter}
                </span>
              )}
              {school.equityIndexBand && (
                <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded-md border border-gray-200">
                  EI Band {school.equityIndexBand}
                </span>
              )}
            </div>

            {/* CTA Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg transition-colors font-medium text-sm group-hover:bg-blue-700">
              View School Details
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
}