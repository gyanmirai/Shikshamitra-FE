import type { ReportSubCategory } from 'src/components/common-report/types';
import type { ComplianceReportType } from 'src/redux/student/records/student-record-reports-api';

import ComplianceReportForm from './components/ComplianceReportForm';
import { complianceReportDefinitions } from './utils/compliance-report-model';

const reports: [ComplianceReportType, string, string][] = [
  [
    'UdiseBaseline',
    'generic-udise-student-export',
    'Export UDISE+ baseline columns with masked identity compliance statuses',
  ],
  [
    'GujaratCompliance',
    'gujarat-gseb-student-compliance-report',
    'Review Gujarat state-board compliance fields for reconciliation',
  ],
  [
    'IdentityExceptions',
    'aadhaar-apaar-exception-report',
    'Track consent refused, mismatch, pending, and missing identity cases',
  ],
  [
    'EligibilityTracking',
    'rte-scholarship-caste-certificate-tracking-report',
    'Track RTE, scholarship, and caste certificate follow-up status',
  ],
];

export function complianceReportCatalog(onGenerated: () => void): ReportSubCategory[] {
  return reports.map(([reportType, id, description]) => ({
    id,
    name: complianceReportDefinitions[reportType].title,
    description,
    categoryId: 'Compliance',
    icon: '',
    render: () => (
      <ComplianceReportForm key={reportType} reportType={reportType} onGenerated={onGenerated} />
    ),
  }));
}
