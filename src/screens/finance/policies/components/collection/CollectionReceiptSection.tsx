'use client';

import type { FormikProps } from 'formik';

import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { SectionCard } from './CollectionCommon';

import type { ICollectionPolicyFormValues } from '../../types/finance-policy.types';

export default function CollectionReceiptSection({
  formik,
}: {
  formik: FormikProps<ICollectionPolicyFormValues>;
}) {
  const error = Boolean(formik.touched.receiptGrouping && formik.errors.receiptGrouping);

  return (
    <SectionCard
      title="Receipt Generation"
      icon={GlobalIcons.receiptIcon}
      subtitle="Controls receipts when fees and charges are collected together. Late fees are included with fees. Payments awaiting verification appear in reconciliation once per receipt; separate receipts for the same payment are verified together."
    >
      <ShakingTextField error={error}>
        <CustomSelect
          fullWidth
          size="small"
          required
          name="receiptGrouping"
          label="Receipts for fees and charges"
          value={formik.values.receiptGrouping ?? 'Separate'}
          options={[
            {
              label: 'Single combined receipt',
              value: 'Combined',
              description:
                'One receipt number covering fees and charges, with one reconciliation entry when verification is required.',
            },
            {
              label: 'Separate fee and charge receipts',
              value: 'Separate',
              description:
                'Two receipt numbers: one for fees and one for charges, with two reconciliation entries when verification is required.',
            },
          ]}
          optionDescriptionKey="description"
          labelKey="label"
          valueKey="value"
          onChange={(value) => formik.setFieldValue('receiptGrouping', value)}
          onBlur={() => formik.setFieldTouched('receiptGrouping', true)}
          error={error}
          helperText={error ? formik.errors.receiptGrouping : undefined}
        />
      </ShakingTextField>
    </SectionCard>
  );
}
