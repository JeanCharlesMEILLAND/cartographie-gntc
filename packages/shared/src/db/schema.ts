import { pgTable, text, timestamp, serial, varchar, integer, jsonb, real } from 'drizzle-orm/pg-core';

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

export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 30 }).notNull(), // 'cherche_transport' | 'propose_capacite' | 'wagons_disponibles'

  // Author
  authorId: integer('author_id').references(() => users.id).notNull(),
  authorName: varchar('author_name', { length: 255 }).notNull(),
  authorCompany: varchar('author_company', { length: 255 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 50 }),

  // Content
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  produit: varchar('produit', { length: 255 }),
  tonnage: integer('tonnage'),

  // Geolocation
  lat: real('lat').notNull(),
  lon: real('lon').notNull(),
  commune: varchar('commune', { length: 255 }),
  iteId: varchar('ite_id', { length: 50 }),
  iteName: varchar('ite_name', { length: 255 }),

  // Destination (optional)
  destLat: real('dest_lat'),
  destLon: real('dest_lon'),
  destCommune: varchar('dest_commune', { length: 255 }),

  // Dates
  dateDebut: timestamp('date_debut'),
  dateFin: timestamp('date_fin'),

  // Wagon-specific
  wagonType: varchar('wagon_type', { length: 100 }),
  wagonCount: integer('wagon_count'),

  // Status
  status: varchar('status', { length: 20 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  announcementId: integer('announcement_id').references(() => announcements.id).notNull(),
  senderId: integer('sender_id').references(() => users.id).notNull(),
  senderName: varchar('sender_name', { length: 255 }).notNull(),
  senderCompany: varchar('sender_company', { length: 255 }),
  recipientId: integer('recipient_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const iteEnrichment = pgTable('ite_enrichment', {
  id: serial('id').primaryKey(),
  iteId: varchar('ite_id', { length: 50 }).notNull().unique(),

  // Marchandises & volume
  marchandises: jsonb('marchandises').$type<string[]>(),
  volumeAnnuel: integer('volume_annuel'),

  // Équipements
  equipements: jsonb('equipements').$type<string[]>(),
  moyensTraction: jsonb('moyens_traction').$type<string[]>(),

  // Infrastructure
  nombreVoies: integer('nombre_voies'),
  longueurUtile: integer('longueur_utile'),
  electrifie: integer('electrifie').default(0),
  gabarit: varchar('gabarit', { length: 20 }),
  typeSol: varchar('type_sol', { length: 20 }),
  capaciteWagons: integer('capacite_wagons'),
  tonnageMax: integer('tonnage_max'),

  // ICPE (Installations Classées — Georisques)
  icpeStatutSeveso: varchar('icpe_statut_seveso', { length: 30 }),
  icpeRegime: varchar('icpe_regime', { length: 30 }),
  icpeCodeAiot: varchar('icpe_code_aiot', { length: 20 }),
  icpeRaisonSociale: varchar('icpe_raison_sociale', { length: 255 }),

  // Gare de fret la plus proche (SNCF Open Data)
  garefretNom: varchar('garefret_nom', { length: 255 }),
  garefretDistanceKm: real('garefret_distance_km'),

  // Contact
  contactNom: varchar('contact_nom', { length: 255 }),
  contactTelephone: varchar('contact_telephone', { length: 50 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  siteWeb: varchar('site_web', { length: 500 }),

  // Notes & photos
  notes: text('notes'),
  photos: jsonb('photos').$type<string[]>(),

  // Vérification
  dateVerification: timestamp('date_verification'),
  verifieePar: varchar('verifiee_par', { length: 255 }),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const registrations = pgTable('registrations', {
  id: serial('id').primaryKey(),
  company: varchar('company', { length: 255 }).notNull(),
  activity: varchar('activity', { length: 255 }).notNull(),
  contact: varchar('contact', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  website: varchar('website', { length: 500 }),
  description: text('description'),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending' | 'approved' | 'rejected'
  notes: text('notes'), // admin notes
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const ports = pgTable('ports', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 500 }).notNull(),
  latitude: text('latitude').notNull(),
  longitude: text('longitude').notNull(),
  nature: varchar('nature', { length: 50 }),        // 'Fluvial' | 'Maritime' | 'Fluvio-maritime'
  source: varchar('source', { length: 20 }).notNull(), // 'sandre' | 'osm' | 'manual'
  sourceId: varchar('source_id', { length: 100 }),
  commune: varchar('commune', { length: 255 }),
  operator: varchar('operator', { length: 255 }),
  gestion: varchar('gestion', { length: 255 }),
  zone: varchar('zone', { length: 255 }),
  cargo: varchar('cargo', { length: 255 }),
  hasCommerce: integer('has_commerce').default(0),
  visible: integer('visible').default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
