import type { AnyObjectSchema } from 'yup';

import { ValidationError } from 'yup';

/** Describe the same schema errors that submission enforces, without touching a draft. */
export function schemaFieldErrors(schema: AnyObjectSchema, values: unknown) {
  try {
    schema.validateSync(values, { abortEarly: false });
    return {} as Record<string, string>;
  } catch (error) {
    if (!(error instanceof ValidationError)) throw error;
    return error.inner.reduce<Record<string, string>>((errors, issue) => {
      if (issue.path && !errors[issue.path]) errors[issue.path] = issue.message;
      return errors;
    }, {});
  }
}
