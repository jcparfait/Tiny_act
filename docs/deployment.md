# Deploiement

## Backend Rails sur Heroku

Le backend Rails est deployable sur Heroku depuis la racine du depot.

### 0. Installer le Heroku CLI

Sur macOS avec Homebrew:

```bash
brew tap heroku/brew
brew install heroku
heroku --version
```

### 1. Preparer Heroku

```bash
heroku login
heroku create tiny-act-api
heroku addons:create heroku-postgresql:essential-0 --app tiny-act-api
```

Si l'application Heroku existe deja, remplacer `tiny-act-api` par son nom reel et connecter le remote Git:

```bash
heroku git:remote -a tiny-act-api
```

### 2. Configurer les variables d'environnement

```bash
heroku config:set RAILS_ENV=production --app tiny-act-api
heroku config:set SECRET_KEY_BASE="$(bin/rails secret)" --app tiny-act-api
heroku config:set APP_HOST=tiny-act-api.herokuapp.com --app tiny-act-api
```

Si le projet utilise des credentials Rails chiffres en production et que `config/master.key` existe localement, ajouter aussi:

```bash
heroku config:set RAILS_MASTER_KEY="$(cat config/master.key)" --app tiny-act-api
```

Optionnel, seulement si une version web externe doit appeler l'API depuis un navigateur:

```bash
heroku config:set CORS_ORIGINS=https://example.com --app tiny-act-api
```

Pour OAuth, ajouter aussi les variables provider necessaires si la configuration locale les utilise.

### 3. Deployer la branche mobile

```bash
git push heroku mobile/expo-client:main
```

Le `Procfile` lance automatiquement:

- `bin/rails db:migrate` en phase release ;
- Puma pour le process web.

### 4. Verifier l'API

```bash
heroku open --app tiny-act-api
curl https://tiny-act-api.herokuapp.com/api/v1/health
```

La reponse attendue est proche de:

```json
{
  "status": "ok",
  "app": "Tiny Act",
  "version": "v1"
}
```

## Mobile Expo

Quand l'URL Heroku est valide, configurer l'app mobile avec:

```bash
EXPO_PUBLIC_API_URL=https://tiny-act-api.herokuapp.com
```

Pour une build Android installable, cette URL devra etre presente avant la generation de l'APK.
