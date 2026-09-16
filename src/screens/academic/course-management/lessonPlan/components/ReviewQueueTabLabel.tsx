import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

type Props = {
  pendingCount: number;
};

export function ReviewQueueTabLabel({ pendingCount }: Props) {
  return (
    <Stack component="span" direction="row" spacing={0.75} alignItems="center">
      <Box component="span">Review Queue</Box>
      {pendingCount > 0 && (
        <Box
          component="span"
          aria-label={`${pendingCount} pending ${pendingCount === 1 ? 'review' : 'reviews'}`}
          sx={{
            minWidth: 18,
            height: 18,
            px: 0.5,
            borderRadius: 9,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'warning.main',
            color: 'warning.contrastText',
            fontSize: '0.6875rem !important',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {pendingCount}
        </Box>
      )}
    </Stack>
  );
}
