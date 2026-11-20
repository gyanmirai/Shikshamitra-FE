import type { FinanceDashboardOverview } from 'src/redux/finance/financeDashboardApi';

import { fNumber } from 'src/utils/format-number';
import { Box, Paper, Typography } from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';

import { dashboardNumberSx, formatDashboardMoney } from '../finance-dashboard-format';

const chequeRule = (theme: Theme) => alpha(theme.palette.success.main, 0.38);
const chequeTint = (theme: Theme, opacity: number) => alpha(theme.palette.success.main, opacity);

function ChequeFact({
  label,
  value,
  detail,
  overdue = false,
}: {
  label: string;
  value: string;
  detail?: string;
  overdue?: boolean;
}) {
  return (
    <Box sx={{ display: 'grid', alignContent: 'start', minWidth: 0 }}>
      <Typography component="dt" variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        component="dd"
        variant="subtitle1"
        color={overdue ? 'error.main' : 'text.primary'}
        sx={{ m: 0, ...dashboardNumberSx }}
      >
        {value}
      </Typography>
      {detail && (
        <Typography component="dd" variant="caption" color="text.secondary" sx={{ m: 0 }}>
          {detail}
        </Typography>
      )}
    </Box>
  );
}

export default function FinanceChequeOverview({
  overview,
  periodLabel,
}: {
  overview: FinanceDashboardOverview;
  periodLabel: string;
}) {
  const reviewGroups = overview.work.filter(
    ({ kind }) => kind === 'concessionReview' || kind === 'refundReview'
  );
  const refunds = overview.refundsAwaitingPayment;
  const hasStub = reviewGroups.length > 0 || refunds !== null;
  const {balances} = overview;

  return (
    <Paper
      component="section"
      aria-label="Finance overview for the selected period"
      variant="outlined"
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          md: hasStub ? 'minmax(0, 3fr) minmax(185px, 1fr)' : '1fr',
        },
        borderColor: chequeRule,
        borderRadius: 1.5,
        overflow: 'clip',
        bgcolor: 'background.paper',
        backgroundImage: (theme) =>
          `linear-gradient(110deg, ${alpha(theme.palette.warning.main, 0.065)}, ${chequeTint(theme, 0.055)})`,
      }}
    >
      <Box
        sx={{
          minWidth: 0,
          position: 'relative',
          isolation: 'isolate',
          overflow: 'hidden',
          px: { xs: 2, md: 3 },
          py: { xs: 1.5, md: 2 },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            zIndex: -1,
            pointerEvents: 'none',
            maskImage: 'linear-gradient(90deg, transparent 28%, #000 95%)',
            backgroundImage: (theme) => {
              const line = chequeTint(theme, 0.1);
              return `repeating-radial-gradient(ellipse at 93% 120%, transparent 0 9px, ${line} 10px 11px, transparent 12px 15px), repeating-radial-gradient(ellipse at 73% -30%, transparent 0 9px, ${line} 10px 11px, transparent 12px 15px)`;
            },
          },
        }}
      >
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          {periodLabel} · Fees due
        </Typography>
        <Box
          sx={{
            display: 'grid',
            alignItems: 'center',
            gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', sm: 'auto minmax(12px, 1fr) auto' },
            gap: { xs: 1, sm: 1.5 },
            mt: 0.5,
            mb: 1.5,
          }}
        >
          <Typography component="h2" variant="h6">
            Outstanding Fees
          </Typography>
          <Box
            aria-hidden="true"
            sx={{
              display: { xs: 'none', sm: 'block' },
              borderBottom: '1px solid',
              borderColor: chequeRule,
            }}
          />
          <Typography
            component="p"
            sx={{
              ...dashboardNumberSx,
              bgcolor: 'background.paper',
              border: '3px double',
              borderColor: chequeRule,
              fontSize: 'clamp(1.25rem, 3.3vw, 2.7rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.04em',
              px: { xs: 0.75, md: 1.5 },
              py: 0.5,
              textAlign: 'end',
            }}
          >
            {balances ? formatDashboardMoney(balances.outstanding) : '—'}
          </Typography>
        </Box>
        {balances ? (
          <Box
            component="dl"
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: { xs: 1.5, md: 3 },
              m: 0,
              '& > div': {
                display: { xs: 'grid', lg: 'flex' },
                justifyContent: 'space-between',
                alignItems: { lg: 'baseline' },
                gridTemplateRows: { xs: '1fr auto' },
                columnGap: 1,
                borderBottom: '1px solid',
                borderColor: chequeRule,
                pb: 0.5,
                ...dashboardNumberSx,
              },
            }}
          >
            <ChequeFact
              label="Overdue fees"
              value={formatDashboardMoney(balances.overdue)}
              overdue={balances.overdue > 0}
            />
            <ChequeFact
              label="Students with overdue fees"
              value={fNumber(balances.studentsWithOverdueFees)}
            />
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Fee balances are unavailable for your access.
          </Typography>
        )}
      </Box>
      {hasStub && (
        <Box
          component="dl"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: '1fr' },
            alignContent: 'center',
            position: 'relative',
            m: 0,
            px: { xs: 2, md: 2.5 },
            py: 1.5,
            gap: 1,
            bgcolor: (theme) => chequeTint(theme, 0.085),
            border: '0 dashed',
            borderTopWidth: { xs: 1, md: 0 },
            borderLeftWidth: { xs: 0, md: 1 },
            borderColor: chequeRule,
            '& > div + div': {
              border: '0 solid',
              borderColor: chequeRule,
              borderTopWidth: { xs: 0, md: 1 },
              borderLeftWidth: { xs: 1, md: 0 },
              pt: { md: 0.75 },
              pl: { xs: 1, md: 0 },
            },
            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              top: -6,
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: chequeRule,
            },
            '&::before': {
              left: -6,
              clipPath: { xs: 'inset(0 0 0 5px)', md: 'inset(5px 0 0 0)' },
            },
            '&::after': {
              right: { xs: -6, md: 'auto' },
              left: { md: -6 },
              top: { md: 'auto' },
              bottom: { md: -6 },
              clipPath: { xs: 'inset(0 5px 0 0)', md: 'inset(0 0 5px 0)' },
            },
          }}
        >
          {reviewGroups.length > 0 && (
            <ChequeFact
              label="Requests awaiting review"
              value={fNumber(reviewGroups.reduce((count, group) => count + group.count, 0))}
            />
          )}
          {refunds && refunds.amount !== null && (
            <ChequeFact
              label="Refunds awaiting payment"
              value={formatDashboardMoney(refunds.amount)}
              detail={`${fNumber(refunds.count)} ${refunds.count === 1 ? 'refund' : 'refunds'}`}
            />
          )}
        </Box>
      )}
    </Paper>
  );
}
