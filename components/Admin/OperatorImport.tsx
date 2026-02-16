'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { TransportData, Service } from '@/lib/types';
import { parseCsvServices } from '@/lib/importCsv';

interface Props {
  data: TransportData;
  operator: string;
  onSave: (d: TransportData) => void;
  saving: boolean;
}

export default function OperatorImport({ data, operator, onSave, saving }: Props) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<Service[] | null>(null);
  const [allParsed, setAllParsed] = useState<Service[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<{ added: number; replaced: boolean } | null>(null);
  const [mode, setMode] = useState<'add' | 'replace'>('add');
  const [skipped, setSkipped] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setErrors([]);
    setPreview(null);
    setImportResult(null);
    setSkipped(0);

    if (!file.name.endsWith('.csv')) {
      setErrors(['Seuls les fichiers .csv sont acceptés']);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const result = parseCsvServices(text, operator);

      if (result.errors.length > 0) {
        setErrors(result.errors);
        return;
      }
      if (result.services.length === 0) {
        setErrors(['Aucun service valide trouvé dans le fichier']);
        return;
      }

      setSkipped(result.skipped);
      setAllParsed(result.services);
      setPreview(result.services.slice(0, 5));
    };
    reader.readAsText(file);
  }, [operator]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }, [handleFile]);

  const handleConfirm = () => {
    if (allParsed.length === 0) return;

    const updated = { ...data };
    if (mode === 'replace') {
      // Replace: remove all operator's services, add new ones
      updated.services = [
        ...data.services.filter((s) => s.operator !== operator),
        ...allParsed,
      ];
    } else {
      // Add: keep existing, add new
      updated.services = [...data.services, ...allParsed];
    }

    // Rebuild routes
    const routeMap = new Map<string, { from: string; to: string; fromLat: number; fromLon: number; toLat: number; toLon: number; freq: number; operators: Set<string> }>();
    for (const s of updated.services) {
      if (s.from === s.to) continue;
      const key = [s.from, s.to].sort().join('||');
      if (!routeMap.has(key)) {
        const fromP = updated.platforms.find((p) => p.site === s.from);
        const toP = updated.platforms.find((p) => p.site === s.to);
        routeMap.set(key, {
          from: s.from, to: s.to,
          fromLat: fromP?.lat || 0, fromLon: fromP?.lon || 0,
          toLat: toP?.lat || 0, toLon: toP?.lon || 0,
          freq: 0, operators: new Set(),
        });
      }
      const r = routeMap.get(key)!;
      r.freq++;
      r.operators.add(s.operator);
    }
    updated.routes = [...routeMap.values()].map((r) => ({ ...r, operators: [...r.operators] }));
    updated.operators = [...new Set(updated.services.map((s) => s.operator))].sort();

    onSave(updated);
    setImportResult({ added: allParsed.length, replaced: mode === 'replace' });
    setPreview(null);
    setAllParsed([]);
  };

  const handleDownloadTemplate = () => {
    const bom = '\uFEFF';
    const headers = 'Départ;Destination;Jour Départ;HLR;Jour Arrivée;MAD;CM;Cont;S.Pr;S.NP;P400';
    const example = 'Lyon Vénissieux;Marseille Canet;Lu;08:30;Lu;14:00;Oui;Non;Non;Non;Non';
    const csv = bom + headers + '\n' + example + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modele-import-${operator.replace(/\s+/g, '-').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const DAYS: Record<string, string> = { Lu: 'Lundi', Ma: 'Mardi', Me: 'Mercredi', Je: 'Jeudi', Ve: 'Vendredi', Sa: 'Samedi', Di: 'Dimanche' };

  return (
    <div className="pb-20 md:pb-4">
      <h1 className="text-sm font-display font-bold text-text mb-4 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 9V2M7 2L4.5 4.5M7 2L9.5 4.5" />
          <path d="M2 8.5V11C2 11.55 2.45 12 3 12H11C11.55 12 12 11.55 12 11V8.5" />
        </svg>
        Importer des services
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* ── Left column: Import zone ── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Success result */}
          {importResult && (
            <div className="glass-panel rounded-xl p-4 border border-cyan/30">
              <div className="flex items-center gap-2 text-cyan mb-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="8" cy="8" r="6" /><path d="M5.5 8L7 9.5L10.5 6" />
                </svg>
                <span className="text-xs font-bold">Import réussi !</span>
              </div>
              <p className="text-xs text-muted">
                {importResult.added} service{importResult.added > 1 ? 's' : ''}{' '}
                {importResult.replaced ? 'remplacé' : 'ajouté'}{importResult.added > 1 ? 's' : ''}.
              </p>
              <Link
                href="/admin/flux"
                className="inline-flex items-center gap-1.5 text-xs text-blue hover:text-cyan transition-colors mt-2"
              >
                Voir mes services →
              </Link>
            </div>
          )}

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`glass-panel rounded-xl p-8 border-2 border-dashed cursor-pointer transition-all text-center ${
              dragging
                ? 'border-blue bg-blue/5 scale-[1.01]'
                : 'border-border hover:border-blue/40 hover:bg-blue/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dragging ? 'bg-blue/20 text-blue' : 'bg-border/30 text-muted'}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16V4M12 4L8 8M12 4L16 8" />
                  <path d="M4 14V19C4 19.55 4.45 20 5 20H19C19.55 20 20 19.55 20 19V14" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-text">Glissez votre fichier CSV ici</p>
                <p className="text-[10px] text-muted mt-1">ou cliquez pour sélectionner un fichier</p>
              </div>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                checked={mode === 'add'}
                onChange={() => setMode('add')}
                className="accent-blue"
              />
              <span className="text-xs text-text">Ajouter aux services existants</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                checked={mode === 'replace'}
                onChange={() => setMode('replace')}
                className="accent-orange"
              />
              <span className="text-xs text-text">Remplacer tous mes services</span>
            </label>
          </div>

          {/* Template download */}
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 text-xs text-blue hover:text-cyan transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <path d="M6 2V9M6 9L3.5 6.5M6 9L8.5 6.5" /><path d="M2 8V10H10V8" />
            </svg>
            Télécharger un modèle CSV
          </button>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="glass-panel rounded-xl p-4 border border-orange/30">
              <p className="text-xs font-bold text-orange mb-1">Erreurs d'import</p>
              {errors.map((err, i) => (
                <p key={i} className="text-[10px] text-muted">{err}</p>
              ))}
            </div>
          )}

          {/* Preview */}
          {preview && preview.length > 0 && (
            <div className="glass-panel rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-text">
                  Aperçu ({allParsed.length} service{allParsed.length > 1 ? 's' : ''} détecté{allParsed.length > 1 ? 's' : ''})
                  {skipped > 0 && <span className="text-orange ml-1">• {skipped} ignoré{skipped > 1 ? 's' : ''}</span>}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setPreview(null); setAllParsed([]); }}
                    className="text-[10px] text-muted hover:text-orange transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={saving}
                    className="text-[10px] px-3 py-1 rounded-md bg-blue text-white hover:bg-blue/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Import...' : mode === 'replace' ? 'Remplacer' : 'Importer'}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-muted border-b border-border">
                      <th className="text-left py-1 px-1.5 font-medium">Départ</th>
                      <th className="text-left py-1 px-1.5 font-medium">Destination</th>
                      <th className="text-left py-1 px-1.5 font-medium">Jour</th>
                      <th className="text-left py-1 px-1.5 font-medium">HLR</th>
                      <th className="text-left py-1 px-1.5 font-medium">Arr.</th>
                      <th className="text-left py-1 px-1.5 font-medium">MAD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((s, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-1 px-1.5 text-text">{s.from}</td>
                        <td className="py-1 px-1.5 text-text">{s.to}</td>
                        <td className="py-1 px-1.5 text-muted">{DAYS[s.dayDep] || s.dayDep}</td>
                        <td className="py-1 px-1.5 font-mono">{s.timeDep || '—'}</td>
                        <td className="py-1 px-1.5 text-muted">{DAYS[s.dayArr] || s.dayArr}</td>
                        <td className="py-1 px-1.5 font-mono">{s.timeArr || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {allParsed.length > 5 && (
                <p className="text-[9px] text-muted mt-2">...et {allParsed.length - 5} autres services</p>
              )}
            </div>
          )}
        </div>

        {/* ── Right column: Format guide ── */}
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-xl p-4 sticky top-20">
            <h2 className="text-xs font-display font-bold text-text mb-3 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                <circle cx="7" cy="7" r="6" /><path d="M7 4V7.5M7 9.5V10" />
              </svg>
              Guide du format
            </h2>

            <p className="text-[10px] text-muted mb-3">
              Votre fichier CSV doit contenir les colonnes suivantes. La colonne <strong>Opérateur</strong> est remplie automatiquement avec <strong>{operator}</strong>.
            </p>

            <div className="space-y-2 mb-4">
              <div className="text-[10px]">
                <span className="font-medium text-text">Colonnes requises :</span>
                <span className="text-muted ml-1">Départ, Destination</span>
              </div>
              <div className="text-[10px]">
                <span className="font-medium text-text">Colonnes optionnelles :</span>
                <span className="text-muted ml-1">Jour Départ, HLR, Jour Arrivée, MAD, CM, Cont, S.Pr, S.NP, P400</span>
              </div>
            </div>

            <h3 className="text-[10px] font-bold text-text mb-2">Exemple :</h3>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-[9px]">
                <thead>
                  <tr className="bg-blue/5 text-muted">
                    <th className="text-left py-1 px-1.5">Départ</th>
                    <th className="text-left py-1 px-1.5">Destination</th>
                    <th className="text-left py-1 px-1.5">J.Dép</th>
                    <th className="text-left py-1 px-1.5">HLR</th>
                    <th className="text-left py-1 px-1.5">CM</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border/50">
                    <td className="py-1 px-1.5">Lyon</td>
                    <td className="py-1 px-1.5">Marseille</td>
                    <td className="py-1 px-1.5">Lu</td>
                    <td className="py-1 px-1.5 font-mono">08:30</td>
                    <td className="py-1 px-1.5">Oui</td>
                  </tr>
                  <tr className="border-t border-border/50">
                    <td className="py-1 px-1.5">Paris</td>
                    <td className="py-1 px-1.5">Le Havre</td>
                    <td className="py-1 px-1.5">Ma</td>
                    <td className="py-1 px-1.5 font-mono">14:00</td>
                    <td className="py-1 px-1.5">Non</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-1.5">
              <h3 className="text-[10px] font-bold text-text">Formats acceptés :</h3>
              <div className="text-[9px] text-muted space-y-1">
                <p><strong className="text-text">Jours :</strong> Lu, Ma, Me, Je, Ve, Sa, Di (ou Lundi, Mardi...)</p>
                <p><strong className="text-text">Heures :</strong> HH:MM (ex: 08:30) ou HHMM (ex: 0830)</p>
                <p><strong className="text-text">Oui/Non :</strong> Oui, Non, O, N, Yes, No, 1, 0</p>
                <p><strong className="text-text">Séparateur :</strong> Point-virgule (;) ou virgule (,)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
