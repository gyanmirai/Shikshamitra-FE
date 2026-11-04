import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Box, Typography } from '@mui/material';
import { SubjectType } from 'src/enums/subject-type';
import { FormSectionCard } from 'src/components/form-section-card';

import type { ISubjectDetail } from '../type';

const STATUS_CONFIG: Record<string | number, { label: string; color: LabelColor }> = {
  0: { label: 'Draft', color: 'info' },
  1: { label: 'Published', color: 'success' },
  2: { label: 'In Review', color: 'warning' },
  3: { label: 'Needs Setup', color: 'error' },
  4: { label: 'Archived', color: 'default' },
  5: { label: 'Inactive', color: 'default' },
  Draft: { label: 'Draft', color: 'info' },
  Published: { label: 'Published', color: 'success' },
  InReview: { label: 'In Review', color: 'warning' },
  NeedsSetup: { label: 'Needs Setup', color: 'error' },
  Archived: { label: 'Archived', color: 'default' },
  Inactive: { label: 'Inactive', color: 'default' },
};

const InformationItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
      {label}
    </Typography>
    {typeof value === 'string' ? (
      <Typography variant="body2" sx={{ color: 'text.primary', overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    ) : (
      value
    )}
  </Box>
);

type Props = {
  subject: ISubjectDetail | null;
  status?: number | string;
  subjectType?: number;
};

export function SubjectInformationCard({ subject, status, subjectType }: Props) {
  const statusInfo = (status == null ? undefined : STATUS_CONFIG[status]) ?? {
    label: status == null ? 'Not available' : String(status),
    color: 'default' as LabelColor,
  };

  return (
    <FormSectionCard
      title="Subject Information"
      icon={GlobalIcons.notebook}
      descriptionTooltip="Saved subject identity, allocation type, and publication status."
      titleTypographyProps={{ fontWeight: 600 }}
      sx={{ minWidth: 0, containerType: 'inline-size' }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          '@container (min-width: 360px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
          '@container (min-width: 680px)': { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        <InformationItem label="Subject code" value={subject?.subjectCode || 'Not available'} />
        <InformationItem
          label="Type"
          value={
            subjectType !== undefined
              ? SubjectType[subjectType] || 'Not available'
              : 'Not available'
          }
        />
        <InformationItem
          label="Subject name"
          value={subject?.subjectName || subject?.subject?.name || 'Not available'}
        />
        <InformationItem label="Medium" value="Not available" />
        <InformationItem
          label="Status"
          value={
            <Label variant="soft" color={statusInfo.color} sx={{ height: 22 }}>
              {statusInfo.label}
            </Label>
          }
        />
      </Box>
    </FormSectionCard>
  );
}
