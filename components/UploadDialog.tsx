'use client';

import { useState, useCallback, useRef } from 'react';
import clsx from 'clsx';

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export default function UploadDialog({ open, onClose, onUploadSuccess }: UploadDialogProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    platforms: number;
    routes: number;
    operators: number;
    unmatched: number;
    unmatchedList: string[];
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setResult(null);

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Le fichier doit être au format .xlsx ou .xls');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur lors du traitement');
        return;
      }

      setResult(data.stats);
      onUploadSuccess();
    } catch {
      setError('Erreur réseau. Réessayez.');
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative glass-panel rounded-xl w-[480px] max-w-[95vw] mx-4 sm:mx-0 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-display font-semibold text-blue uppercase tracking-wider">
            Importer des données Excel
          </h2>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M4 12L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Drop zone */}
          <div
            className={clsx(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
              dragging ? 'border-blue bg-blue/10' : 'border-border hover:border-muted'
            )}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />

            {uploading ? (
              <div className="text-cyan animate-pulse">
                <svg className="w-8 h-8 mx-auto mb-2 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.416" strokeDashoffset="10" />
                </svg>
                <p className="text-sm">Traitement en cours...</p>
              </div>
            ) : (
              <>
                <svg className="w-10 h-10 mx-auto mb-3 text-muted" viewBox="0 0 24 24" fill="none">
                  <path d="M12 16V4M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 14V18C4 19.1 4.9 20 6 20H18C19.1 20 20 19.1 20 18V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-sm text-text mb-1">
                  Glissez votre fichier Excel ici
                </p>
                <p className="text-xs text-muted">
                  ou cliquez pour parcourir (.xlsx)
                </p>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 p-2 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mt-3 space-y-2">
              <div className="p-3 rounded bg-green-500/10 border border-green-500/30 text-green-400 text-xs">
                Import réussi !
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-[rgba(20,30,60,0.4)]">
                  <span className="text-muted">Plateformes</span>
                  <div className="font-mono text-cyan font-bold">{result.platforms}</div>
                </div>
                <div className="p-2 rounded bg-[rgba(20,30,60,0.4)]">
                  <span className="text-muted">Liaisons</span>
                  <div className="font-mono text-cyan font-bold">{result.routes}</div>
                </div>
                <div className="p-2 rounded bg-[rgba(20,30,60,0.4)]">
                  <span className="text-muted">Opérateurs</span>
                  <div className="font-mono text-cyan font-bold">{result.operators}</div>
                </div>
                <div className="p-2 rounded bg-[rgba(20,30,60,0.4)]">
                  <span className="text-muted">Non géocodées</span>
                  <div className={clsx(
                    'font-mono font-bold',
                    result.unmatched > 0 ? 'text-orange' : 'text-cyan'
                  )}>
                    {result.unmatched}
                  </div>
                </div>
              </div>

              {/* Unmatched list */}
              {result.unmatched > 0 && (
                <div className="p-2 rounded bg-orange/10 border border-orange/30">
                  <p className="text-xs text-orange font-medium mb-1">
                    Plateformes non géocodées ({result.unmatched}) :
                  </p>
                  <div className="text-[10px] text-muted max-h-[80px] overflow-y-auto">
                    {result.unmatchedList.map((name, i) => (
                      <span key={i}>
                        {name}{i < result.unmatchedList.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
