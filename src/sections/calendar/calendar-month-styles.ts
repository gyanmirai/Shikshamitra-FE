import type { Theme } from '@mui/material/styles';

import { varAlpha } from 'src/theme/styles';

export const calendarMonthStyles = (theme: Theme) => ({
  '& .fc .fc-daygrid-day-frame': { minHeight: 96 },
  '& .fc .fc-daygrid-day-top': { justifyContent: 'flex-end', padding: theme.spacing(0.75) },
  '& .fc .fc-daygrid-day-number': {
    ...theme.typography.subtitle2,
    width: 28,
    height: 28,
    padding: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  '& .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number': {
    backgroundColor: theme.vars.palette.primary.dark,
    color: theme.vars.palette.primary.contrastText,
    fontWeight: theme.typography.fontWeightBold,
  },
  '& .fc .fc-day-other': {
    backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
    '& .fc-daygrid-day-top': { opacity: 1 },
    '& .fc-daygrid-day-number': { color: theme.vars.palette.text.secondary },
  },
  '& .fc .fc-daygrid-day-events': { marginBottom: theme.spacing(0.75) },
  '& .fc .fc-daygrid-event': { marginTop: 4 },
  '& .fc .fc-daygrid-block-event': {
    borderWidth: 0,
    borderInlineStartWidth: 3,
    '& .fc-event-main': { padding: theme.spacing(0.5, 0.75) },
  },
  '& .fc .fc-daygrid-event.fc-event-start, & .fc .fc-daygrid-event.fc-event-end': {
    marginLeft: 6,
    marginRight: 6,
  },
  '& .fc .fc-daygrid-event .fc-event-title': {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    fontWeight: theme.typography.fontWeightMedium,
  },
  '& .fc .fc-daygrid-more-link': {
    ...theme.typography.caption,
    display: 'inline-block',
    margin: theme.spacing(0.5, 0.75),
    color: theme.vars.palette.text.primary,
    fontWeight: theme.typography.fontWeightSemiBold,
    '&:hover': { backgroundColor: theme.vars.palette.action.hover, textDecoration: 'underline' },
  },
  [theme.breakpoints.down('sm')]: {
    '& .fc .fc-daygrid-day-frame': { minHeight: 76 },
    '& .fc .fc-daygrid-day-top': { padding: theme.spacing(0.5, 0.25) },
    '& .fc .fc-daygrid-event.fc-event-start, & .fc .fc-daygrid-event.fc-event-end': {
      marginLeft: 2,
      marginRight: 2,
    },
    '& .fc .fc-daygrid-block-event .fc-event-main': { padding: theme.spacing(0.25) },
  },
});
