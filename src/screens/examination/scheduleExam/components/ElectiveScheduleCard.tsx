import type { ReactNode } from 'react';

import { Chip } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { FormSectionCard } from 'src/components/form-section-card';

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
    <FormSectionCard
      collapsible
      title={name}
      icon={GlobalIcons.family}
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      descriptionTooltip="Schedule the electives with assigned students in the selected divisions. Subjects without assigned students are excluded from this exam."
      sx={{ mb: 2, minWidth: 0 }}
      contentSx={{ minWidth: 0 }}
      action={
        <Chip
          label={
            subjectCount === 0
              ? 'No assigned students'
              : `${subjectCount} subject${subjectCount === 1 ? '' : 's'}`
          }
          size="small"
          variant="outlined"
        />
      }
    >
      {subjectCount === 0 ? (
        <EmptyElectiveSchedule standardId={standardId} divisionIds={divisionIds} />
      ) : (
        children
      )}
    </FormSectionCard>
  );
}
