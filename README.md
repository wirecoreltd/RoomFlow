# RoomFlow

Application de réservation de salles de réunion : planning en temps réel, prévention des conflits au niveau base de données, rôles utilisateur/administrateur, tableau de bord statistique.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Supabase** : base de données Postgres, authentification (email/mot de passe), temps réel
- **Tailwind CSS**
- Déploiement : **Vercel**

## 1. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → **New project**.
2. Une fois créé, ouvre **SQL Editor** et colle le contenu de [`supabase/schema.sql`](./supabase/schema.sql), puis exécute-le.
   Ce script crée les tables (`profiles`, `rooms`, `bookings`, `sites`), les policies de sécurité (RLS), le trigger de création de profil, et surtout **la contrainte anti-chevauchement** qui empêche deux réservations de se superposer sur une même salle — garantie au niveau de la base, pas seulement du code.
3. Dans **Project Settings → API**, récupère `Project URL` et `anon public key`.

## 2. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Renseigne `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 3. Installer et lancer en local

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000), crée un compte, puis dans Supabase (SQL Editor) exécute :

```sql
update profiles set role = 'admin' where email = 'ton.email@exemple.com';
```

pour te donner les droits administrateur (menu **Salles**, **Réservations**, **Utilisateurs**, **Tableau de bord**).

## 4. Déployer sur Vercel

1. Pousse ce projet sur GitHub.
2. Sur [vercel.com](https://vercel.com), importe le repo.
3. Ajoute les mêmes variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) dans **Settings → Environment Variables**.
4. Déploie. Chaque push sur la branche principale redéploiera automatiquement.

## Fonctionnalités

- **Planning temps réel** : vue type timeline, une colonne par salle, mise à jour automatique via Supabase Realtime dès qu'une réservation est créée ou annulée par n'importe qui.
- **Anti-conflit garanti** : contrainte `EXCLUDE` Postgres — impossible, même en cas de double clic ou de deux utilisateurs simultanés, de réserver deux fois le même créneau sur la même salle.
- **Rôles** : `user` (réserve, consulte, annule ses propres réservations) et `admin` (gère les salles, les utilisateurs, supervise toutes les réservations, consulte les statistiques).
- **Historique et supervision** : filtre à venir / passées / annulées.
- **Tableau de bord** : salles actives, réservations sur 30 jours, taux d'occupation, salle la plus demandée, graphique par jour.
- **Conçu pour évoluer** : la table `sites` permet dès maintenant de rattacher des salles à différents sites/organisations.

## Prochaines étapes possibles

- Notifications email (rappel avant la réunion, confirmation) via un webhook Supabase + Resend.
- Récurrence des réservations (réunion hebdomadaire).
- Multi-organisation avec sous-domaines ou espaces de travail séparés.
