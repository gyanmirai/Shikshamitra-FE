import { Toaster } from 'sonner';
import { varAlpha } from 'src/theme/styles';
import { styled } from '@mui/material/styles';

import { toasterClasses } from './classes';

// ----------------------------------------------------------------------

export const StyledToaster = styled(Toaster)(({ theme }) => {
  const baseStyles = {
    toastDefault: {
      // padding: theme.spacing(1, 1, 1, 1.5),
      // boxShadow: theme.customShadows.z8,
      color: theme.vars.palette.background.paper,
      backgroundColor: 'unset',
    },
    toastColor: {
      padding: theme.spacing(0.75, 1.25, 0.75, 0.75),
      boxShadow: theme.customShadows.z8,
      color: theme.vars.palette.text.primary,
      backgroundColor: theme.vars.palette.background.paper,
    },
    toastLoader: {
      padding: theme.spacing(0.75, 1.25, 0.75, 0.75),
      boxShadow: theme.customShadows.z8,
      color: theme.vars.palette.text.primary,
      backgroundColor: theme.vars.palette.background.paper,
    },
  };

  const loadingStyles = {
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'none',
    transform: 'none',
    overflow: 'hidden',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 'inherit',
    justifyContent: 'center',
    background: theme.vars.palette.background.neutral,
    [`& .${toasterClasses.loadingIcon}`]: {
      zIndex: 9,
      width: 24,
      height: 24,
      borderRadius: '50%',
      animation: 'rotate 3s infinite linear',
      background: `conic-gradient(${varAlpha(theme.vars.palette.text.primaryChannel, 0)}, ${varAlpha(theme.vars.palette.text.disabledChannel, 0.64)})`,
    },
    [toasterClasses.loaderVisible]: { display: 'flex' },
  };

  return {
    width: 'min(420px, calc(100vw - 32px))',
    [`& .${toasterClasses.toast}`]: {
      gap: 10,
      width: '100%',
      maxWidth: 'min(420px, calc(100vw - 32px))',
      minHeight: 52,
      display: 'flex',
      position: 'relative',
      borderRadius: 12,
      alignItems: 'center',
      padding: 0,
      overflow: 'visible',
      backgroundColor: 'transparent',
    },
    /*
     * Content
     */
    [`& .${toasterClasses.content}`]: {
      gap: 0,
      flex: '1 1 auto',
      minWidth: 0,
      paddingRight: 28,
    },
    [`& .${toasterClasses.title}`]: {
      fontSize: theme.typography.subtitle2.fontSize,
      lineHeight: 1.45,
      overflowWrap: 'anywhere',
    },
    [`& .${toasterClasses.description}`]: {
      ...theme.typography.caption,
      opacity: 0.64,
    },
    /*
     * Buttons
     */
    [`& .${toasterClasses.actionButton}`]: {},
    [`& .${toasterClasses.cancelButton}`]: {},
    [`& .${toasterClasses.closeButton}`]: {
      top: 8,
      right: 8,
      left: 'auto',
      color: 'currentColor',
      backgroundColor: 'transparent',
      transform: 'none',
      borderColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
      transition: theme.transitions.create(['background-color', 'border-color']),
      '&:hover': {
        borderColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.24),
        backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
      },
    },
    /*
     * Icon
     */
    [`& .${toasterClasses.icon}`]: {
      margin: 0,
      width: 48,
      height: 48,
      flex: '0 0 48px',
      alignItems: 'center',
      borderRadius: 'inherit',
      justifyContent: 'center',
      alignSelf: 'stretch',
      [`& .${toasterClasses.iconSvg}`]: {
        width: 24,
        height: 24,
        fontSize: 0,
      },
    },

    /*
     * Default
     */
    '@keyframes rotate': { to: { transform: 'rotate(1turn)' } },

    [`& .${toasterClasses.default}`]: {
      ...baseStyles.toastDefault,
      [`&:has(${toasterClasses.closeBtnVisible})`]: {
        [`& .${toasterClasses.content}`]: {
          paddingRight: 36,
        },
      },
      [`&:has(.${toasterClasses.loader})`]: baseStyles.toastLoader,
      /*
       * With loader
       */
      [`&:has(.${toasterClasses.loader})`]: baseStyles.toastLoader,
      [`& .${toasterClasses.loader}`]: loadingStyles,
    },
    /*
     * Error
     */
    [`& .${toasterClasses.error}`]: {
      ...baseStyles.toastColor,
      [`&:has(${toasterClasses.closeBtnVisible}) .${toasterClasses.content}`]: {
        paddingRight: 36,
      },
      [`& .${toasterClasses.icon}`]: {
        color: theme.palette.error.main,
        backgroundColor: varAlpha(theme.vars.palette.error.mainChannel, 0.08),
      },
    },
    /*
     * Success
     */
    [`& .${toasterClasses.success}`]: {
      ...baseStyles.toastColor,
      [`&:has(${toasterClasses.closeBtnVisible}) .${toasterClasses.content}`]: {
        paddingRight: 36,
      },
      [`& .${toasterClasses.icon}`]: {
        color: theme.vars.palette.success.main,
        backgroundColor: varAlpha(theme.vars.palette.success.mainChannel, 0.08),
      },
    },
    /*
     * Warning
     */
    [`& .${toasterClasses.warning}`]: {
      ...baseStyles.toastColor,
      [`&:has(${toasterClasses.closeBtnVisible}) .${toasterClasses.content}`]: {
        paddingRight: 36,
      },
      [`& .${toasterClasses.icon}`]: {
        color: theme.vars.palette.warning.main,
        backgroundColor: varAlpha(theme.vars.palette.warning.mainChannel, 0.08),
      },
    },
    /*
     * Info
     */
    [`& .${toasterClasses.info}`]: {
      ...baseStyles.toastColor,
      [`&:has(${toasterClasses.closeBtnVisible}) .${toasterClasses.content}`]: {
        paddingRight: 36,
      },
      [`& .${toasterClasses.icon}`]: {
        color: theme.vars.palette.info.main,
        backgroundColor: varAlpha(theme.vars.palette.info.mainChannel, 0.08),
      },
    },
  };
});
