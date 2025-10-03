import { OwnershipAuditEvent } from './ownership.js';

const events: OwnershipAuditEvent[] = [];

export function auditOwnership(event: OwnershipAuditEvent) {
  events.push(event);
  // On pourrait brancher un logger externe ici ulterieurement
}

export function getOwnershipEvents() {
  return [...events];
}

export function clearOwnershipEvents() {
  events.length = 0;
}
