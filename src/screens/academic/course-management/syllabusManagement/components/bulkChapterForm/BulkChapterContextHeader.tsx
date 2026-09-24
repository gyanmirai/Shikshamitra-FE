'use client';

import { Iconify } from 'src/components/iconify';
import { Paper, Stack, Divider, Typography } from '@mui/material';

type Props = {
  className?: string;
  subject?: string;
};

const ContextItem = ({ label, value }: { label: string; value?: string }) => (
  <Stack direction="row" alignItems="baseline" gap={0.75}>
    <Typography
      variant="caption"
      color="text.secondary"
      fontWeight={700}
      sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
    >
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {value || 'Not selected'}
    </Typography>
  </Stack>
);

export default function BulkChapterContextHeader({ className, subject }: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
      }}
    >
      <Iconify
        icon="mdi:book-education-outline"
        width={20}
        sx={{ color: 'text.secondary', flexShrink: 0 }}
      />
      <ContextItem label="Class" value={className} />
      <Divider orientation="vertical" flexItem />
      <ContextItem label="Subject" value={subject} />
      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
        Bulk chapter setup
      </Typography>
    </Paper>
  );
}
