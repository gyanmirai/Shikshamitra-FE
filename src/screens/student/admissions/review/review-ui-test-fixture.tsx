import type { ReactNode } from 'react';
import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { addIcon } from '@iconify/react';
import { GlobalIcons } from 'src/utils/icons';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

// Register the real table/dialog icons locally so tests do not download decorative assets.
[
  ...Object.values(GlobalIcons),
  'mdi:close',
  'mdi:check-circle-outline',
  'mdi:school-outline',
  'solar:export-bold',
  'solar:document-bold',
  'file-icons:microsoft-excel',
  'solar:minimize-square-3-outline',
  'solar:maximize-square-3-outline',
  'solar:trash-bin-trash-bold',
  'eva:arrow-back-fill',
  'fluent:filter-12-filled',
].forEach((name) => addIcon(name, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 }));
export const reviewStage: AdmissionApplicationStage = {
  id: 'review-1',
  definitionStageId: 'definition-review',
  code: 'REVIEW',
  name: 'Admission review',
  stageType: 6,
  displayOrder: 3,
  status: 1,
  allowManualSkip: false,
  reviewEnabled: true,
};
export function renderReviewUi(
  children: ReactNode,
  actions = ['View', 'Edit', 'Submit', 'Assign', 'Decide']
) {
  return renderDocumentUi(
    <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>,
    actions.map((action) =>
      action.startsWith('Students.') ? action : `Students.Admissions.Reviews.${action}`
    )
  );
}
