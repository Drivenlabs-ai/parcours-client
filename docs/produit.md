# Le produit

Un petit portail support, utilisé localement par une personne pendant la formation. Le client de démonstration est Acme ; toutes les demandes sont fictives.

## Ce que l'on peut faire

Créer une demande, rechercher dans les sujets et descriptions, filtrer par statut, ouvrir une demande, y répondre et changer son statut.

## Règles métier

- Sujet : de 3 à 100 caractères après suppression des espaces aux extrémités.
- Description : de 10 à 2 000 caractères ; réponse : de 1 à 2 000 caractères.
- Priorité : `normale` ou `urgente` ; statut initial : `ouvert`.
- Statuts : `ouvert`, `en_cours`, `resolu`.
- Une demande doit avoir au moins une réponse avant de passer à `resolu`.
- Les réponses de cette démo sont signées « Support ».
- Les compteurs décrivent toutes les demandes, même lorsqu'un filtre masque une partie de la liste.

## Limites assumées

Un seul processus Node.js écrit le fichier JSON local. Aucune authentification ni séparation entre clients n'est prévue. Cette base n'est pas destinée à un déploiement public du service : le dépôt est public, l'application tourne sur le poste de chaque participant.

## Pendant la formation

Le dépôt fournit un vrai frontend, une API et des données. Les skills, règles ciblées, hooks et agents spécialisés pourront être ajoutés pendant les exercices. La simplicité du produit laisse la place au travail sur Claude Code.
