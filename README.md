# Parcours client — portail support de formation

Un projet local complet : interface, API, données fictives persistées et tests. Il fonctionne avant toute utilisation de Claude Code. Le dépôt unique de la formation est **[Drivenlabs-ai/parcours-client](https://github.com/Drivenlabs-ai/parcours-client)**, celui indiqué dans le guide de préparation.

## Préparer la copie

Prérequis : **Node.js 22+ avec npm**, **Git**, et Claude Code pour l’activité. VS Code affiche les fichiers et les diffs ; Claude Code s’utilise dans un **terminal séparé**. Aucun compte GitHub ni droit de push n’est nécessaire. Aucun `npm install`, Docker, base externe ou clé API pour l’application.

Choisir un dossier hors de vos dépôts professionnels pour éviter leurs instructions parentes. Pour une première récupération :

```sh
git clone https://github.com/Drivenlabs-ai/parcours-client.git
cd parcours-client
node --version
```

Si le guide vous a déjà fait cloner ce dépôt, ouvrir cette copie et vérifier `git status --short`. Si la sortie est vide, la mettre à jour :

```sh
git pull --ff-only
git fetch --tags
```

Si la sortie indique des modifications ou si la mise à jour échoue, **conserver le dossier intact** et demander de l’aide au formateur. Préparer une nouvelle copie dans un autre dossier si nécessaire ; ne pas utiliser `reset --hard` ni supprimer la copie existante.

La copie Git hors connexion fournie avec l’activité conserve aussi l’historique et le tag de départ :

```sh
git clone parcours-client.bundle parcours-client
cd parcours-client
```

L’archive ZIP ne contient que les fichiers. Privilégier un clone ou le bundle pour les worktrees et la revue de cet atelier.

## Commencer dans un worktree

Depuis la racine de la copie Git, dans le terminal séparé :

```sh
git status --short --branch
claude --worktree atelier-tickets
```

Dans Claude, nommer aussi la conversation :

```text
/rename atelier-tickets
```

Le worktree est le dossier `.claude/worktrees/atelier-tickets/`, avec sa branche `worktree-atelier-tickets`. La conversation est la session Claude qui travaille dans ce dossier ; la fenêtre VS Code ne fait que l’afficher.

Demander à Claude : « Ouvre ton dossier de travail actuel dans une nouvelle fenêtre VS Code avec `code -n .`. » La commande doit être exécutée **depuis le worktree**. Si `code` n’est pas disponible, utiliser « Fichier → Ouvrir un dossier » dans VS Code et sélectionner ce même worktree.

Garder le terminal Claude ouvert, côte à côte avec VS Code. Ne pas lancer une seconde session Claude dans son terminal intégré. Si l’extension Claude Code est installée, utiliser `/ide` dans la session existante pour la connecter à la fenêtre du worktree.

Avant de continuer, vérifier ensemble : **dossier du worktree, branche active et emplacement des fichiers modifiés**. Depuis ce dossier, `git rev-parse --show-toplevel` et `git branch --show-current` donnent les deux premiers repères. Les réglages globaux de votre outil continuent de s’appliquer.

## Lancer et vérifier l’application

Demander à Claude de lancer l’application **depuis le worktree**, ou ouvrir un second terminal de serveur dans ce dossier :

```sh
npm start
```

Ouvrir **http://localhost:3000**. Garder un seul serveur pour la démonstration. Arrêter avec `Ctrl+C`. Si le port est occupé, arrêter le serveur identifié ou utiliser `npm start -- --port 3001`, puis ouvrir `http://localhost:3001`. Deux copies peuvent utiliser des ports différents ; ne pas lancer deux serveurs sur les données d’une même copie.

Pour vérifier :

```sh
npm test
```

Les tests API et stockage utilisent des fichiers temporaires et ne changent pas les tickets visibles. Les tests de worktree utilisent Git localement et suppriment uniquement leur propre fixture temporaire.

Chaque worktree possède ses fichiers. `data/tickets.local.json` est ignoré par Git et calculé depuis `backend/store.js`, jamais depuis le dossier Git commun. Une nouvelle copie démarre avec ses propres exemples. Ne pas partager ce fichier entre copies par lien symbolique ou configuration.

## Reprendre après une première réalisation

Montrer la reprise après une première modification utile, pas immédiatement après la création du worktree. Quitter la session et **choisir de conserver le worktree** lorsque Claude le propose. Puis, depuis la copie du dépôt :

```sh
claude --resume atelier-tickets
```

Vérifier le dossier de travail avant de poursuivre. Le nom du worktree et le nom de la conversation sont distincts ; leur donner le même nom facilite cet exercice. Supprimer le worktree à la sortie peut supprimer ses fichiers : ne pas choisir cette option pour reprendre l’atelier.

## Revue locale et fin de l’exercice

Le tag **`atelier-depart`** désigne le code initial consolidé. Depuis le worktree :

```sh
git diff atelier-depart
git status --short
```

Le diff montre les changements des fichiers suivis, y compris ceux non commités. Le statut signale aussi les nouveaux fichiers, à lire séparément. Demander à Claude de faire une **revue sans modifier le code**, avec les problèmes précis, leur emplacement et un scénario de reproduction. Examiner les remarques, corriger celles qui sont fondées, puis rejouer `npm test`.

Finir par les changements, les preuves, les limites et la prochaine tâche. Commit, push, PR et fusion sont expliqués comme la suite en projet réel. **Aucune PR ni aucun push demandé aux participants.** Le plugin officiel `code-review` travaille sur une PR ; il n’est pas la procédure de revue locale de cet exercice.

## Revenir aux exemples

```sh
npm run reset-data
```

Confirmer en tapant `oui`. Sans terminal interactif, aucune modification : utiliser `npm run reset-data -- --yes` pour confirmer explicitement. Seul `data/tickets.local.json` de cette copie est remplacé, jamais une branche ou le code. Le bouton « Réinitialiser la démo » fait la même opération après confirmation dans le navigateur.

## Fichiers

```text
frontend/              Page, interactions, appels HTTP et styles
  brand/               Police et image locales, licence
backend/
  server.js            Démarrage sur 127.0.0.1
  app.js               Routes et fichiers publics autorisés
  domain.js            Validation et règles métier
  store.js             Lecture et écriture des tickets
data/
  tickets.seed.json    Trois demandes fictives partagées
  tickets.local.json   Créé au démarrage, ignoré par Git
docs/
  produit.md           Comportements et limites
  api.md               Contrat HTTP
scripts/
  reset-data.js        Réinitialisation sans commande Git
tests/
  api.test.js          Parcours HTTP, refus et persistance
  isolation.test.js    Worktrees et remise à zéro indépendants
```

## Ce qui reste à construire

Le départ permet de créer, rechercher, filtrer par statut, répondre et résoudre. **Affectation, priorité, `CLAUDE.md` et skills ne sont pas fournis** : ils seront produits pendant la séance. Les critères sont dans les supports de formation.

Cette application sans authentification est prévue pour un poste local et un seul processus d’écriture. Ne pas exposer le service sur Internet. Claude Code utilise séparément les services de votre fournisseur de modèle : application locale ne signifie pas inférence locale.

Le logo appartient à Imagine Human. Work Sans est embarquée sous [licence SIL Open Font License](frontend/brand/OFL-Work-Sans.txt). Aucune police ni image n’est chargée depuis Internet.
