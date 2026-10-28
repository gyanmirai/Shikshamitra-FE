import type { FormikProps } from 'formik';

import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import CustomAccordion from 'src/components/custom-accordian';
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
      descriptionTooltip="Choose when the school-wide counter restarts. The year in the number is matched automatically. The cycle locks after the first custom number is issued."
    >
      <ShakingTextField error={Boolean(cycleError)}>
        <CustomSelect
          label="Numbering cycle"
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
        <CustomAccordion
          title="Advanced Settings"
          expanded={expanded}
          onChange={() => setExpanded((value) => !value)}
          content={
            <ShakingTextField error={Boolean(yearError)}>
              <CustomSelect
                label="Year in number"
                name="yearFormat"
                value={form.values.yearFormat}
                options={[
                  { value: 0, label: 'No year' },
                  { value: 1, label: 'Calendar year' },
                  { value: 2, label: 'Academic year' },
                ]}
                size="small"
                fullWidth
                formControlProps={{ required: true }}
                disabled={disabled}
                error={Boolean(yearError)}
                helperText={
                  yearError ||
                  'Including a year changes the format; the counter still continues without restarting.'
                }
                onBlur={form.handleBlur}
                onChange={(value) => form.setFieldValue('yearFormat', Number(value))}
              />
            </ShakingTextField>
          }
        />
      )}
    </FormSectionCard>
  );
}
