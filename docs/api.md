# Contrat de l’API — point de départ

API locale, même origine que la page. Les écritures utilisent du JSON avec `Content-Type: application/json`. Une erreur renvoie `{ "error": "message" }` et un statut HTTP non réussi.

| Requête                          | Entrée                                 | Réponse               |
| -------------------------------- | -------------------------------------- | --------------------- |
| `GET /api/tickets`               | Paramètres facultatifs `q` et `status` | `{ tickets, counts }` |
| `GET /api/tickets/:id`           | Identifiant                            | `{ ticket }`          |
| `POST /api/tickets`              | `{ subject, description }`             | `201`, `{ ticket }`   |
| `PATCH /api/tickets/:id`         | `{ status }`                           | `{ ticket }`          |
| `POST /api/tickets/:id/messages` | `{ text }`                             | `201`, `{ ticket }`   |
| `POST /api/reset`                | `{}`                                   | `{ ok: true }`        |

Un ticket contient `id`, `subject`, `description`, `status`, `createdAt` et `messages`. Un message contient `id`, `author`, `text` et `createdAt`. Les dates sont ISO UTC. Encoder les identifiants dans l’URL.

`q` recherche dans le sujet et la description, sans espaces en début/fin, sans tenir compte de la casse. `status` accepte les statuts du [produit](produit.md). Un filtre vide est ignoré. Les conditions se combinent avec ET. `counts` reste global : `{ ouvert, en_cours, resolu }`.

Erreurs : `400` entrée invalide, `403` origine/hôte refusé, `404` ressource inconnue, `413` corps supérieur à 16 Kio, `415` type de contenu incorrect, `422` résolution sans réponse.

Une mutation refusée ne doit pas écrire les tickets. Les fichiers de données et les instructions du dépôt ne sont pas servis par HTTP.
