import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';

import { Stack } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { fNumber } from 'src/utils/format-number';
import { DetailGrid, DetailField } from 'src/components/detail-view';
import { FormSectionHeader } from 'src/components/form-section-card';

export function FinanceDeclarations({ charges }: { charges: LibraryDashboardOverview['charges'] }) {
  return (
    <Stack spacing={2}>
      <FormSectionHeader
        title="Local Status Declarations"
        icon={GlobalIcons.history}
        descriptionTooltip="These retained local Pending, Paid and Waived flags do not prove Finance settlement or waiver. Their principal amounts are not used in the Finance totals."
      />
      <DetailGrid>
        <DetailField
          label="Declared Pending"
          value={fNumber(charges.pendingCount)}
          labelTypographyProps={{
            color: 'text.secondary',
            sx: { fontWeight: 400, letterSpacing: 0, textTransform: 'none' },
          }}
        />
        <DetailField
          label="Declared Paid"
          value={fNumber(charges.paidCount)}
          labelTypographyProps={{
            color: 'text.secondary',
            sx: { fontWeight: 400, letterSpacing: 0, textTransform: 'none' },
          }}
        />
        <DetailField
          label="Declared Waived"
          value={fNumber(charges.waivedCount)}
          labelTypographyProps={{
            color: 'text.secondary',
            sx: { fontWeight: 400, letterSpacing: 0, textTransform: 'none' },
          }}
        />
      </DetailGrid>
    </Stack>
  );
}
