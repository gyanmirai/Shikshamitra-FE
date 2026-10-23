'use client';

import type { Theme } from '@mui/material/styles';

import { usePathname } from 'next/navigation';
import { alertClasses } from '@mui/material/Alert';
import GlobalStyles from '@mui/material/GlobalStyles';

const MODULE_PATHS = ['/academic', '/security', '/setting'];
const alertSelector = `.${alertClasses.root}.${alertClasses.root}.${alertClasses.root}:not([data-sonner-toaster] *)`;

function feedbackStyles(theme: Theme) {
  const neutralSurface = {
    color: theme.vars.palette.text.primary,
    backgroundColor: theme.vars.palette.background.neutral,
    backgroundImage: 'none',
    borderColor: theme.vars.palette.divider,
    boxShadow: 'none',
  };

  return {
    [alertSelector]: {
      ...neutralSurface,
      [`& .${alertClasses.message}, & .${alertClasses.message} .MuiTypography-root, & .${alertClasses.action}`]:
        {
          color: 'inherit',
        },
      [`& .${alertClasses.icon}, & .${alertClasses.icon} svg`]: {
        color: theme.vars.palette.text.secondary,
        opacity: 1,
      },
    },
  };
}

export function ModuleFeedbackStyles() {
  const pathname = usePathname();
  const useNeutralFeedback = MODULE_PATHS.some(
    (path) => pathname === path || pathname?.startsWith(`${path}/`)
  );

  // Include portalled dialogs and drawers while preserving the shared toast styles.
  return useNeutralFeedback ? <GlobalStyles styles={feedbackStyles} /> : null;
}
