import type { ReactNode } from 'react';
import type { CustomSelectProps } from 'src/components/custom-select';

import { useId } from 'react';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Stack, Divider, Checkbox, Typography, FormHelperText } from '@mui/material';

export function FeeStructureSelect({
  label = 'Fee structure',
  ...props
}: CustomSelectProps<'label' | 'value', false>) {
  const select = <CustomSelect size="small" isSearch label={label} {...props} />;
  return props.required ? (
    <ShakingTextField error={props.error}>{select}</ShakingTextField>
  ) : (
    select
  );
}

export function FeeHeadSelectionGroup({
  optional,
  children,
  error,
}: {
  optional?: boolean;
  children: ReactNode;
  error?: string;
}) {
  const title = optional ? 'Optional Fee Heads' : 'Mandatory Fee Heads';
  const errorId = useId();
  return (
    <FormSectionCard
      aria-label={title}
      title={title}
      titleTypographyProps={{ component: 'h4' }}
      icon="mdi:layers-outline"
      iconSize={16}
      iconContainerSize={28}
      descriptionTooltip={
        optional
          ? 'Select the optional fees to include.'
          : 'These fees are included with the selected structure.'
      }
      contentSpacing={1}
      sx={{ minWidth: 0, boxShadow: 'none', containerType: 'inline-size' }}
    >
      <Stack
        role={error ? 'group' : undefined}
        aria-describedby={error ? errorId : undefined}
        divider={<Divider flexItem />}
      >
        {children}
      </Stack>
      {error && (
        <FormHelperText error id={errorId} role="alert">
          {error}
        </FormHelperText>
      )}
    </FormSectionCard>
  );
}

export function FeeHeadSelectionRow({
  name,
  amount,
  details,
  labelAdornment,
  selection,
}: {
  name: string;
  amount?: ReactNode;
  details?: ReactNode;
  labelAdornment?: ReactNode;
  selection?: { checked: boolean; disabled: boolean; onChange: (checked: boolean) => void };
}) {
  const id = useId();
  const hasAmount = amount != null;
  return (
    <Box
      component="section"
      aria-label={name}
      sx={{
        py: 1,
        display: 'grid',
        gap: 1,
        alignItems: 'start',
        gridTemplateAreas: details
          ? '"name" "amount" "details"'
          : hasAmount
            ? '"name" "amount"'
            : '"name"',
        gridTemplateColumns: 'minmax(0, 1fr)',
        '@container (min-width: 240px)': {
          gridTemplateAreas: details ? '"name amount" "details details"' : '"name amount"',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.9fr)',
        },
        ...(details && {
          '@container (min-width: 460px)': {
            gridTemplateAreas: '"name amount details"',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.4fr)',
          },
        }),
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        useFlexGap
        sx={{ gridArea: 'name', minWidth: 0 }}
      >
        {selection && (
          <Checkbox
            size="small"
            checked={selection.checked}
            disabled={selection.disabled}
            onChange={(_, checked) => selection.onChange(checked)}
            slotProps={{ input: { id } }}
            sx={{ flexShrink: 0 }}
          />
        )}
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
            {selection ? <label htmlFor={id}>{name}</label> : name}
          </Typography>
          {labelAdornment}
        </Stack>
      </Stack>
      {hasAmount && <Box sx={{ gridArea: 'amount', minWidth: 0 }}>{amount}</Box>}
      {details && <Box sx={{ gridArea: 'details', minWidth: 0 }}>{details}</Box>}
    </Box>
  );
}

export function FeeHeadSelectionAmount({
  children,
  deferred = false,
}: {
  children: ReactNode;
  deferred?: boolean;
}) {
  return (
    <Typography
      variant="body2"
      color={deferred ? 'text.secondary' : 'text.primary'}
      sx={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}
    >
      {children}
    </Typography>
  );
}
