export type SchoolType = 'Primary' | 'Intermediate' | 'Secondary' | 'Composite';
export type Gender = 'Co-ed' | 'Boys' | 'Girls';
export type Proprietor = 'State' | 'State-Integrated' | 'Private';

export interface Location {
  lat: number;
  lng: number;
}

export interface School {
  id: string;
  name: string;
  akaNames?: string[];
  type: SchoolType;
  yearLevels?: string;
  minYear?: number;
  maxYear?: number;
  gender: Gender;
  proprietor: Proprietor;
  specialCharacter?: string;
  boarding: boolean;
  websiteUrl?: string;
  phone?: string;
  email?: string;
  roll?: number;
  equityIndexBand?: number;
  decile?: number;
  address?: string;
  suburb?: string;
  location?: Location;
  zoneId?: string;
  distanceMeters?: number;
  hasZone: boolean;
}

export interface Zone {
  id: string;
  schoolId: string;
  geometry: any; // GeoJSON MultiPolygon
  lastUpdated?: Date;
  notes?: string;
}

export interface SearchFilters {
  type?: SchoolType[];
  gender?: Gender[];
  proprietor?: Proprietor[];
  boarding?: boolean;
  hasZone?: boolean;
  yearLevels?: string[];
  equityIndexBand?: number[];
  decile?: number[];
  radius?: number;
  center?: Location;
}

export interface SearchParams {
  q?: string;
  filters?: SearchFilters;
  lat?: number;
  lng?: number;
  radius?: number;
  bbox?: [number, number, number, number];
  page?: number;
  pageSize?: number;
  sortBy?: 'distance' | 'name' | 'type';
}

export interface SearchResponse {
  results: School[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ZoneCheckResponse {
  queryPoint: Location;
  matches: Array<{
    schoolId: string;
    schoolName: string;
    zoneLastUpdated?: string;
  }>;
}

export interface GeocodeResult {
  address: string;
  location: Location;
  confidence: number;
}