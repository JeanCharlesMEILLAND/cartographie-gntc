export interface Platform {
  site: string;
  ville: string;
  exploitant: string;
  groupe: string;
  departement: string;
  pays: string;
  lat: number;
  lon: number;
  chantierSNCF?: boolean;
}

export interface AggregatedRoute {
  from: string;
  to: string;
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
  freq: number;
  operators: string[];
}

export interface TransportData {
  platforms: Platform[];
  routes: AggregatedRoute[];
  operators: string[];
  unmatchedPlatforms: string[];
  uploadedAt: string;
  fileName: string;
}

export interface RawFlux {
  operateur: string;
  paysExp: string;
  dptExp: string;
  plateformeExp: string;
  exploitantPFExp: string;
  paysDest: string;
  dptDest: string;
  plateformeDest: string;
  exploitantPFDest: string;
  frequenceHebdo: number;
  jourDepart: string;
  hlrDepart: string;
  jourArrivee: string;
  madArrivee: string;
  accepteCaissesMobiles: string;
  accepteConteneurs: string;
  accepteSemiPrehensibles: string;
  accepteSemiNonPrehensibles: string;
  accepteSemiP400: string;
  commentaires: string;
  travail: string;
}

export interface RawPlatform {
  site: string;
  exploitant: string;
  groupe: string;
  chantierSNCF: string;
  departement: string;
  rue: string;
  cp: string;
  ville: string;
  pays: string;
}
