# Portail support

Une application locale pour pratiquer Claude Code sur un petit projet complet : frontend, API, données et tests.

Créer une demande, rechercher et filtrer les tickets, répondre au client et suivre la résolution. Toutes les données sont fictives.

## Démarrer

Prérequis : Git et Node.js 22 ou plus récent, avec npm.

```sh
git clone https://github.com/Drivenlabs-ai/parcours-client.git
cd parcours-client
npm start
```

Ouvrir **http://localhost:3000**. Aucune dépendance à installer. `Ctrl+C` arrête le serveur.

Dans Claude Desktop, onglet **Code**, choisir **Local** et sélectionner le dossier cloné. Chacun peut aussi utiliser VS Code ou Claude Code au terminal.

## Comprendre le dépôt

```text
CLAUDE.md             Contexte commun pour Claude Code
frontend/
  index.html          La page
  app.js              L'affichage et les interactions
  api.js              Les appels à l'API
  style.css           L'apparence
backend/
  CLAUDE.md           Consignes propres au backend
  server.js           Démarrage du serveur local
  app.js              Routes HTTP et fichiers publics
  domain.js           Règles métier et validation
  store.js            Lecture et écriture des tickets
data/
  tickets.seed.json   Trois demandes fictives de départ
  tickets.local.json  Données de travail, créées au démarrage et ignorées par Git
docs/
  produit.md          Le périmètre et les règles métier
  api.md              Le contrat entre frontend et backend
tests/
  api.test.js         Tests HTTP isolés sur des données temporaires
```

Le navigateur appelle l'API ; l'API valide les entrées et enregistre les tickets dans un fichier JSON. Un seul processus Node.js utilise ce fichier. Le serveur écoute sur la machine locale, à l'adresse `127.0.0.1`.

## Vérifier

```sh
npm test
```

Les tests créent des fichiers temporaires. Ils ne modifient pas les tickets que vous voyez dans l'application.

Le bouton **Réinitialiser la démo** rétablit les trois demandes fictives après confirmation. Les demandes ajoutées dans la démo seront alors supprimées.

## Pour la formation

Les consignes sont sur le site de la formation. Ce dépôt sert à travailler le contexte, les instructions, les skills, les hooks et la délégation sur des évolutions concrètes.

L'application fonctionne sans clé API, compte supplémentaire ni service externe. Claude Code utilise séparément votre compte et les services de votre fournisseur de modèle : une application locale ne signifie pas que l'inférence est locale.

Le dépôt est public pour faciliter le clonage. Le service lui-même reste local et sans authentification ; les données sont fictives.
