import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { SubjectType } from 'src/enums/subject-type';
import { Box, Paper, Typography } from '@mui/material';

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

const InformationItem = ({
  label,
  value,
  monospace = false,
}: {
  label: string;
  value: React.ReactNode;
  monospace?: boolean;
}) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
      {label}
    </Typography>
    {typeof value === 'string' ? (
      <Typography
        variant="body2"
        noWrap
        sx={{ fontWeight: 600, color: 'text.primary', fontFamily: monospace ? 'monospace' : 'inherit' }}
      >
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
};

export function SubjectInformationCard({ subject, status = 0 }: Props) {
  const statusInfo = STATUS_CONFIG[status] ?? {
    label: String(status),
    color: 'default' as LabelColor,
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
        Subject Information
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        <InformationItem label="Subject Code" value={subject?.subjectCode || '—'} monospace />
        <InformationItem
          label="Type"
          value={
            subject?.subjectNo !== undefined && SubjectType[subject.subjectNo]
              ? SubjectType[subject.subjectNo]
              : 'Standard'
          }
        />
        <InformationItem
          label="Subject Name"
          value={subject?.subjectName || subject?.subject?.name || '—'}
        />
        <InformationItem
          label="Medium"
          value={subject?.subject?.educationMediumId ? 'Configured' : 'General'}
        />
        <InformationItem
          label="Status"
          value={
            <Label variant="soft" color={statusInfo.color} sx={{ height: 22 }}>
              {statusInfo.label}
            </Label>
          }
        />
      </Box>
    </Paper>
  );
}
