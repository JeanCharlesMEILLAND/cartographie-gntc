'use client';

import { useState } from 'react';
import Link from 'next/link';

const ACTIVITY_TYPES = [
  'Opérateur de transport combiné',
  'Gestionnaire de plateforme / terminal',
  'Autre',
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
    // Champs opérateur
    liaisons: '',
    utiTypes: '',
    volumes: '',
    // Champs gestionnaire
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
      // Build description from conditional fields
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

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-[#2d2a26] placeholder:text-gray-400 focus:outline-none focus:border-[#1a4d2e] focus:ring-2 focus:ring-[#84cc16]/20 transition-all";

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
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-[#84cc16]/15 flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[#84cc16]">
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
            <div className="mb-10">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2d2a26] mb-3">
                Référencer mon entreprise
              </h1>
              <p className="text-[#8b8178] leading-relaxed">
                Vous êtes <strong className="text-[#2d2a26]">opérateur de transport combiné</strong> ou{' '}
                <strong className="text-[#2d2a26]">gestionnaire de plateforme</strong> ?
                Remplissez ce formulaire pour référencer votre activité sur la carte interactive du transport combiné.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div>
                <label htmlFor="activity" className="block text-sm font-semibold text-[#2d2a26] mb-1.5">
                  Vous êtes <span className="text-red-500">*</span>
                </label>
                <select
                  id="activity"
                  name="activity"
                  required
                  value={formData.activity}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Sélectionnez votre activité</option>
                  {ACTIVITY_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Champs conditionnels : Opérateur */}
              {isOperateur && (
                <div className="space-y-4 p-4 rounded-xl bg-[#1a4d2e]/5 border border-[#1a4d2e]/10">
                  <p className="text-xs text-[#8b8178] font-medium uppercase tracking-wider">Informations opérateur</p>
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
                </div>
              )}

              {/* Champs conditionnels : Gestionnaire */}
              {isGestionnaire && (
                <div className="space-y-4 p-4 rounded-xl bg-[#1a4d2e]/5 border border-[#1a4d2e]/10">
                  <p className="text-xs text-[#8b8178] font-medium uppercase tracking-wider">Informations plateforme</p>
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
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact" className="block text-sm font-semibold text-[#2d2a26] mb-1.5">
                    Nom du contact <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="contact"
                    name="contact"
                    required
                    value={formData.contact}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Prénom Nom"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-[#2d2a26] mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="email@entreprise.fr"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-[#2d2a26] mb-1.5">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="+33 6 00 00 00 00"
                  />
                </div>
                <div>
                  <label htmlFor="website" className="block text-sm font-semibold text-[#2d2a26] mb-1.5">
                    Site web
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://www.entreprise.fr"
                  />
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

              {error && (
                <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto bg-gradient-to-br from-[#1a4d2e] to-[#84cc16] text-white font-semibold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-[#1a4d2e]/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {sending ? 'Envoi en cours...' : 'Envoyer ma demande de référencement'}
                </button>
              </div>

              <p className="text-xs text-[#8b8178]">
                En soumettant ce formulaire, vous acceptez que vos données soient utilisées pour le traitement de votre demande. Aucune donnée n&apos;est partagée avec des tiers.
              </p>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
