import type { EsiImpactPreview } from 'src/redux/hr/statutory-scheme-api';

import {
  Box,
  Alert,
  Button,
  Dialog,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { formatEsiCurrency, formatPayrollMonth } from './esi-statutory-utils';

type EsiActivationDialogProps = {
  open: boolean;
  month: string;
  summary: EsiImpactPreview['summary'];
  isActivating: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function EsiActivationDialog({
  open,
  month,
  summary,
  isActivating,
  onClose,
  onConfirm,
}: EsiActivationDialogProps) {
  return (
    <Dialog open={open} onClose={isActivating ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Review and activate ESI</DialogTitle>
      <DialogContent dividers sx={{ display: 'grid', gap: 2 }}>
        <Typography>
          Confirm the complete payroll impact for <strong>{formatPayrollMonth(month)}</strong>.
        </Typography>
        <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 1, m: 0 }}>
          <Typography component="dt">Covered employees</Typography>
          <Typography component="dd" fontWeight={700} m={0}>
            {summary.coveredEmployeeCount}
          </Typography>
          <Typography component="dt">Employee deductions</Typography>
          <Typography component="dd" fontWeight={700} m={0}>
            {formatEsiCurrency(summary.employeeContributionTotal)}
          </Typography>
          <Typography component="dt">Employer contribution</Typography>
          <Typography component="dd" fontWeight={700} m={0}>
            {formatEsiCurrency(summary.employerContributionTotal)}
          </Typography>
          {summary.governmentContributionTotal > 0 ? (
            <>
              <Typography component="dt">Government contribution</Typography>
              <Typography component="dd" fontWeight={700} m={0}>
                {formatEsiCurrency(summary.governmentContributionTotal)}
              </Typography>
            </>
          ) : null}
        </Box>
        {summary.blockingIssues.length ? (
          <Alert severity="warning">
            {summary.blockingIssues.length} unresolved setup warning
            {summary.blockingIssues.length === 1 ? '' : 's'} must be reviewed before activation.
          </Alert>
        ) : (
          <Alert severity="info">
            Activation creates and binds the system-managed ESI deduction. Payroll continues to
            calculate employee and employer amounts from the effective statutory rule.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isActivating}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={isActivating || !summary.canActivate}
        >
          {isActivating ? 'Activating…' : 'Confirm activation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
