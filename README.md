# ZotLocation

Application web de location saisonnière développée dans le cadre du titre professionnel CDA.

## Technologies utilisées

### Front-end

- Next.js
- React.js

### Back-end

- Symfony
- API Platform
- JWT Authentication

### Base de données

- PostgreSQL

### Infrastructure

- Docker
- Docker Compose
- Caddy

### Paiement

- Stripe

---

# Prérequis

- Docker Desktop (Windows/Mac)
- Docker Engine + Docker Compose (Linux)

Vérifier l'installation :

```bash
docker --version
docker compose version
```

---

# Installation

## 1. Cloner le dépôt

```bash
git clone <url-du-depot>
cd zotlocation
```

---

## 2. Créer le fichier .env

Créer un fichier `.env` à la racine du projet.

Exemple :

```env
DATABASE_URL=postgresql://app:change_me@db:5432/app?serverVersion=16&charset=utf8

CORS_ALLOW_ORIGIN=http://localhost:3000

JWT_PRIVATE_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=change_me

JWT_TOKEN_TTL=3600

NEXT_PUBLIC_API_URL=http://localhost:8085
```

Adapter les valeurs si nécessaire.

---

## 3. Générer les clés JWT

Si les clés JWT ne sont pas présentes :

```bash
docker compose run --rm backend php bin/console lexik:jwt:generate-keypair
```

Les fichiers générés seront :

```text
back-end/config/jwt/private.pem
back-end/config/jwt/public.pem
```

---

## 4. Démarrer l'environnement de développement

```bash
docker compose -f docker-compose.dev.yml up --build
```

Au premier démarrage :

- les dépendances Composer sont installées ;
- les migrations Doctrine sont exécutées automatiquement ;
- Symfony est lancé ;
- Next.js est lancé ;
- PostgreSQL est créé automatiquement.

---

# Accès aux services

## Front-end

```text
http://localhost:3000
```

---

## API Symfony

```text
http://localhost:8085/api
```

---

## PostgreSQL

```text
Host : localhost
Port : 5434
Database : app
User : app
Password : change_me
```

---

# Architecture

```text
Navigateur
        │
        ▼
Next.js / React
        │
        ▼
Caddy
        │
        ▼
Symfony API Platform
        │
        ▼
PostgreSQL
```

---

# Arrêter l'environnement

```bash
docker compose -f docker-compose.dev.yml down
```

---

# Rebuild complet

```bash
docker compose -f docker-compose.dev.yml down -v

docker compose -f docker-compose.dev.yml up --build
```

---

# Dépannage

## Vérifier les conteneurs

```bash
docker ps
```

---

## Logs backend

```bash
docker compose logs backend
```

---

## Logs frontend

```bash
docker compose logs frontend
```

---

## Logs caddy

```bash
docker compose logs caddy
```

---

## Erreur JWT

Vérifier la présence des fichiers :

```text
back-end/config/jwt/private.pem
back-end/config/jwt/public.pem
```

Si nécessaire :

```bash
docker compose run --rm backend php bin/console lexik:jwt:generate-keypair
```

---

## Erreur CORS

Vérifier :

```env
CORS_ALLOW_ORIGIN=http://localhost:3000
```

---

## Réinitialiser la base

```bash
docker compose -f docker-compose.dev.yml down -v

docker compose -f docker-compose.dev.yml up --build
```

Les migrations seront rejouées automatiquement.
