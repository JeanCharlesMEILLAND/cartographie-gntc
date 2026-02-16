import { describe, it, expect } from 'vitest';
import { parseCsvServices } from '@/lib/importCsv';

describe('parseCsvServices', () => {
  it('returns error for empty CSV', () => {
    const result = parseCsvServices('');
    expect(result.services).toHaveLength(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('returns error for header-only CSV', () => {
    const result = parseCsvServices('Opérateur;Départ;Destination');
    expect(result.services).toHaveLength(0);
    expect(result.errors).toContain('Fichier vide ou sans données');
  });

  it('returns error for missing required columns', () => {
    const csv = 'Ville;Pays\nParis;France';
    const result = parseCsvServices(csv);
    expect(result.services).toHaveLength(0);
    expect(result.errors.some((e) => e.includes('Opérateur'))).toBe(true);
  });

  it('parses semicolon-separated CSV', () => {
    const csv = 'Opérateur;Départ;Destination;Jour Départ;HLR\nNaviland;Paris;Lyon;Lundi;10:00';
    const result = parseCsvServices(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.services).toHaveLength(1);
    expect(result.services[0].operator).toBe('Naviland');
    expect(result.services[0].from).toBe('Paris');
    expect(result.services[0].to).toBe('Lyon');
  });

  it('parses comma-separated CSV', () => {
    const csv = 'Opérateur,Départ,Destination\nNaviland,Paris,Lyon';
    const result = parseCsvServices(csv);
    expect(result.services).toHaveLength(1);
    expect(result.services[0].operator).toBe('Naviland');
  });

  it('normalizes day names (lundi -> Lu)', () => {
    const csv = 'Opérateur;Départ;Destination;Jour Départ;Jour Arrivée\nOp;A;B;lundi;vendredi';
    const result = parseCsvServices(csv);
    expect(result.services[0].dayDep).toBe('Lu');
    expect(result.services[0].dayArr).toBe('Ve');
  });

  it('normalizes time formats (0830 -> 08:30)', () => {
    const csv = 'Opérateur;Départ;Destination;HLR;MAD\nOp;A;B;0830;1430';
    const result = parseCsvServices(csv);
    expect(result.services[0].timeDep).toBe('08:30');
    expect(result.services[0].timeArr).toBe('14:30');
  });

  it('normalizes yes/no values', () => {
    const csv = 'Opérateur;Départ;Destination;CM;Cont;S.Pr;S.NP;P400\nOp;A;B;Oui;yes;1;Non;0';
    const result = parseCsvServices(csv);
    const s = result.services[0];
    expect(s.acceptsCM).toBe('Oui');
    expect(s.acceptsCont).toBe('Oui');
    expect(s.acceptsSemiPre).toBe('Oui');
    expect(s.acceptsSemiNon).toBe('Non');
    expect(s.acceptsP400).toBe('Non');
  });

  it('skips rows with missing required fields', () => {
    const csv = 'Opérateur;Départ;Destination\nOp;A;B\n;C;D\nOp2;;E';
    const result = parseCsvServices(csv);
    expect(result.services).toHaveLength(1);
    expect(result.skipped).toBe(2);
  });

  it('handles quoted fields', () => {
    const csv = 'Opérateur;Départ;Destination\n"Naviland Cargo";"Paris Nord";"Lyon Part-Dieu"';
    const result = parseCsvServices(csv);
    expect(result.services[0].operator).toBe('Naviland Cargo');
    expect(result.services[0].from).toBe('Paris Nord');
  });
});
