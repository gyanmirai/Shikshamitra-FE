import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { Typography } from '@mui/material';
import { readStageConfiguration } from 'src/redux/student/admissions/admission-assessment-policy';

import { SavedFormStagePolicy } from './saved-form-stage-policy';
import { SavedDocumentStagePolicy } from './saved-document-stage-policy';
import { SavedAssessmentStagePolicy } from './saved-assessment-stage-policy';

export function SavedWorkflowStagePolicy({
  stage,
  forms,
}: {
  stage: AdmissionWorkflowStage;
  forms: AdmissionForm[];
}) {
  if (!readStageConfiguration(stage.configurationJson))
    return (
      <Typography role="alert" variant="body2" color="error.main" sx={{ p: 2 }}>
        The saved stage configuration could not be read.
      </Typography>
    );
  if (stage.stageType === 1) return <SavedFormStagePolicy stage={stage} forms={forms} />;
  if (stage.stageType === 2) return <SavedAssessmentStagePolicy stage={stage} />;
  if (stage.stageType === 5) return <SavedDocumentStagePolicy stage={stage} />;
  return null;
}
