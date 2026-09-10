# Portail de feedback

Une petite application locale pour pratiquer Claude Code sur un dépôt facile à comprendre.

Une page pour déposer un retour et consulter les retours avec leur statut : « À étudier », « Prévu » ou « Livré ». Les nouveaux retours restent dans le navigateur ; « Réinitialiser la démo » retrouve les trois exemples de départ.

## Démarrer

Prérequis : Git et Node.js 22 ou plus récent, avec npm.

```sh
git clone https://github.com/Drivenlabs-ai/parcours-client.git
cd parcours-client
npm start
```

Ouvrir **http://localhost:3000**. Aucune dépendance à installer.

Dans Claude Desktop, ouvrir l'onglet **Code**, choisir un environnement **Local** et sélectionner le dossier cloné. Le même dépôt peut être ouvert dans VS Code ou depuis Claude Code au terminal.

## Les fichiers

```text
index.html        La page
src/feedbacks.js  Les exemples de retours et les statuts
src/app.js        Le formulaire, la sauvegarde et l'affichage
src/style.css     L'apparence
server.mjs        Le serveur local
```

L'application utilise HTML, CSS et JavaScript, sans framework. Le serveur expose uniquement les fichiers de l'application et écoute sur la machine locale. Aucun compte, service externe ou appel d'IA n'est nécessaire pour la faire fonctionner.

Claude Code utilise séparément votre compte et les services de votre fournisseur de modèle : une application locale ne signifie pas que l'inférence est locale.

## Pour l'atelier

Le dépôt contient uniquement des données fictives. Chacun travaille sur son clone. Les exercices et les consignes sont fournis sur le site de la formation.

Le code initial est volontairement court : les évolutions seront réalisées pendant les exercices.
