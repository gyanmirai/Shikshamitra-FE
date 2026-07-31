'use client';

import { Alert } from '@mui/material';

import { EnrollmentSettingsPage } from './enrollment-settings-page';
import { FinanceHandoffConfiguration } from './finance-handoff-configuration';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';

export function FinanceHandoffSettingsRoute() {
  const { academicYearId } = useEnrollmentWorkspace();

  return (
    <EnrollmentSettingsPage
      title="Finance Handoff Settings"
      description="Choose when Enrollment asks Finance for verification and which Finance reference staff can see."
      layout="document"
    >
      <Alert severity="info">
        Finance remains the source of truth for payment, receipt, waiver, reconciliation, and refund
        status. Enrollment only requests and displays verification.
      </Alert>
      {academicYearId ? (
        <FinanceHandoffConfiguration academicYearId={academicYearId} />
      ) : (
        <Alert severity="info">Select an academic year to configure the Finance handoff.</Alert>
      )}
    </EnrollmentSettingsPage>
  );
}
