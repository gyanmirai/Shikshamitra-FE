import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

import type { TransportAiReview } from './hooks/useTransportAiReport';

type Props = {
  review: TransportAiReview;
};

function getFilterChips(review: TransportAiReview) {
  const { query } = review.plan;
  const chips: string[] = [];
  if (query.routeId) chips.push('Selected route');
  if (query.stopId) chips.push('Selected stop');
  if (query.vehicleId) chips.push('Selected vehicle');
  if (query.staffId) chips.push('Selected staff member');
  if (query.memberType !== undefined && query.memberType !== null) {
    chips.push(query.memberType === 0 ? 'Students' : 'Employees');
  }
  if (query.status) chips.push(`Status: ${query.status}`);
  if (query.fromDate || query.toDate)
    chips.push(`${query.fromDate ?? 'Start'} to ${query.toDate ?? 'Today'}`);
  return chips;
}

export function TransportAiReportPlanReview({ review }: Props) {
  const { plan, preview } = review;

  return (
    <Stack spacing={1.5}>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }} aria-live="polite">
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="solar:clipboard-check-bold" color="success.main" />
            <Box>
              <Typography variant="subtitle2">Transport report plan ready</Typography>
              <Typography variant="caption" color="text.secondary">
                Review the interpretation and live authorized preview before approval.
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
            <Typography variant="caption" color="text.secondary">
              Selected report
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {preview.title}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Understood request
            </Typography>
            <Typography variant="body2">{review.interpretedRequest}</Typography>
          </Box>
          <Typography variant="body2">{review.summary}</Typography>
          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
            {getFilterChips(review).map((label) => (
              <Chip key={label} size="small" color="secondary" variant="soft" label={label} />
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            CSV output · {Math.round(review.confidence * 100)}% planning confidence
          </Typography>
        </Stack>
      </Paper>

      <Alert severity="success" icon={<Iconify icon="solar:shield-check-bold" />}>
        <Typography variant="subtitle2">Permission-safe scope</Typography>
        <Typography variant="body2">{review.permissionSummary}</Typography>
      </Alert>

      {review.assumptions.length > 0 && (
        <Alert severity="info">
          <Typography variant="subtitle2">Defaults used</Typography>
          {review.assumptions.map((assumption) => (
            <Typography key={assumption} variant="body2">
              • {assumption}
            </Typography>
          ))}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2">Authorized data preview</Typography>
          <Typography variant="caption" color="text.secondary">
            Showing {preview.items.length} of {preview.totalCount} matching rows.
          </Typography>
        </Box>
        <TableContainer sx={{ maxHeight: 300 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {preview.columns.map((column) => (
                  <TableCell key={column.key}>{column.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {preview.items.slice(0, 5).map((row, index) => (
                <TableRow key={`${plan.reportKey}-${index}`}>
                  {preview.columns.map((column) => (
                    <TableCell key={column.key}>{row[column.key] ?? '—'}</TableCell>
                  ))}
                </TableRow>
              ))}
              {preview.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={Math.max(preview.columns.length, 1)}>
                    No matching rows.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
