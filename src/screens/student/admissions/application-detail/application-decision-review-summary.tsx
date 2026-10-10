import type {
  AdmissionApplication,
  AdmissionApplicationWorkflow,
} from 'src/redux/student/admissions/admission-applications-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Divider, ButtonBase, Typography } from '@mui/material';

import {
  isApprovalStage,
  getStageStatusColor,
  getStageStatusLabel,
} from './application-progress-model';

type Props = {
  application: AdmissionApplication;
  workflow?: AdmissionApplicationWorkflow;
  disabled: boolean;
  onSelectStage?: (stageId: string) => void;
};

const STAGE_ICONS: Record<number, string> = {
  1: 'mdi:file-document-outline',
  2: 'mdi:clipboard-text-outline',
  4: 'mdi:receipt-text-outline',
  5: 'mdi:file-check-outline',
};

export function ApplicationDecisionReviewSummary({
  application,
  workflow,
  disabled,
  onSelectStage,
}: Props) {
  const orderedStages = [...(workflow?.stages ?? [])].sort(
    (left, right) => left.displayOrder - right.displayOrder
  );
  const decisionStage =
    orderedStages.find(
      (stage) => stage.id === workflow?.currentStageInstanceId && isApprovalStage(stage)
    ) ?? orderedStages.find(isApprovalStage);
  const stages = orderedStages.filter(
    (stage) =>
      !isApprovalStage(stage) && (!decisionStage || stage.displayOrder < decisionStage.displayOrder)
  );

  return (
    <Stack spacing={1} sx={{ minWidth: 0 }}>
      <Typography variant="subtitle1" component="h3">
        Review summary
      </Typography>
      <Divider />
      {stages.length ? (
        stages.map((stage) => {
          const content = (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ width: 1, minWidth: 0 }}>
              <Iconify
                icon={STAGE_ICONS[stage.stageType] ?? 'mdi:clipboard-check-outline'}
                width={22}
              />
              <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                  {stage.name}
                </Typography>
                <Label color={getStageStatusColor(stage.status)} sx={{ alignSelf: 'flex-start' }}>
                  {getStageStatusLabel(stage.status)}
                </Label>
              </Stack>
              {onSelectStage && <Iconify icon="mdi:chevron-right" width={18} />}
            </Stack>
          );
          return onSelectStage ? (
            <ButtonBase
              key={stage.id}
              disabled={disabled}
              onClick={() => onSelectStage(stage.id)}
              aria-label={`Review ${stage.name}`}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                py: 1,
                borderBottom: 1,
                borderColor: 'divider',
                '&.Mui-focusVisible': {
                  outline: 2,
                  outlineColor: 'primary.main',
                  outlineOffset: 2,
                },
              }}
            >
              {content}
            </ButtonBase>
          ) : (
            <Box key={stage.id} sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}>
              {content}
            </Box>
          );
        })
      ) : (
        <Typography variant="body2" color="text.secondary">
          No prior stage details are available.
        </Typography>
      )}
      {application.standardName && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: 0.5 }}>
          <Iconify icon="mdi:school-outline" width={20} />
          <Typography variant="body2" color="text.secondary">
            Applying for {application.standardName}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}
