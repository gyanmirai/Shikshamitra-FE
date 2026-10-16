import type { ReactNode } from 'react';
import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

export const eligibilityStage: AdmissionApplicationStage = {
  id: 'eligibility-1',
  definitionStageId: 'definition-eligibility',
  code: 'ELIGIBILITY',
  name: 'Admission eligibility',
  stageType: 3,
  eligibilityEnabled: true,
  status: 1,
  displayOrder: 2,
  allowManualSkip: false,
};
export function renderEligibilityUi(
  children: ReactNode,
  permissions = ['View', 'Add']
) {
  return renderDocumentUi(
    children,
    permissions.map((action) => `Students.Admissions.Eligibility.${['Evaluate', 'RequestException', 'ReviewException'].includes(action) ? 'Add' : action}`)
  );
}
