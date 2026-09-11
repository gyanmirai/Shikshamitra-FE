import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Stack, Accordion, Typography, AccordionSummary, AccordionDetails } from '@mui/material';

import { ApplicationReviewPanel } from './application-review-panel';

export function ApplicationReviews({
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
    (stage) => stage.reviewEnabled && stage.id !== currentStage?.id && stage.status >= 2
  );
  if (!currentStage?.reviewEnabled && !history.length) return null;
  return (
    <Stack spacing={1}>
      {currentStage?.reviewEnabled && (
        <ApplicationReviewPanel key={currentStage.id} {...props} stage={currentStage} />
      )}
      {history.map((stage) => (
        <Accordion
          key={stage.id}
          expanded={expanded === stage.id}
          onChange={(_, open) => setExpanded(open ? stage.id : null)}
        >
          <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
            <Typography variant="subtitle2">{stage.name} · Review records</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {expanded === stage.id && (
              <ApplicationReviewPanel
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
