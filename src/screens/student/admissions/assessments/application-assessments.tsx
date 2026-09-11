import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import dayjs from 'dayjs';
import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Stack, Accordion, Typography, AccordionDetails, AccordionSummary } from '@mui/material';

import { AssessmentHistoryDetails } from './assessment-history-details';
import { ApplicationAssessmentPanel } from './application-assessment-panel';
import { STAGE_STATUS_LABELS } from '../application-detail/application-progress-model';

type Props = {
  applicationId: string;
  admissionOfferingId: string;
  stages: AdmissionApplicationStage[];
  currentStage?: AdmissionApplicationStage;
  canAdvance: boolean;
  advancing: boolean;
  onComplete: () => void;
};

export function ApplicationAssessments({ stages, currentStage, ...props }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const history = stages.filter(
    (stage) => stage.assessmentEnabled && stage.id !== currentStage?.id && stage.status >= 2
  );
  if (!currentStage?.assessmentEnabled && !history.length) return null;
  return (
    <Stack spacing={1}>
      {currentStage?.assessmentEnabled && (
        <ApplicationAssessmentPanel key={currentStage.id} {...props} stage={currentStage} />
      )}
      {history.map((stage) => (
        <Accordion
          key={stage.id}
          expanded={expanded === stage.id}
          onChange={(_, open) => setExpanded(open ? stage.id : null)}
        >
          <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
            <Stack>
              <Typography variant="subtitle2">{stage.name} · Assessment history</Typography>
              <Typography variant="caption" color="text.secondary">
                {STAGE_STATUS_LABELS[stage.status] ?? 'Previous step'}
                {stage.completedAt ? ` · ${dayjs(stage.completedAt).format('DD MMM YYYY')}` : ''}
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            {expanded === stage.id && (
              <AssessmentHistoryDetails
                applicationId={props.applicationId}
                stageInstanceId={stage.id}
              />
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
}
