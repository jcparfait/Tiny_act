# Tiny Act

Tiny Act est une application mobile qui aide l'utilisateur a choisir et realiser une micro-activite adaptee a son humeur, son lieu, son temps disponible et ses centres d'interet.

Le projet combine une application Expo / React Native et une API Rails. L'objectif est simple: transformer un moment d'inertie en petite action concrete, puis rendre la progression visible avec de l'XP, un historique et une room personnalisable.

## Statut

- Version mobile fonctionnelle sur la branche par defaut `mobile/expo-client`.
- Backend Rails deploye sur Heroku et expose des endpoints JSON sous `/api/v1`.
- APK Android installable generee avec EAS Build.
- Release GitHub de demonstration disponible pour les recruteurs.
- README principal et README mobile nettoyes.
- Tests Rails ajoutes sur les principaux endpoints API mobile.

## Demo recruteur

- Release GitHub: https://github.com/jcparfait/Tiny_act/releases/tag/v1.0.0-mobile-demo
- Dernier build Android EAS: https://expo.dev/accounts/jcparfait/projects/tiny-act/builds/d46043ef-a0f3-46ff-bff9-822f29c3b5fb
- APK Android directe: https://expo.dev/artifacts/eas/9RBGzWuqGBwAQI0Pgtfsj5ew1UjOBCVM4u-9tMZOgdc.apk
- API Heroku: https://tiny-act-513fa82ec3fd.herokuapp.com
- Healthcheck API: https://tiny-act-513fa82ec3fd.herokuapp.com/api/v1/health

Compte de demonstration:

```text
Email: jc.demo@example.com
Mot de passe: 123456
```

## Apercu produit

L'utilisateur choisit d'abord son humeur, son lieu et sa duree disponible. L'application propose ensuite des activites compatibles avec ses centres d'interet. Quand une activite est terminee, l'utilisateur gagne de l'XP et peut debloquer des meubles pour personnaliser sa room.

Fonctionnalites principales:

- authentification mobile avec compte utilisateur et token API ;
- onboarding avec selection des centres d'interet et avatar ;
- recommandation d'activites selon humeur, lieu, duree et interets ;
- activites guidees avec timer, pause, reprise et finalisation ;
- activites specialisees: quiz culture, quiz code, langues, melodie et sport guide ;
- historique des sessions terminees ;
- calcul d'XP centralise cote backend ;
- progression par centre d'interet ;
- inventaire et room personnalisable avec meubles debloques par XP ;
- persistance locale du token et des preferences mobiles.

## Stack

| Partie | Technologies |
| --- | --- |
| Mobile | Expo, React Native, TypeScript, Expo Router |
| UI mobile | Expo Image, Expo Fonts, React Native Animated, design system local |
| Auth mobile | API token, Expo Secure Store |
| Backend | Ruby on Rails 8.1, API JSON, Devise |
| Base de donnees | PostgreSQL |
| Donnees | Seeds Rails, imports CSV via Roo |
| Tests | Minitest Rails, tests API mobile, tests modele/service sur la logique XP |

## Architecture

```text
.
├── app/                         # Backend Rails: controllers, models, services
├── config/routes.rb             # Routes web Rails et API mobile /api/v1
├── db/                          # Schema, migrations, seeds et donnees CSV
├── test/                        # Tests Rails, dont tests API mobile
└── mobile/                      # Application Expo / React Native
    ├── .env.example             # Exemple de configuration API mobile
    ├── app.json                 # Configuration Expo
    ├── package.json             # Scripts et dependances mobile
    └── src/
        ├── app/                 # Ecrans Expo Router
        ├── components/          # Composants UI mobiles
        ├── context/             # AuthContext
        ├── services/            # Clients API
        ├── theme/               # Tokens visuels
        └── types/               # Types TypeScript partages cote mobile
```

## API mobile

Les routes API principales sont exposees sous `/api/v1`:

| Domaine | Routes principales |
| --- | --- |
| Sante API | `GET /api/v1/health` |
| Auth | `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `DELETE /auth/logout` |
| Profil | `PATCH /auth/profile`, `DELETE /auth/profile` |
| Onboarding | `GET /interests`, `PATCH /interests` |
| Criteres | `GET /moods`, `GET /locations`, `GET /durations` |
| Sessions | `GET /activity_sessions`, `POST /activity_sessions`, `GET /activity_sessions/:id` |
| Execution | `PATCH /start`, `PATCH /pause`, `PATCH /resume`, `PATCH /finish` |
| Progression | `GET/PATCH /activity_sessions/:id/progress`, `GET /reward` |
| Room | `GET /room`, `POST/PATCH/DELETE /room/furnitures` |

## Installation locale

Prerequis:

- Ruby compatible Rails 8.1 ;
- PostgreSQL ;
- Bundler ;
- Node.js ;
- Expo CLI via `npx`.

### Backend Rails

```bash
bundle install
bin/rails db:create
bin/rails db:migrate
bin/rails db:seed
bin/rails server
```

API locale:

```text
http://localhost:3000/api/v1
```

### Application mobile

```bash
cd mobile
npm install
cp .env.example .env.local
```

Adapter `EXPO_PUBLIC_API_URL` dans `mobile/.env.local` si l'application tourne sur un telephone physique.

Lancer Expo:

```bash
npx expo start
```

## Tests et qualite

Commandes utiles:

```bash
bin/rails test
bin/rails test test/controllers/api/v1
bin/rails test test/services/xp_calculator_test.rb
cd mobile && npm run lint
cd mobile && npm run typecheck
cd mobile && npm run doctor
```

Couverture actuelle:

- authentification mobile: login, token, endpoint protege, logout ;
- inscription mobile ;
- selection des centres d'interet mobiles ;
- creation et execution d'une session d'activite ;
- attribution d'XP et lecture de reward ;
- room mobile: inventaire, placement, deplacement et suppression de meuble ;
- logique XP cote service.

A renforcer ensuite:

- CI GitHub Actions ;
- tests mobiles unitaires sur les helpers critiques ;
- build Android AAB pour une publication Google Play.

## Comptes de demonstration

Les seeds creent plusieurs comptes de demo avec le mot de passe suivant:

```text
123456
```

Exemples:

- `jc.demo@example.com`
- `tibo.demo@example.com`
- `david.demo@example.com`
- `dina.demo@example.com`
- `emma.demo@example.com`

## Logique XP

Le calcul d'XP est centralise dans `app/services/xp_calculator.rb`.

Base par duree:

| Duree | XP de base |
| --- | ---: |
| 5 minutes | 10 XP |
| 15 minutes | 22 XP |
| 30 minutes | 40 XP |

Multiplicateur par humeur:

| Humeur | Multiplicateur |
| --- | ---: |
| A plat | x1.3 |
| Bof / Mitige | x1.15 |
| En forme | x1.0 |

L'XP est attribuee une seule fois par session terminee grace au champ `xp_awarded_at`, puis synchronisee avec la progression par centre d'interet.

## Roadmap courte

- ajouter une CI GitHub Actions ;
- ajouter quelques tests mobiles unitaires ;
- preparer une build Android AAB pour le Play Store ;
- ajouter captures d'ecran et courte video de demo dans ce README.