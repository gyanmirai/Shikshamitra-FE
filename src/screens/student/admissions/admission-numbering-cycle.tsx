import type { FormikProps } from 'formik';

import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';

import { numberingCycles } from './admission-numbering-model';

import type { NumberingFormValues } from './admission-numbering-model';

export function AdmissionNumberingCycle({
  form,
  disabled,
  sequenceLocked,
}: {
  form: FormikProps<NumberingFormValues>;
  disabled: boolean;
  sequenceLocked: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const continuous = form.values.resetPolicy === 0;
  useEffect(() => {
    // Reveal an existing customization without rewriting it on initialization.
    if (continuous && form.values.yearFormat !== 0) setExpanded(true);
  }, [continuous, form.values.yearFormat]);
  const cycle = numberingCycles.find((option) => option.value === form.values.resetPolicy);
  const cycleError = form.touched.resetPolicy ? form.errors.resetPolicy : undefined;
  const yearError = form.touched.yearFormat ? form.errors.yearFormat : undefined;
  return (
    <FormSectionCard
      icon={GlobalIcons.scheduledReport}
      title="Numbering Cycle"
      descriptionTooltip="Choose when the school-wide counter restarts. Changing the cycle starts a new numbering series for future applications."
    >
      <ShakingTextField error={Boolean(cycleError)}>
        <CustomSelect
          label="Numbering Cycle"
          name="resetPolicy"
          value={form.values.resetPolicy}
          options={numberingCycles.map(({ value, label }) => ({ value, label }))}
          size="small"
          fullWidth
          formControlProps={{ required: true }}
          disabled={disabled || sequenceLocked}
          error={Boolean(cycleError)}
          helperText={
            cycleError ||
            (sequenceLocked
              ? 'Numbering cycle is locked because application numbers have already been generated.'
              : cycle?.description)
          }
          onBlur={form.handleBlur}
          onChange={(value) => {
            const next = numberingCycles.find((option) => option.value === Number(value));
            if (!next || disabled || sequenceLocked) return;
            // One Formik update prevents an incompatible intermediate preview/save draft.
            form.setValues({ ...form.values, resetPolicy: next.value, yearFormat: next.value });
            form.setFieldTouched('resetPolicy', true, false);
            setExpanded(false);
          }}
        />
      </ShakingTextField>
      {continuous && (
        <FormSectionCard
          collapsible
          title="Advanced Settings"
          expanded={expanded}
          onExpandedChange={setExpanded}
          contentSpacing={1.5}
          sx={{ p: 1.5 }}
        >
          <ShakingTextField error={Boolean(yearError)}>
            <CustomSelect
              label="Year in Number"
              name="yearFormat"
              value={form.values.yearFormat}
              options={[
                { value: 0, label: 'No Year' },
                { value: 1, label: 'Calendar Year' },
                { value: 2, label: 'Academic Year' },
              ]}
              size="small"
              fullWidth
              formControlProps={{ required: true }}
              disabled={disabled}
              error={Boolean(yearError)}
              helperText={yearError || 'With continuous numbering, the counter keeps running across years.'}
              onBlur={form.handleBlur}
              onChange={(value) => form.setFieldValue('yearFormat', Number(value))}
            />
          </ShakingTextField>
        </FormSectionCard>
      )}
    </FormSectionCard>
  );
}
