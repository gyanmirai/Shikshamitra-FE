import type { MouseEvent } from 'react';
import type { AdmissionPipelineItem } from 'src/redux/student/admissions/admission-pipeline-api';

import Link from 'next/link';
import { GlobalIcons } from 'src/utils/icons';
import { Box, IconButton } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { formatAdmissionReference } from '../admission-reference';
import { pipelineActionLabel } from './admission-pipeline-row-content';

type Props = {
  row: AdmissionPipelineItem;
  applicationUrl: (id: string, assessmentAction?: 'book') => string;
  onOpen?: (id: string, assessmentAction?: 'book') => void;
  onPrint?: (id: string, mode: 'blank' | 'filled') => void;
};

export function AdmissionPipelineRowActions({ row, applicationUrl, onOpen, onPrint }: Props) {
  const label = pipelineActionLabel(row);
  const bookAssessment = row.stageType === 2 && row.assessmentAction === 'book';
  const reference = formatAdmissionReference(row.applicationNumber);
  const icon =
    row.stageType === 0
      ? 'mdi:account-search-outline'
      : row.stageType === 1
        ? 'mdi:clipboard-check-outline'
        : bookAssessment
          ? 'mdi:calendar-plus-outline'
          : row.stageType === 2 && row.assessmentAction === 'view'
            ? 'mdi:calendar-check-outline'
            : row.stageType === 4
              ? 'mdi:wallet-outline'
              : row.stageType === 5
                ? 'mdi:file-document-check-outline'
                : row.stageType === 12
                  ? 'mdi:calendar-clock-outline'
                  : row.stageType === 7
                    ? 'mdi:school-outline'
                    : 'mdi:arrow-right-circle-outline';
  const open = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (
      onOpen &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      !event.altKey &&
      event.button === 0
    ) {
      event.preventDefault();
      if (bookAssessment) onOpen(row.id, 'book');
      else onOpen(row.id);
    }
  };
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: { xs: 0, sm: 0.5 },
        '& .MuiIconButton-root': {
          width: { xs: 44, sm: 30 },
          height: { xs: 44, sm: 30 },
        },
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <CustomTooltip title={label} arrow>
        <IconButton
          size="small"
          component={Link}
          href={applicationUrl(row.id, bookAssessment ? 'book' : undefined)}
          aria-label={`${label} ${reference}`}
          onClick={open}
          sx={{ color: 'text.secondary' }}
        >
          <Iconify icon={icon} width={20} aria-hidden />
        </IconButton>
      </CustomTooltip>
      {onPrint && (
        <AdaptiveThreeDotsActions
          directActionLimit={0}
          mobileDirectActionLimit={0}
          moreLabel={`Print options for ${reference}`}
          actions={(['filled', 'blank'] as const).map((mode) => ({
            id: `print-${mode}`,
            label: mode === 'filled' ? 'Print filled form' : 'Print blank form',
            icon: GlobalIcons.printer,
            onClick: () => onPrint(row.id, mode),
          }))}
        />
      )}
    </Box>
  );
}
