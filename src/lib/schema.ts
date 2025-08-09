import { pgTable, uuid, varchar, text, integer, boolean, timestamp, geometry, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const schoolTypeEnum = pgEnum('school_type', ['Primary', 'Intermediate', 'Secondary', 'Composite']);
export const genderEnum = pgEnum('gender', ['Co-ed', 'Boys', 'Girls']);
export const proprietorEnum = pgEnum('proprietor', ['State', 'State-Integrated', 'Private']);

export const schools = pgTable('schools', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  akaNames: text('aka_names').array(),
  type: schoolTypeEnum('type').notNull(),
  yearLevels: varchar('year_levels', { length: 50 }),
  minYear: integer('min_year'),
  maxYear: integer('max_year'),
  gender: genderEnum('gender').notNull(),
  proprietor: proprietorEnum('proprietor').notNull(),
  specialCharacter: varchar('special_character', { length: 100 }),
  boarding: boolean('boarding').default(false),
  websiteUrl: varchar('website_url', { length: 500 }),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  roll: integer('roll'),
  equityIndexBand: integer('equity_index_band'),
  decile: integer('decile'),
  address: text('address'),
  suburb: varchar('suburb', { length: 100 }),
  location: geometry('location', { type: 'point', mode: 'xy' }),
  zoneId: uuid('zone_id'),
  sourceProvider: varchar('source_provider', { length: 100 }),
  sourceFileId: varchar('source_file_id', { length: 100 }),
  importedAt: timestamp('imported_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const zones = pgTable('zones', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').references(() => schools.id).notNull(),
  geometry: geometry('geometry', { type: 'multipolygon', mode: 'xy' }).notNull(),
  lastUpdated: timestamp('last_updated'),
  notes: text('notes'),
  sourceProvider: varchar('source_provider', { length: 100 }),
  sourceFileId: varchar('source_file_id', { length: 100 }),
  importedAt: timestamp('imported_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const addressCache = pgTable('address_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  queryString: varchar('query_string', { length: 500 }).notNull(),
  normalizedAddress: text('normalized_address'),
  location: geometry('location', { type: 'point', mode: 'xy' }),
  geocoderProvider: varchar('geocoder_provider', { length: 50 }),
  confidence: integer('confidence'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const schoolsRelations = relations(schools, ({ one }) => ({
  zone: one(zones, {
    fields: [schools.zoneId],
    references: [zones.id],
  }),
}));

export const zonesRelations = relations(zones, ({ one }) => ({
  school: one(schools, {
    fields: [zones.schoolId],
    references: [schools.id],
  }),
}));