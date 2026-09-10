# Contrat de l'API

API locale, même origine que la page. Les corps des requêtes d'écriture sont en JSON (`Content-Type: application/json`). Une erreur renvoie `{ "error": "message" }` avec un statut HTTP non réussi.

| Requête | Entrée | Réponse |
| --- | --- | --- |
| `GET /api/tickets` | Paramètres facultatifs `q` et `status` | `{ tickets, counts }` |
| `GET /api/tickets/:id` | Identifiant | `{ ticket }` |
| `POST /api/tickets` | `{ subject, description, priority? }` | `201`, `{ ticket }` |
| `PATCH /api/tickets/:id` | `{ status }` | `{ ticket }` |
| `POST /api/tickets/:id/messages` | `{ text }` | `201`, `{ ticket }` |
| `POST /api/reset` | `{}` | `{ ok: true }` |

Un ticket contient `id`, `subject`, `description`, `priority`, `status`, `createdAt` et `messages`. Chaque message contient `id`, `author`, `text`, `createdAt`. Les dates sont des chaînes ISO UTC.

La recherche est insensible à la casse. Les compteurs `ouvert`, `en_cours` et `resolu` restent globaux. Les règles de validation sont dans [Le produit](produit.md).

Erreurs utiles : `400` entrée invalide, `403` origine/hôte refusé, `404` ressource inconnue, `413` corps trop volumineux, `415` format incorrect, `422` résolution sans réponse.
