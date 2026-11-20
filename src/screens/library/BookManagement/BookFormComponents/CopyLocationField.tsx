import type { FormikProps } from 'formik';

import { getIn } from 'formik';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import type { BookFormValues } from '../Components/type';

export type LibrarySectionOption = {
  id: string;
  sectionName: string;
  shelfDetails: { id: string; shelfName: string }[];
};

export function CopyLocationField({
  formik,
  index,
  field,
  sections,
  disabled,
}: {
  formik: FormikProps<BookFormValues>;
  index: number;
  field: 'section' | 'shelf';
  sections: LibrarySectionOption[];
  disabled: boolean;
}) {
  const copy = formik.values.copies[index];
  const persisted = Boolean(copy.copyId || copy.id);
  const path = `copies.${index}.${field}`;
  const error = Boolean(getIn(formik.touched, path) && getIn(formik.errors, path));
  const section = sections.find((item) => item.id === copy.section);
  const options =
    field === 'section'
      ? sections.map((item) => ({ value: item.id, label: item.sectionName }))
      : (section?.shelfDetails || []).map((shelf) => ({ value: shelf.id, label: shelf.shelfName }));

  return (
    <ShakingTextField error={error}>
      <CustomSelect
        name={path}
        label={field === 'section' ? 'Section' : 'Shelf'}
        required
        value={copy[field] || ''}
        options={options}
        disabled={disabled || persisted || (field === 'shelf' && !copy.section)}
        onChange={(value) => {
          formik.setFieldValue(path, value);
          if (field === 'section') formik.setFieldValue(`copies.${index}.shelf`, '');
        }}
        onBlur={() => formik.setFieldTouched(path, true)}
        error={error}
        helperText={
          error
            ? String(getIn(formik.errors, path))
            : persisted
              ? 'Use Move copy from Inventory actions to change a saved location.'
              : undefined
        }
        formControlProps={{ fullWidth: true }}
      />
    </ShakingTextField>
  );
}
