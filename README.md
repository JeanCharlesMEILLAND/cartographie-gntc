# Cartographie Transport Combine — GNTC

Application web de cartographie interactive pour le transport combine rail-route en France, developpee pour le GNTC (Groupement National des Transports Combines).

Visualisation des plateformes, liaisons ferroviaires, operateurs et services sur une carte interactive avec un panneau d'administration complet.

## Stack technique

- **Framework** : Next.js 14 (App Router)
- **UI** : React 18, Tailwind CSS
- **Carte** : Leaflet + React-Leaflet
- **BDD** : PostgreSQL (Neon) via Drizzle ORM
- **Auth** : NextAuth v5 (credentials + JWT)
- **Validation** : Zod
- **State** : Zustand
- **Import** : xlsx (Excel), CSV

## Prerequis

- Node.js >= 18
- PostgreSQL (ou compte [Neon](https://neon.tech))
- npm

## Installation

```bash
git clone https://github.com/JeanCharlesMEILLAND/cartographie-gntc.git
cd cartographie-gntc
npm install
```

## Configuration

Copier le fichier d'exemple et renseigner les valeurs :

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL (ex: `postgresql://user:pass@host:5432/db`) |
| `AUTH_SECRET` | Secret NextAuth — generer avec `openssl rand -base64 32` |

## Base de donnees

Appliquer le schema avec Drizzle :

```bash
npx drizzle-kit push
```

Cela cree 3 tables :
- `users` — comptes utilisateurs (admin / operateur)
- `operators` — profils operateurs (logo, contact, description)
- `audit_log` — historique des modifications

### Seed initial

Creer le premier compte admin :

```bash
node scripts/seed-admin.mjs
```

Importer les operateurs depuis les donnees :

```bash
node scripts/seed-operators.mjs
node scripts/seed-operator-profiles.mjs
```

## Lancement

```bash
npm run dev
```

L'application est disponible sur `http://localhost:3000`.

## Import des donnees

L'admin peut importer un fichier Excel (`.xlsx`) via le bouton d'upload dans le panneau d'administration. Le fichier doit contenir deux onglets :

1. **Plateformes** — liste des sites avec coordonnees GPS
2. **Flux** — services avec operateur, origine, destination, horaires, materiels acceptes

Les donnees sont stockees dans `data/current.json`.

Un script d'initialisation est aussi disponible :

```bash
node scripts/init-data.mjs
```

## Geometries ferroviaires

Les lignes sur la carte suivent les voies ferrees reelles. Les geometries sont calculees via :

1. **BRouter** (`brouter.de`) — routage ferroviaire
2. **Overpass API** — snap des coordonnees plateformes vers les noeuds ferroviaires les plus proches

Precalculer toutes les geometries :

```bash
node scripts/fetch-rail-routes-v2.mjs
```

Les resultats sont caches dans `public/rail-geometries.json`. Les geometries manquantes peuvent aussi etre calculees a la volee via l'API `/api/rail-geometry`.

## Architecture

```
app/
  page.tsx                    # Carte publique interactive
  login/page.tsx              # Page de connexion
  admin/
    page.tsx                  # Dashboard admin (KPIs, qualite, exports)
    activite/page.tsx         # Vue operateur (ses sites, liaisons, carte)
    plateformes/page.tsx      # CRUD plateformes
    operateurs/page.tsx       # Liste operateurs
    operateurs/[name]/page.tsx# Detail operateur
    flux/page.tsx             # Tableau des services
    utilisateurs/page.tsx     # Gestion utilisateurs (admin only)
    historique/page.tsx       # Audit log (admin only)
    profil/page.tsx           # Profil operateur
  api/
    data/route.ts             # GET donnees transport (public)
    auth/[...nextauth]/       # NextAuth handlers
    upload/route.ts           # POST import Excel (admin)
    rail-geometry/route.ts    # POST calcul geometrie rail
    admin/
      save/route.ts           # POST sauvegarde donnees + audit
      operators/route.ts      # CRUD operateurs
      users/route.ts          # CRUD utilisateurs
      audit/route.ts          # GET historique modifications

components/
  Admin/                      # Composants panneau admin
  Filters/                    # Filtres carte (pays, operateur, frequence)
  Map*/                       # Couches carte (routes, plateformes, labels)
  SearchPanel.tsx             # Recherche d'itineraire
  Legend.tsx                   # Legende operateurs

lib/
  auth.ts                     # Configuration NextAuth
  validations.ts              # Schemas Zod
  types.ts                    # Interfaces TypeScript
  adminComputations.ts        # Calculs KPIs et statistiques
  dataQuality.ts              # Controles qualite donnees
  exportCsv.ts / importCsv.ts # Import/export CSV
  parseExcel.ts               # Parsing fichier Excel
  bezier.ts                   # Courbes Bezier (fallback carte)
  colors.ts                   # Palette couleurs operateurs
  co2.ts                      # Calcul economies CO2
  routeFinder.ts              # Recherche itineraire (BFS)
  db/
    schema.ts                 # Schema Drizzle (users, operators, audit_log)
    index.ts                  # Connexion BDD

middleware.ts                 # Protection centralisee des routes
store/                        # Zustand stores (filtres, recherche, admin)
```

## Roles et permissions

| | Admin | Operateur |
|---|---|---|
| Carte publique | oui | oui |
| Dashboard KPIs | oui | — |
| Gerer ses services | oui | oui (scope propre) |
| Gerer les plateformes | oui | — |
| Gerer les utilisateurs | oui | — |
| Importer Excel/CSV | oui | CSV propre operateur |
| Voir l'audit log | oui | — |
| Modifier profil operateur | oui | oui (le sien) |

## Securite

- **Middleware centralisé** (`middleware.ts`) : protection de toutes les routes `/admin` et `/api/admin`
- **Validation Zod** sur toutes les API (body, types, contraintes)
- **Scope operateur** : un operateur ne peut modifier que ses propres services
- **Mots de passe** : hashes bcrypt (10 rounds)
- **Audit** : toutes les modifications sont logguees en BDD

## Scripts npm

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de developpement (port 3000) |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Lint ESLint |

## Fonctionnalites carte publique

- Plateformes avec marqueurs proportionnels au volume
- Liaisons suivant les voies ferrees reelles
- Filtrage par operateur, frequence, pays (France/International)
- Overlay reseau SNCF (ITE, electrification, voie unique/double)
- Simulation trafic live avec curseur temporel
- Recherche d'itineraire multi-correspondance
- Filtre par type d'UTI (caisses mobiles, conteneurs, semi-remorques, P400)
- Calcul economies CO2 rail vs route
- Labels de noms de sites avec anti-collision
- Export CSV (synthese, plateformes, liaisons, services)

## Licence

Projet prive — GNTC / OTC.
