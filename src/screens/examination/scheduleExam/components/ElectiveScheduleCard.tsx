import type { ReactNode } from 'react';

import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { EmptyElectiveSchedule } from './EmptyElectiveSchedule';

type Props = {
  name: string;
  subjectCount: number;
  standardId?: string | null;
  divisionIds: string[];
  children: ReactNode;
};

export function ElectiveScheduleCard({
  name,
  subjectCount,
  standardId,
  divisionIds,
  children,
}: Props) {
  return (
    <Accordion
      defaultExpanded
      disableGutters
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<Iconify icon="eva:chevron-down-fill" width={18} />}
        sx={{
          px: 2,
          minHeight: 44,
          bgcolor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.07),
          borderBottom: '1px solid',
          borderColor: 'divider',
          '&.Mui-expanded': { minHeight: 44 },
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            gap: 1,
            my: 0.75,
            flexWrap: 'wrap',
          },
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: 'warning.main',
            flexShrink: 0,
          }}
        />
        <Typography variant="subtitle2" fontWeight={700}>
          {name}
        </Typography>
        <Chip
          label={
            subjectCount === 0
              ? 'No assigned students'
              : `${subjectCount} subject${subjectCount !== 1 ? 's' : ''}`
          }
          size="small"
          color="warning"
          variant="soft"
          sx={{ fontSize: '0.7rem', height: 20, fontWeight: 600 }}
        />
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        {subjectCount === 0 ? (
          <EmptyElectiveSchedule standardId={standardId} divisionIds={divisionIds} />
        ) : (
          children
        )}
      </AccordionDetails>
    </Accordion>
  );
}
