import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { Alert, Stack, Typography } from '@mui/material';

import { ApplicationDocumentsPanel } from './application-documents-panel';

export function ApplicationFormDocuments({
  applicationId,
  stages,
  unsaved,
  saving,
}: {
  applicationId: string;
  stages: AdmissionApplicationStage[];
  unsaved: boolean;
  saving: boolean;
}) {
  const collecting = stages.filter((stage) => stage.documentCollectionAvailable);
  if (!collecting.length) return null;
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle1">Supporting documents</Typography>
      <Typography variant="body2" color="text.secondary">
        Upload once here. The same files will be available for staff verification in the document
        stage.
      </Typography>
      {unsaved && (
        <Alert severity="info">
          Save your form answers before uploading documents so the checklist uses your latest
          information.
        </Alert>
      )}
      {collecting.map((stage) => (
        <ApplicationDocumentsPanel
          key={stage.id}
          applicationId={applicationId}
          stage={stage}
          disabled={unsaved || saving}
        />
      ))}
    </Stack>
  );
}
