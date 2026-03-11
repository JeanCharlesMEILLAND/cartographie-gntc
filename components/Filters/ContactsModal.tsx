'use client';

import { useState } from 'react';
import { getAllContacts, getOperatorLogo } from '@/lib/operatorContacts';
import { getOperatorColor } from '@/lib/colors';

export default function ContactsModal() {
  const [open, setOpen] = useState(false);
  const contacts = getAllContacts();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 px-3 rounded-lg border border-border hover:border-blue/30 text-muted hover:text-blue transition-all"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 3.5C2 2.67 2.67 2 3.5 2H10.5C11.33 2 12 2.67 12 3.5V10.5C12 11.33 11.33 12 10.5 12H3.5C2.67 12 2 11.33 2 10.5V3.5Z" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="7" cy="5.5" r="1.8" stroke="currentColor" strokeWidth="1" />
          <path d="M4 11C4 9.34 5.34 8 7 8C8.66 8 10 9.34 10 11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
        Contacts opérateurs
      </button>

      {open && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Modal */}
          <div className="relative glass-panel rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="text-sm font-display font-bold text-text">Contacts Opérateurs</h2>
                <p className="text-[10px] text-muted mt-0.5">
                  Source : gntc.fr — Plan de transport 2026
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-text transition-colors p-1.5 rounded-md hover:bg-white/5"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4L12 12M4 12L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto p-3 space-y-2">
              {contacts.map(({ operator, contact: c }) => {
                const logo = getOperatorLogo(operator);
                const color = getOperatorColor(operator);
                return (
                  <div
                    key={operator}
                    className="p-3 rounded-lg border border-border hover:border-blue/20 transition-colors"
                  >
                    {/* Operator name */}
                    <div className="flex items-center gap-2 mb-2">
                      {logo ? (
                        <img src={logo} alt="" className="w-5 h-5 rounded-sm object-contain flex-shrink-0" />
                      ) : (
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                      )}
                      <span className="text-xs font-bold text-text">{operator}</span>
                    </div>

                    {/* Contact details */}
                    <div className="ml-7 space-y-1 text-[11px]">
                      {c.contact && (
                        <div className="text-muted">
                          <span className="text-text font-medium">{c.contact}</span>
                        </div>
                      )}
                      {c.address && (
                        <div className="text-muted truncate" title={c.address}>{c.address}</div>
                      )}
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        {c.phone && (
                          <a
                            href={`tel:${c.phone.replace(/[\s().]/g, '')}`}
                            className="inline-flex items-center gap-1 text-blue hover:text-cyan transition-colors"
                          >
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                              <path d="M2 1.5H4L5 3.5L3.5 4.5C4.2 5.9 5.1 6.8 6.5 7.5L7.5 6L9.5 7V9C9.5 9.55 9.05 10 8.5 10C4.6 9.7 1.3 6.4 1 2.5C1 1.95 1.45 1.5 2 1.5Z" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {c.phone}
                          </a>
                        )}
                        {c.email && (
                          <a
                            href={`mailto:${c.email}`}
                            className="inline-flex items-center gap-1 text-blue hover:text-cyan transition-colors"
                          >
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                              <rect x="1" y="2.5" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="0.9" />
                              <path d="M1 3.5L5.5 6.5L10 3.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
                            </svg>
                            {c.email}
                          </a>
                        )}
                        {c.website && (
                          <a
                            href={`https://${c.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue hover:text-cyan transition-colors"
                          >
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="0.9" />
                              <path d="M1.5 5.5H9.5M5.5 1.5C4 3.5 4 7.5 5.5 9.5M5.5 1.5C7 3.5 7 7.5 5.5 9.5" stroke="currentColor" strokeWidth="0.9" />
                            </svg>
                            {c.website}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
