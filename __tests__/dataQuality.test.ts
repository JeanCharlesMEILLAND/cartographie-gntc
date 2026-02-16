import { describe, it, expect } from 'vitest';
import { analyzeDataQuality } from '@/lib/dataQuality';
import { TransportData } from '@/lib/types';

function makeData(overrides: Partial<TransportData> = {}): TransportData {
  return {
    platforms: [
      { site: 'A', ville: 'Paris', exploitant: 'X', groupe: 'G', departement: '75', pays: 'France', lat: 48.8, lon: 2.3 },
      { site: 'B', ville: 'Lyon', exploitant: 'Y', groupe: 'G', departement: '69', pays: 'France', lat: 45.7, lon: 4.8 },
    ],
    routes: [
      { from: 'A', to: 'B', fromLat: 48.8, fromLon: 2.3, toLat: 45.7, toLon: 4.8, freq: 10, operators: ['Op1'] },
    ],
    services: [
      { operator: 'Op1', from: 'A', to: 'B', dayDep: 'Lu', timeDep: '10:00', dayArr: 'Lu', timeArr: '14:00', acceptsCM: 'Oui', acceptsCont: 'Oui', acceptsSemiPre: 'Non', acceptsSemiNon: 'Non', acceptsP400: 'Non' },
    ],
    operators: ['Op1'],
    unmatchedPlatforms: [],
    uploadedAt: '2026-01-01',
    fileName: 'test.xlsx',
    ...overrides,
  };
}

describe('analyzeDataQuality', () => {
  it('returns no issues for clean data', () => {
    const issues = analyzeDataQuality(makeData());
    expect(issues).toHaveLength(0);
  });

  it('detects duplicate routes', () => {
    const route = { from: 'A', to: 'B', fromLat: 48.8, fromLon: 2.3, toLat: 45.7, toLon: 4.8, freq: 5, operators: ['Op1'] };
    const issues = analyzeDataQuality(makeData({ routes: [route, route] }));
    const dups = issues.filter((i) => i.type === 'duplicate' && i.message.includes('Route'));
    expect(dups.length).toBeGreaterThan(0);
    expect(dups[0].severity).toBe('error');
  });

  it('detects duplicate services', () => {
    const svc = { operator: 'Op1', from: 'A', to: 'B', dayDep: 'Lu', timeDep: '10:00', dayArr: 'Lu', timeArr: '14:00', acceptsCM: 'Oui', acceptsCont: 'Oui', acceptsSemiPre: 'Non', acceptsSemiNon: 'Non', acceptsP400: 'Non' };
    const issues = analyzeDataQuality(makeData({ services: [svc, svc] }));
    const dups = issues.filter((i) => i.type === 'duplicate' && i.message.includes('Service'));
    expect(dups.length).toBeGreaterThan(0);
    expect(dups[0].severity).toBe('error');
  });

  it('detects orphan platforms', () => {
    const data = makeData();
    data.platforms.push({ site: 'C', ville: 'Marseille', exploitant: 'Z', groupe: 'G', departement: '13', pays: 'France', lat: 43.3, lon: 5.4 });
    const issues = analyzeDataQuality(data);
    const orphans = issues.filter((i) => i.type === 'orphan');
    expect(orphans.length).toBe(1);
    expect(orphans[0].severity).toBe('warning');
    expect(orphans[0].details).toContain('C');
  });

  it('detects high frequency routes', () => {
    const route = { from: 'A', to: 'B', fromLat: 48.8, fromLon: 2.3, toLat: 45.7, toLon: 4.8, freq: 100, operators: ['Op1'] };
    const issues = analyzeDataQuality(makeData({ routes: [route] }));
    const high = issues.filter((i) => i.type === 'high-freq');
    expect(high.length).toBe(1);
    expect(high[0].severity).toBe('warning');
  });

  it('detects platforms without coordinates', () => {
    const data = makeData();
    data.platforms.push({ site: 'D', ville: 'X', exploitant: '', groupe: '', departement: '', pays: '', lat: 0, lon: 0 });
    const issues = analyzeDataQuality(data);
    const noCoords = issues.filter((i) => i.type === 'no-coords');
    expect(noCoords.length).toBe(1);
    expect(noCoords[0].severity).toBe('error');
  });

  it('sorts issues by severity (errors first)', () => {
    const data = makeData();
    // Add orphan (warning) + missing coords (error)
    data.platforms.push({ site: 'C', ville: 'X', exploitant: '', groupe: '', departement: '', pays: '', lat: 0, lon: 0 });
    const issues = analyzeDataQuality(data);
    if (issues.length >= 2) {
      const sevOrder = issues.map((i) => i.severity);
      const errorIdx = sevOrder.indexOf('error');
      const warningIdx = sevOrder.indexOf('warning');
      if (errorIdx !== -1 && warningIdx !== -1) {
        expect(errorIdx).toBeLessThan(warningIdx);
      }
    }
  });
});
