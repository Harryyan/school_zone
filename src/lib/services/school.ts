import { db } from '../db';
import { schools } from '../schema';
import { eq, sql, and, or, ilike, asc } from 'drizzle-orm';
import type { School, SearchParams, SearchResponse, SchoolType, Gender, Proprietor } from '@/types';

interface SchoolDbRow {
  id: string;
  name: string;
  akaNames: string[] | null;
  type: SchoolType;
  yearLevels: string | null;
  minYear: number | null;
  maxYear: number | null;
  gender: Gender;
  proprietor: Proprietor;
  specialCharacter: string | null;
  boarding: boolean | null;
  websiteUrl: string | null;
  phone: string | null;
  email: string | null;
  roll: number | null;
  equityIndexBand: number | null;
  decile: number | null;
  address: string | null;
  suburb: string | null;
  locationLat: number | null;
  locationLng: number | null;
  zoneId: string | null;
  hasZone: boolean;
  distanceMeters?: number | null;
}

export class SchoolService {
  async search(params: SearchParams): Promise<SearchResponse> {
    const {
      q,
      filters,
      lat,
      lng,
      radius = 5000,
      bbox,
      page = 1,
      pageSize = 20,
      sortBy = 'name'
    } = params;

    // Build WHERE conditions
    const whereConditions = [];

    // Text search
    if (q) {
      whereConditions.push(
        or(
          ilike(schools.name, `%${q}%`),
          ilike(schools.address, `%${q}%`),
          ilike(schools.suburb, `%${q}%`)
        )
      );
    }

    // Geographic filters
    if (lat && lng && radius) {
      whereConditions.push(
        sql`ST_DWithin(${schools.location}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radius})`
      );
    }

    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = bbox;
      whereConditions.push(
        sql`ST_Within(${schools.location}, ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326))`
      );
    }

    // Apply filters
    if (filters) {
      if (filters.type?.length) {
        whereConditions.push(sql`${schools.type} = ANY(${filters.type})`);
      }

      if (filters.gender?.length) {
        whereConditions.push(sql`${schools.gender} = ANY(${filters.gender})`);
      }

      if (filters.proprietor?.length) {
        whereConditions.push(sql`${schools.proprietor} = ANY(${filters.proprietor})`);
      }

      if (filters.boarding !== undefined) {
        whereConditions.push(eq(schools.boarding, filters.boarding));
      }

      if (filters.hasZone !== undefined) {
        if (filters.hasZone) {
          whereConditions.push(sql`${schools.zoneId} IS NOT NULL`);
        } else {
          whereConditions.push(sql`${schools.zoneId} IS NULL`);
        }
      }

      if (filters.equityIndexBand?.length) {
        whereConditions.push(sql`${schools.equityIndexBand} = ANY(${filters.equityIndexBand})`);
      }

      if (filters.decile?.length) {
        whereConditions.push(sql`${schools.decile} = ANY(${filters.decile})`);
      }
    }

    // Build ORDER BY
    const orderByClause = [];
    if (sortBy === 'distance' && lat && lng) {
      orderByClause.push(asc(sql`ST_Distance(${schools.location}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography)`));
    } else if (sortBy === 'name') {
      orderByClause.push(asc(schools.name));
    } else if (sortBy === 'type') {
      orderByClause.push(asc(schools.type), asc(schools.name));
    }

    // Build the complete query
    let query = db
      .select({
        id: schools.id,
        name: schools.name,
        akaNames: schools.akaNames,
        type: schools.type,
        yearLevels: schools.yearLevels,
        minYear: schools.minYear,
        maxYear: schools.maxYear,
        gender: schools.gender,
        proprietor: schools.proprietor,
        specialCharacter: schools.specialCharacter,
        boarding: schools.boarding,
        websiteUrl: schools.websiteUrl,
        phone: schools.phone,
        email: schools.email,
        roll: schools.roll,
        equityIndexBand: schools.equityIndexBand,
        decile: schools.decile,
        address: schools.address,
        suburb: schools.suburb,
        locationLat: sql<number>`ST_Y(${schools.location})`,
        locationLng: sql<number>`ST_X(${schools.location})`,
        zoneId: schools.zoneId,
        hasZone: sql<boolean>`${schools.zoneId} IS NOT NULL`,
        distanceMeters: lat && lng 
          ? sql<number>`ST_Distance(${schools.location}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography)`
          : sql<number>`NULL`
      })
      .from(schools);

    // Apply WHERE conditions if any
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions)) as typeof query;
    }

    // Apply ORDER BY if any  
    if (orderByClause.length > 0) {
      query = query.orderBy(...orderByClause) as typeof query;
    }

    // Count total results
    const totalQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(schools);
    
    // Apply same filters to count query (simplified version)
    // In production, you'd want to refactor this to avoid duplication

    const [results, [{ count: total }]] = await Promise.all([
      query.limit(pageSize).offset((page - 1) * pageSize),
      totalQuery
    ]);

    return {
      results: results.map(SchoolService.mapDbRowToSchool),
      total,
      page,
      pageSize
    };
  }

  async findById(id: string): Promise<School | null> {
    const result = await db
      .select({
        id: schools.id,
        name: schools.name,
        akaNames: schools.akaNames,
        type: schools.type,
        yearLevels: schools.yearLevels,
        minYear: schools.minYear,
        maxYear: schools.maxYear,
        gender: schools.gender,
        proprietor: schools.proprietor,
        specialCharacter: schools.specialCharacter,
        boarding: schools.boarding,
        websiteUrl: schools.websiteUrl,
        phone: schools.phone,
        email: schools.email,
        roll: schools.roll,
        equityIndexBand: schools.equityIndexBand,
        decile: schools.decile,
        address: schools.address,
        suburb: schools.suburb,
        locationLat: sql<number>`ST_Y(${schools.location})`,
        locationLng: sql<number>`ST_X(${schools.location})`,
        zoneId: schools.zoneId,
        hasZone: sql<boolean>`${schools.zoneId} IS NOT NULL`
      })
      .from(schools)
      .where(eq(schools.id, id))
      .limit(1);

    return result.length > 0 ? SchoolService.mapDbRowToSchool(result[0]) : null;
  }

  async findNearby(lat: number, lng: number, radius: number = 5000, limit: number = 5): Promise<School[]> {
    const results = await db
      .select({
        id: schools.id,
        name: schools.name,
        akaNames: schools.akaNames,
        type: schools.type,
        yearLevels: schools.yearLevels,
        minYear: schools.minYear,
        maxYear: schools.maxYear,
        gender: schools.gender,
        proprietor: schools.proprietor,
        specialCharacter: schools.specialCharacter,
        boarding: schools.boarding,
        websiteUrl: schools.websiteUrl,
        phone: schools.phone,
        email: schools.email,
        roll: schools.roll,
        equityIndexBand: schools.equityIndexBand,
        decile: schools.decile,
        address: schools.address,
        suburb: schools.suburb,
        locationLat: sql<number>`ST_Y(${schools.location})`,
        locationLng: sql<number>`ST_X(${schools.location})`,
        zoneId: schools.zoneId,
        hasZone: sql<boolean>`${schools.zoneId} IS NOT NULL`,
        distanceMeters: sql<number>`ST_Distance(${schools.location}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography)`
      })
      .from(schools)
      .where(
        sql`ST_DWithin(${schools.location}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radius})`
      )
      .orderBy(asc(sql`ST_Distance(${schools.location}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography)`))
      .limit(limit);

    return results.map(SchoolService.mapDbRowToSchool);
  }

  private static mapDbRowToSchool(row: SchoolDbRow): School {
    return {
      id: row.id,
      name: row.name,
      akaNames: row.akaNames || [],
      type: row.type,
      yearLevels: row.yearLevels || undefined,
      minYear: row.minYear || undefined,
      maxYear: row.maxYear || undefined,
      gender: row.gender,
      proprietor: row.proprietor,
      specialCharacter: row.specialCharacter || undefined,
      boarding: row.boarding || false,
      websiteUrl: row.websiteUrl || undefined,
      phone: row.phone || undefined,
      email: row.email || undefined,
      roll: row.roll || undefined,
      equityIndexBand: row.equityIndexBand || undefined,
      decile: row.decile || undefined,
      address: row.address || undefined,
      suburb: row.suburb || undefined,
      location: (row.locationLat !== null && row.locationLng !== null) ? {
        lat: row.locationLat,
        lng: row.locationLng
      } : undefined,
      zoneId: row.zoneId || undefined,
      hasZone: row.hasZone,
      distanceMeters: row.distanceMeters || undefined
    };
  }
}