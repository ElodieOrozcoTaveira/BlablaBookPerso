
# Middleware : ownership-audit

## Problème résolu

Comment garantir la traçabilité et l’audit des actions des utilisateurs sur leurs propres ressources (création, modification, suppression) ?

## Mécanisme technique

Ce middleware intercepte les actions sur les ressources appartenant à l’utilisateur et enregistre un événement d’audit pour chaque opération significative (modification, suppression, accès). Les événements sont stockés en mémoire ou envoyés à un service externe de log/audit.

## Exemple de code

```ts
import { OwnershipAuditEvent } from './ownership.js';

const events: OwnershipAuditEvent[] = [];

export function auditOwnership(event: OwnershipAuditEvent) {
    events.push(event);
// On pourrait brancher un logger externe ici ultérieurement
}

export function getOwnershipEvents() {
    return [...events];
}

export function clearOwnershipEvents() {
    events.length = 0;
}
```

## Avantages

- Permet la conformité RGPD et la traçabilité des actions utilisateurs.
- Facilite l’analyse des comportements et la détection d’anomalies.
- Peut être adapté pour stocker les logs dans une base dédiée ou un service externe.
