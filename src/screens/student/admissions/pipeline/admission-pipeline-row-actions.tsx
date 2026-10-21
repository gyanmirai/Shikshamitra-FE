import type { MouseEvent } from 'react';
import type { AdmissionPipelineItem } from 'src/redux/student/admissions/admission-pipeline-api';

import Link from 'next/link';
import { Box, Button } from '@mui/material';
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
    <CustomTooltip title={row.nextRequiredAction || 'Open the current admission step'}>
      <Button
        component={Link}
        href={href}
        aria-label={`${label} ${reference}`}
        size="small"
        variant="outlined"
        onClick={open}
        sx={{ width: { xs: 80, sm: 152 }, whiteSpace: 'nowrap' }}
      >
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          {label}
        </Box>
        <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
          Open
        </Box>
      </Button>
    </CustomTooltip>
  );
}
