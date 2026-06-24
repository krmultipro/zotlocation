# ZotLocation

Application web de location saisonnière développée dans le cadre du titre professionnel CDA.

## Technologies utilisées

### Front-end

- Next.js
- React, utilisé par Next.js

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

Créer un fichier `.env` à la racine du projet. Ce fichier est utilisé par Docker Compose pour configurer les services.

Exemple :

```env
# Base de données Docker
DATABASE_URL="postgresql://app:change_me@db:5432/app?serverVersion=16&charset=utf8"

# CORS dev : le frontend Next.js tourne sur localhost:3000
CORS_ALLOW_ORIGIN="http://localhost:3000"

# URL publique utilisée par le frontend pour appeler Caddy/API
NEXT_PUBLIC_API_URL=http://localhost:8085

# JWT dans le conteneur backend
JWT_PRIVATE_KEY=/var/www/html/config/jwt/private.pem
JWT_PUBLIC_KEY=/var/www/html/config/jwt/public.pem
JWT_PASSPHRASE=change_me
JWT_TOKEN_TTL=3600

# Stripe
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_votre_cle_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook
```

Pour un démarrage sans paiement Stripe, laisser les clés Stripe vides est possible, mais la réservation sera refusée avant création :

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Pour tester le paiement, `STRIPE_SECRET_KEY` doit obligatoirement contenir une clé test Stripe valide.

---

## 3. Obtenir une clé Stripe de test

Pour tester les réservations avec paiement, il faut créer ou utiliser un compte Stripe en mode test.

1. Aller sur le tableau de bord Stripe :

```text
https://dashboard.stripe.com
```

2. Activer le mode test dans le tableau de bord Stripe.

3. Aller dans :

```text
Développeurs > Clés API
```

4. Copier la clé secrète de test. Elle commence par :

```text
sk_test_
```

5. La renseigner dans le fichier `.env` à la racine du projet :

```env
STRIPE_SECRET_KEY=sk_test_votre_cle_stripe
```

Le webhook Stripe n'est pas obligatoire pour le test local simple du paiement. Après le retour Stripe, le front appelle Symfony avec l'identifiant de session Stripe pour confirmer le paiement et passer la réservation en `paid`.

Il peut donc rester vide en développement :

```env
STRIPE_WEBHOOK_SECRET=
```

Pour tester un paiement Stripe, utiliser la carte de test suivante :

```text
Numéro : 4242 4242 4242 4242
Date   : une date future, par exemple 12/34
CVC    : 123
Code postal : n'importe quelle valeur
```

Après modification des variables Stripe dans `.env`, recréer au minimum le conteneur backend :

```bash
docker compose -f docker-compose.dev.yml up -d --force-recreate backend
```

En cas de doute ou après une modification Docker, relancer tout l'environnement :

```bash
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up --build
```

---

## 4. Générer les clés JWT

Si les clés JWT ne sont pas présentes :

```bash
docker compose -f docker-compose.dev.yml exec backend php bin/console lexik:jwt:generate-keypair --skip-if-exists
```

Les fichiers générés seront :

```text
back-end/config/jwt/private.pem
back-end/config/jwt/public.pem
```

La valeur de `JWT_PASSPHRASE` doit correspondre à la passphrase utilisée au moment de la génération des clés.

---

## 5. Démarrer l'environnement de développement

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

## Backend direct debug

```text
http://localhost:8001
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
  ├─ http://localhost:3000
  │    └─ Next.js
  │
  └─ http://localhost:8085/api
       └─ Caddy
          └─ Symfony API Platform
             └─ PostgreSQL
```

Les fichiers uploadés sont servis via :

```text
http://localhost:8085/uploads/...
```

Physiquement, ils sont stockés dans :

```text
back-end/public/uploads/
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
docker compose -f docker-compose.dev.yml exec backend php bin/console lexik:jwt:generate-keypair --skip-if-exists
```

---

## Erreur Stripe

Si la réservation affiche :

```text
Le paiement est temporairement indisponible. La réservation n'a pas été créée.
```

vérifier dans `.env` :

```env
STRIPE_SECRET_KEY=sk_test_votre_cle_stripe
FRONTEND_URL=http://localhost:3000
```

Puis recréer le conteneur backend pour recharger les variables :

```bash
docker compose -f docker-compose.dev.yml up -d --force-recreate backend
```

Pour un test manuel du paiement, utiliser la carte Stripe :

```text
4242 4242 4242 4242
```

avec une date future et un CVC quelconque.

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
