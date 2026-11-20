import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';
import type { LibraryDashboardFinancePosition } from 'src/redux/library/dashboard-finance-types';

import { GlobalIcons } from 'src/utils/icons';
import { fNumber } from 'src/utils/format-number';
import { Stack, Alert, Divider } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailGrid, DetailField } from 'src/components/detail-view';

import { FinanceDeclarations } from './FinanceDeclarations';
import { FinanceCurrencyPosition } from './FinanceCurrencyPosition';

export function DashboardFinancePanel({ overview }: { overview?: LibraryDashboardOverview }) {
  const position: LibraryDashboardFinancePosition | null = overview?.financePosition ?? null;
  return (
    <FormSectionCard
      title="Finance Position"
      icon={GlobalIcons.paymentSummary}
      descriptionTooltip="Finance-owned balances for authorized assessment records in the selected year. Evidence counts and currency totals remain separate from retained local payment declarations."
      contentSx={{ containerType: 'inline-size', minWidth: 0 }}
      sx={{ height: 1, boxShadow: 'none' }}
    >
      <Stack spacing={2} divider={<Divider />}>
        {position ? (
          <Stack spacing={2}>
            <DetailGrid>
              <DetailField
                label="Verified sources"
                value={fNumber(position.verifiedCount)}
                labelTypographyProps={{
                  color: 'text.secondary',
                  sx: { fontWeight: 400, letterSpacing: 0, textTransform: 'none' },
                }}
              />
              <DetailField
                label="Needs review"
                value={fNumber(position.needsReviewCount)}
                labelTypographyProps={{
                  color: 'text.secondary',
                  sx: { fontWeight: 400, letterSpacing: 0, textTransform: 'none' },
                }}
              />
              <DetailField
                label="Unposted assessments"
                value={fNumber(position.unpostedCount)}
                labelTypographyProps={{
                  color: 'text.secondary',
                  sx: { fontWeight: 400, letterSpacing: 0, textTransform: 'none' },
                }}
              />
            </DetailGrid>
            {position.currencyTotals.length ? (
              position.currencyTotals.map((totals, index) => (
                <FinanceCurrencyPosition key={`${totals.currency}:${index}`} totals={totals} />
              ))
            ) : (
              <Alert severity="info">
                No verified currency totals. Review and unposted counts remain separate from
                settlement.
              </Alert>
            )}
          </Stack>
        ) : (
          <Alert severity="info">
            Finance position unavailable. Local declarations do not establish verified balances.
          </Alert>
        )}
        {overview && <FinanceDeclarations charges={overview.charges} />}
      </Stack>
    </FormSectionCard>
  );
}
