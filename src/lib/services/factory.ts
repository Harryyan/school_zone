import { config } from '@/config';
import { SchoolService } from './school';
import { ZoneService } from './zone';
import { GeocodingService } from './geocoding';
import type { SearchParams, SearchResponse, School, Zone, ZoneCheckResponse, GeocodeResult } from '@/types';

// Mock Services
import { searchMockSchools, mockSchools } from '@/data/mockSchools';

// Abstract interfaces for services
export interface ISchoolService {
  search(params: SearchParams): Promise<SearchResponse>;
  findById(id: string): Promise<School | null>;
  findNearby(lat: number, lng: number, radius?: number, limit?: number): Promise<School[]>;
}

export interface IZoneService {
  checkAddressInZones(lat: number, lng: number): Promise<ZoneCheckResponse>;
  getZoneBySchoolId(schoolId: string): Promise<Zone | null>;
  getZoneById(id: string): Promise<Zone | null>;
  getZonesInBounds(bounds: [number, number, number, number]): Promise<Zone[]>;
}

export interface IGeocodingService {
  geocodeAddress(query: string): Promise<GeocodeResult[]>;
  reverseGeocode(lat: number, lng: number): Promise<string | null>;
}

// Mock implementations
class MockSchoolService implements ISchoolService {
  async search(params: SearchParams): Promise<SearchResponse> {
    return searchMockSchools({
      q: params.q,
      type: params.filters?.type,
      gender: params.filters?.gender,
      proprietor: params.filters?.proprietor,
      boarding: params.filters?.boarding,
      hasZone: params.filters?.hasZone,
      equityIndexBand: params.filters?.equityIndexBand,
      decile: params.filters?.decile,
      page: params.page,
      pageSize: params.pageSize,
      sortBy: params.sortBy
    });
  }

  async findById(id: string): Promise<School | null> {
    return mockSchools.find(s => s.id === id) || null;
  }

  async findNearby(lat: number, lng: number, radius: number = 5000, limit: number = 5): Promise<School[]> {
    // Simple distance calculation for mock
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371e3;
      const φ1 = lat1 * Math.PI/180;
      const φ2 = lat2 * Math.PI/180;
      const Δφ = (lat2-lat1) * Math.PI/180;
      const Δλ = (lng2-lng1) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c;
    };

    return mockSchools
      .map(school => {
        if (!school.location) return null;
        const distance = calculateDistance(lat, lng, school.location.lat, school.location.lng);
        return distance <= radius ? { ...school, distanceMeters: distance } : null;
      })
      .filter(school => school !== null)
      .sort((a, b) => a!.distanceMeters! - b!.distanceMeters!)
      .slice(0, limit);
  }
}

class MockZoneService implements IZoneService {
  async checkAddressInZones(lat: number, lng: number): Promise<ZoneCheckResponse> {
    // Mock: assume some schools have zones at these locations
    const mockMatches = mockSchools
      .filter(school => school.hasZone && school.location)
      .slice(0, 2) // Just return first 2 for demo
      .map(school => ({
        schoolId: school.id,
        schoolName: school.name,
        zoneLastUpdated: '2024-01-01'
      }));

    return {
      queryPoint: { lat, lng },
      matches: mockMatches
    };
  }

  async getZoneBySchoolId(schoolId: string): Promise<Zone | null> {
    const school = mockSchools.find(s => s.id === schoolId);
    if (!school || !school.hasZone) return null;

    return {
      id: `zone-${schoolId}`,
      schoolId,
      geometry: {
        type: 'MultiPolygon',
        coordinates: [[[[174.7, -36.85], [174.8, -36.85], [174.8, -36.9], [174.7, -36.9], [174.7, -36.85]]]]
      },
      lastUpdated: new Date('2024-01-01')
    };
  }

  async getZoneById(id: string): Promise<Zone | null> {
    return null; // Mock implementation
  }

  async getZonesInBounds(bounds: [number, number, number, number]): Promise<Zone[]> {
    return []; // Mock implementation
  }
}

class MockGeocodingService implements IGeocodingService {
  private mockAddresses = [
    {
      address: 'Queen Street, Auckland Central, Auckland 1010',
      location: { lat: -36.8485, lng: 174.7633 },
      confidence: 90
    },
    {
      address: 'Mission Bay, Auckland 1071',
      location: { lat: -36.8578, lng: 174.8270 },
      confidence: 85
    },
    {
      address: 'Epsom, Auckland 1023',
      location: { lat: -36.8735, lng: 174.7762 },
      confidence: 85
    },
    {
      address: 'Ponsonby, Auckland 1011',
      location: { lat: -36.8467, lng: 174.7457 },
      confidence: 80
    }
  ];

  async geocodeAddress(query: string): Promise<GeocodeResult[]> {
    return this.mockAddresses.filter(addr =>
      addr.address.toLowerCase().includes(query.toLowerCase())
    );
  }

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    return 'Auckland, New Zealand'; // Mock result
  }
}

// Service Factory
class ServiceFactory {
  private static instance: ServiceFactory;
  
  private schoolService?: ISchoolService;
  private zoneService?: IZoneService;
  private geocodingService?: IGeocodingService;

  private constructor() {}

  static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  getSchoolService(): ISchoolService {
    if (!this.schoolService) {
      switch (config.services.school) {
        case 'mock':
          this.schoolService = new MockSchoolService();
          break;
        case 'database':
          this.schoolService = new SchoolService();
          break;
        default:
          console.warn(`Unknown school service: ${config.services.school}, falling back to mock`);
          this.schoolService = new MockSchoolService();
      }
    }
    return this.schoolService;
  }

  getZoneService(): IZoneService {
    if (!this.zoneService) {
      switch (config.services.zones) {
        case 'mock':
          this.zoneService = new MockZoneService();
          break;
        case 'database':
          this.zoneService = new ZoneService();
          break;
        default:
          console.warn(`Unknown zone service: ${config.services.zones}, falling back to mock`);
          this.zoneService = new MockZoneService();
      }
    }
    return this.zoneService;
  }

  getGeocodingService(): IGeocodingService {
    if (!this.geocodingService) {
      switch (config.services.geocoding) {
        case 'mock':
          this.geocodingService = new MockGeocodingService();
          break;
        default:
          this.geocodingService = new GeocodingService();
      }
    }
    return this.geocodingService;
  }

  // Reset services (useful for testing or environment switches)
  reset(): void {
    this.schoolService = undefined;
    this.zoneService = undefined;
    this.geocodingService = undefined;
  }
}

// Export singleton instance
export const serviceFactory = ServiceFactory.getInstance();

// Convenience exports
export const schoolService = () => serviceFactory.getSchoolService();
export const zoneService = () => serviceFactory.getZoneService();
export const geocodingService = () => serviceFactory.getGeocodingService();