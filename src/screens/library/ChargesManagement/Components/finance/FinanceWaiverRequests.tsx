import type {
  FinanceWaiverContext,
  FinanceWaiverContextItem,
} from 'src/redux/library/charges-management/finance-corrections.types';

import { formatNumber } from 'src/utils/formate_number';
import { Alert, Paper, Stack, Button, Typography, Pagination } from '@mui/material';
import { FinanceWaiverAction } from 'src/redux/library/charges-management/finance-corrections.types';

export function FinanceWaiverRequests({
  context,
  action,
  page,
  disabled,
  onPage,
  onSelect,
}: {
  context: FinanceWaiverContext;
  action: FinanceWaiverAction;
  page: number;
  disabled: boolean;
  onPage: (page: number) => void;
  onSelect: (row: FinanceWaiverContextItem) => void;
}) {
  return (
    <Stack spacing={2}>
      <Typography variant="body2">Waiver requests: {context.requests.totalCount}</Typography>
      {context.requests.items.length === 0 && (
        <Typography variant="body2">No waiver requests in this context.</Typography>
      )}
      {context.requests.items.map((row) => (
        <Paper key={row.requestId} variant="outlined" sx={{ p: 1.5 }}>
          <Stack spacing={1}>
            <Typography variant="body2">{row.reason}</Typography>
            <Typography variant="body2">
              {row.state === 0
                ? 'Pending approval'
                : row.state === 1
                  ? 'Applied waiver'
                  : row.state === 2
                    ? 'Rejected waiver'
                    : 'Review required'}
            </Typography>
            <Typography variant="body2">
              Requested:{' '}
              {formatNumber(String(row.requestedAmount), context.receivable.currency, {
                fractionDigits: 2,
              })}
            </Typography>
            {row.applicationId && (
              <Typography variant="body2">
                Reversible:{' '}
                {formatNumber(String(row.reversibleAmount), context.receivable.currency, {
                  fractionDigits: 2,
                })}
              </Typography>
            )}
            {row.issues.map((issue) => (
              <Alert key={issue} severity="info">
                {issue}
              </Alert>
            ))}
            {action !== FinanceWaiverAction.Apply && (
              <Button
                type="button"
                size="small"
                variant="outlined"
                disabled={disabled || context.canExecute !== true || row.canAct !== true}
                onClick={() => onSelect(row)}
              >
                {action === FinanceWaiverAction.Approve
                  ? 'Approve waiver'
                  : action === FinanceWaiverAction.Reject
                    ? 'Reject waiver'
                    : 'Select reversal'}
              </Button>
            )}
          </Stack>
        </Paper>
      ))}
      {context.requests.totalCount > 20 && (
        <Pagination
          page={page}
          count={Math.ceil(context.requests.totalCount / 20)}
          disabled={disabled}
          onChange={(_, next) => onPage(next)}
          aria-label="Waiver request pages"
        />
      )}
    </Stack>
  );
}
