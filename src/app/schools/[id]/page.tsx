'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  GlobeAltIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  HomeIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import type { School, Zone } from '@/types';
import { getMockZoneAreas } from '@/data/mockZones';
import dynamic from 'next/dynamic';

// Dynamically import the map components to avoid SSR issues
const SchoolZoneMap = dynamic(
  () => import('@/components/map/SchoolZoneMap'),
  { ssr: false }
);

const FullscreenZoneMap = dynamic(
  () => import('@/components/map/FullscreenZoneMap'),
  { ssr: false }
);

export default function SchoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const schoolId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  
  const [school, setSchool] = useState<School | null>(null);
  const [zone, setZone] = useState<Zone | null>(null);
  const [nearbySchools, setNearbySchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullscreenMap, setShowFullscreenMap] = useState(false);

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch school details
        const schoolResponse = await fetch(`/api/schools/${schoolId}`);
        if (!schoolResponse.ok) {
          throw new Error('School not found');
        }
        const schoolData = await schoolResponse.json();
        setSchool(schoolData);

        // Fetch zone information if school has a zone
        if (schoolData.hasZone && schoolData.location) {
          try {
            const zoneResponse = await fetch(`/api/schools/${schoolId}/zone`);
            if (zoneResponse.ok) {
              const zoneData = await zoneResponse.json();
              setZone(zoneData);
            }
          } catch (zoneError) {
            console.error('Failed to fetch zone data:', zoneError);
          }
        }

        // Fetch nearby schools
        if (schoolData.location) {
          try {
            const nearbyResponse = await fetch(
              `/api/schools/nearby?lat=${schoolData.location.lat}&lng=${schoolData.location.lng}&radius=3000&limit=5`
            );
            if (nearbyResponse.ok) {
              const nearbyData = await nearbyResponse.json();
              setNearbySchools(nearbyData.schools.filter((s: School) => s.id !== schoolId));
            }
          } catch (nearbyError) {
            console.error('Failed to fetch nearby schools:', nearbyError);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load school data');
      } finally {
        setIsLoading(false);
      }
    };

    if (schoolId) {
      fetchSchoolData();
    }
  }, [schoolId]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Primary': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Secondary': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Composite': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return '';
    if (meters < 1000) {
      return `${Math.round(meters)}m away`;
    }
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to search
          </Link>
          
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">School Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error || 'The school you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">Back to search</span>
            </Link>
            <h1 className="text-xl font-bold text-blue-600">🏫 Auckland Schools</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* School Header */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Hero Image */}
              <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getTypeColor(school.type)}`}>
                      {school.type} School
                    </span>
                    {school.boarding && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full border border-blue-200">
                        Boarding Available
                      </span>
                    )}
                    {school.hasZone && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full border border-yellow-200">
                        Zoned School
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {school.name}
                  </h1>
                  {school.yearLevels && (
                    <p className="text-blue-100 text-lg">
                      Year Levels: {school.yearLevels}
                    </p>
                  )}
                </div>
              </div>

              {/* School Info */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">School Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-5 w-5 text-gray-500 mr-3" />
                        <span className="text-gray-700">{school.gender}</span>
                      </div>
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-500 mr-3" />
                        <span className="text-gray-700">{school.proprietor}</span>
                      </div>
                      {school.roll && (
                        <div className="flex items-center">
                          <AcademicCapIcon className="h-5 w-5 text-gray-500 mr-3" />
                          <span className="text-gray-700">{school.roll} students</span>
                        </div>
                      )}
                      {school.specialCharacter && (
                        <div className="flex items-center">
                          <InformationCircleIcon className="h-5 w-5 text-gray-500 mr-3" />
                          <span className="text-gray-700">{school.specialCharacter}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      {school.address && (
                        <div className="flex items-start">
                          <MapPinIcon className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                          <span className="text-gray-700">{school.address}</span>
                        </div>
                      )}
                      {school.phone && (
                        <div className="flex items-center">
                          <PhoneIcon className="h-5 w-5 text-gray-500 mr-3" />
                          <a 
                            href={`tel:${school.phone}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {school.phone}
                          </a>
                        </div>
                      )}
                      {school.email && (
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-5 w-5 text-gray-500 mr-3" />
                          <a 
                            href={`mailto:${school.email}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {school.email}
                          </a>
                        </div>
                      )}
                      {school.websiteUrl && (
                        <div className="flex items-center">
                          <GlobeAltIcon className="h-5 w-5 text-gray-500 mr-3" />
                          <a 
                            href={school.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Visit Official Website →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Performance Indicators */}
                {(school.equityIndexBand || school.decile) && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Indicators</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {school.equityIndexBand && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Equity Index Band</div>
                          <div className="text-lg font-semibold text-gray-900">
                            Band {school.equityIndexBand}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {school.equityIndexBand === 1 && "Most disadvantaged"}
                            {school.equityIndexBand === 2 && "Disadvantaged"}
                            {school.equityIndexBand === 3 && "Average"}
                            {school.equityIndexBand === 4 && "Least disadvantaged"}
                          </div>
                        </div>
                      )}
                      {school.decile && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Decile (Legacy)</div>
                          <div className="text-lg font-semibold text-gray-900">
                            Decile {school.decile}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            1 = lowest, 10 = highest
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* School Zone Map - Main Content */}
            {school.hasZone && school.location && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <HomeIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="text-xl font-semibold text-gray-900">School Enrolment Zone</h3>
                      </div>
                      <p className="text-gray-600">Interactive map showing zone boundaries and school location</p>
                    </div>
                    <button 
                      onClick={() => setShowFullscreenMap(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      View Fullscreen
                    </button>
                  </div>
                </div>
                <SchoolZoneMap school={school} className="h-96" />
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <div className="w-4 h-3 bg-green-400 opacity-20 border border-green-600 rounded mr-2"></div>
                        <span className="text-gray-600">School Zone</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white mr-2"></div>
                        <span className="text-gray-600">School Location</span>
                      </div>
                    </div>
                    <span className="text-gray-500">Use + / - to zoom • Drag to pan</span>
                  </div>
                </div>
              </div>
            )}

            {/* Nearby Schools */}
            {nearbySchools.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Nearby Schools</h3>
                <div className="space-y-3">
                  {nearbySchools.map((nearbySchool) => (
                    <Link
                      key={nearbySchool.id}
                      href={`/schools/${nearbySchool.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{nearbySchool.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(nearbySchool.type)}`}>
                              {nearbySchool.type}
                            </span>
                            <span className="text-sm text-gray-600">{nearbySchool.gender}</span>
                            {nearbySchool.distanceMeters && (
                              <span className="text-sm text-blue-600 font-medium">
                                {formatDistance(nearbySchool.distanceMeters)}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowLeftIcon className="h-4 w-4 text-gray-400 rotate-180" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Zone Information */}
            {school.hasZone && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <HomeIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Zone Details</h3>
                </div>
                
                {zone ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-800 mb-2">Zone Status</div>
                      <div className="font-medium text-blue-900">Active Enrolment Zone</div>
                      {zone.lastUpdated && (
                        <div className="text-xs text-blue-600 mt-1">
                          Last updated: {new Date(zone.lastUpdated).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Areas in Zone</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        {zone.id && getMockZoneAreas(zone.id).length > 0 ? (
                          getMockZoneAreas(zone.id).map((area, index) => (
                            <div key={index} className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                area.includes(school.suburb || '') 
                                  ? 'bg-green-500' 
                                  : index % 3 === 0 
                                    ? 'bg-blue-500' 
                                    : index % 3 === 1 
                                      ? 'bg-purple-500' 
                                      : 'bg-orange-500'
                              }`}></div>
                              {area}
                              {area.includes(school.suburb || '') && (
                                <span className="ml-2 text-xs text-green-600 font-medium">
                                  (School location)
                                </span>
                              )}
                            </div>
                          ))
                        ) : (
                          <>
                            {school.suburb && (
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                {school.suburb} (School location)
                              </div>
                            )}
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                              Central areas within 2km
                            </div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                              Residential neighborhoods
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {zone.notes && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="text-sm text-yellow-800">
                          <strong>Note:</strong> {zone.notes}
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600">
                        <strong>Disclaimer:</strong> Zone boundaries may change. Please confirm with the school or Ministry of Education for final enrollment eligibility.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-gray-500 mb-2">Zone information not available</div>
                    <div className="text-xs text-gray-400">
                      Please contact the school directly for zone details.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {school.websiteUrl && (
                  <a
                    href={school.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 transition-colors"
                  >
                    <div className="flex items-center">
                      <GlobeAltIcon className="h-5 w-5 mr-3" />
                      <span className="font-medium">Visit School Website</span>
                    </div>
                    <ArrowLeftIcon className="h-4 w-4 rotate-180" />
                  </a>
                )}
                
                {school.phone && (
                  <a
                    href={`tel:${school.phone}`}
                    className="flex items-center justify-between w-full p-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 transition-colors"
                  >
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 mr-3" />
                      <span className="font-medium">Call School</span>
                    </div>
                    <ArrowLeftIcon className="h-4 w-4 rotate-180" />
                  </a>
                )}
                
                {school.location && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${school.location.lat},${school.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                  >
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 mr-3" />
                      <span className="font-medium">View on Map</span>
                    </div>
                    <ArrowLeftIcon className="h-4 w-4 rotate-180" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Map Modal */}
      {school && (
        <FullscreenZoneMap
          school={school}
          isOpen={showFullscreenMap}
          onClose={() => setShowFullscreenMap(false)}
        />
      )}
    </div>
  );
}
