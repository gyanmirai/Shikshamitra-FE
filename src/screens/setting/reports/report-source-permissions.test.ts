import { it, expect, describe } from 'vitest';

import { canReadReport, permittedReportOptions } from './report-source-permissions';

import type { ReportDefinition } from './types';

const definition = (id: string, ...requiredPermissions: string[]): ReportDefinition => ({ id, label: id, academic: false, columns: [], requiredPermissions });
const grants = (...names: string[]) => names.map((name) => ({ name, isGranted: true }));
const view = 'InstituteSetup.Reports.View';
const documentView = 'InstituteSetup.SchoolDocuments.View';
const identityView = 'InstituteSetup.SchoolIdentity.View';
const signature = 'InstituteSetup.SchoolIdentity.AccessSignature';

describe('Report source permissions', () => {
  it('requires source View in addition to Reports View', () => {
    const report = definition('school-document-counts', documentView);
    expect(canReadReport(report, grants(view))).toBe(false);
    expect(canReadReport(report, grants(documentView))).toBe(false);
    expect(canReadReport(report, grants(view, documentView))).toBe(true);
  });
  it('requires both identity View and Access Signature for signature configuration', () => {
    const report = definition('school-identity-signatures', identityView, signature);
    expect(canReadReport(report, grants(view, identityView))).toBe(false);
    expect(canReadReport(report, grants(view, signature))).toBe(false);
    expect(canReadReport(report, grants(view, identityView, signature))).toBe(true);
  });
  it('removes revoked datasets without modifying the cached catalogue', () => {
    const options = { choices: {}, reportTypes: [definition('school-document-counts', documentView), definition('school-identity-register', identityView)] };
    expect(permittedReportOptions(options, grants(view, identityView))?.reportTypes.map((report) => report.id)).toEqual(['school-identity-register']);
    expect(options.reportTypes).toHaveLength(2);
  });
  it('fails closed when required source metadata is absent', () => {
    expect(canReadReport(definition('unknown'), grants(view))).toBe(false);
  });
});
