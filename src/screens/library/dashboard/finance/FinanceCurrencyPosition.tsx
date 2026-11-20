import type { LibraryDashboardFinanceCurrency } from 'src/redux/library/dashboard-finance-types';

import { GlobalIcons } from 'src/utils/icons';
import { Box, Stack, Alert } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import { DetailGrid, DetailField } from 'src/components/detail-view';
import { FormSectionHeader } from 'src/components/form-section-card';
import { dashboardFinanceAmounts } from 'src/redux/library/dashboard-finance-types';

export function FinanceCurrencyPosition({ totals }: { totals: LibraryDashboardFinanceCurrency }) {
  const knownCurrency = /^[A-Z]{3}$/.test(totals.currency);
  const currencyLabel = knownCurrency ? totals.currency : 'Unknown currency';
  const amount = (value: string) =>
    knownCurrency && /^\d+\.\d{2}$/.test(value)
      ? formatNumber(value, totals.currency, { fractionDigits: 2 })
      : 'Unavailable';
  return (
    <Box
      component="section"
      aria-label={`${currencyLabel} financial position`}
      sx={{ minWidth: 0 }}
    >
      <Stack spacing={2}>
        <FormSectionHeader
          title={currencyLabel}
          icon={GlobalIcons.paymentSummary}
          descriptionTooltip="Separate Finance totals for this currency. Pending verification is reserved rather than settled. Net refunds retain processed payouts less returned payouts."
        />
        {!knownCurrency && (
          <Alert severity="warning">
            Currency is unavailable; these monetary totals cannot be presented.
          </Alert>
        )}
        <DetailGrid desktopColumns={4}>
          {dashboardFinanceAmounts.map(([field, label]) => (
            <DetailField
              key={field}
              label={label}
              value={amount(totals[field])}
              labelTypographyProps={{
                color: 'text.secondary',
                sx: { fontWeight: 400, letterSpacing: 0, textTransform: 'none' },
              }}
            />
          ))}
        </DetailGrid>
      </Stack>
    </Box>
  );
}
