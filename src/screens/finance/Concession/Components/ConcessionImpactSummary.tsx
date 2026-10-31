import type { ConcessionRequestPreview } from 'src/redux/finance/ConcessionManagement/types';

import { GlobalIcons } from 'src/utils/icons';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Stack, Divider } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailField } from 'src/components/detail-view';

export default function ConcessionImpactSummary({
  preview,
  concessionName,
  selectedFeeHeadCount,
  loading = false,
}: {
  preview?: ConcessionRequestPreview | null;
  concessionName?: string;
  selectedFeeHeadCount: number;
  loading?: boolean;
}) {
  return (
    <FormSectionCard
      title="Concession Impact"
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      icon={GlobalIcons.usage}
      iconContainerSize={28}
      contentSpacing={1}
      sx={{ p: 1.5, bgcolor: 'background.paper', minWidth: 0 }}
      descriptionTooltip={`Server-calculated totals for ${selectedFeeHeadCount} selected fee head${selectedFeeHeadCount === 1 ? '' : 's'}${concessionName ? ` under ${concessionName}` : ''}. Net payable is the eligible fee amount after concession.`}
    >
      <Stack spacing={1} aria-busy={loading} aria-live="polite" aria-atomic="true">
        {[
          { label: 'Before concession', amount: preview?.totalEligibleBase },
          { label: 'Concession', amount: preview?.totalConcessionAmount },
        ].map(({ label, amount }) => (
          <DetailField
            key={label}
            layout="inline"
            label={label}
            value={
              amount == null
                ? '—'
                : `${label === 'Concession' ? '−' : ''}${formatNumber(amount, 'INR')}`
            }
          />
        ))}
        <Divider />
        <DetailField
          layout="inline"
          label="After concession"
          value={preview ? formatNumber(preview.netPayable, 'INR') : '—'}
        />
        {(loading || !preview) && (
          <Box
            component="span"
            role="status"
            sx={{
              position: 'absolute',
              width: 1,
              height: 1,
              overflow: 'hidden',
              clipPath: 'inset(50%)',
              whiteSpace: 'nowrap',
            }}
          >
            {loading
              ? 'Calculating fee impact…'
              : !preview
                ? 'Select fees and enter concession values.'
                : ''}
          </Box>
        )}
      </Stack>
    </FormSectionCard>
  );
}
