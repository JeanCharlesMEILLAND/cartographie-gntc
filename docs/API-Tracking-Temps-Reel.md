# Suivi Temps Reel du Transport Combine -- Etude des API et Plateformes

**Date :** 16 fevrier 2026
**Contexte :** La fonctionnalite "Trafic live" de la cartographie GNTC affiche actuellement des positions **theoriques** basees sur les horaires planifies. Ce document recense toutes les solutions existantes pour obtenir des donnees de suivi **en temps reel**.

---

## Table des matieres

1. [Etat des lieux](#1-etat-des-lieux)
2. [Operateurs avec API de tracking](#2-operateurs-avec-api-de-tracking)
   - [Naviland Cargo (API REST)](#21-naviland-cargo--api-rest)
   - [DB Cargo France (link2rail API)](#22-db-cargo-france--link2rail-api)
3. [Operateurs avec portail de suivi](#3-operateurs-avec-portail-de-suivi)
   - [HUPAC (Train Radar / WOLF)](#31-hupac--train-radar--wolf)
   - [CargoBeamer (eLogistics)](#32-cargobeamer--elogistics)
   - [VIIA (VIIA Drive)](#33-viia--viia-drive)
   - [T3M (Everysens IoT)](#34-t3m--everysens-iot)
   - [Novatrans-Greenmodal (CESAR)](#35-novatrans-greenmodal--cesar)
4. [Plateformes centralisees](#4-plateformes-centralisees)
   - [CESAR-NEXT](#41-cesar-next)
   - [RNE TIS](#42-rne-tis--train-information-system)
   - [Everysens (SaaS)](#43-everysens--saas)
   - [RailData ISR](#44-raildata-isr)
5. [Cadre reglementaire](#5-cadre-reglementaire)
   - [TEL TSI (2026/253)](#51-tel-tsi-reglement-2026253)
   - [eFTI](#52-efti)
6. [SNCF Open Data -- Pourquoi ca ne marche pas](#6-sncf-open-data)
7. [Tableau comparatif](#7-tableau-comparatif)
8. [Recommandations pour la cartographie GNTC](#8-recommandations)
9. [Contacts](#9-contacts)

---

## 1. Etat des lieux

### Ce que fait la cartographie aujourd'hui

La fonctionnalite "Trafic live" simule le deplacement des trains sur la carte en se basant sur :
- Les jours de depart et d'arrivee (Lu, Ma, Me, etc.)
- Les heures HLR (Heure Limite de Remise) et MAD (Mise A Disposition)
- Une interpolation lineaire de la position entre depart et arrivee

**Limite :** Ce n'est **pas du temps reel**. C'est une simulation basee sur les horaires theoriques. Aucun retard, annulation ou changement n'est reflete.

### Ce qui existe sur le marche

| Categorie | Exemple | Temps reel ? | Acces |
|-----------|---------|-------------|-------|
| API operateur | Naviland, DB Cargo | Oui (GPS/evenements) | Client/partenaire |
| Portail client | HUPAC, CargoBeamer | Oui (GPS) | Client uniquement |
| Plateforme europeenne | CESAR-NEXT, RNE TIS | Oui (multi-operateurs) | Accord/contrat |
| SaaS tiers | Everysens | Oui (IoT/GPS) | Abonnement payant |
| Donnees ouvertes | SNCF Open Data | **Passagers uniquement** | Gratuit |

---

## 2. Operateurs avec API de tracking

### 2.1 Naviland Cargo -- API REST

Naviland Cargo est le **seul operateur francais** de transport combine a proposer un portail API documente.

| | Details |
|---|---|
| **Portail API** | https://api-docs.naviland-cargo.com/ |
| **API Tracking** | https://api-docs.naviland-cargo.com/catalog/tracking |
| **Portail client** | https://navitrack.naviland-cargo.com/ (Navitr@ck) |
| **App mobile** | Navidriver (Android) -- validation des operations route |
| **Format** | REST / JSON (probable, portail moderne) |
| **Authentification** | API Key ou OAuth2 (apres inscription sur le portail) |
| **Acces** | Inscription sur le portail API + relation commerciale |
| **Cout** | Non public -- inclus dans la relation commerciale |
| **Groupe** | Rail Logistics Europe / SNCF |

**Fonctionnalites Navitr@ck :**
- Suivi en temps reel des expeditions (conteneurs, caisses mobiles, citernes)
- Statut des unites de chargement
- Capacite disponible dans les plans de transport
- Interface moderne (Angular/Material Design)

**Contact API :**
- Site : https://www.naviland-cargo.com/en/contacts
- Telephone : +33 (0)1 41 05 33 01
- Adresse : 16 Rue Simone Veil, 93400 Saint-Ouen-sur-Seine

---

### 2.2 DB Cargo France -- link2rail API

DB Cargo possede la plateforme API la **plus mature et la mieux documentee** du secteur fret ferroviaire europeen.

| | Details |
|---|---|
| **Portail developpeur** | https://developers.deutschebahn.com/db-cargo/link2rail |
| **Portail commercial** | https://link2rail.dbcargo.com/ |
| **Page produit** | https://www.dbcargo.com/rail-de-en/link2rail/api |
| **Format** | REST / JSON |
| **Authentification** | **OAuth2** (Login Service -> access token -> sessionID) |
| **Delai d'approbation** | **3 jours ouvrables** apres inscription |
| **Cout** | Non public -- "implementation rentable" |

**APIs disponibles :**

| API | Description | Demo ? |
|-----|-------------|--------|
| **Track & Trace** | Suivi temps reel des ordres de transport. Messages VABE (Value Added Business Events) automatiques avec positions GPS. Historique et notifications. | Non |
| **Geofence Control** | Transparence pour les wagons equipes GPS/telematique. Vue d'ensemble par site : numeros de wagons, donnees de commande, temps d'immobilisation. | **Oui** |
| **Empty Wagon Order** | Commande de wagons vides via templates du portail. | **Oui** |
| **Transport Location** | Informations de localisation des ordres de transport. | A verifier |
| **Login Service** | Service OAuth2 pour obtenir les tokens d'acces. | **Oui** |

**Comment s'inscrire :**
1. Aller sur https://developers.deutschebahn.com/db-cargo/link2rail/en/start
2. Creer un compte sur le portail developpeur (gratuit pour consulter les specs)
3. Selectionner un plan d'utilisation pour l'API souhaitee
4. Creer une application (client ID + client secret fournis)
5. Verification interne (approbation sous **3 jours ouvrables** par email)
6. Tester via "Try It" ou appeler depuis un systeme externe

**Contact :** link2rail@deutschebahn.com

---

## 3. Operateurs avec portail de suivi

### 3.1 HUPAC -- Train Radar / WOLF

| | Details |
|---|---|
| **Plateforme** | WOLF (Web Online Logistics Facility) |
| **URL** | https://www.hupac.com/EN/WOLF-platform-9d39b000 |
| **Login** | http://wolf.hupac.ch/ |
| **Demande d'acces** | https://www.hupac.com/Login-WOLF-request |
| **Train Radar** | https://www.hupac.com/EN/Train-Radar-1a2fc800 |
| **Handbook** | https://www.hupac.com/Hupac-Train-Radar-Handbook-0bf50f00 |
| **Integration** | EDIGES XML (pas de REST API publique) |
| **GPS** | Positions toutes les **3 minutes** via balises embarquees |
| **Capteurs** | 1 000 wagons equipes (technologie Nexiot) |

**Train Radar fournit :**
- Positions GPS temps reel sur une carte
- ETA (Estimated Time of Arrival) au terminal de destination
- ETP (Estimated Time of Pick-up) de l'unite de chargement
- Alertes d'irregularites et retards
- Evenements de trafic (maintenance infra, perturbations)
- Vue par train ou par unite de chargement

**WOLF fournit en plus :**
- Outil de reservation en ligne
- Gestion des enlevements (pick-up)
- Telechargement des bons de livraison
- Connexion directe a CESAR-NEXT

**Contact :** info.ch@hupac.com | +41 58 855 88 00

---

### 3.2 CargoBeamer -- eLogistics

| | Details |
|---|---|
| **Plateforme** | eLogistics |
| **URL** | https://booking.cargobeamer.com |
| **GPS** | Suivi GPS **24h/24, 7j/7** des semi-remorques |
| **API** | Pas d'API publique documentee |
| **Acces** | Clients enregistres uniquement |

**Fonctionnalites :**
- Reservation en ligne des transports
- Suivi GPS en temps reel de toutes les semi-remorques sur le reseau europeen
- Gestion documentaire (protocoles check-in/check-out, historique, factures)
- Notifications email automatiques sur l'avancement
- Reservation du pre/post acheminement (drayage)

**Contact :** info@cargobeamer.com | +49 341 652 339 00

---

### 3.3 VIIA -- VIIA Drive

| | Details |
|---|---|
| **App** | VIIA Drive |
| **iOS** | https://apps.apple.com/fr/app/viia-drive/id1494962576 |
| **Android** | https://play.google.com/store/apps/details?id=com.viia.viiadrive |
| **Langues** | 10 langues |
| **Terminaux** | Le Boulou, Orbassano, Aiton, Macon, Bettembourg, Calais |

**Fonctionnalites :**
- Pre-enregistrement avant arrivee au terminal (reduction du temps d'attente)
- Generation de QR Code pour entree rapide au terminal
- Suivi en temps reel du statut de reservation
- Geolocalisation des semi-remorques aux terminaux
- Historique des operations

**Contact :** info@viia.com | +33 4 68 81 56 74

---

### 3.4 T3M -- Everysens IoT

| | Details |
|---|---|
| **Plateforme** | Everysens TVMS (SaaS) |
| **Capteurs** | Everytrack (capteurs IoT industriels) |
| **Connectivite** | Sigfox LPWAN |
| **Autonomie** | 3-5 ans par capteur |
| **Partenaire wagons** | VTG Connect (VTG Rail Europe France) |
| **Terminaux** | 10 terminaux en France + 1 en Italie |

**Comment ca marche :**
1. Capteurs GPS/temperature/vitesse installes sur les wagons
2. Transmission via reseau Sigfox (faible consommation)
3. Traitement par la plateforme cloud Everysens
4. Tableau de bord temps reel pour les equipes T3M
5. Alertes proactives (retards, trains incomplets)
6. ETA predictifs par intelligence artificielle

**Contact T3M :** sales@t3m.fr | +33 4 67 27 18 51

---

### 3.5 Novatrans-Greenmodal -- CESAR

| | Details |
|---|---|
| **Portail** | CESAR Online / CESAR-NEXT |
| **URL Novatrans** | https://www.cesar-online.com/booking/partner.htm?name=novatrans |
| **Espace client** | https://novatrans-greenmodal.eu/fr/espace-client |
| **Reservation Greenmodal** | https://novatrans-greenmodal.eu/en/booking-form-greenmodal-transport |

Novatrans est **membre fondateur** de CESAR (2004). Tous les clients Novatrans-Greenmodal peuvent acceder au suivi via CESAR-NEXT.

**Contact Novatrans :** +33 (0)1 85 34 49 00
**Contact Greenmodal :** +33 (0)4 88 15 11 51

---

## 4. Plateformes centralisees

### 4.1 CESAR-NEXT

**La plateforme de reference du transport combine europeen.**

| | Details |
|---|---|
| **URL** | https://cesar-next.com |
| **Ancien portail** | https://www.cesar-online.com |
| **Lancement** | 2 mai 2023 (successeur de CESAR, lance en 2004) |
| **Operateur** | CIS SCRL (CESAR Information Services), Bruxelles |
| **Supervision** | UIRR (https://www.uirr.com/services/cesar) |
| **Volume** | **2,3 millions d'unites de chargement/an** |
| **Utilisateurs** | **1 000+ clients** connectes |
| **Langues** | 4 langues |
| **Disponibilite** | 24/7 |

**Membres fondateurs / operateurs connectes :**
- Kombiverkehr (Allemagne)
- Hupac (Suisse)
- Mercitalia Intermodal (Italie, groupe FS)
- Novatrans-Greenmodal (France)
- LINEAS
- Rail Cargo Operator

**Fonctionnalites detaillees :**

| Fonctionnalite | Description |
|---|---|
| **Track & Trace** | Suivi en temps reel des unites de chargement (conteneurs, caisses mobiles, semi-remorques) a travers l'Europe |
| **Horaires** | Horaires a jour des trains de transport combine |
| **Rapports d'irregularites** | Notifications proactives en cas de retards ou perturbations |
| **ETA / ETP** | Heure estimee d'arrivee au terminal + heure estimee d'enlevement |
| **Disponibilite des unites** | Notification quand l'unite est prete a etre enlevee au terminal de destination |
| **Vue multi-operateurs** | Si vous utilisez plusieurs operateurs TC, toutes les donnees sur une seule plateforme |
| **Service B2B** | Telechargement automatise de toutes les donnees de transport pour integration dans vos systemes |
| **Connectivite EDIGES** | Echange de donnees standardise avec les operateurs de terminaux |
| **Interface avec les GI** | Connexion directe avec les Gestionnaires d'Infrastructure (SNCF Reseau, DB Netz, etc.) |

**Format de donnees :**
- **EDIGES** (European Data Interchange for Combined Transport) XML v4.1
- Partiellement conforme TAF TSI
- Couvre : reservation, operations route pre/post, activites terminal, suivi train, ETA/ETD/ETP
- Documentation : https://edigesconsortium.atlassian.net/wiki/spaces/ED/pages/1463353345/4.1-FINAL
- **Pas d'API REST/JSON publique** -- integration via B2B/EDI

**Comment s'inscrire :**
1. Aller sur https://cesar-next.com ou https://www.cesar-online.com
2. Cliquer sur "Register"
3. Selectionner votre **operateur intermodal de reference** (celui dont vous etes client)
4. Remplir les informations de l'entreprise
5. Recevoir les identifiants par email
6. Se connecter pour acceder au suivi

**Cout :**
Le cout n'est **pas rendu public**. L'acces semble etre **inclus dans la relation commerciale** avec l'operateur TC. Pas de tarif par transaction ou d'abonnement affiche. Contacter CIS SCRL ou votre operateur pour confirmation.

**Interet pour GNTC :**
- Vue consolidee du trafic de TOUS les operateurs membres
- Source unique pour les donnees de suivi a l'echelle europeenne
- Integration B2B possible pour alimenter la cartographie en donnees reelles
- Couvre environ **2/3 du volume UIRR** -- la majorite du TC europeen

**Contact :**
- Via UIRR : https://www.uirr.com/services/cesar
- Via Kombiverkehr : https://www.kombiverkehr.de/en/service/it-solutions/cesar-next
- Contact direct CIS SCRL : via votre operateur TC

---

### 4.2 RNE TIS -- Train Information System

**Le systeme le plus complet pour le suivi temps reel des trains fret en Europe.**

| | Details |
|---|---|
| **URL** | https://rne.eu/it/rne-applications/tis/ |
| **Carte live** | https://rne.eu/tis-live-map/ (publique !) |
| **Couverture** | **24 pays europeens, 26 operateurs ferroviaires** |
| **Volume** | **840 000 trajets/mois** |
| **Disponibilite** | 99,6% |
| **Utilisateurs** | 5 300+ actifs/mois |
| **Standards** | TAF/TAP TSI |

**Donnees disponibles pour le fret :**
- Positions temps reel des trains (fret ET passagers)
- Comparaison horaires prevus vs reels
- Retards et irregularites avec estimations
- ETA/ETD aux gares et terminaux
- Donnees de transfert transfrontalier
- Perturbations infrastructure
- Carte live de visualisation

**Qui peut s'inscrire :**
- Entreprises ferroviaires (EF)
- Chargeurs / expediteurs
- Commissionnaires de transport
- **Operateurs de transport combine** (GNTC est eligible)
- Gestionnaires d'installations (terminaux fret, ports)

**Processus d'inscription (TIS User Agreement) :**
1. Telecharger le formulaire : https://cms.rne.eu/tis/tis-downloads/tis-interface-agreement-users
2. Remplir toutes les donnees de l'entreprise
3. **Imprimer DEUX copies papier**
4. Faire **signer par un representant autorise** (ex: DG)
5. **Envoyer par courrier postal** au bureau RNE a Vienne (les scans PDF ne sont PAS acceptes)
6. RNE envoie les comptes TIS par email

**Format de donnees :**
- Protocole SOAP/XML (base TAF/TAP TSI)
- RNE Common Interface (CI) : stockage cloud des messages TAF TSI
- Signatures numeriques optionnelles
- **Pas de REST/JSON** -- architecture SOAP legacy

**Cout :** Non public. Acces apparemment gratuit ou faible cout pour les entites qualifiees.

**Contact :**
- Email : support.tis@rne.eu
- Telephone : +43 1 907 62 72 25
- Adresse : RailNetEurope, Jakov-Lind-Strasse 5, Campus 3, 1020 Vienna, Austria
- Horaires support : Lun-Jeu 09:00-16:00, Ven 09:00-15:00

---

### 4.3 Everysens -- SaaS

**La plateforme SaaS la plus avancee pour la visibilite fret ferroviaire.**

| | Details |
|---|---|
| **URL** | https://www.everysens.com |
| **Siege** | Paris |
| **Fondation** | 2015 |
| **Clients** | Heidelberg Materials, Eqiom, Danone, ArcelorMittal, ID Logistics, Arkema, T3M |
| **Operateurs connectes** | **40+ operateurs ferroviaires** et loueurs de wagons |
| **Partenariat** | Shippeo (visibilite multimodale route + ocean + rail) |

**Modules :**

| Module | Description |
|---|---|
| **Visibilite temps reel** | Suivi GPS precis des wagons (individuels et trains complets). ETA predictifs par IA. Alertes proactives. |
| **Smart Planning ("Ralf")** | Creation de plans de transport en 3 clics. Optimisation IA (cout, empreinte carbone, service client). |
| **Insights 360** | Tableau de bord KPI complet. Analyse de rentabilite. Reporting empreinte carbone. |
| **Gestion de flotte** | Digitalisation des details wagons. Suivi de maintenance. Optimisation des rotations conteneurs/wagons. |

**Technologies IoT :**
- Capteurs Omnitrack / Everytrack
- Connectivite Sigfox LPWAN
- Capteurs VTG Connect (partenaire)
- Autonomie 3-5 ans

**Integrations :**
- ERP : SAP, Oracle, OpenTAS
- TMS existants
- Partenariat Shippeo pour visibilite multimodale
- GMAO (logiciels de maintenance)

**Cout :** Non public. SaaS entreprise avec tarification personnalisee. Demander un devis.

**Demo :** **Oui** -- demander sur https://www.everysens.com/contact

**Contact :**
- Page contact : https://www.everysens.com/contact
- Valerie Demanne (Product Marketing) : valerie.demanne@everysens.com | +33 (0)7 83 71 27 05

---

### 4.4 RailData ISR

| | Details |
|---|---|
| **URL** | https://www.raildata.coop/services/isr/ |
| **Volume** | **300 000 evenements wagon/jour** (110 millions+/an) |
| **Format** | XML via FTP ou **REST API** sur VPN Hermes (JSON en dev) |
| **Standards** | TAF TSI |
| **Acces** | **Entreprises ferroviaires uniquement** |
| **Cout** | Adhesion RailData requise |

RailData ISR alimente les systemes comme CESAR et TIS mais n'est **pas directement accessible** pour les operateurs TC ou les associations.

**Contact :** info@raildata.coop

---

## 5. Cadre reglementaire

### 5.1 TEL TSI (Reglement 2026/253)

Le **Reglement d'execution (UE) 2026/253** du 6 fevrier 2026 remplace et fusionne les anciens TAF TSI (fret) et TAP TSI (passagers) en un reglement unique.

| | Details |
|---|---|
| **Adopte** | 6 fevrier 2026 |
| **Entree en vigueur** | 2 mars 2026 |
| **Codes organisation** | Obligatoires depuis le 1er janvier 2026 (4 caracteres, attribues par ERA) |

**Ce que ca change pour le suivi fret :**

1. **Partage de donnees B2B obligatoire** entre acteurs ferroviaires
2. **Tracking etendu** : du premier au dernier kilometre, y compris dans les installations de service
3. **Integration des terminaux multimodaux** dans les processus numeriques ferroviaires
4. **Lettre de voiture electronique (eCN)** : transport sans papier
5. **Format standardise** : Ontologie ERA commune pour tous les acteurs europeens
6. **Acces non discriminatoire** : base sur les principes du Data Act europeen (2023/2854)
7. **Exigences cybersecurite** : normes obligatoires pour la qualite et securite des donnees

**Impact concret :**
La reglementation va **forcer** la standardisation et l'ouverture des donnees de suivi fret. D'ici 2-5 ans, l'acces aux donnees temps reel devrait s'ameliorer significativement pour tous les acteurs du TC.

**Sources :**
- https://transport.ec.europa.eu/news-events/news/commission-adopts-harmonised-eu-specifications-data-sharing-rail-transport-2026-02-10_en
- https://www.railfreight.com/interoperability/2026/02/12/eu-establishes-new-tsi-tel-with-mandatory-data-sharing-in-rail/

---

### 5.2 eFTI

Le reglement **eFTI (EU 2020/1056)** cree un systeme de transport de fret sans papier pour l'echange standardise de donnees entre tous les modes de transport. Pleine applicabilite prevue pour **aout 2025**. Complementaire au TEL TSI pour le rail.

---

## 6. SNCF Open Data

**SNCF Open Data ne couvre PAS le fret.**

| | Details |
|---|---|
| **URL** | https://ressources.data.sncf.com/ |
| **API** | https://numerique.sncf.com/startup/api/ |
| **Couverture temps reel** | TGV, TER, Transilien, Intercites **uniquement** |
| **Fret** | **Aucune donnee temps reel** |
| **Donnees infrastructure** | Chantiers TC, passages a niveau, etc. (statique uniquement) |

Pour le fret, il faut passer par les operateurs directement ou via CESAR-NEXT / RNE TIS.

---

## 7. Tableau comparatif

| Plateforme | GPS Temps reel | API REST | Cout | Couverture operateurs | Integration web |
|---|---|---|---|---|---|
| **Naviland API** | Oui | **Oui** | Via contrat | Naviland uniquement | Facile (REST/JSON) |
| **DB Cargo link2rail** | Oui (VABE) | **Oui (OAuth2)** | Via contrat | DB Cargo uniquement | Facile (REST/JSON, demo) |
| **CESAR-NEXT** | Statuts | Non (B2B XML) | Via operateur TC | **Multi-operateurs (2/3 du TC EU)** | Moyen (EDIGES XML) |
| **RNE TIS** | Oui | Non (SOAP/XML) | Accord formel | **24 pays, fret + passager** | Difficile (SOAP legacy) |
| **Everysens** | Oui (IoT GPS) | Non (SaaS) | Abonnement SaaS | 40+ operateurs | Via partenariat |
| **HUPAC WOLF** | Oui (3 min) | Non (portail web) | Client uniquement | HUPAC uniquement | Non |
| **CargoBeamer** | Oui (24/7) | Non | Client uniquement | CargoBeamer uniquement | Non |
| **VIIA Drive** | Geo terminal | Non (app mobile) | Client uniquement | VIIA uniquement | Non |
| **SNCF Open Data** | **Passagers seulement** | Oui | Gratuit | **Aucun fret** | N/A |

---

## 8. Recommandations

### Option A -- Court terme : Labelliser comme "theorique"

**Effort : Faible | Delai : Immediat**

Renommer "Trafic live" en **"Simulation horaire"** ou **"Trafic theorique"** et ajouter un disclaimer :
> "Positions estimees a partir des horaires planifies. Ne reflete pas les retards ou annulations."

**Avantage :** Honnete envers les utilisateurs, pas de fausse promesse.

### Option B -- Moyen terme : Integration Naviland + DB Cargo

**Effort : Moyen | Delai : 2-4 mois**

1. S'inscrire sur le portail API Naviland (https://api-docs.naviland-cargo.com/)
2. S'inscrire sur DB Cargo link2rail (https://developers.deutschebahn.com/db-cargo/link2rail)
3. Integrer les API Track & Trace pour ces 2 operateurs
4. Afficher les trains Naviland et DB Cargo en **temps reel** et les autres en **theorique** (avec indication visuelle differente)

**Avantage :** Donnees reelles pour 2 operateurs majeurs. Architecture REST/JSON moderne.

### Option C -- Long terme : CESAR-NEXT B2B

**Effort : Eleve | Delai : 6-12 mois**

1. GNTC contacte UIRR/CIS SCRL pour un accord d'acces CESAR-NEXT B2B
2. Integration des flux EDIGES XML pour recevoir les statuts de TOUS les operateurs membres
3. Alimentation de la cartographie avec les donnees CESAR

**Avantage :** Couverture de la majorite des operateurs TC europeens via une seule integration.

### Option D -- Vision complete : RNE TIS

**Effort : Eleve | Delai : 6-12 mois**

1. GNTC signe un TIS User Agreement (courrier postal a Vienne)
2. Integration des flux SOAP/XML TIS
3. Positions temps reel de TOUS les trains fret a travers 24 pays

**Avantage :** La source la plus complete. Mais architecture SOAP/XML complexe.

### Recommandation

**Faire A + B en parallele :**
- Immediatement : renommer en "Simulation horaire" avec disclaimer
- En parallele : commencer l'integration Naviland + DB Cargo (les 2 seuls avec API REST)
- A moyen terme : evaluer CESAR-NEXT B2B avec le GNTC

---

## 9. Contacts

### Operateurs -- API / Tracking

| Operateur | Contact | Email | Telephone |
|---|---|---|---|
| **Naviland Cargo** | API Portal | contact@naviland-cargo.com | +33 1 41 05 33 01 |
| **DB Cargo** | link2rail | link2rail@deutschebahn.com | -- |
| **HUPAC** | WOLF Access | info.ch@hupac.com | +41 58 855 88 00 |
| **CargoBeamer** | eLogistics | info@cargobeamer.com | +49 341 652 339 00 |
| **VIIA** | VIIA Drive | info@viia.com | +33 4 68 81 56 74 |
| **T3M** | Everysens | sales@t3m.fr | +33 4 67 27 18 51 |
| **Novatrans** | CESAR | contact.commercial@novatrans.eu | +33 1 85 34 49 00 |
| **Greenmodal** | CESAR | contact@novatrans-greenmodal.eu | +33 4 88 15 11 51 |

### Plateformes

| Plateforme | Contact | Email |
|---|---|---|
| **CESAR-NEXT** | CIS SCRL / UIRR | Via operateur TC ou uirr.com |
| **RNE TIS** | RailNetEurope Vienna | support.tis@rne.eu |
| **Everysens** | Valerie Demanne | valerie.demanne@everysens.com |
| **RailData ISR** | RailData | info@raildata.coop |

### Liens utiles

- CESAR-NEXT : https://cesar-next.com
- CESAR info (UIRR) : https://www.uirr.com/services/cesar
- CESAR info (Kombiverkehr) : https://www.kombiverkehr.de/en/service/it-solutions/cesar-next
- Naviland API : https://api-docs.naviland-cargo.com/
- Navitr@ck : https://navitrack.naviland-cargo.com/
- DB Cargo link2rail : https://developers.deutschebahn.com/db-cargo/link2rail
- RNE TIS : https://rne.eu/it/rne-applications/tis/
- RNE TIS Live Map : https://rne.eu/tis-live-map/
- EDIGES documentation : https://edigesconsortium.atlassian.net/wiki/spaces/ED/pages/1463353345/4.1-FINAL
- Everysens : https://www.everysens.com/contact
- HUPAC WOLF : https://www.hupac.com/EN/WOLF-platform-9d39b000
- HUPAC Train Radar Handbook : https://www.hupac.com/Hupac-Train-Radar-Handbook-0bf50f00
- TEL TSI (Commission) : https://transport.ec.europa.eu/news-events/news/commission-adopts-harmonised-eu-specifications-data-sharing-rail-transport-2026-02-10_en
