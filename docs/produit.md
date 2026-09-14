# Le portail support

Application locale de formation pour une seule personne. Les trois demandes, dates et échanges fournis sont fictifs.

## Fonctions au départ

Créer une demande, rechercher dans le sujet et la description, filtrer par statut, ouvrir le détail, ajouter une réponse et changer le statut. Les compteurs portent sur toutes les demandes, même masquées par les filtres.

## Règles métier

- Sujet : 3 à 100 caractères, après suppression des espaces aux extrémités.
- Description : 10 à 2 000 caractères ; réponse : 1 à 2 000 caractères.
- Statut initial : `ouvert`. Statuts possibles : `ouvert`, `en_cours`, `resolu`.
- Une demande doit avoir au moins une réponse avant de passer à `resolu`.
- Les réponses sont signées « Support » ; aucun compte utilisateur.
- Recherche insensible à la casse ; recherche et statut se combinent.
- Le brouillon d’une réponse reste disponible quand on change de demande ou qu’une écriture échoue. Il reste en mémoire du navigateur, pas après rechargement.

## Données et limites

`data/tickets.seed.json` contient les exemples partagés. Au premier démarrage, le serveur crée `data/tickets.local.json` dans sa propre copie de travail. Chaque écriture relit les données puis remplace le fichier par renommage. Un seul processus Node écrit ce fichier.

Les tests utilisent des fichiers temporaires distincts. La réinitialisation remet les trois exemples et supprime les demandes et réponses ajoutées dans cette copie, après confirmation.

Pas d’affectation ni de priorité au départ : ces évolutions sont à réaliser pendant l’atelier. Pas de service cloud, d’authentification, de synchronisation entre postes ni de dépendance externe. Le service écoute sur `127.0.0.1`.
