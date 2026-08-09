'use client';

import type { AdmissionCrmPipelineColumnKey } from 'src/redux/student/admissions-crm/admissions-crm-api';

import FilterAltRounded from '@mui/icons-material/FilterAltRounded';
import { Box, Paper, Stack, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';

export type ApplicantWorklistStageOption = {
  key: AdmissionCrmPipelineColumnKey;
  label: string;
};

type Props = {
  title: string;
  label?: string;
  description?: string;
  columns: readonly ApplicantWorklistStageOption[];
  selectedColumn: AdmissionCrmPipelineColumnKey;
  onChange: (value: AdmissionCrmPipelineColumnKey) => void;
};

export function ApplicantWorklistStageFilter({
  title,
  label,
  description,
  columns,
  selectedColumn,
  onChange,
}: Props) {
  const descriptionId = `${title.toLocaleLowerCase().replace(/\s+/g, '-')}-stage-filter-description`;
  const controls = (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={selectedColumn}
      onChange={(_event, value: AdmissionCrmPipelineColumnKey | null) => {
        if (value != null) onChange(value);
      }}
      aria-label={label ? `${label} filter` : `${title} worklist`}
      aria-describedby={label && description ? descriptionId : undefined}
      sx={
        label
          ? {
              flexShrink: 0,
              maxWidth: '100%',
              '& .MuiToggleButton-root': {
                minHeight: 44,
                px: { xs: 1.25, sm: 2 },
                whiteSpace: 'nowrap',
                touchAction: 'manipulation',
              },
            }
          : undefined
      }
    >
      {columns.map((item) => (
        <ToggleButton key={item.key} value={item.key}>
          {item.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );

  if (!label) return <Box sx={{ overflowX: 'auto' }}>{controls}</Box>;

  return (
    <Paper
      variant="outlined"
      role="region"
      aria-label={`${label} filter`}
      sx={{ p: 1.25, borderRadius: 2, flexShrink: 0, overflow: 'hidden' }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        gap={1.25}
      >
        <Stack direction="row" alignItems="flex-start" gap={1} sx={{ minWidth: 0 }}>
          <FilterAltRounded aria-hidden="true" color="action" sx={{ mt: 0.25 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2">{label}</Typography>
            <Typography id={descriptionId} variant="caption" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Stack>
        <Box sx={{ overflowX: 'auto', maxWidth: '100%', pb: 0.25 }}>{controls}</Box>
      </Stack>
    </Paper>
  );
}
