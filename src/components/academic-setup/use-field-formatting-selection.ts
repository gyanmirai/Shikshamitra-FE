import type { SetStateAction } from 'react';

import { useState } from 'react';

import type { AcademicTextCase } from './academic-field-formatting-model';

type Field<T> = { key: T; example: string; fixedDisabled?: boolean };

export function useFieldFormattingSelection<Values extends Record<string, AcademicTextCase>>(
  fields: readonly Field<keyof Values & string>[],
  values: Values,
  setValues: (value: SetStateAction<Values>, shouldValidate?: boolean) => unknown,
  initialField: keyof Values & string
) {
  type Key = keyof Values & string;
  const [selectedFields, setSelectedFields] = useState<Key[]>([initialField]);
  const [example, setExample] = useState(
    fields.find((item) => item.key === initialField)?.example ?? ''
  );
  const editableFields = selectedFields.filter((key) =>
    fields.some((item) => item.key === key && !item.fixedDisabled)
  );
  const first = editableFields[0];
  const mode =
    first && editableFields.every((key) => values[key] === values[first]) ? values[first] : null;

  return {
    selectedFields: editableFields,
    mode,
    example,
    setExample,
    selectFields: (keys: Key[]) => {
      const next = [...new Set(keys)].filter((key) =>
        fields.some((item) => item.key === key && !item.fixedDisabled)
      );
      setSelectedFields(next);
      if (next[0] !== first) {
        setExample(fields.find((item) => item.key === next[0])?.example ?? '');
      }
    },
    applyMode: (nextMode: AcademicTextCase) => {
      if (!editableFields.length) return;
      setValues((current) => {
        const next = { ...current };
        editableFields.forEach((key) => {
          next[key] = nextMode as Values[Key];
        });
        return next;
      }, false);
    },
  };
}
