'use client';

import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { ConcessionSectionCard } from './ConcessionCommon';
import { CONCESSION_SCOPES } from './concessionPresentation';

export default function ConcessionApplicationSection({ formik }: { formik: any }) {
  const error = Boolean(formik.touched.applyOn && formik.errors.applyOn);
  return (
    <ConcessionSectionCard
      title="Application scope"
      subtitle={
        formik.values.applyOn === 'AllFees'
          ? 'Choose eligible installments. Paid collections remain in history; concessions on paid amounts create separate refund requests.'
          : 'Choose eligible installments. Only unpaid balances are recalculated; paid collections remain in history.'
      }
      icon="solar:layers-linear"
    >
      <ShakingTextField error={error}>
        <CustomSelect
          fullWidth
          size="small"
          label="Apply concession on *"
          name="applyOn"
          options={CONCESSION_SCOPES}
          value={formik.values.applyOn}
          onChange={(value) => formik.setFieldValue('applyOn', value)}
          onBlur={() => formik.setFieldTouched('applyOn', true)}
          error={error}
          helperText={
            (formik.touched.applyOn && formik.errors.applyOn) ||
            CONCESSION_SCOPES.find((o) => o.value === formik.values.applyOn)?.caption
          }
        />
      </ShakingTextField>
    </ConcessionSectionCard>
  );
}
