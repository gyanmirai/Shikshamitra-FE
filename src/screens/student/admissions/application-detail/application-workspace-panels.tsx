'use client';

import { lazy } from 'react';
import dynamic from 'next/dynamic';

import {
  ApplicationWorkspaceSkeleton,
  ApplicationAssessmentSkeleton,
} from './application-workspace-skeleton';

// Keep heavy form, Finance, assessment and preview code outside the opening shell.
// The existing stage/dialog conditions remain responsible for mounting each panel.
const loading = () => <ApplicationWorkspaceSkeleton />;
const formLoading = () => <ApplicationWorkspaceSkeleton layout="form" />;
const tableLoading = () => <ApplicationWorkspaceSkeleton layout="table" />;

export const loadApplicationRuntimeForm = () =>
  import('./application-runtime-form').then((module) => module.ApplicationRuntimeForm);
export const ApplicationRuntimeForm = dynamic(loadApplicationRuntimeForm, { loading: formLoading });
export const ApplicationDecisionCard = dynamic(
  () => import('./application-decision-card').then((module) => module.ApplicationDecisionCard),
  { loading }
);
// The owner supplies the correction frame/Close control while this chunk loads.
export const ApplicationFormCorrectionEditor = lazy(() =>
  import('./application-form-correction-editor').then((module) => ({
    default: module.ApplicationFormCorrectionEditor,
  }))
);
export const ApplicationPaymentStage = dynamic(
  () =>
    import('../payment/application-payment-stage').then((module) => module.ApplicationPaymentStage),
  { loading }
);
export const ApplicationSeatStage = dynamic(
  () => import('../seat/application-seat-stage').then((module) => module.ApplicationSeatStage),
  { loading }
);
export const ApplicationAssessmentPanel = dynamic(
  () =>
    import('../assessments/application-assessment-panel').then(
      (module) => module.ApplicationAssessmentPanel
    ),
  { loading: () => <ApplicationAssessmentSkeleton /> }
);
export const AssessmentHistoryDetails = dynamic(
  () =>
    import('../assessments/assessment-history-details').then(
      (module) => module.AssessmentHistoryDetails
    ),
  { loading: tableLoading }
);
export const ApplicationDocumentsPanel = dynamic(
  () =>
    import('../document-verification/application-documents-panel').then(
      (module) => module.ApplicationDocumentsPanel
    ),
  { loading: tableLoading }
);
