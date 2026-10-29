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

function financeFeedbackStyles(theme: Theme) {
  return {
    [alertSelector]: {
      color: theme.vars.palette.text.secondary,
      backgroundColor: theme.vars.palette.background.paper,
      backgroundImage: 'none',
      border: `1px solid ${theme.vars.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
      boxShadow: 'none',
      padding: theme.spacing(0.75, 1.25),
      alignItems: 'flex-start',
      [`& .${alertClasses.message}`]: {
        padding: 0,
        minWidth: 0,
        overflowWrap: 'anywhere',
      },
      [`& .${alertClasses.message} .MuiTypography-root`]: { color: 'inherit' },
      [`& .${alertClasses.message} .MuiAlertTitle-root`]: {
        color: theme.vars.palette.text.primary,
      },
      [`& .${alertClasses.icon}`]: {
        padding: 0,
        marginRight: theme.spacing(1),
        fontSize: 20,
        alignItems: 'center',
        opacity: 1,
      },
      [`& .${alertClasses.action}`]: {
        paddingTop: 0,
        paddingBottom: 0,
        marginRight: 0,
        alignSelf: 'center',
      },
      ...Object.fromEntries(
        (['info', 'warning', 'error', 'success'] as const).map((severity) => [
          `&.MuiAlert-color${severity[0].toUpperCase()}${severity.slice(1)} .${alertClasses.icon}, &.MuiAlert-color${severity[0].toUpperCase()}${severity.slice(1)} .${alertClasses.icon} svg`,
          { color: theme.vars.palette[severity].main },
        ])
      ),
    },
  };
}

export function ModuleFeedbackStyles() {
  const pathname = usePathname();
  const isFinance = pathname === '/finance' || pathname?.startsWith('/finance/');
  const useNeutralFeedback = MODULE_PATHS.some(
    (path) => pathname === path || pathname?.startsWith(`${path}/`)
  );

  // Include portalled dialogs and drawers while preserving the shared toast styles.
  if (isFinance) return <GlobalStyles styles={financeFeedbackStyles} />;
  return useNeutralFeedback ? <GlobalStyles styles={feedbackStyles} /> : null;
}
