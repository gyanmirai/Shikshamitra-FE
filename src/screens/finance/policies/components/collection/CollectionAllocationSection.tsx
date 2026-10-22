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
      title="Payment Allocation"
      icon={GlobalIcons.receiptIcon}
      subtitle="Payments follow the top-to-bottom order shown on the fee collection screen. Each due is cleared before moving to the next."
    >
      <ShakingTextField
        error={Boolean(formik.touched.allocationBasis && formik.errors.allocationBasis)}
      >
        <CustomSelect
          fullWidth
          size="small"
          label="Allocate payment by *"
          name="allocationBasis"
          value={formik.values.allocationBasis ?? 'Legacy'}
          options={[
            ...(legacy ? [{ label: 'Existing selection order', value: 'Legacy' }] : []),
            { label: 'By installment', value: 'Installment' },
            { label: 'By fee head', value: 'FeeHead' },
          ]}
          onChange={(value) => formik.setFieldValue('allocationBasis', value)}
          onBlur={() => formik.setFieldTouched('allocationBasis', true)}
          error={Boolean(formik.touched.allocationBasis && formik.errors.allocationBasis)}
          helperText={
            (formik.touched.allocationBasis && formik.errors.allocationBasis) ||
            (legacy
              ? 'This policy retains its existing behavior. Choose a basis to enable automatic allocation.'
              : 'Uses the order shown in fee collection, from top to bottom. No separate fee-head priority is needed.')
          }
        />
      </ShakingTextField>
    </SectionCard>
  );
}
