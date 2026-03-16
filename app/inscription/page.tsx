'use client';

import { useState } from 'react';
import Link from 'next/link';

const ACTIVITY_OPTIONS = [
  {
    value: 'Opérateur de transport combiné',
    label: 'Opérateur de transport combiné',
    description: 'Vous exploitez des liaisons de transport combiné rail-route ou fleuve-route',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="12" width="4" height="7" rx="1" />
        <rect x="7" y="9" width="4" height="10" rx="1" />
        <rect x="13" y="6" width="4" height="13" rx="1" />
        <path d="M1 21h22" />
        <path d="M19 12l2-2 2 2" />
        <path d="M21 21V10" />
      </svg>
    ),
  },
  {
    value: 'Gestionnaire de plateforme / terminal',
    label: 'Gestionnaire de plateforme',
    description: 'Vous gérez un ou plusieurs terminaux de transbordement',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20h20" />
        <path d="M5 20V8l7-5 7 5v12" />
        <rect x="9" y="12" width="6" height="8" rx="0.5" />
        <path d="M9 12h6" />
        <path d="M12 12v8" />
      </svg>
    ),
  },
  {
    value: 'Autre',
    label: 'Autre acteur',
    description: 'Chargeur, commissionnaire, prestataire logistique, autre',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
];

export default function InscriptionPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    activity: '',
    contact: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    liaisons: '',
    utiTypes: '',
    volumes: '',
    terminaux: '',
    capacite: '',
    equipements: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const isOperateur = formData.activity === 'Opérateur de transport combiné';
  const isGestionnaire = formData.activity === 'Gestionnaire de plateforme / terminal';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      let fullDescription = formData.description || '';
      if (isOperateur) {
        const parts: string[] = [];
        if (formData.liaisons) parts.push(`Liaisons : ${formData.liaisons}`);
        if (formData.utiTypes) parts.push(`Types UTI : ${formData.utiTypes}`);
        if (formData.volumes) parts.push(`Volumes : ${formData.volumes}`);
        if (parts.length > 0) fullDescription = parts.join('\n') + (fullDescription ? '\n' + fullDescription : '');
      } else if (isGestionnaire) {
        const parts: string[] = [];
        if (formData.terminaux) parts.push(`Terminaux : ${formData.terminaux}`);
        if (formData.capacite) parts.push(`Capacité : ${formData.capacite}`);
        if (formData.equipements) parts.push(`Équipements : ${formData.equipements}`);
        if (parts.length > 0) fullDescription = parts.join('\n') + (fullDescription ? '\n' + fullDescription : '');
      }

      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: formData.company,
          activity: formData.activity,
          contact: formData.contact,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          description: fullDescription,
        }),
      });
      if (!res.ok) throw new Error('Erreur serveur');
      setSubmitted(true);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSending(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-[#2d2a26] placeholder:text-gray-400 focus:outline-none focus:border-[#1a4d2e] focus:ring-2 focus:ring-[#84cc16]/20 transition-all';

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Header */}
      <header className="bg-[#0f2818] border-b border-white/10">
        <div className="h-[2px] bg-gradient-to-r from-[#1a4d2e] via-[#84cc16] to-[#1a4d2e]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/carte" className="flex items-center gap-3">
            <img src="/logo-gntc.jpg" alt="GNTC" className="h-9 rounded" />
            <div>
              <div className="text-sm font-bold text-white">Transport Combiné</div>
              <div className="text-[10px] text-gray-500">Carte interactive</div>
            </div>
          </Link>
          <Link
            href="/carte"
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 7H3M3 7L6.5 3.5M3 7L6.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour à la carte
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {submitted ? (
          <div className="text-center py-20 animate-in fade-in duration-500">
            <div className="w-20 h-20 rounded-full bg-[#84cc16]/15 flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-[#84cc16]">
                <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2d2a26] mb-4">Demande envoyée !</h1>
            <p className="text-[#8b8178] mb-8 max-w-md mx-auto">
              Votre demande de référencement a été transmise. Notre équipe reviendra vers vous dans les meilleurs délais.
            </p>
            <Link
              href="/carte"
              className="inline-flex items-center gap-2 bg-gradient-to-br from-[#1a4d2e] to-[#84cc16] text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all"
            >
              Retour à la carte
            </Link>
          </div>
        ) : (
          <>
            {/* Hero */}
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 bg-[#1a4d2e]/8 text-[#1a4d2e] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
                Référencement gratuit
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2d2a26] mb-3">
                Référencer mon entreprise
              </h1>
              <p className="text-[#8b8178] leading-relaxed">
                Vous êtes <strong className="text-[#2d2a26]">opérateur de transport combiné</strong> ou{' '}
                <strong className="text-[#2d2a26]">gestionnaire de plateforme</strong> ?
                Remplissez ce formulaire pour apparaître sur la carte interactive du GNTC.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1 — Entreprise */}
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-3 mb-1">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#1a4d2e] text-white text-xs font-bold">1</span>
                  <h2 className="text-base font-bold text-[#2d2a26]">Votre entreprise</h2>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-[#2d2a26] mb-1.5">
                    Raison sociale <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Nom de votre entreprise"
                  />
                </div>

                {/* Activity type — radio cards */}
                <fieldset>
                  <legend className="block text-sm font-semibold text-[#2d2a26] mb-3">
                    Type d&apos;activité <span className="text-red-500">*</span>
                  </legend>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {ACTIVITY_OPTIONS.map((opt) => {
                      const selected = formData.activity === opt.value;
                      return (
                        <label
                          key={opt.value}
                          className={`
                            relative flex flex-col items-center text-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                            ${selected
                              ? 'border-[#1a4d2e] bg-[#1a4d2e]/5 shadow-md shadow-[#1a4d2e]/10'
                              : 'border-gray-200 bg-white hover:border-[#84cc16]/50 hover:bg-[#84cc16]/5'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="activity"
                            value={opt.value}
                            checked={selected}
                            onChange={handleChange}
                            required
                            className="sr-only"
                          />
                          {/* Check badge */}
                          <span
                            className={`
                              absolute top-2.5 right-2.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                              ${selected ? 'border-[#1a4d2e] bg-[#1a4d2e]' : 'border-gray-300 bg-white'}
                            `}
                          >
                            {selected && (
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                          <span className={`transition-colors duration-200 ${selected ? 'text-[#1a4d2e]' : 'text-[#8b8178]'}`}>
                            {opt.icon}
                          </span>
                          <span className={`text-sm font-semibold leading-tight ${selected ? 'text-[#1a4d2e]' : 'text-[#2d2a26]'}`}>
                            {opt.label}
                          </span>
                          <span className="text-[11px] leading-snug text-[#8b8178]">
                            {opt.description}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </section>

              {/* Section 2 — Conditional details */}
              {(isOperateur || isGestionnaire) && (
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#84cc16] text-white text-xs font-bold">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                    <h2 className="text-base font-bold text-[#2d2a26]">
                      {isOperateur ? 'Détails opérateur' : 'Détails plateforme'}
                    </h2>
                  </div>

                  {isOperateur && (
                    <>
                      <div>
                        <label htmlFor="liaisons" className="block text-sm font-semibold text-[#2d2a26] mb-1.5">
                          Liaisons opérées
                        </label>
                        <input
                          type="text"
                          id="liaisons"
                          name="liaisons"
                          value={formData.liaisons}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Ex : Lyon — Marseille, Paris — Bordeaux..."
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="utiTypes" className="block text-sm font-semibold text-[#2d2a26] mb-1.5">
                            Types d&apos;UTI acceptés
                          </label>
                          <input
                            type="text"
                            id="utiTypes"
                            name="utiTypes"
                            value={formData.utiTypes}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="CM, conteneurs, semi-remorques..."
                          />
                        </div>
                        <div>
                          <label htmlFor="volumes" className="block text-sm font-semibold text-[#2d2a26] mb-1.5">
                            Volumes
                          </label>
                          <input
                            type="text"
                            id="volumes"
                            name="volumes"
                            value={formData.volumes}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="Ex : 500 UTI/semaine"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {isGestionnaire && (
                    <>
                      <div>
                        <label htmlFor="terminaux" className="block text-sm font-semibold text-[#2d2a26] mb-1.5">
                          Terminaux gérés
                        </label>
                        <input
                          type="text"
                          id="terminaux"
                          name="terminaux"
                          value={formData.terminaux}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Nom et localisation de vos terminaux"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="capacite" className="block text-sm font-semibold text-[#2d2a26] mb-1.5">
                            Capacité
                          </label>
                          <input
                            type="text"
                            id="capacite"
                            name="capacite"
                            value={formData.capacite}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="Ex : 200 UTI/jour"
                          />
                        </div>
                        <div>
                          <label htmlFor="equipements" className="block text-sm font-semibold text-[#2d2a26] mb-1.5">
                            Équipements
                          </label>
                          <input
                            type="text"
                            id="equipements"
                            name="equipements"
                            value={formData.equipements}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="Portiques, grues, reach stackers..."
                          />
                        </div>
                      </div>
                    </>
                  )}
                </section>
              )}

              {/* Section 3 — Contact */}
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-3 mb-1">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#1a4d2e] text-white text-xs font-bold">2</span>
                  <h2 className="text-base font-bold text-[#2d2a26]">Vos coordonnées</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact" className="block text-sm font-semibold text-[#2d2a26] mb-1.5">
                      Nom du contact <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        id="contact"
                        name="contact"
                        required
                        value={formData.contact}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                        placeholder="Prénom Nom"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-[#2d2a26] mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="M22 7l-10 6L2 7" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                        placeholder="email@entreprise.fr"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-[#2d2a26] mb-1.5">
                      Téléphone
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                        </svg>
                      </span>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                        placeholder="+33 6 00 00 00 00"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-semibold text-[#2d2a26] mb-1.5">
                      Site web
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                        </svg>
                      </span>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                        placeholder="https://www.entreprise.fr"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-[#2d2a26] mb-1.5">
                    Informations complémentaires
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className={`${inputClass} resize-none`}
                    placeholder="Toute information utile pour le référencement..."
                  />
                </div>
              </section>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto bg-gradient-to-br from-[#1a4d2e] to-[#84cc16] text-white font-semibold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-[#1a4d2e]/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Envoyer ma demande
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
                <p className="text-xs text-[#8b8178] max-w-md">
                  En soumettant ce formulaire, vous acceptez que vos données soient utilisées pour le traitement de votre demande. Aucune donnée n&apos;est partagée avec des tiers.
                </p>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
