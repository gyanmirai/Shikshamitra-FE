import type { ReceivingOptions } from 'src/redux/library/receiving-types';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Stack, Tooltip, IconButton } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { ReceivingCostFields } from './ReceivingCostFields';
import { ReceivingTitlePicker } from './ReceivingTitlePicker';
import { receivingFieldError } from './receiving-field-state';
import { ReceivingLocationFields } from './ReceivingLocationFields';
import { ReceivingAccessionFields } from './ReceivingAccessionFields';

import type { ReceivingForm } from './receiving-field-state';

export function ReceivingLineFields({
  formik,
  index,
  options,
  disabled,
}: {
  formik: ReceivingForm;
  index: number;
  options?: ReceivingOptions;
  disabled: boolean;
}) {
  const prefix = `lines[${index}]`;
  const line = formik.values.lines[index];
  const error = (name: string) => receivingFieldError(formik, `${prefix}.${name}`);
  return (
    <FormSectionCard
      title={`Title ${index + 1}`}
      icon={GlobalIcons.issueBook}
      descriptionTooltip="Choose an existing title, new copy quantity and permanent Library location. Existing copies are preserved."
      action={
        <Tooltip title={`Remove title ${index + 1}`}>
          <span>
            <IconButton
              size="small"
              aria-label={`Remove title ${index + 1}`}
              disabled={disabled || formik.values.lines.length === 1}
              onClick={() =>
                formik.setFieldValue(
                  'lines',
                  formik.values.lines.filter((_, row) => row !== index)
                )
              }
            >
              <Iconify icon={GlobalIcons.delete} />
            </IconButton>
          </span>
        </Tooltip>
      }
    >
      <Stack spacing={2}>
        <ShakingTextField error={Boolean(error('book'))}>
          <ReceivingTitlePicker
            name={`${prefix}.book`}
            value={line.book}
            disabled={disabled}
            onChange={(book) => formik.setFieldValue(`${prefix}.book`, book)}
            onBlur={() => formik.setFieldTouched(`${prefix}.book`, true)}
            error={error('book')}
          />
        </ShakingTextField>
        <ShakingTextField error={Boolean(error('quantity'))}>
          <NumericFormatCustom
            label="Quantity"
            name={`${prefix}.quantity`}
            value={line.quantity}
            required
            fullWidth
            size="small"
            prefix=""
            decimalScale={0}
            roundToWholeRupees={false}
            valueIsNumericString
            disabled={disabled}
            isAllowed={({ value }) => !value || Number(value) <= 5000}
            onValueChange={({ value }, source) => {
              if (source.source === 'event') formik.setFieldValue(`${prefix}.quantity`, value);
            }}
            onBlur={() => formik.setFieldTouched(`${prefix}.quantity`, true)}
            error={Boolean(error('quantity'))}
            helperText={error('quantity')}
          />
        </ShakingTextField>
        <ReceivingLocationFields
          formik={formik}
          index={index}
          options={options}
          disabled={disabled}
        />
        <ReceivingCostFields formik={formik} index={index} disabled={disabled} />
        <ReceivingAccessionFields formik={formik} index={index} disabled={disabled} />
      </Stack>
    </FormSectionCard>
  );
}
