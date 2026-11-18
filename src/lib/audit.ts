import {loadAuditStatus} from '../../scripts/lib/audit-status.mjs';
export {auditLine, auditAnswers, auditSource, auditFootnote, AUDIT_HEADING, AUDIT_COVERAGE} from '../../scripts/lib/audit-status.mjs';
export interface AuditEntry {
  backstop: string; row: number; label: string; asterisk: boolean;
  answers: {draftAccounts: string; opinionDelivered: string; dateDelivered: string; opinionPublished: string};
}
export interface AuditTable {backstop: string; financialYears: string}
export interface AuditStatus {
  source: {publisher: string; title: string; url: string; published_or_updated: string; data_cut_off: string; licence: string};
  values: {tables: AuditTable[]; profiles: {gss: string; entries: AuditEntry[]}[]};
  profiles: Map<string, AuditEntry[]>;
}
export const auditStatus: AuditStatus = loadAuditStatus();
export const auditFor = (gss: string): AuditEntry[] => auditStatus.profiles.get(gss) ?? [];
