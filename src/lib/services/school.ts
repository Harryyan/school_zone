import { db } from '../db';
import { schools, zones } from '../schema';
import { eq, sql, and, or, ilike, desc, asc } from 'drizzle-orm';
import type { School, SearchParams, SearchResponse, SearchFilters } from '@/types';

export class SchoolService {
  static async search(params: SearchParams): Promise<SearchResponse> {
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
        location: schools.location,
        zoneId: schools.zoneId,
        hasZone: sql<boolean>`${schools.zoneId} IS NOT NULL`,
        distanceMeters: lat && lng 
          ? sql<number>`ST_Distance(${schools.location}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography)`
          : sql<number>`NULL`
      })
      .from(schools);

    // Text search
    if (q) {
      query = query.where(
        or(
          ilike(schools.name, `%${q}%`),
          ilike(schools.address, `%${q}%`),
          ilike(schools.suburb, `%${q}%`)
        )
      );
    }

    // Geographic filters
    if (lat && lng && radius) {
      query = query.where(
        sql`ST_DWithin(${schools.location}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radius})`
      );
    }

    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = bbox;
      query = query.where(
        sql`ST_Within(${schools.location}, ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326))`
      );
    }

    // Apply filters
    if (filters) {
      const conditions: any[] = [];

      if (filters.type?.length) {
        conditions.push(sql`${schools.type} = ANY(${filters.type})`);
      }

      if (filters.gender?.length) {
        conditions.push(sql`${schools.gender} = ANY(${filters.gender})`);
      }

      if (filters.proprietor?.length) {
        conditions.push(sql`${schools.proprietor} = ANY(${filters.proprietor})`);
      }

      if (filters.boarding !== undefined) {
        conditions.push(eq(schools.boarding, filters.boarding));
      }

      if (filters.hasZone !== undefined) {
        if (filters.hasZone) {
          conditions.push(sql`${schools.zoneId} IS NOT NULL`);
        } else {
          conditions.push(sql`${schools.zoneId} IS NULL`);
        }
      }

      if (filters.equityIndexBand?.length) {
        conditions.push(sql`${schools.equityIndexBand} = ANY(${filters.equityIndexBand})`);
      }

      if (filters.decile?.length) {
        conditions.push(sql`${schools.decile} = ANY(${filters.decile})`);
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }

    // Sorting
    if (sortBy === 'distance' && lat && lng) {
      query = query.orderBy(asc(sql`ST_Distance(${schools.location}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography)`));
    } else if (sortBy === 'name') {
      query = query.orderBy(asc(schools.name));
    } else if (sortBy === 'type') {
      query = query.orderBy(asc(schools.type), asc(schools.name));
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
      results: results.map(this.mapDbRowToSchool),
      total,
      page,
      pageSize
    };
  }

  static async findById(id: string): Promise<School | null> {
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
        location: schools.location,
        zoneId: schools.zoneId,
        hasZone: sql<boolean>`${schools.zoneId} IS NOT NULL`
      })
      .from(schools)
      .where(eq(schools.id, id))
      .limit(1);

    return result.length > 0 ? this.mapDbRowToSchool(result[0]) : null;
  }

  static async findNearby(lat: number, lng: number, radius: number = 5000, limit: number = 5): Promise<School[]> {
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
        location: schools.location,
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

    return results.map(this.mapDbRowToSchool);
  }

  private static mapDbRowToSchool(row: any): School {
    return {
      id: row.id,
      name: row.name,
      akaNames: row.akaNames || [],
      type: row.type,
      yearLevels: row.yearLevels,
      minYear: row.minYear,
      maxYear: row.maxYear,
      gender: row.gender,
      proprietor: row.proprietor,
      specialCharacter: row.specialCharacter,
      boarding: row.boarding || false,
      websiteUrl: row.websiteUrl,
      phone: row.phone,
      email: row.email,
      roll: row.roll,
      equityIndexBand: row.equityIndexBand,
      decile: row.decile,
      address: row.address,
      suburb: row.suburb,
      location: row.location ? {
        lat: row.location.coordinates[1],
        lng: row.location.coordinates[0]
      } : undefined,
      zoneId: row.zoneId,
      hasZone: row.hasZone,
      distanceMeters: row.distanceMeters
    };
  }
}