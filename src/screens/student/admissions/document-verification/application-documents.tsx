import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Stack, Accordion, Typography, AccordionSummary, AccordionDetails } from '@mui/material';

import { ApplicationDocumentsPanel } from './application-documents-panel';

export function ApplicationDocuments({
  stages,
  currentStage,
  ...props
}: {
  applicationId: string;
  stages: AdmissionApplicationStage[];
  currentStage?: AdmissionApplicationStage;
  canAdvance: boolean;
  advancing: boolean;
  onComplete: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const history = stages.filter(
    (stage) =>
      stage.documentVerificationEnabled && stage.id !== currentStage?.id && stage.status >= 2
  );
  if (!currentStage?.documentVerificationEnabled && !history.length) return null;
  return (
    <Stack spacing={1}>
      {currentStage?.documentVerificationEnabled && (
        <ApplicationDocumentsPanel key={currentStage.id} {...props} stage={currentStage} />
      )}
      {history.map((stage) => (
        <Accordion
          key={stage.id}
          expanded={expanded === stage.id}
          onChange={(_, open) => setExpanded(open ? stage.id : null)}
        >
          <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
            <Typography variant="subtitle2">{stage.name} · Document history</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {expanded === stage.id && (
              <ApplicationDocumentsPanel
                applicationId={props.applicationId}
                stage={stage}
                historical
              />
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
}
