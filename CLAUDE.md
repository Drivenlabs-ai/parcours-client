# Portail support

Application de formation locale, avec des données fictives. Garder le code simple et sans dépendance externe.

- `frontend/` : page, affichage et appels à l'API.
- `backend/` : serveur HTTP, règles métier et stockage.
- Avant de changer un comportement métier, lire `docs/produit.md`.
- Avant de changer un échange frontend/backend, lire `docs/api.md`.
- `npm start` lance le portail ; `npm test` vérifie l'API sur des données temporaires.
- Les données de travail sont dans `data/tickets.local.json`, exclu de Git. Les exemples partagés sont dans `data/tickets.seed.json`.
