# Backend

- Valider les entrées dans `domain.js`, même quand le formulaire les contrôle déjà.
- Passer par `store.js` pour modifier les données ; les tests utilisent leur propre fichier temporaire.
- Renvoyer les erreurs prévues avec `AppError` et un message compréhensible par l'utilisateur.
- Après un changement métier ou d'API, lancer `npm test` depuis la racine.
