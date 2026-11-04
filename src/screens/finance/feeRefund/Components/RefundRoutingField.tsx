import type { RoutingOption } from 'src/redux/finance/financeRoutingApi';
import type { ChangeEvent, FocusEvent } from 'react';

import { Grid, MenuItem, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { FinanceFieldSkeleton } from '../../components/FinanceFormSkeleton';

export default function RefundRoutingField({
  field,
  value,
  options,
  loading,
  disabled,
  error,
  onChange,
  onBlur,
}: {
  field: 'expenseCategoryId' | 'bankAccountId';
  value: string;
  options: RoutingOption[];
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) {
  const category = field === 'expenseCategoryId';
  const label = category ? 'Expense category' : 'Source school bank account';
  return (
    <Grid size={12}>
      <ShakingTextField error={Boolean(error)}>
        <FinanceFieldSkeleton
          loading={Boolean(loading)}
          label={category ? 'Loading expense categories' : 'Loading school bank accounts'}
        >
          <TextField
            fullWidth
            size="small"
            required
            select
            label={label}
            name={field}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled || loading}
            error={Boolean(error)}
            helperText={
              error ||
              (loading
                ? `Loading ${category ? 'expense categories' : 'bank accounts'}…`
                : options.length === 0
                  ? `No ${category ? 'expense categories' : 'school bank accounts'} are available.`
                  : category &&
                      options.some(
                        (option) =>
                          option.id === value && option.label.trim().toLowerCase() === 'none'
                      )
                    ? 'None excludes this refund from Accounts expenses.'
                    : undefined)
            }
          >
            {options.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </FinanceFieldSkeleton>
      </ShakingTextField>
    </Grid>
  );
}
