# Tiny Act Mobile

Application mobile Expo / React Native de Tiny Act.

Ce dossier contient le client mobile. Le backend Rails reste a la racine du depot et expose l'API JSON utilisee par l'application mobile.

## Role de l'app mobile

L'application permet a l'utilisateur de:

- se connecter ou creer un compte ;
- choisir ses centres d'interet et son avatar ;
- selectionner son humeur, son lieu et sa duree disponible ;
- recevoir des recommandations de micro-activites ;
- lancer, mettre en pause, reprendre et terminer une session ;
- gagner de l'XP ;
- consulter son historique ;
- debloquer des meubles et personnaliser sa room.

## Stack mobile

- Expo SDK 56
- React Native 0.85
- React 19
- TypeScript strict
- Expo Router
- Expo Secure Store pour le token mobile
- Expo Image, Expo Fonts et Expo Splash Screen
- EAS Build pour les builds Android installables

## Prerequis

- Node.js 20.19.4 ou plus recent ;
- le backend Rails lance depuis la racine du depot ou deploye sur Heroku ;
- un simulateur Android/iOS ou un telephone avec Expo Go ;
- une URL API accessible depuis le device ;
- EAS CLI pour generer une APK Android.

## Installation

Depuis la racine du depot:

```bash
cd mobile
npm install
```

Le projet mobile utilise `npm` et le lockfile `package-lock.json`.

## Configuration API

Copier le fichier d'exemple:

```bash
cp .env.example .env.local
```

Par defaut:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Pour un telephone physique, `localhost` pointe vers le telephone, pas vers l'ordinateur. Il faut donc utiliser l'adresse IP locale de la machine qui lance Rails, par exemple:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.42:3000
```

Pour la build APK, `mobile/eas.json` pointe vers l'API Heroku:

```bash
EXPO_PUBLIC_API_URL=https://tiny-act-513fa82ec3fd.herokuapp.com
```

## Lancement

Lancer le backend Rails dans un premier terminal depuis la racine du depot:

```bash
bundle install
bin/rails db:create db:migrate db:seed
bin/rails server
```

Lancer Expo dans un second terminal:

```bash
cd mobile
npx expo start
```

Puis choisir l'une des options Expo:

- Android emulator ;
- iOS simulator ;
- Expo Go sur telephone ;
- web, utile seulement pour un controle rapide.

## Scripts disponibles

```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
npm run typecheck
npm run doctor
npm run build:android:apk
```

## Build Android APK

Installer EAS CLI si necessaire:

```bash
npm install -g eas-cli
```

Se connecter a Expo:

```bash
eas login
```

Verifier le projet avant build:

```bash
npm run typecheck
npm run lint
npm run doctor
```

Generer une APK Android installable:

```bash
npm run build:android:apk
```

Le profil `preview` dans `eas.json` produit une APK avec:

```text
https://tiny-act-513fa82ec3fd.herokuapp.com
```

comme URL d'API.

## Structure

```text
mobile/
├── .env.example             # Exemple de configuration API
├── app.json                 # Configuration Expo
├── eas.json                 # Profils EAS Build
├── eslint.config.js         # Configuration ESLint Expo
├── package.json             # Scripts et dependances
├── tsconfig.json            # TypeScript strict et alias @/*
└── src/
    ├── app/                 # Ecrans Expo Router
    ├── components/          # Composants UI
    ├── constants/           # Assets, avatars, bonus, furniture
    ├── context/             # AuthContext
    ├── services/            # Clients API et stockage local
    ├── theme/               # Tokens visuels Tiny Act
    └── types/               # Types TypeScript
```

## Ecrans principaux

- `login`, `register`, `forgot-password`, `reset-password` ;
- `interests` et `avatar` pour l'onboarding ;
- `index` pour le parcours de recommandation ;
- `session/[id]` pour executer une activite ;
- `history` pour l'historique ;
- `explore` pour la room ;
- `profile` pour le compte utilisateur.

## Endpoints consommes

L'application mobile consomme principalement:

- `/api/v1/auth/login` ;
- `/api/v1/auth/register` ;
- `/api/v1/auth/me` ;
- `/api/v1/interests` ;
- `/api/v1/moods` ;
- `/api/v1/locations` ;
- `/api/v1/durations` ;
- `/api/v1/activity_sessions` ;
- `/api/v1/activity_sessions/:id/start` ;
- `/api/v1/activity_sessions/:id/pause` ;
- `/api/v1/activity_sessions/:id/resume` ;
- `/api/v1/activity_sessions/:id/finish` ;
- `/api/v1/activity_sessions/:id/reward` ;
- `/api/v1/room` ;
- `/api/v1/room/furnitures`.

## Depannage rapide

### Node.js trop ancien

React Native 0.85 demande Node.js 20.19.4 ou plus recent. Si `npm install`, `npm run lint` ou `expo-doctor` affiche `Unsupported engine`, mettre Node a jour puis relancer `npm install`.

### `EXPO_PUBLIC_API_URL n'est pas configuree`

Verifier que `mobile/.env.local` existe et contient `EXPO_PUBLIC_API_URL`. Redemarrer Expo apres modification.

### `Impossible de joindre le serveur`

Verifier que Rails tourne bien sur le port 3000 ou que l'URL Heroku repond a `/api/v1/health`.

Sur telephone physique, utiliser l'IP locale de l'ordinateur au lieu de `localhost`.

### Session expiree

Le token mobile est stocke via Expo Secure Store. En cas de souci pendant le developpement, se deconnecter puis se reconnecter.

### Assets ou splash screen incoherents

Verifier les chemins dans `app.json`, notamment:

- `./assets/images/icon.png` ;
- `./assets/images/brand/tiny-act-logo.png` ;
- les images Android adaptive icon.

## Prochaines ameliorations

- ajouter quelques tests unitaires sur les helpers mobiles critiques ;
- preparer un profil store Android en AAB si publication Google Play.