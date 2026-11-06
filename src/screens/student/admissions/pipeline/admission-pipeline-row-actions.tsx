import type { MouseEvent } from 'react';
import type { AdmissionPipelineItem } from 'src/redux/student/admissions/admission-pipeline-api';

import Link from 'next/link';
import { IconButton } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';

import { formatAdmissionReference } from '../admission-reference';
import { pipelineActionLabel } from './admission-pipeline-row-content';

type Props = {
  row: AdmissionPipelineItem;
  href: string;
  onOpen?: (id: string) => void;
};

export function AdmissionPipelineRowActions({ row, href, onOpen }: Props) {
  const label = pipelineActionLabel(row);
  const reference = formatAdmissionReference(row.applicationNumber);
  const icon =
    row.stageType === 0
      ? 'mdi:account-search-outline'
      : row.stageType === 1
        ? 'mdi:clipboard-check-outline'
        : row.stageType === 2
          ? 'mdi:calendar-plus-outline'
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
      onOpen(row.id);
    }
  };
  return (
    <CustomTooltip title={label} arrow>
      <IconButton
        component={Link}
        href={href}
        aria-label={`${label} ${reference}`}
        onClick={open}
        sx={{ color: 'text.secondary' }}
      >
        <Iconify icon={icon} width={20} aria-hidden />
      </IconButton>
    </CustomTooltip>
  );
}
