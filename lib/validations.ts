import { z } from 'zod';

// ── Users ──

export const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe : 6 caractères minimum'),
  name: z.string().min(1, 'Nom requis'),
  role: z.enum(['admin', 'operator']).default('operator'),
  operator: z.string().optional().default(''),
});

export const updateUserSchema = z.object({
  id: z.number({ required_error: 'ID requis' }),
  email: z.string().email('Email invalide').optional(),
  password: z.string().min(6, 'Mot de passe : 6 caractères minimum').optional(),
  name: z.string().min(1).optional(),
  role: z.enum(['admin', 'operator']).optional(),
  operator: z.string().optional(),
});

// ── Operators ──

export const createOperatorSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  logo: z.string().nullish(),
  description: z.string().nullish(),
  website: z.string().nullish(),
  contactEmail: z.string().email('Email invalide').nullish().or(z.literal('')),
  contactPhone: z.string().nullish(),
  address: z.string().nullish(),
  color: z.string().nullish(),
});

export const updateOperatorSchema = z.object({
  id: z.number({ required_error: 'ID requis' }),
  name: z.string().min(1).optional(),
  logo: z.string().nullish(),
  description: z.string().nullish(),
  website: z.string().nullish(),
  contactEmail: z.string().email().nullish().or(z.literal('')),
  contactPhone: z.string().nullish(),
  address: z.string().nullish(),
  color: z.string().nullish(),
});

// ── Rail geometry ──

export const railGeometrySchema = z.object({
  from: z.string().min(1, 'Champ "from" requis'),
  to: z.string().min(1, 'Champ "to" requis'),
  fromLat: z.number(),
  fromLon: z.number(),
  toLat: z.number(),
  toLon: z.number(),
});

// ── Transport data (save) ──

const platformSchema = z.object({
  site: z.string().min(1),
  ville: z.string(),
  exploitant: z.string(),
  groupe: z.string(),
  departement: z.string(),
  pays: z.string(),
  lat: z.number(),
  lon: z.number(),
  chantierSNCF: z.boolean().optional(),
});

const routeSchema = z.object({
  from: z.string(),
  to: z.string(),
  fromLat: z.number(),
  fromLon: z.number(),
  toLat: z.number(),
  toLon: z.number(),
  freq: z.number(),
  operators: z.array(z.string()),
});

const serviceSchema = z.object({
  operator: z.string(),
  from: z.string(),
  to: z.string(),
  dayDep: z.string(),
  timeDep: z.string(),
  dayArr: z.string(),
  timeArr: z.string(),
  acceptsCM: z.string(),
  acceptsCont: z.string(),
  acceptsSemiPre: z.string(),
  acceptsSemiNon: z.string(),
  acceptsP400: z.string(),
});

export const transportDataSchema = z.object({
  platforms: z.array(platformSchema),
  routes: z.array(routeSchema),
  services: z.array(serviceSchema),
  operators: z.array(z.string()),
  unmatchedPlatforms: z.array(z.string()),
  uploadedAt: z.string(),
  fileName: z.string(),
});

// ── Helper ──

export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const msg = result.error.issues.map((i) => i.message).join(', ');
  return { success: false, error: msg };
}
