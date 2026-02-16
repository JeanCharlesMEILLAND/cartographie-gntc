import { pgTable, text, timestamp, serial, varchar, integer, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('operator'), // 'admin' | 'operator'
  operator: varchar('operator', { length: 255 }), // linked operator name (for operator role)
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const operators = pgTable('operators', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  logo: text('logo'), // Base64 encoded image
  description: text('description'),
  website: varchar('website', { length: 500 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  address: text('address'),
  color: varchar('color', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  userName: varchar('user_name', { length: 255 }),
  action: varchar('action', { length: 50 }).notNull(), // 'update' | 'delete' | 'create'
  tableName: varchar('table_name', { length: 50 }).notNull(), // 'platforms' | 'flux'
  recordId: text('record_id'),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const transportData = pgTable('transport_data', {
  id: serial('id').primaryKey(),
  data: jsonb('data').notNull(),
  fileName: varchar('file_name', { length: 500 }),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const railGeometries = pgTable('rail_geometries', {
  id: serial('id').primaryKey(),
  data: jsonb('data').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
