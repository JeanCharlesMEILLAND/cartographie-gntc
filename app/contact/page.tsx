'use client';

import { useState } from 'react';
import PageLayout from '@/components/Site/PageLayout';

const CONTACT_INFO = [
  {
    label: 'Adresse',
    value: '58 rue de la Victoire\n75009 Paris',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-blue">
        <path d="M10 2C6.686 2 4 4.686 4 8C4 12 10 18 10 18C10 18 16 12 16 8C16 4.686 13.314 2 10 2Z" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: 'T\u00e9l\u00e9phone',
    value: '+33 6.81.84.26.21',
    href: 'tel:+33681842621',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-blue">
        <path d="M3 4.5C3 3.67 3.67 3 4.5 3H7.37C7.78 3 8.14 3.27 8.26 3.67L9.26 6.87C9.37 7.23 9.24 7.62 8.93 7.84L7.64 8.8C8.56 10.68 10.08 12.2 11.96 13.12L12.92 11.83C13.14 11.52 13.53 11.39 13.89 11.5L17.09 12.5C17.49 12.62 17.76 12.98 17.76 13.39V16.26C17.76 17.09 17.09 17.76 16.26 17.76C8.94 17.32 3 11.06 3 4.5Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: 'Email',
    value: 'secretariat@gntc.fr',
    href: 'mailto:secretariat@gntc.fr',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-blue">
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 6L10 11L18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const SOCIALS = [
  { name: 'Twitter / X', href: 'https://twitter.com/GNTC_TC', icon: 'X' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/gntc/', icon: 'in' },
  { name: 'YouTube', href: 'https://www.youtube.com/@gntc_tc', icon: '\u25B6' },
];

export default function ContactPage() {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent'>('idle');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState('sending');
    // Simulate sending
    setTimeout(() => setFormState('sent'), 1500);
  }

  return (
    <PageLayout
      title="Contact"
      subtitle="N&rsquo;h&eacute;sitez pas &agrave; nous contacter pour toute question sur le transport combin&eacute;."
      breadcrumbs={[{ label: 'Contact' }]}
    >
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact info */}
        <div>
          <div className="space-y-6 mb-8">
            {CONTACT_INFO.map((info) => (
              <div key={info.label} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue/5 flex items-center justify-center">
                  {info.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold text-text uppercase tracking-wider mb-0.5">{info.label}</div>
                  {info.href ? (
                    <a href={info.href} className="text-sm text-blue hover:underline whitespace-pre-line">{info.value}</a>
                  ) : (
                    <div className="text-sm text-muted whitespace-pre-line">{info.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-xs font-semibold text-text uppercase tracking-wider mb-3">R&eacute;seaux sociaux</div>
            <div className="flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-blue/5 flex items-center justify-center text-sm font-bold text-blue hover:bg-blue/10 transition-colors"
                  title={s.name}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Delegue general */}
          <div className="mt-8 bg-white rounded-xl border border-gray-100 p-6">
            <div className="text-xs font-semibold text-text uppercase tracking-wider mb-3">D&eacute;l&eacute;gu&eacute;e G&eacute;n&eacute;rale</div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue/10 flex items-center justify-center flex-shrink-0">
                <span className="text-base font-display font-bold text-blue">IO</span>
              </div>
              <div>
                <div className="font-display font-bold text-text">Isabelle OCKET</div>
                <div className="text-xs text-muted">secretariat@gntc.fr &middot; +33 6.81.84.26.21</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
          <h2 className="text-lg font-display font-bold text-text mb-6">&Eacute;crivez-nous</h2>

          {formState === 'sent' ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">&check;</div>
              <h3 className="text-lg font-display font-bold text-text mb-2">Message envoy&eacute; !</h3>
              <p className="text-sm text-muted">Nous vous r&eacute;pondrons dans les meilleurs d&eacute;lais.</p>
              <button
                onClick={() => setFormState('idle')}
                className="mt-4 text-sm text-blue hover:underline"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-200 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue/20"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Entreprise</label>
                  <input
                    type="text"
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-200 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue/20"
                    placeholder="Votre entreprise"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-200 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue/20"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Objet</label>
                <select className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-200 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue/20">
                  <option>Information g&eacute;n&eacute;rale</option>
                  <option>Adh&eacute;sion au GNTC</option>
                  <option>Transport combin&eacute;</option>
                  <option>Aides et CEE</option>
                  <option>Presse / M&eacute;dias</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Message</label>
                <textarea
                  required
                  rows={5}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-200 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue/20 resize-none"
                  placeholder="Votre message..."
                />
              </div>
              <button
                type="submit"
                disabled={formState === 'sending'}
                className="w-full gntc-gradient-bg text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                {formState === 'sending' ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
