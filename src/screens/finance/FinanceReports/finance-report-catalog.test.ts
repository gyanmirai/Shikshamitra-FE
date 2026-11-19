import { describe, expect, it } from 'vitest';

import { reportFields, phaseOneReports, getFinanceReportGroups } from './finance-report-catalog';

describe('Finance report catalog', () => {
  it('offers the fields relevant to each Phase 1 report', () => {
    expect(phaseOneReports).toHaveLength(6);
    expect(reportFields(phaseOneReports[1])).toContain('ageingBucket');
    expect(reportFields(phaseOneReports[2])).toContain('payerSearch');
    expect(reportFields(phaseOneReports[3])).toContain('collector');
    expect(reportFields(phaseOneReports[4])).toContain('receiptNumber');
    expect(reportFields(phaseOneReports[5])).toContain('dateBasis');
  });

  it('groups the authorized reports by the workspace that owns them', () => {
    const ids = [...phaseOneReports, 'Fee List Cheque Clear Date Wise', 'Bank Deposit Report', 'Classwise Fee Setup'];
    const groups = getFinanceReportGroups(ids.map((id) => ({ id, label: id })));

    expect(groups.map((group) => group.name)).toEqual(['Fees Reports', 'Accounts Reports']);
    expect(groups[0].reports.map((report) => report.id)).toEqual([
      ...phaseOneReports.slice(0, 5),
      'Classwise Fee Setup',
    ]);
    expect(groups[1].reports.map((report) => report.id)).toEqual([
      phaseOneReports[5],
      'Fee List Cheque Clear Date Wise',
      'Bank Deposit Report',
    ]);
  });

  it('omits groups with no reports returned by the backend', () => {
    const report = { id: phaseOneReports[5], label: 'Authorized report' };

    expect(getFinanceReportGroups([])).toEqual([]);
    expect(getFinanceReportGroups([report])).toMatchObject([{ id: 'accounts', reports: [report] }]);
  });
});
