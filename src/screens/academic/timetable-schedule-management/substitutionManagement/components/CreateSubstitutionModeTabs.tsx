import type { SyntheticEvent } from 'react';

import { Tab, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { CustomTabs } from 'src/components/custom-tabs';

import type { CreateSubstitutionOriginMode } from '../services/create-substitution-origin';

type CreateSubstitutionModeTabsProps = {
  value: CreateSubstitutionOriginMode;
  onChange: (value: CreateSubstitutionOriginMode) => void;
};

export function CreateSubstitutionModeTabs({ value, onChange }: CreateSubstitutionModeTabsProps) {
  const handleChange = (_event: SyntheticEvent, nextValue: CreateSubstitutionOriginMode) => {
    onChange(nextValue);
  };

  return (
    <Box
      sx={{
        width: 'fit-content',
        maxWidth: '100%',
        borderRadius: 1.25,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.neutral',
        overflow: 'hidden',
      }}
    >
      <CustomTabs
        value={value}
        onChange={handleChange}
        guardUnsavedChanges={false}
        variant="scrollable"
        scrollButtons={false}
        aria-label="Choose how to find the affected lecture"
        sx={{ bgcolor: 'transparent', minHeight: 40 }}
        slotProps={{
          scroller: { p: 0.5 },
          flexContainer: { gap: 0.5 },
          indicator: { display: 'none' },
          tab: {
            minHeight: 40,
            px: 1.5,
            py: 0.75,
            borderRadius: 0.75,
            color: 'text.secondary',
            fontSize: '0.8125rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          },
          selected: {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
            color: 'primary.dark',
            fontWeight: 700,
          },
        }}
      >
        <Tab value="teacher" label="By Unavailable Teacher" />
        <Tab value="lecture" label="By Class & Lecture" />
      </CustomTabs>
    </Box>
  );
}
