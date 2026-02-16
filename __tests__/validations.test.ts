import { describe, it, expect } from 'vitest';
import {
  parseBody,
  createUserSchema,
  updateUserSchema,
  createOperatorSchema,
  updateOperatorSchema,
  railGeometrySchema,
  transportDataSchema,
} from '@/lib/validations';

describe('createUserSchema', () => {
  it('accepts valid user data', () => {
    const result = parseBody(createUserSchema, {
      email: 'test@example.com',
      password: 'secret123',
      name: 'Jean',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('test@example.com');
      expect(result.data.role).toBe('operator'); // default
    }
  });

  it('rejects invalid email', () => {
    const result = parseBody(createUserSchema, {
      email: 'not-an-email',
      password: 'secret123',
      name: 'Jean',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = parseBody(createUserSchema, {
      email: 'test@example.com',
      password: '123',
      name: 'Jean',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toContain('6');
  });

  it('rejects missing name', () => {
    const result = parseBody(createUserSchema, {
      email: 'test@example.com',
      password: 'secret123',
    });
    expect(result.success).toBe(false);
  });

  it('accepts admin role', () => {
    const result = parseBody(createUserSchema, {
      email: 'admin@test.com',
      password: 'secret123',
      name: 'Admin',
      role: 'admin',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.role).toBe('admin');
  });

  it('rejects invalid role', () => {
    const result = parseBody(createUserSchema, {
      email: 'test@test.com',
      password: 'secret123',
      name: 'Jean',
      role: 'superadmin',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateUserSchema', () => {
  it('requires id', () => {
    const result = parseBody(updateUserSchema, { name: 'Jean' });
    expect(result.success).toBe(false);
  });

  it('accepts id with optional fields', () => {
    const result = parseBody(updateUserSchema, { id: 1, name: 'New Name' });
    expect(result.success).toBe(true);
  });

  it('accepts id alone', () => {
    const result = parseBody(updateUserSchema, { id: 1 });
    expect(result.success).toBe(true);
  });
});

describe('createOperatorSchema', () => {
  it('accepts valid operator', () => {
    const result = parseBody(createOperatorSchema, { name: 'Naviland Cargo' });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = parseBody(createOperatorSchema, { name: '' });
    expect(result.success).toBe(false);
  });

  it('accepts optional contact email', () => {
    const result = parseBody(createOperatorSchema, {
      name: 'Test',
      contactEmail: 'contact@test.com',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty contact email', () => {
    const result = parseBody(createOperatorSchema, {
      name: 'Test',
      contactEmail: '',
    });
    expect(result.success).toBe(true);
  });
});

describe('updateOperatorSchema', () => {
  it('requires id', () => {
    const result = parseBody(updateOperatorSchema, { name: 'New' });
    expect(result.success).toBe(false);
  });

  it('accepts id with fields', () => {
    const result = parseBody(updateOperatorSchema, { id: 1, description: 'Updated' });
    expect(result.success).toBe(true);
  });
});

describe('railGeometrySchema', () => {
  it('accepts valid geometry request', () => {
    const result = parseBody(railGeometrySchema, {
      from: 'Paris', to: 'Lyon',
      fromLat: 48.8, fromLon: 2.3, toLat: 45.7, toLon: 4.8,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing from', () => {
    const result = parseBody(railGeometrySchema, {
      from: '', to: 'Lyon',
      fromLat: 48.8, fromLon: 2.3, toLat: 45.7, toLon: 4.8,
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric coordinates', () => {
    const result = parseBody(railGeometrySchema, {
      from: 'Paris', to: 'Lyon',
      fromLat: 'abc', fromLon: 2.3, toLat: 45.7, toLon: 4.8,
    });
    expect(result.success).toBe(false);
  });
});

describe('transportDataSchema', () => {
  const validData = {
    platforms: [{ site: 'A', ville: 'Paris', exploitant: 'X', groupe: 'G', departement: '75', pays: 'France', lat: 48.8, lon: 2.3 }],
    routes: [{ from: 'A', to: 'B', fromLat: 48.8, fromLon: 2.3, toLat: 45.7, toLon: 4.8, freq: 5, operators: ['Op1'] }],
    services: [{ operator: 'Op1', from: 'A', to: 'B', dayDep: 'Lu', timeDep: '10:00', dayArr: 'Lu', timeArr: '14:00', acceptsCM: 'Oui', acceptsCont: 'Oui', acceptsSemiPre: 'Non', acceptsSemiNon: 'Non', acceptsP400: 'Non' }],
    operators: ['Op1'],
    unmatchedPlatforms: [],
    uploadedAt: '2026-01-01',
    fileName: 'test.xlsx',
  };

  it('accepts valid transport data', () => {
    const result = parseBody(transportDataSchema, validData);
    expect(result.success).toBe(true);
  });

  it('rejects missing platforms array', () => {
    const { platforms, ...rest } = validData;
    const result = parseBody(transportDataSchema, rest);
    expect(result.success).toBe(false);
  });

  it('rejects platform without lat', () => {
    const bad = { ...validData, platforms: [{ site: 'A', ville: 'P', exploitant: '', groupe: '', departement: '', pays: '', lat: 'abc', lon: 2.3 }] };
    const result = parseBody(transportDataSchema, bad);
    expect(result.success).toBe(false);
  });
});
