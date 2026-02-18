# Sources de données — Cartographie Transport Combiné OTC/GNTC

## Vue d'ensemble

La cartographie interactive utilise plusieurs sources de données publiques et ouvertes pour construire ses couches d'information. Ce document détaille chaque source, son origine, sa licence et comment elle est utilisée.

---

## 1. Données de transport combiné (données métier)

| Élément | Source | Format |
|---------|--------|--------|
| Plateformes (sites) | Fichier Excel uploadé par l'OTC/GNTC | Converti en JSON, stocké en base PostgreSQL |
| Services (liaisons ferroviaires) | Fichier Excel uploadé par l'OTC/GNTC | Idem |
| Opérateurs | Fichier Excel uploadé par l'OTC/GNTC | Idem |

**Contenu** : liste des plateformes de transport combiné (nom, ville, département, coordonnées GPS, exploitant, groupe), services hebdomadaires entre plateformes (jours, horaires, types d'UTI acceptées), et opérateurs avec leurs contacts.

**Mise à jour** : manuelle via l'interface d'administration (`/admin`).

---

## 2. Réseau ferroviaire français

### 2.1 Tracé du réseau ferré national (RFN)

| Détail | Valeur |
|--------|--------|
| **Source** | SNCF Réseau — Réseau Ferré National |
| **Fichier** | `/public/sncf-rfn.geojson` (fichier statique ~890 Ko) |
| **Licence** | Licence Ouverte Etalab 2.0 |
| **Couche carte** | "Réseau ferré" |

Tracé complet de toutes les lignes ferroviaires françaises. Affiché en bleu semi-transparent en fond de carte.

### 2.2 Régime d'exploitation (voie unique / double voie)

| Détail | Valeur |
|--------|--------|
| **Source** | SNCF Open Data |
| **URL** | `https://ressources.data.sncf.com/api/explore/v2.1/catalog/datasets/regime-dexploitation-des-lignes/exports/geojson` |
| **Licence** | Licence Ouverte Etalab 2.0 |
| **Couches carte** | "Voie unique" / "Double voie" |

Distinction entre les lignes à voie unique (bleues) et double voie (orange). Données récupérées dynamiquement via l'API SNCF Open Data.

### 2.3 Électrification des lignes

| Détail | Valeur |
|--------|--------|
| **Source** | SNCF Open Data |
| **URL** | `https://ressources.data.sncf.com/api/explore/v2.1/catalog/datasets/liste-des-lignes-electrifiees/exports/geojson` |
| **Licence** | Licence Ouverte Etalab 2.0 |
| **Couche carte** | "Électrification" |

Type d'électrification par ligne : 25 000V AC (rouge), 1 500V DC (bleu), 15 000V 16.67Hz (orange), 3 000V DC (vert), 750V DC (violet).

### 2.4 ITE — Installations Terminales Embranchées

| Détail | Valeur |
|--------|--------|
| **Source** | data.gouv.fr (Ministère des Transports) |
| **URL** | `https://www.data.gouv.fr/api/1/datasets/r/a31e504f-ad5c-4b78-916e-f9ed30d789b7` |
| **Licence** | Licence Ouverte Etalab 2.0 |
| **Couches carte** | "ITE utilisées" / "ITE disponibles" |

Points de raccordement ferroviaire des entreprises. Séparées en deux catégories :
- **ITE utilisées** (jaune) : convention active + circulation récente
- **ITE disponibles** (bleu) : infrastructure existante mais pas de trafic récent

### 2.5 Géométries des itinéraires ferroviaires

| Détail | Valeur |
|--------|--------|
| **Source** | BRouter (routage ferroviaire) + Overpass API (nœuds OpenStreetMap) |
| **URLs** | `https://brouter.de/brouter` / `https://overpass-api.de/api/interpreter` |
| **Fichier cache** | `/public/rail-geometries.json` (~395 Ko) |
| **Licence** | ODbL (OpenStreetMap) |

Les tracés ferroviaires entre plateformes sont calculés via BRouter (profil rail) en utilisant les nœuds ferroviaires OpenStreetMap les plus proches de chaque plateforme. Les résultats sont mis en cache pour éviter de recalculer à chaque chargement.

---

## 3. Réseau fluvial

### 3.1 Voies navigables

| Détail | Valeur |
|--------|--------|
| **Source** | Sandre / Eau France — Domaine Public Fluvial (DPF) |
| **URL** | `https://services.sandre.eaufrance.fr/geo/dpf` (service WFS) |
| **Format** | GeoJSON via WFS (`application/json; subtype=geojson`) |
| **Licence** | Licence Ouverte Etalab 2.0 |
| **Couche carte** | "Voies navigables" |
| **Gestionnaire des données** | VNF (Voies Navigables de France) |

Tracé de l'ensemble du Domaine Public Fluvial français. L'application filtre pour ne garder que les segments **navigables** (exclusion des segments "Non navigable" et "Fictif").

**Propriétés disponibles par segment** :
- `Navigabilité` : Navigable / Non navigable
- `Gabarit` : classe CEMT du gabarit de navigation
- `Voie` : nom de la voie (ex: "Seine", "Canal du Midi")
- `Autorité_Gestion` : gestionnaire (VNF, département, etc.)
- `Département` / `Région`

### 3.2 Ports fluviaux et maritimes

| Détail | Valeur |
|--------|--------|
| **Source** | Sandre / Eau France — Référentiel des ports |
| **URL** | `https://services.sandre.eaufrance.fr/geo/pts` (service WFS) |
| **Format** | GeoJSON via WFS |
| **Licence** | Licence Ouverte Etalab 2.0 |
| **Couche carte** | "Ports fluviaux" |

Points de localisation des ports français. L'application filtre pour ne garder que :
- Les ports à activité **Commerce** (fret/marchandises)
- Les ports de nature **Fluvial** ou **Fluvio-maritime**

Les ports de plaisance et de pêche uniquement sont exclus.

**Propriétés affichées dans le tooltip** :
- `NomPort` : nom du port
- `LbCommune` : commune
- `MnNaturePort` : Maritime / Fluvial / Fluvio-maritime
- `MnActivitePortuaire_1..6` : activités (Commerce, Pêche, Plaisance, etc.)

---

## 4. Routage et géocodage

### 4.1 Géocodage des villes

| Détail | Valeur |
|--------|--------|
| **Source** | Nominatim (OpenStreetMap) |
| **URL** | `https://nominatim.openstreetmap.org/search` |
| **Licence** | ODbL (OpenStreetMap) |
| **Limite** | 1 requête/seconde (respect de la politique d'usage) |

Utilisé pour convertir les noms de villes en coordonnées GPS dans la recherche d'itinéraire et le chatbot. Limité à 8 pays : France, Belgique, Luxembourg, Allemagne, Italie, Espagne, Pays-Bas, Suisse.

### 4.2 Itinéraire routier (premier/dernier km)

| Détail | Valeur |
|--------|--------|
| **Source** | OSRM — Open Source Routing Machine |
| **URL** | `https://router.project-osrm.org/route/v1/driving/` |
| **Licence** | Données OpenStreetMap (ODbL) |

Calcul du tracé routier réel entre la ville d'origine et la première plateforme, et entre la dernière plateforme et la ville de destination. Affiché en pointillés orange sur la carte. Remplace une simple ligne droite par le vrai itinéraire routier (autoroutes, nationales, etc.).

---

## 5. Fonds de carte (tuiles)

| Style | Source | URL |
|-------|--------|-----|
| OSM France | OpenStreetMap France | `tile.openstreetmap.fr/osmfr/` |
| Carto Dark | CARTO | `basemaps.cartocdn.com/dark_all/` |
| Carto Light | CARTO | `basemaps.cartocdn.com/light_all/` |
| Voyager | CARTO | `basemaps.cartocdn.com/rastertiles/voyager/` |
| Topo | OpenTopoMap | `tile.opentopomap.org/` |

---

## 6. Chatbot IA k LEFER

| Détail | Valeur |
|--------|--------|
| **Source** | IA k LEFER (API privée) |
| **URL** | `https://www.iaklefer.fr/api/chat` |
| **Protocole** | Server-Sent Events (SSE) / Streaming |

Le chatbot intégré utilise l'API de IA k LEFER pour répondre aux questions générales sur le transport combiné. Pour les recherches d'itinéraire (ex: "transporter de Lyon à Marseille"), le chatbot utilise les données locales de la cartographie (mêmes algorithmes que le panneau de recherche).

---

## 7. Analytics

| Détail | Valeur |
|--------|--------|
| **Source** | Vercel Analytics |
| **Données collectées** | Pages vues, visiteurs, pays, appareil, navigateur |
| **Stockage** | Serveurs Vercel |

---

## 8. Facteurs d'émission CO₂

| Détail | Valeur |
|--------|--------|
| **Source** | ADEME — Base Carbone 2024 |
| **Facteurs utilisés** | Rail : 5,4 g CO₂/t-km · Route : 68 g CO₂/t-km |
| **Coefficient routier** | ×1.3 (sinuosité route vs vol d'oiseau) |
| **Charge moyenne** | 20 tonnes par UTI |

Ces facteurs sont utilisés dans le comparateur CO₂ du panneau de recherche et du chatbot pour comparer transport combiné vs tout routier.

---

## Résumé des licences

| Licence | Sources concernées |
|---------|-------------------|
| **Licence Ouverte Etalab 2.0** | SNCF Open Data, data.gouv.fr, Sandre/Eau France |
| **ODbL (Open Database License)** | OpenStreetMap, Nominatim, OSRM, Overpass, BRouter |
| **Propriétaire** | Données OTC/GNTC (plateformes, services), IA k LEFER |

Toutes les données publiques utilisées sont sous licences ouvertes permettant la réutilisation libre, y compris à des fins commerciales, sous réserve de mention de la source.

---

*Document généré le 18 février 2026 — Cartographie Transport Combiné OTC/GNTC*
