import { Box } from '@mui/material';

import { SavedLabelCard } from './SavedLabelCard';

import type { SavedLabel } from './saved-label-model';

export function SavedLabelsGrid({
  labels,
  title,
  onValidityChange,
  id,
}: {
  labels: SavedLabel[];
  title?: string;
  onValidityChange: (key: string, valid: boolean) => void;
  id?: string;
}) {
  return (
    <Box
      id={id}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        gap: 2,
        '@media print': { gridTemplateColumns: 'minmax(0, 1fr)', gap: '4mm' },
      }}
    >
      {labels.map((label) => (
        <SavedLabelCard
          key={label.copyId}
          label={label}
          title={title}
          onValidityChange={onValidityChange}
        />
      ))}
    </Box>
  );
}
