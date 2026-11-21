import type { CustodyPreview } from 'src/redux/library/custody-api';

import { Alert, Stack, Typography } from '@mui/material';

export function StockActionReview({ review }: { review?: CustodyPreview }) {
  if (!review) return null;
  if (review.errors.length > 0) {
    return (
      <Alert severity="warning">
        <Stack component="ul" spacing={0.5} sx={{ my: 0, pl: 2 }}>
          {review.errors.map((error) => (
            <Typography
              component="li"
              key={`${error.copyId || 'context'}:${error.code}`}
              variant="body2"
            >
              {review.copies.find((copy) => copy.copyId === error.copyId)?.accessionNumber}{' '}
              {error.message}
            </Typography>
          ))}
        </Stack>
      </Alert>
    );
  }
  return (
    <Alert severity="info">
      {review.copies.length} {review.copies.length === 1 ? 'copy is' : 'copies are'} ready to
      record.
    </Alert>
  );
}
