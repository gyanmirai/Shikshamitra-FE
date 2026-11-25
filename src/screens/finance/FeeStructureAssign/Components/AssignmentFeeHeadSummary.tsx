import type { ReactNode } from 'react';
import type { AssignmentHead } from 'src/redux/finance/studentFeeAssignment';

import { Label } from 'src/components/label';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Stack, Checkbox, Typography } from '@mui/material';
import { DetailField } from 'src/screens/finance/components/detail-view';

import AssignmentProrationDetails from './AssignmentProrationDetails';

import type { FeeHeadProration } from './assignmentReviewPresentation';

export default function AssignmentFeeHeadSummary({
  head,
  currency,
  calculation,
  serviceDetails,
  selection,
  amountInput,
  amountDetails,
  status,
  actions,
}: {
  head: AssignmentHead;
  currency: string;
  calculation?: FeeHeadProration;
  serviceDetails?: ReactNode;
  selection?: {
    id: string;
    disabled: boolean;
    onChange: (checked: boolean) => void;
  };
  amountInput?: ReactNode;
  amountDetails?: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
}) {
  const amount = head.included ? head.obligation : head.isVariable ? null : head.configuredAmount;

  const displayedAmount = amountInput ?? amountDetails ?? (
    typeof amount === 'number' ? (
      <DetailField
        label={head.included ? 'Assigned amount' : 'Configured amount'}
        value={formatNumber(amount, currency)}
      />
    ) : null
  );

  return (
    <Box
      component="section"
      aria-label={head.feeHeadName}
      sx={{ containerType: 'inline-size', minWidth: 0 }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateAreas: amountInput
            ? '"name" "details" "amount"'
            : '"name amount" "details details"',
          gridTemplateColumns: amountInput ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) auto',
          alignItems: 'start',
          columnGap: 2,
          '@container (min-width: 520px)': {
            gridTemplateAreas: '"name details amount"',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.65fr) minmax(9rem, 1fr)',
          },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ gridArea: 'name' }}>
          {head.isOptional && (
            <Checkbox
              checked={head.included}
              disabled={selection?.disabled ?? true}
              onChange={(_, checked) => selection?.onChange(checked)}
              slotProps={{ input: { id: selection?.id, 'aria-label': head.feeHeadName } }}
              sx={{ p: 0 }}
            />
          )}
          <Stack spacing={0.5} sx={{ minWidth: 0, alignItems: 'flex-start' }}>
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
              <Typography component="h3" variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                {selection ? (
                  <label htmlFor={selection.id}>{head.feeHeadName}</label>
                ) : (
                  head.feeHeadName
                )}
              </Typography>
              {head.isVariable && <Label>Variable</Label>}
            </Stack>
            {status}
          </Stack>
        </Stack>
        {displayedAmount && (
          <Box
            sx={{
              gridArea: 'amount',
              minWidth: 0,
              mt: amountInput ? 1.5 : 0,
              textAlign: 'left',
              fontVariantNumeric: 'tabular-nums',
              '@container (min-width: 520px)': { mt: 0 },
            }}
          >
            {displayedAmount}
          </Box>
        )}
        {(serviceDetails || calculation) && (
          <Stack
            spacing={1}
            sx={{
              gridArea: 'details',
              minWidth: 0,
              mt: 1.5,
              '@container (min-width: 520px)': { mt: 0 },
            }}
          >
            {serviceDetails}
            <AssignmentProrationDetails head={head} calculation={calculation} currency={currency} />
          </Stack>
        )}
      </Box>
      {actions && (
        <Box
          sx={{
            mt: 1.5,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1,
            '@container (min-width: 520px)': { justifyContent: 'flex-end' },
          }}
        >
          {actions}
        </Box>
      )}
    </Box>
  );
}
