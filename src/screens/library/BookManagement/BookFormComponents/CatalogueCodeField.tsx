import type { FormikProps } from 'formik';
import type { CatalogueChoice } from 'src/redux/library/catalogue-configuration-types';

import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { legacyLanguageValue } from 'src/redux/library/catalogue-metadata';

import type { BookFormValues } from '../Components/type';

export function CatalogueCodeField({
  formik,
  field,
  choices,
  required,
  disabled,
}: {
  formik: FormikProps<BookFormValues>;
  field: 'languageCode' | 'materialCode';
  choices: CatalogueChoice[];
  required: boolean;
  disabled: boolean;
}) {
  const value = formik.values[field] ?? '';
  const label = field === 'languageCode' ? 'Language' : 'Material';
  const error = Boolean(formik.touched[field] && formik.errors[field]);
  const current = choices.find((item) => item.code === value);
  const options = choices
    .filter((item) => item.isActive || item.code === value)
    .map((item) => ({
      value: item.code,
      label: item.isActive ? item.label : `${item.label} (retired)`,
    }));
  if (value && !current) options.push({ value, label: `${value} (saved choice unavailable)` });
  if (!required) options.unshift({ value: '', label: 'Unspecified' });
  return (
    <ShakingTextField error={error}>
      <CustomSelect
        name={field}
        label={label}
        required={required}
        value={value}
        options={options}
        disabled={disabled}
        disabledValues={value && (!current || !current.isActive) ? [value] : []}
        disabledLabel="Retained for this saved record"
        onChange={(selected) => {
          const code = String(selected) || null;
          if (field === 'languageCode') {
            formik.setValues(
              (values) => ({
                ...values,
                languageCode: code,
                language: legacyLanguageValue(code),
                languageLabel: null,
              }),
              false
            );
          } else formik.setFieldValue(field, code, false);
        }}
        onBlur={() => formik.setFieldTouched(field, true)}
        error={error}
        helperText={
          error
            ? String(formik.errors[field])
            : !choices.length
              ? 'No choices are configured.'
              : undefined
        }
        formControlProps={{ fullWidth: true }}
      />
    </ShakingTextField>
  );
}
