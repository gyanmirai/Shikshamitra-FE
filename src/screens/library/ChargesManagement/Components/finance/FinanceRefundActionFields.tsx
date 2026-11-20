import type { FinanceRoutingOptions } from 'src/redux/finance/financeRoutingApi';

import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Stack, MenuItem, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import type { useFinanceRefundAction } from './useFinanceRefundAction';
import type { FinanceRefundAction } from './finance-refund-action-types';

export function FinanceRefundActionFields({
  state,
  action,
  method,
  options,
  routingUnavailable,
}: {
  state: ReturnType<typeof useFinanceRefundAction>;
  action: FinanceRefundAction;
  method: string;
  options?: FinanceRoutingOptions;
  routingUnavailable: boolean;
}) {
  const { formik, locked } = state;
  const input = (
    name:
      'expenseCategoryId' | 'bankAccountId' | 'externalReference' | 'reason' | 'evidenceReference'
  ) => ({
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: Boolean(formik.touched[name] && formik.errors[name]),
    helperText: formik.touched[name] && formik.errors[name],
    size: 'small' as const,
    fullWidth: true,
    disabled: locked,
  });
  const routing = action === 'approve' || action === 'recordPayout';
  return (
    <Stack spacing={2}>
      {routing && (
        <ShakingTextField error={input('expenseCategoryId').error}>
          <TextField
            {...input('expenseCategoryId')}
            select
            required
            label="Expense category"
            disabled={locked || routingUnavailable}
          >
            {options?.expenseCategories.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
        </ShakingTextField>
      )}
      {routing && method !== 'Cash' && (
        <ShakingTextField error={input('bankAccountId').error}>
          <TextField
            {...input('bankAccountId')}
            select
            required
            label="Paying school bank"
            disabled={locked || routingUnavailable}
          >
            {options?.bankAccounts.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
        </ShakingTextField>
      )}
      {action === 'recordPayout' && (
        <>
          {method !== 'Cash' && (
            <ShakingTextField error={input('externalReference').error}>
              <TextField {...input('externalReference')} required label="Payment reference" />
            </ShakingTextField>
          )}
          <ShakingTextField
            error={Boolean(formik.touched.paymentDate && formik.errors.paymentDate)}
          >
            <DateTimePicker
              label="Payment date"
              value={formik.values.paymentDate ? dayjs(formik.values.paymentDate) : null}
              disabled={locked}
              onChange={(date) =>
                formik.setFieldValue('paymentDate', date?.isValid() ? date.toISOString() : '')
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  required: true,
                  error: Boolean(formik.touched.paymentDate && formik.errors.paymentDate),
                  helperText: formik.touched.paymentDate && formik.errors.paymentDate,
                },
              }}
            />
          </ShakingTextField>
        </>
      )}
      {(action === 'reject' || action === 'returnPayout') && (
        <ShakingTextField error={input('reason').error}>
          <TextField
            {...input('reason')}
            required
            label={action === 'returnPayout' ? 'Return reason' : 'Decision reason'}
            multiline
            minRows={2}
          />
        </ShakingTextField>
      )}
      {action === 'returnPayout' && (
        <ShakingTextField error={input('evidenceReference').error}>
          <TextField {...input('evidenceReference')} required label="Evidence reference" />
        </ShakingTextField>
      )}
    </Stack>
  );
}
