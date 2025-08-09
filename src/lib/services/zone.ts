import { db } from '../db';
import { schools, zones } from '../schema';
import { eq, sql } from 'drizzle-orm';
import type { Zone, ZoneCheckResponse, Location } from '@/types';

export class ZoneService {
  static async checkAddressInZones(lat: number, lng: number): Promise<ZoneCheckResponse> {
    const results = await db
      .select({
        schoolId: schools.id,
        schoolName: schools.name,
        zoneLastUpdated: zones.lastUpdated,
        zoneId: zones.id
      })
      .from(zones)
      .innerJoin(schools, eq(zones.schoolId, schools.id))
      .where(
        sql`ST_Contains(${zones.geometry}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326))`
      );

    return {
      queryPoint: { lat, lng },
      matches: results.map(row => ({
        schoolId: row.schoolId,
        schoolName: row.schoolName,
        zoneLastUpdated: row.zoneLastUpdated?.toISOString().split('T')[0]
      }))
    };
  }

  static async getZoneBySchoolId(schoolId: string): Promise<Zone | null> {
    const result = await db
      .select({
        id: zones.id,
        schoolId: zones.schoolId,
        geometry: zones.geometry,
        lastUpdated: zones.lastUpdated,
        notes: zones.notes
      })
      .from(zones)
      .where(eq(zones.schoolId, schoolId))
      .limit(1);

    if (result.length === 0) return null;

    const row = result[0];
    return {
      id: row.id,
      schoolId: row.schoolId,
      geometry: row.geometry,
      lastUpdated: row.lastUpdated || undefined,
      notes: row.notes || undefined
    };
  }

  static async getZoneById(id: string): Promise<Zone | null> {
    const result = await db
      .select({
        id: zones.id,
        schoolId: zones.schoolId,
        geometry: zones.geometry,
        lastUpdated: zones.lastUpdated,
        notes: zones.notes
      })
      .from(zones)
      .where(eq(zones.id, id))
      .limit(1);

    if (result.length === 0) return null;

    const row = result[0];
    return {
      id: row.id,
      schoolId: row.schoolId,
      geometry: row.geometry,
      lastUpdated: row.lastUpdated || undefined,
      notes: row.notes || undefined
    };
  }

  static async getZonesInBounds(bounds: [number, number, number, number]): Promise<Zone[]> {
    const [minLng, minLat, maxLng, maxLat] = bounds;
    
    const results = await db
      .select({
        id: zones.id,
        schoolId: zones.schoolId,
        geometry: zones.geometry,
        lastUpdated: zones.lastUpdated,
        notes: zones.notes
      })
      .from(zones)
      .where(
        sql`ST_Intersects(${zones.geometry}, ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326))`
      );

    return results.map(row => ({
      id: row.id,
      schoolId: row.schoolId,
      geometry: row.geometry,
      lastUpdated: row.lastUpdated || undefined,
      notes: row.notes || undefined
    }));
  }
}