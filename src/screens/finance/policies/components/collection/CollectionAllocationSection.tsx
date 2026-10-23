'use client';

import type { FormikProps } from 'formik';

import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { SectionCard } from './CollectionCommon';

import type { ICollectionPolicyFormValues } from '../../types/finance-policy.types';

export default function CollectionAllocationSection({
  formik,
}: {
  formik: FormikProps<ICollectionPolicyFormValues>;
}) {
  const legacy = formik.values.allocationBasis === 'Legacy';
  return (
    <SectionCard
      title="Automatic Payment Priority"
      icon={GlobalIcons.receiptIcon}
      subtitle="When no fees or charges are selected, the entered amount is allocated across outstanding fees in this priority. Selecting items limits the payment to those items. Ledger grouping does not change payment priority."
    >
      <ShakingTextField
        error={Boolean(formik.touched.allocationBasis && formik.errors.allocationBasis)}
      >
        <CustomSelect
          fullWidth
          size="small"
          label="Prioritize automatic payments by"
          required
          name="allocationBasis"
          value={formik.values.allocationBasis ?? 'Legacy'}
          options={[
            ...(legacy ? [{ label: 'Existing selection order', value: 'Legacy' }] : []),
            { label: 'Installment first (earliest due)', value: 'Installment' },
            { label: 'Fee head first (A–Z)', value: 'FeeHead' },
          ]}
          onChange={(value) => formik.setFieldValue('allocationBasis', value)}
          onBlur={() => formik.setFieldTouched('allocationBasis', true)}
          error={Boolean(formik.touched.allocationBasis && formik.errors.allocationBasis)}
          helperText={
            (formik.touched.allocationBasis && formik.errors.allocationBasis) ||
            (legacy
              ? 'This policy retains its existing behavior. Choose a basis to enable automatic allocation.'
              : formik.values.allocationBasis === 'FeeHead'
                ? 'Clears each fee head in alphabetical order, paying its earliest dues first.'
                : 'Clears the earliest installment first, then moves to the next installment.')
          }
        />
      </ShakingTextField>
    </SectionCard>
  );
}
