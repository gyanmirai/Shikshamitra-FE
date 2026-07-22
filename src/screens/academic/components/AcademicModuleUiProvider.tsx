'use client';

import type { Theme } from '@mui/material/styles';

import { alpha } from '@mui/material/styles';
import { Box, GlobalStyles } from '@mui/material';

type AcademicModuleUiProviderProps = {
  children: React.ReactNode;
};

const academicGlobalStyles = (theme: Theme) => ({
  '.academic-module-ui': {
    minHeight: '100%',
    color: theme.palette.text.primary,
    background:
      theme.palette.mode === 'dark'
        ? `linear-gradient(180deg, ${alpha(theme.palette.primary.dark, 0.14)} 0%, ${theme.palette.background.default} 240px)`
        : `linear-gradient(180deg, ${alpha(theme.palette.primary.light, 0.12)} 0%, ${theme.palette.background.default} 250px)`,
  },
  '.academic-module-ui .MuiBreadcrumbs-root': {
    marginBottom: theme.spacing(2),
  },
  '.academic-module-ui .MuiCard-root, .academic-module-ui .MuiPaper-root': {
    border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.28 : 0.72)}`,
    borderRadius: 8,
    backgroundImage: 'none',
    boxShadow:
      theme.palette.mode === 'dark'
        ? `0 16px 42px ${alpha(theme.palette.common.black, 0.28)}`
        : `0 14px 36px ${alpha(theme.palette.grey[500], 0.12)}`,
  },
  '.academic-module-ui .MuiCard-root .MuiCard-root, .academic-module-ui .MuiPaper-root .MuiPaper-root':
    {
      boxShadow: 'none',
    },
  '.academic-module-ui .MuiCardHeader-root': {
    padding: theme.spacing(2.25, 2.5, 0),
  },
  '.academic-module-ui .MuiCardContent-root': {
    padding: theme.spacing(2.5),
  },
  '.academic-module-ui .MuiButton-root': {
    borderRadius: 8,
    textTransform: 'none',
    fontWeight: 700,
    boxShadow: 'none',
  },
  '.academic-module-ui .MuiButton-contained': {
    boxShadow: `0 8px 18px ${alpha(theme.palette.primary.main, 0.18)}`,
  },
  '.academic-module-ui .MuiOutlinedInput-root, .academic-module-ui .MuiAutocomplete-root .MuiOutlinedInput-root':
    {
      borderRadius: 8,
      backgroundColor:
        theme.palette.mode === 'dark'
          ? alpha(theme.palette.common.white, 0.035)
          : alpha(theme.palette.common.white, 0.78),
      transition: theme.transitions.create(['background-color', 'box-shadow', 'border-color'], {
        duration: theme.transitions.duration.shortest,
      }),
    },
  '.academic-module-ui .MuiOutlinedInput-root.Mui-focused': {
    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.14)}`,
  },
  '.academic-module-ui .MuiInputLabel-root': {
    fontWeight: 600,
  },
  '.academic-module-ui .MuiChip-root': {
    borderRadius: 8,
    fontWeight: 700,
  },
  '.academic-module-ui .MuiTabs-root': {
    minHeight: 40,
  },
  '.academic-module-ui .MuiTab-root': {
    minHeight: 40,
    borderRadius: 8,
    textTransform: 'none',
    fontWeight: 700,
  },
  '.academic-module-ui .MuiTableContainer-root': {
    borderRadius: 8,
  },
  '.academic-module-ui .MuiTableCell-head': {
    fontSize: 13,
    letterSpacing: 0,
    color: theme.palette.text.secondary,
    backgroundColor:
      theme.palette.mode === 'dark'
        ? alpha(theme.palette.common.white, 0.055)
        : alpha(theme.palette.grey[500], 0.08),
  },
  '.academic-module-ui .MuiTableRow-root:not(.MuiTableRow-head):hover': {
    backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.045),
  },
  '.academic-module-ui .MuiDialog-paper': {
    borderRadius: 8,
  },
  '.academic-module-ui .MuiDrawer-paper': {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  '.academic-module-ui .MuiAlert-root': {
    borderRadius: 8,
  },
  '.academic-module-ui .MuiLinearProgress-root': {
    borderRadius: 8,
  },
  '.academic-module-ui .MuiSkeleton-root': {
    borderRadius: 8,
  },
});

export function AcademicModuleUiProvider({ children }: AcademicModuleUiProviderProps) {
  return (
    <Box className="academic-module-ui">
      <GlobalStyles styles={academicGlobalStyles} />
      {children}
    </Box>
  );
}

