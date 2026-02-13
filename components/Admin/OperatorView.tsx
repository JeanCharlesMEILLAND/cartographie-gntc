'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { TransportData, Service, Platform, AggregatedRoute } from '@/lib/types';
import { getOperatorPlatforms, DAY_ORDER } from '@/lib/adminComputations';
import { getOperatorColor } from '@/lib/colors';
import OperatorMap from './OperatorMap';

const DAYS = Object.keys(DAY_ORDER);

/**
 * Patch chirurgical de data.routes :
 * - Ajoute une route si une paire de services existe mais pas de route correspondante
 * - Supprime une route si plus aucun service ne la justifie
 * - Ne touche JAMAIS aux routes existantes (fréquence, opérateurs intacts)
 */
function patchRoutes(existingRoutes: AggregatedRoute[], services: Service[], platforms: Platform[], op: string): AggregatedRoute[] {
  const coordMap = new Map<string, { lat: number; lon: number }>();
  for (const p of platforms) coordMap.set(p.site, { lat: p.lat, lon: p.lon });

  // Paires de sites actives pour cet opérateur
  const activePairs = new Set<string>();
  for (const s of services) {
    if (s.operator !== op || s.from === s.to) continue;
    activePairs.add([s.from, s.to].sort().join('||'));
  }

  // Paires déjà dans data.routes (toutes, pas que cet opérateur)
  const routeKeys = new Set<string>();
  for (const r of existingRoutes) {
    routeKeys.add([r.from, r.to].sort().join('||'));
  }

  // 1) Ajouter les routes manquantes
  const newRoutes = [...existingRoutes];
  for (const key of activePairs) {
    if (routeKeys.has(key)) continue;
    const [a, b] = key.split('||');
    const c1 = coordMap.get(a);
    const c2 = coordMap.get(b);
    if (!c1 || !c2) continue;
    newRoutes.push({
      from: a, to: b,
      fromLat: c1.lat, fromLon: c1.lon,
      toLat: c2.lat, toLon: c2.lon,
      freq: 1,
      operators: [op],
    });
  }

  // 2) Supprimer les routes de cet opérateur qui n'ont plus de services
  return newRoutes.filter((r) => {
    if (!r.operators.includes(op)) return true; // pas notre opérateur, on touche pas
    const key = [r.from, r.to].sort().join('||');
    if (activePairs.has(key)) return true; // encore des services
    // Plus de services pour cet opérateur sur cette route
    if (r.operators.length > 1) {
      // D'autres opérateurs utilisent cette route → retirer juste cet opérateur
      r.operators = r.operators.filter((o) => o !== op);
      return true;
    }
    return false; // seul opérateur → supprimer la route
  });
}

const EMPTY_SERVICE: Omit<Service, 'operator'> = {
  from: '', to: '', dayDep: 'Lu', timeDep: '', dayArr: 'Lu', timeArr: '',
  acceptsCM: 'Non', acceptsCont: 'Non', acceptsSemiPre: 'Non', acceptsSemiNon: 'Non', acceptsP400: 'Non',
};

const miniSelectCls = 'text-[10px] bg-white border border-border rounded px-1.5 py-1 text-text focus:outline-none focus:border-blue/40';
const miniInputCls = 'text-[10px] bg-white border border-border rounded px-1.5 py-1 text-text font-mono placeholder:text-muted/50 focus:outline-none focus:border-blue/40 w-14';

interface Props {
  data: TransportData;
  operator: string;
  onSave: (d: TransportData) => void;
  saving: boolean;
}

export default function OperatorView({ data, operator, onSave, saving }: Props) {
  const color = getOperatorColor(operator);

  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [siteSearch, setSiteSearch] = useState('');
  const [expandedDest, setExpandedDest] = useState<string | null>(null);
  const [addingFromSite, setAddingFromSite] = useState(false);
  const [siteNewService, setSiteNewService] = useState<Omit<Service, 'operator'>>({ ...EMPTY_SERVICE });
  const [addingScheduleTo, setAddingScheduleTo] = useState<string | null>(null);
  const [scheduleNew, setScheduleNew] = useState({ dayDep: 'Lu', timeDep: '', dayArr: 'Lu', timeArr: '' });
  const [addingSite, setAddingSite] = useState(false);
  const [newSiteTarget, setNewSiteTarget] = useState('');
  const [newSiteFrom, setNewSiteFrom] = useState('');
  const [extraRailGeo, setExtraRailGeo] = useState<Record<string, [number, number][]>>({});
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const platformNames = useMemo(() => data.platforms.map((p) => p.site).sort(), [data.platforms]);

  // Plateformes pas encore utilisées par cet opérateur (pour "Ajouter un site")
  const usedSites = useMemo(() => {
    const s = new Set<string>();
    for (const svc of data.services) {
      if (svc.operator === operator) { s.add(svc.from); s.add(svc.to); }
    }
    return s;
  }, [data.services, operator]);
  const availableSites = useMemo(() => platformNames.filter((n) => !usedSites.has(n)), [platformNames, usedSites]);

  const operatorPlatformCards = useMemo(() => {
    const sites = getOperatorPlatforms(data.services, operator);
    return sites.map((site) => {
      const p = data.platforms.find((pl) => pl.site === site);
      const destinations = data.services
        .filter((s) => s.operator === operator && s.from === site && s.from !== s.to)
        .reduce((acc, s) => { if (!acc.includes(s.to)) acc.push(s.to); return acc; }, [] as string[]);
      const serviceCount = data.services.filter((s) => s.operator === operator && s.from !== s.to && (s.from === site || s.to === site)).length;
      return { site, platform: p, destinations, serviceCount };
    });
  }, [data.services, data.platforms, operator]);

  // Détail du site sélectionné avec services complets par destination
  const selectedSiteData = useMemo(() => {
    if (!selectedSite) return null;
    const card = operatorPlatformCards.find((c) => c.site === selectedSite);
    if (!card) return null;
    const allServices = data.services.filter((s) => s.operator === operator && s.from === selectedSite && s.from !== s.to);
    const destMap = new Map<string, Service[]>();
    for (const s of allServices) {
      const arr = destMap.get(s.to) || [];
      arr.push(s);
      destMap.set(s.to, arr);
    }
    const destList = Array.from(destMap.entries())
      .map(([to, svcs]) => ({ to, services: svcs }))
      .sort((a, b) => b.services.length - a.services.length);
    return { ...card, destList };
  }, [selectedSite, operatorPlatformCards, data.services, operator]);

  const handleSiteClick = useCallback((site: string) => {
    setSelectedSite((prev) => {
      if (prev === site) return null;
      setExpandedDest(null);
      setAddingFromSite(false);
      return site;
    });
  }, []);

  const handleMapSiteSelect = useCallback((site: string | null) => {
    setSelectedSite(site);
    setExpandedDest(null);
    setAddingFromSite(false);
    if (site) {
      const el = cardRefs.current.get(site);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  // Fetch géométrie rail pour une paire de sites (en arrière-plan)
  const fetchRailGeometry = useCallback((from: string, to: string) => {
    const pFrom = data.platforms.find((p) => p.site === from);
    const pTo = data.platforms.find((p) => p.site === to);
    if (!pFrom || !pTo || !pFrom.lat || !pTo.lat) return;
    fetch('/api/rail-geometry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, fromLat: pFrom.lat, fromLon: pFrom.lon, toLat: pTo.lat, toLon: pTo.lon }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.geometry) {
          setExtraRailGeo((prev) => ({ ...prev, [res.key]: res.geometry }));
        }
      })
      .catch(() => {});
  }, [data.platforms]);

  // Save simple : services uniquement, routes intactes
  const savePlain = useCallback((newServices: Service[]) => {
    onSave({ ...data, services: newServices });
  }, [data, onSave]);

  // Save avec patch routes : uniquement pour ajout/suppression de destination/site
  const saveWithRoutes = useCallback((newServices: Service[]) => {
    const routes = patchRoutes(data.routes, newServices, data.platforms, operator);
    onSave({ ...data, services: newServices, routes });
  }, [data, onSave, operator]);

  // Service CRUD
  const handleServiceEdit = (from: string, to: string, dayDep: string, timeDep: string, field: string, newValue: string) => {
    const idx = data.services.findIndex((s) => s.operator === operator && s.from === from && s.to === to && s.dayDep === dayDep && s.timeDep === timeDep);
    if (idx === -1) return;
    const newServices = [...data.services];
    newServices[idx] = { ...newServices[idx], [field]: newValue };
    savePlain(newServices);
  };

  const handleAddSiteService = () => {
    if (!siteNewService.from || !siteNewService.to || siteNewService.from === siteNewService.to) return;
    const newSvc: Service = { operator, ...siteNewService };
    const newServices = [...data.services, newSvc];
    // Réciprocité auto si la destination n'est pas encore un site de l'opérateur
    if (!usedSites.has(siteNewService.to)) {
      newServices.push({
        operator, from: siteNewService.to, to: siteNewService.from,
        dayDep: siteNewService.dayArr || 'Lu', timeDep: '', dayArr: siteNewService.dayDep || 'Lu', timeArr: '',
        acceptsCM: siteNewService.acceptsCM, acceptsCont: siteNewService.acceptsCont,
        acceptsSemiPre: siteNewService.acceptsSemiPre, acceptsSemiNon: siteNewService.acceptsSemiNon, acceptsP400: siteNewService.acceptsP400,
      });
    }
    saveWithRoutes(newServices);
    // Fetch géométrie rail en arrière-plan
    fetchRailGeometry(siteNewService.from, siteNewService.to);
    setSiteNewService({ ...EMPTY_SERVICE, from: selectedSite || '' });
    setAddingFromSite(false);
  };

  const handleAddSite = () => {
    if (!newSiteTarget) return;
    const from = newSiteFrom || newSiteTarget;
    const to = newSiteTarget;
    const svc: Service = {
      operator, from, to,
      dayDep: 'Lu', timeDep: '', dayArr: 'Lu', timeArr: '',
      acceptsCM: 'Non', acceptsCont: 'Non', acceptsSemiPre: 'Non', acceptsSemiNon: 'Non', acceptsP400: 'Non',
    };
    const newServices = [...data.services, svc];
    // Réciprocité si on relie à un site existant
    if (newSiteFrom && newSiteFrom !== newSiteTarget) {
      newServices.push({
        operator, from: newSiteTarget, to: newSiteFrom,
        dayDep: 'Lu', timeDep: '', dayArr: 'Lu', timeArr: '',
        acceptsCM: 'Non', acceptsCont: 'Non', acceptsSemiPre: 'Non', acceptsSemiNon: 'Non', acceptsP400: 'Non',
      });
    }
    saveWithRoutes(newServices);
    // Fetch géométrie rail en arrière-plan
    if (from !== to) fetchRailGeometry(from, to);
    setSelectedSite(newSiteTarget);
    setNewSiteTarget('');
    setNewSiteFrom('');
    setAddingSite(false);
  };

  const handleAddSchedule = (from: string, to: string) => {
    const base = data.services.find((s) => s.operator === operator && s.from === from && s.to === to);
    const svc: Service = {
      operator, from, to,
      dayDep: scheduleNew.dayDep, timeDep: scheduleNew.timeDep,
      dayArr: scheduleNew.dayArr, timeArr: scheduleNew.timeArr,
      acceptsCM: base?.acceptsCM || 'Non', acceptsCont: base?.acceptsCont || 'Non',
      acceptsSemiPre: base?.acceptsSemiPre || 'Non', acceptsSemiNon: base?.acceptsSemiNon || 'Non',
      acceptsP400: base?.acceptsP400 || 'Non',
    };
    savePlain([...data.services, svc]);
    setScheduleNew({ dayDep: 'Lu', timeDep: '', dayArr: 'Lu', timeArr: '' });
    setAddingScheduleTo(null);
  };

  const handleDeleteService = (from: string, to: string, dayDep: string, timeDep: string) => {
    const idx = data.services.findIndex((s) => s.operator === operator && s.from === from && s.to === to && s.dayDep === dayDep && s.timeDep === timeDep);
    if (idx === -1) return;
    savePlain(data.services.filter((_, i) => i !== idx));
  };

  const handleDeleteDestination = (from: string, to: string) => {
    const count = data.services.filter((s) => s.operator === operator && s.from === from && s.to === to).length;
    if (!confirm(`Supprimer la destination ${to} (${count} horaire${count > 1 ? 's' : ''}) ?`)) return;
    saveWithRoutes(data.services.filter((s) => !(s.operator === operator && s.from === from && s.to === to)));
    if (expandedDest === to) setExpandedDest(null);
  };

  const handleDeleteSite = (site: string) => {
    const count = data.services.filter((s) => s.operator === operator && s.from !== s.to && (s.from === site || s.to === site)).length;
    if (!confirm(`Supprimer ${site} et ses ${count} service${count > 1 ? 's' : ''} ?`)) return;
    saveWithRoutes(data.services.filter((s) => !(s.operator === operator && (s.from === site || s.to === site))));
    if (selectedSite === site) setSelectedSite(null);
  };

  return (
    <div>
      {/* ── Split: site list (avec accordéon) | carte ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3" style={{ height: 'calc(100vh - 110px)' }}>
        {/* Colonne gauche : sites + accordéon détail */}
        <div
          className="lg:col-span-4 xl:col-span-3 overflow-y-auto pr-0.5 custom-scrollbar h-full"
        >
          {/* Recherche site + bouton ajouter */}
          <div className="px-1 pb-2 space-y-1.5">
            <div className="relative">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                value={siteSearch}
                onChange={(e) => setSiteSearch(e.target.value)}
                placeholder="Rechercher un site..."
                className="w-full text-[11px] bg-white/80 border border-border rounded-md pl-7 pr-7 py-1.5 text-text placeholder:text-muted/50 focus:outline-none focus:border-blue/40"
              />
              {siteSearch && (
                <button
                  onClick={() => setSiteSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              )}
            </div>
            <button
              onClick={() => { setAddingSite(!addingSite); setNewSiteTarget(''); }}
              className="w-full text-[10px] text-blue hover:text-cyan transition-colors py-1.5 rounded-md border border-dashed border-blue/30 hover:border-blue/50 hover:bg-blue/5 flex items-center justify-center gap-1.5"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
              Ajouter un site
            </button>
            {/* Formulaire ajout site */}
            {addingSite && (
              <div className="border border-blue/20 rounded-lg p-2 space-y-1.5 bg-white/60">
                <div className="text-[9px] text-muted uppercase tracking-wider font-semibold">Ajouter un site</div>
                <select
                  value={newSiteTarget}
                  onChange={(e) => setNewSiteTarget(e.target.value)}
                  className={miniSelectCls + ' w-full'}
                >
                  <option value="">Nouveau site...</option>
                  {availableSites.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                {newSiteTarget && usedSites.size > 0 && (
                  <>
                    <div className="text-[9px] text-muted">Relier à un site existant <span className="text-muted/50">(optionnel)</span> :</div>
                    <select
                      value={newSiteFrom}
                      onChange={(e) => setNewSiteFrom(e.target.value)}
                      className={miniSelectCls + ' w-full'}
                    >
                      <option value="">Aucun (créer les liaisons après)</option>
                      {Array.from(usedSites).sort().map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </>
                )}
                {newSiteTarget && newSiteFrom && (
                  <div className="text-[9px] text-muted">Liaison {newSiteFrom} → {newSiteTarget} sera créée</div>
                )}
                <div className="flex gap-1.5">
                  <button
                    onClick={handleAddSite}
                    disabled={!newSiteTarget || saving}
                    className="text-[10px] px-2.5 py-1 rounded bg-blue text-white hover:bg-blue/90 transition-colors disabled:opacity-40"
                  >
                    Ajouter
                  </button>
                  <button onClick={() => { setAddingSite(false); setNewSiteFrom(''); }} className="text-[10px] px-2.5 py-1 rounded text-muted hover:text-text border border-border transition-colors">
                    Annuler
                  </button>
                </div>
              </div>
            )}
            <div className="text-[10px] text-muted font-medium px-0.5">
              {operatorPlatformCards.filter((c) => !siteSearch || c.site.toLowerCase().includes(siteSearch.toLowerCase()) || c.platform?.ville?.toLowerCase().includes(siteSearch.toLowerCase())).length} site{operatorPlatformCards.length > 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-0.5">
            {operatorPlatformCards.filter(({ site, platform }) => {
              if (!siteSearch) return true;
              const q = siteSearch.toLowerCase();
              return site.toLowerCase().includes(q) || (platform?.ville?.toLowerCase().includes(q)) || (platform?.departement?.toLowerCase().includes(q));
            }).map(({ site, platform, destinations, serviceCount }) => {
              const isSelected = selectedSite === site;
              const siteDetail = isSelected ? selectedSiteData : null;

              return (
                <div
                  key={site}
                  ref={(el) => { if (el) cardRefs.current.set(site, el); }}
                >
                  {/* Carte site */}
                  <div
                    className={`group rounded-lg px-3 py-2 cursor-pointer transition-all border ${
                      isSelected
                        ? 'border-blue/40 bg-blue/5'
                        : 'border-transparent hover:border-border hover:bg-white/60'
                    }`}
                    onClick={() => handleSiteClick(site)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <svg width="8" height="8" viewBox="0 0 8 8" className={`flex-shrink-0 transition-transform duration-200 text-muted ${isSelected ? 'rotate-90' : ''}`} fill="currentColor">
                          <path d="M2 1L6 4L2 7Z" />
                        </svg>
                        <span className="text-xs font-semibold text-text leading-tight truncate">{site}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] font-mono font-bold" style={{ color }}>{serviceCount}</span>
                        <span className="text-[9px] text-muted">svc</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteSite(site); }}
                          className="text-muted/30 hover:text-orange transition-colors opacity-0 group-hover:opacity-100"
                          title="Supprimer ce site"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {!isSelected && platform?.ville && (
                      <div className="ml-5 mt-0.5 text-[10px] text-muted truncate">
                        {platform.ville}{platform.pays && platform.pays !== 'France' ? ` · ${platform.pays}` : ''}
                      </div>
                    )}
                  </div>

                  {/* Accordéon détail */}
                  {siteDetail && (
                    <div className="mx-1 mb-1 border border-blue/20 rounded-lg bg-gradient-to-b from-blue/5 to-transparent overflow-hidden">
                      {/* Infos site */}
                      <div className="px-3 pt-2.5 pb-2 space-y-1.5">
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px]">
                          {platform?.ville && (
                            <span><span className="text-muted">Ville </span><span className="text-text font-medium">{platform.ville}</span></span>
                          )}
                          {platform?.departement && (
                            <span><span className="text-muted">Dpt </span><span className="text-text font-medium">{platform.departement}</span></span>
                          )}
                          {platform?.pays && (
                            <span><span className="text-muted">Pays </span><span className="text-text font-medium">{platform.pays}</span></span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px]">
                          {platform?.exploitant && (
                            <span><span className="text-muted">Exploitant </span><span className="text-text font-medium">{platform.exploitant}</span></span>
                          )}
                          {platform?.groupe && (
                            <span><span className="text-muted">Groupe </span><span className="text-text font-medium">{platform.groupe}</span></span>
                          )}
                          {platform?.chantierSNCF && (
                            <span className="text-[9px] px-1.5 py-px rounded bg-orange/10 text-orange border border-orange/20">Chantier SNCF</span>
                          )}
                        </div>
                      </div>

                      {/* Destinations expandables */}
                      {siteDetail.destList.length > 0 && (
                        <div className="px-2 pb-1">
                          <div className="text-[9px] text-muted uppercase tracking-wider font-semibold px-1 mb-1">
                            {siteDetail.destList.length} destination{siteDetail.destList.length > 1 ? 's' : ''}
                          </div>
                          <div className="space-y-px">
                            {siteDetail.destList.map(({ to, services: destSvcs }) => {
                              const isDestExpanded = expandedDest === to;
                              return (
                                <div key={to}>
                                  <div
                                    className={`group/dest flex items-center justify-between py-1.5 px-2 rounded cursor-pointer transition-colors ${isDestExpanded ? 'bg-white/80' : 'hover:bg-white/60'}`}
                                    onClick={(e) => { e.stopPropagation(); setExpandedDest(isDestExpanded ? null : to); }}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <svg width="6" height="6" viewBox="0 0 6 6" className={`flex-shrink-0 transition-transform duration-150 text-muted ${isDestExpanded ? 'rotate-90' : ''}`} fill="currentColor">
                                        <path d="M1.5 0.5L4.5 3L1.5 5.5Z" />
                                      </svg>
                                      <span className="text-[11px] text-text truncate">{to}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                      <span className="text-[10px] font-mono font-bold" style={{ color }}>{destSvcs.length}</span>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteDestination(site, to); }}
                                        className="text-muted/30 hover:text-orange transition-colors opacity-0 group-hover/dest:opacity-100"
                                        title="Supprimer cette destination"
                                      >
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 2.5L7.5 7.5M7.5 2.5L2.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Services de cette destination */}
                                  {isDestExpanded && (
                                    <div className="ml-4 mr-1 mb-1 space-y-px">
                                      {destSvcs.map((s, j) => (
                                        <div key={j} className="py-1 px-1.5 rounded text-[10px] group hover:bg-white/60 transition-colors">
                                          <div className="flex items-center gap-1">
                                            <span className="text-muted font-medium w-5 flex-shrink-0">{s.dayDep}</span>
                                            <InlineTimeEdit
                                              value={s.timeDep}
                                              onCommit={(v) => handleServiceEdit(site, to, s.dayDep, s.timeDep, 'timeDep', v)}
                                            />
                                            <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className="flex-shrink-0 text-muted/40 mx-0.5">
                                              <path d="M0 2.5H6M6 2.5L4.5 1M6 2.5L4.5 4" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                                            </svg>
                                            <span className="text-muted font-medium w-5 flex-shrink-0">{s.dayArr}</span>
                                            <InlineTimeEdit
                                              value={s.timeArr}
                                              onCommit={(v) => handleServiceEdit(site, to, s.dayDep, s.timeDep, 'timeArr', v)}
                                            />
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm(`Supprimer ${site} → ${to} (${s.dayDep} ${s.timeDep || ''}) ?`))
                                                  handleDeleteService(site, to, s.dayDep, s.timeDep);
                                              }}
                                              className="ml-auto text-muted/30 hover:text-orange transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                            >
                                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 2.5L7.5 7.5M7.5 2.5L2.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                                            </button>
                                          </div>
                                          <div className="flex gap-1 mt-0.5 ml-5">
                                            {([
                                              { key: 'acceptsCM', label: 'CM' },
                                              { key: 'acceptsCont', label: 'Cont' },
                                              { key: 'acceptsSemiPre', label: 'S.Pr' },
                                              { key: 'acceptsSemiNon', label: 'S.NP' },
                                              { key: 'acceptsP400', label: 'P400' },
                                            ] as const).map(({ key, label }) => {
                                              const active = s[key] === 'Oui';
                                              return (
                                                <button
                                                  key={key}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleServiceEdit(site, to, s.dayDep, s.timeDep, key, active ? 'Non' : 'Oui');
                                                  }}
                                                  className={`text-[8px] px-1 py-px rounded border transition-colors ${
                                                    active
                                                      ? 'bg-blue/10 text-blue border-blue/30'
                                                      : 'bg-transparent text-muted/40 border-border/50 hover:text-muted hover:border-border'
                                                  }`}
                                                >
                                                  {label}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ))}
                                      {/* Ajout horaire */}
                                      {addingScheduleTo === to ? (
                                        <div className="flex items-center gap-1 py-1 px-1.5 rounded bg-white/60" onClick={(e) => e.stopPropagation()}>
                                          <select value={scheduleNew.dayDep} onChange={(e) => setScheduleNew({ ...scheduleNew, dayDep: e.target.value })} className="text-[9px] bg-white border border-border rounded px-1 py-0.5 w-10">
                                            {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                                          </select>
                                          <input value={scheduleNew.timeDep} onChange={(e) => setScheduleNew({ ...scheduleNew, timeDep: e.target.value })} placeholder="HLR" className="text-[9px] font-mono bg-white border border-border rounded px-1 py-0.5 w-12" />
                                          <svg width="6" height="4" viewBox="0 0 6 4" fill="none" className="flex-shrink-0 text-muted/40">
                                            <path d="M0 2H5M5 2L3.5 0.5M5 2L3.5 3.5" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
                                          </svg>
                                          <select value={scheduleNew.dayArr} onChange={(e) => setScheduleNew({ ...scheduleNew, dayArr: e.target.value })} className="text-[9px] bg-white border border-border rounded px-1 py-0.5 w-10">
                                            {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                                          </select>
                                          <input value={scheduleNew.timeArr} onChange={(e) => setScheduleNew({ ...scheduleNew, timeArr: e.target.value })} placeholder="MAD" className="text-[9px] font-mono bg-white border border-border rounded px-1 py-0.5 w-12" />
                                          <button
                                            onClick={() => handleAddSchedule(site, to)}
                                            disabled={saving}
                                            className="text-[9px] text-blue hover:text-cyan transition-colors font-medium ml-auto"
                                          >
                                            OK
                                          </button>
                                          <button onClick={() => setAddingScheduleTo(null)} className="text-[9px] text-muted hover:text-text transition-colors">
                                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M2 2L6 6M6 2L2 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setAddingScheduleTo(to); setScheduleNew({ dayDep: 'Lu', timeDep: '', dayArr: 'Lu', timeArr: '' }); }}
                                          className="text-[9px] text-blue/60 hover:text-blue transition-colors py-0.5 px-1.5"
                                        >
                                          + Horaire
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Bouton + formulaire ajout rapide */}
                      <div className="px-2 pb-2.5">
                        {!addingFromSite ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSiteNewService({ ...EMPTY_SERVICE, from: site });
                              setAddingFromSite(true);
                            }}
                            className="w-full text-[10px] text-blue hover:text-cyan transition-colors py-1.5 rounded border border-dashed border-blue/30 hover:border-blue/50"
                          >
                            + Ajouter une destination
                          </button>
                        ) : (
                          <div className="border border-blue/20 rounded-lg p-2 space-y-2 bg-white/60" onClick={(e) => e.stopPropagation()}>
                            <div className="text-[9px] text-muted uppercase tracking-wider font-semibold">Nouvelle destination depuis {site}</div>
                            {/* Destination */}
                            <select
                              value={siteNewService.to}
                              onChange={(e) => setSiteNewService({ ...siteNewService, to: e.target.value })}
                              className={miniSelectCls + ' w-full'}
                            >
                              <option value="">Destination...</option>
                              {platformNames.filter((n) => n !== site).map((n) => <option key={n} value={n}>{n}</option>)}
                            </select>
                            {/* Horaires */}
                            <div className="grid grid-cols-4 gap-1">
                              <select value={siteNewService.dayDep} onChange={(e) => setSiteNewService({ ...siteNewService, dayDep: e.target.value })} className={miniSelectCls}>
                                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                              </select>
                              <input value={siteNewService.timeDep} onChange={(e) => setSiteNewService({ ...siteNewService, timeDep: e.target.value })} placeholder="HLR" className={miniInputCls} />
                              <select value={siteNewService.dayArr} onChange={(e) => setSiteNewService({ ...siteNewService, dayArr: e.target.value })} className={miniSelectCls}>
                                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                              </select>
                              <input value={siteNewService.timeArr} onChange={(e) => setSiteNewService({ ...siteNewService, timeArr: e.target.value })} placeholder="MAD" className={miniInputCls} />
                            </div>
                            {/* Matériels */}
                            <div className="flex flex-wrap gap-2">
                              {([
                                { key: 'acceptsCM', label: 'CM' },
                                { key: 'acceptsCont', label: 'Cont' },
                                { key: 'acceptsSemiPre', label: 'S.Pr' },
                                { key: 'acceptsSemiNon', label: 'S.NP' },
                                { key: 'acceptsP400', label: 'P400' },
                              ] as const).map(({ key, label }) => (
                                <label key={key} className="flex items-center gap-1 text-[9px] text-text cursor-pointer">
                                  <input type="checkbox" checked={siteNewService[key] === 'Oui'} onChange={(e) => setSiteNewService({ ...siteNewService, [key]: e.target.checked ? 'Oui' : 'Non' })} className="w-3 h-3 rounded border-border text-blue" />
                                  {label}
                                </label>
                              ))}
                            </div>
                            {/* Actions */}
                            <div className="flex gap-1.5">
                              <button
                                onClick={handleAddSiteService}
                                disabled={!siteNewService.to || saving}
                                className="text-[10px] px-2.5 py-1 rounded bg-blue text-white hover:bg-blue/90 transition-colors disabled:opacity-40"
                              >
                                Ajouter
                              </button>
                              <button
                                onClick={() => setAddingFromSite(false)}
                                className="text-[10px] px-2.5 py-1 rounded text-muted hover:text-text border border-border transition-colors"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonne droite : carte */}
        <div className="lg:col-span-8 xl:col-span-9 h-full">
          <OperatorMap
            platforms={data.platforms}
            routes={data.routes}
            services={data.services}
            operator={operator}
            highlightedSite={selectedSite}
            onSiteSelect={handleMapSiteSelect}
            extraRailGeometries={extraRailGeo}
          />
        </div>
      </div>


      {saving && <div className="text-[10px] text-cyan animate-pulse fixed bottom-4 right-4 glass-panel rounded-md px-3 py-1.5">Sauvegarde en cours...</div>}
    </div>
  );
}

/* ── Composants inline ── */

/** Auto-formate une saisie en HH:MM — ex: "10" → "10:00", "1030" → "10:30", "9h30" → "09:30" */
function formatTime(raw: string): string {
  const s = raw.trim().replace(/\s+/g, '');
  if (!s) return '';
  // Déjà au format HH:MM
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const [h, m] = s.split(':');
    return `${h.padStart(2, '0')}:${m}`;
  }
  // Format avec h — "10h", "10h30", "9h5"
  const hMatch = s.match(/^(\d{1,2})[hH](\d{0,2})$/);
  if (hMatch) {
    const h = hMatch[1].padStart(2, '0');
    const m = (hMatch[2] || '0').padEnd(2, '0');
    return `${h}:${m}`;
  }
  // 3-4 chiffres — "930" → "09:30", "1030" → "10:30"
  if (/^\d{3,4}$/.test(s)) {
    const h = s.slice(0, -2).padStart(2, '0');
    const m = s.slice(-2);
    return `${h}:${m}`;
  }
  // 1-2 chiffres — "10" → "10:00", "9" → "09:00"
  if (/^\d{1,2}$/.test(s)) {
    return `${s.padStart(2, '0')}:00`;
  }
  return s;
}

function InlineTimeEdit({ value, onCommit }: { value: string; onCommit: (val: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');

  const commit = () => {
    const formatted = formatTime(draft);
    setDraft(formatted);
    onCommit(formatted);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setEditing(false);
        }}
        onClick={(e) => e.stopPropagation()}
        placeholder="ex: 10h30"
        className="w-14 text-[10px] font-mono bg-blue/5 border border-blue/30 rounded px-1 py-0.5 text-text focus:outline-none"
      />
    );
  }
  return (
    <span
      className="text-[10px] font-mono cursor-pointer hover:text-blue transition-colors px-0.5"
      style={{ color: value ? '#7dc243' : '#8893a7' }}
      onClick={(e) => { e.stopPropagation(); setDraft(value || ''); setEditing(true); }}
      title="Cliquer pour modifier"
    >
      {value || '—'}
    </span>
  );
}

