'use client';

import type { AdmissionCrmPipelineColumnKey } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import FilterAltRounded from '@mui/icons-material/FilterAltRounded';
import { Box, Paper, Stack, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';

export type ApplicantWorklistStageOption = {
  key: AdmissionCrmPipelineColumnKey;
  label: string;
  icon?: string;
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
          ? (theme) => ({
              width: '100%',
              minWidth: { xs: columns.length * 132, md: 0 },
              gap: 0.5,
              p: 0.5,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.grey[500], 0.08),
              '& .MuiToggleButton-root': {
                flex: 1,
                gap: 0.75,
                minHeight: 44,
                minWidth: 0,
                px: { xs: 1.25, sm: 1.5 },
                py: 0.75,
                border: 0,
                borderRadius: '8px !important',
                whiteSpace: 'nowrap',
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.secondary',
                touchAction: 'manipulation',
                transition: theme.transitions.create(['background-color', 'color', 'box-shadow']),
                '&:hover': {
                  color: 'text.primary',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
                '&.Mui-selected': {
                  color: 'primary.contrastText',
                  bgcolor: 'primary.main',
                  boxShadow: theme.shadows[2],
                  '&:hover': { bgcolor: 'primary.dark' },
                },
                '&.Mui-focusVisible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                },
              },
            })
          : undefined
      }
    >
      {columns.map((item) => (
        <ToggleButton key={item.key} value={item.key}>
          {item.icon ? <Iconify icon={item.icon} width={18} aria-hidden="true" /> : null}
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
      sx={{ p: 0.75, borderRadius: 2, flexShrink: 0, overflow: 'hidden' }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        gap={1}
      >
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{ minWidth: 0, px: 0.5, flex: { md: '0 0 220px' } }}
        >
          <FilterAltRounded aria-hidden="true" color="action" />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2">{label}</Typography>
            <Typography
              id={descriptionId}
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', lineHeight: 1.35 }}
            >
              {description}
            </Typography>
          </Box>
        </Stack>
        <Box
          sx={{
            overflowX: 'auto',
            width: '100%',
            maxWidth: '100%',
            overscrollBehaviorX: 'contain',
          }}
        >
          {controls}
        </Box>
      </Stack>
    </Paper>
  );
}
