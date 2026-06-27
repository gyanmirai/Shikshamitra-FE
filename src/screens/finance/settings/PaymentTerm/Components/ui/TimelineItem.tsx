import dayjs from 'dayjs';
import { Box, Stack, Typography } from '@mui/material';

// ---------------------------------------------------------------------------
// TimelineItem — single installment row in the sidebar timeline preview
// ---------------------------------------------------------------------------
interface TimelineItemProps {
  seq: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  dueDate: string | null;
  isLast: boolean;
}

export function TimelineItem({
  seq,
  name,
  startDate,
  endDate,
  dueDate,
  isLast,
}: TimelineItemProps) {
  const hasDate = Boolean(dueDate);

  return (
    <Stack direction="row" spacing={1.5} alignItems="stretch">
      <Stack alignItems="center" sx={{ flexShrink: 0, width: 22 }}>
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            bgcolor: hasDate ? 'primary.main' : 'action.disabledBackground',
            border: '2px solid',
            borderColor: hasDate ? 'primary.dark' : 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background-color 0.3s',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.55rem',
              color: hasDate ? 'white' : 'text.disabled',
              fontWeight: 800,
            }}
          >
            {seq}
          </Typography>
        </Box>
        {!isLast && (
          <Box
            sx={{
              width: 2,
              flex: 1,
              bgcolor: hasDate ? 'primary.lighter' : 'divider',
              my: 0.4,
              minHeight: 14,
              borderRadius: 1,
            }}
          />
        )}
      </Stack>

      <Box sx={{ pb: isLast ? 0.5 : 1.75, flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          fontWeight={600}
          display="block"
          noWrap
          sx={{ fontSize: '0.72rem', color: 'text.primary' }}
        >
          {name || 'Unnamed'}
        </Typography>

        {dueDate ? (
          <Typography variant="caption" sx={{ color: 'primary.main', fontSize: '0.67rem' }}>
            Due: {dayjs(dueDate).format('DD MMM YYYY')}
          </Typography>
        ) : (
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.67rem' }}>
            Due date not set
          </Typography>
        )}

        {startDate && (
          <Typography
            variant="caption"
            display="block"
            sx={{ color: 'text.secondary', fontSize: '0.64rem' }}
          >
            Start: {dayjs(startDate).format('DD MMM YYYY')}
          </Typography>
        )}
        {endDate && (
          <Typography
            variant="caption"
            display="block"
            sx={{ color: 'text.secondary', fontSize: '0.64rem' }}
          >
            End: {dayjs(endDate).format('DD MMM YYYY')}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
