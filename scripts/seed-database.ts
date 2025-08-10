import { db, client } from '../src/lib/db';
import { schools, zones } from '../src/lib/schema';
import { mockSchools } from '../src/data/mockSchools';
import { mockZones } from '../src/data/mockZones';
import { sql } from 'drizzle-orm';

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // First ensure the database schema exists
    console.log('Running database migrations...');
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'schools') THEN
          RAISE EXCEPTION 'Database schema not found. Please run: npm run db:push';
        END IF;
      END
      $$;
    `);

    // Clear existing data
    console.log('Clearing existing schools and zones...');
    await db.delete(zones);
    await db.delete(schools);

    // Insert schools
    console.log('Inserting schools...');
    const schoolIdMap: Record<string, string> = {};
    const schoolsToInsert = mockSchools.map(school => {
      const newId = crypto.randomUUID();
      schoolIdMap[school.id] = newId;
      return {
        id: newId,
        name: school.name,
        type: school.type as any,
        yearLevels: school.yearLevels,
        minYear: school.yearLevels ? parseInt(school.yearLevels.split('-')[0].replace('Y', '')) : null,
        maxYear: school.yearLevels ? parseInt(school.yearLevels.split('-')[1]?.replace('Y', '') || school.yearLevels.replace('Y', '')) : null,
        gender: school.gender as any,
        proprietor: school.proprietor as any,
        specialCharacter: school.specialCharacter,
        boarding: school.boarding,
        websiteUrl: school.websiteUrl,
        phone: school.phone,
        email: school.email,
        roll: school.roll,
        equityIndexBand: school.equityIndexBand,
        decile: school.decile,
        address: school.address,
        suburb: school.suburb,
        location: school.location ? sql`ST_SetSRID(ST_MakePoint(${school.location.lng}, ${school.location.lat}), 4326)` : null,
        zoneId: null,
        sourceProvider: 'mock-data',
        sourceFileId: 'initial-seed',
      };
    });

    await db.insert(schools).values(schoolsToInsert);
    console.log(`Inserted ${schoolsToInsert.length} schools`);

    // Insert zones if mock zones exist
    if (typeof mockZones !== 'undefined' && mockZones.length > 0) {
      console.log('Inserting zones...');
      for (const zone of mockZones) {
        // Create a simple rectangular zone around the school location
        const school = mockSchools.find(s => s.id === zone.schoolId);
        if (school && school.location) {
          const { lat, lng } = school.location;
          // Create a small square zone around the school (roughly 2km x 2km)
          const offset = 0.009; // roughly 1km in degrees
          const point = `POINT(${lng} ${lat})`;
          
          await db.insert(zones).values({
            id: crypto.randomUUID(),
            schoolId: schoolIdMap[zone.schoolId],
            geometry: sql`ST_GeomFromText(${point}, 4326)`,
            lastUpdated: zone.lastUpdated ? new Date(zone.lastUpdated) : null,
            notes: zone.notes,
            sourceProvider: 'mock-data',
            sourceFileId: 'initial-seed',
          });
        }
      }
      console.log(`Inserted ${mockZones.length} zones`);
    } else {
      console.log('No mock zones found, skipping zone insertion');
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };