import { varAlpha } from 'src/theme/styles';
import { styled } from '@mui/material/styles';

import { calendarMonthStyles } from './calendar-month-styles';

// ----------------------------------------------------------------------

export const StyledCalendar = styled('div')(({ theme }) => ({
  width: '100%',
  minWidth: 0,

  '& .fc': {
    '--fc-border-color': varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
    '--fc-now-indicator-color': theme.vars.palette.primary.main,
    '--fc-today-bg-color': varAlpha(theme.vars.palette.primary.mainChannel, 0.04),
    '--fc-page-bg-color': theme.vars.palette.background.paper,
    '--fc-neutral-bg-color': theme.vars.palette.background.neutral,
    '--fc-list-event-hover-bg-color': theme.vars.palette.action.hover,
    '--fc-highlight-color': theme.vars.palette.action.hover,
  },

  '& .fc .fc-license-message': { display: 'none' },
  '& .fc a': { color: theme.vars.palette.text.primary },
  '& .fc a:focus-visible': {
    outline: `2px solid ${theme.vars.palette.primary.main}`,
    outlineOffset: 2,
  },

  // Table Head
  '& .fc .fc-col-header ': {
    backgroundColor: theme.vars.palette.background.neutral,
    boxShadow: `inset 0 -1px 0 ${theme.vars.palette.divider}`,
    '& th': { borderColor: 'transparent' },
    '& .fc-col-header-cell-cushion': {
      ...theme.typography.subtitle2,
      color: theme.vars.palette.text.secondary,
      padding: theme.spacing(1.25, 0),
    },
  },

  // List Empty
  '& .fc .fc-list-empty': {
    ...theme.typography.h6,
    backgroundColor: 'transparent',
    color: theme.vars.palette.text.secondary,
  },

  // Event
  '& .fc .fc-event': {
    borderRadius: +theme.shape.borderRadius / 2,
  },
  '& .fc .fc-event .fc-event-main': {
    padding: '2px 4px',
  },
  '& .fc .fc-event .fc-event-main-frame': {
    fontSize: 13,
    lineHeight: '20px',
  },
  '& .fc .fc-event .fc-event-time': {
    overflow: 'unset',
    fontWeight: theme.typography.fontWeightBold,
  },

  // Popover
  '& .fc .fc-popover': {
    border: 0,
    overflow: 'hidden',
    boxShadow: theme.customShadows.dropdown,
    borderRadius: +theme.shape.borderRadius * 1.5,
    backgroundColor: theme.vars.palette.background.paper,
  },
  '& .fc .fc-popover-header': {
    ...theme.typography.subtitle2,
    padding: theme.spacing(1),
    backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
  },
  '& .fc .fc-popover-close': {
    opacity: 0.48,
    transition: theme.transitions.create(['opacity']),
    '&:hover': { opacity: 1 },
  },
  '& .fc .fc-more-popover .fc-popover-body': { padding: theme.spacing(1) },
  '& .fc .fc-popover-body': {
    '& .fc-daygrid-event.fc-event-start, & .fc-daygrid-event.fc-event-end': { margin: '2px 0' },
  },

  // Month View
  ...calendarMonthStyles(theme),

  // Week & Day View
  '& .fc .fc-timegrid-axis-cushion': {
    ...theme.typography.body2,
    color: theme.vars.palette.text.secondary,
  },
  '& .fc .fc-timegrid-slot-label-cushion': { ...theme.typography.body2 },

  // Agenda View
  '& .fc-direction-ltr .fc-list-day-text, .fc-direction-rtl .fc-list-day-side-text, .fc-direction-ltr .fc-list-day-side-text, .fc-direction-rtl .fc-list-day-text':
    { ...theme.typography.subtitle2 },
  '& .fc .fc-list-event': {
    ...theme.typography.body2,
    '& .fc-list-event-time': { color: theme.vars.palette.text.secondary },
  },
  '& .fc .fc-list-table': { '& th, td': { borderColor: 'transparent' } },

  '& .ownEvent': {
    border: 'none',
  },
}));
