import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import { setupError } from './setup-error';

import type { SetupUserErrors, SetupUserValues } from './setup-user-validation';

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
const text = (value: unknown) => (typeof value === 'string' ? value : '');
const fieldName = (name: string) => {
  const key = name.split('.').pop()?.toLowerCase();
  return (['userName', 'email', 'password', 'roleNames'] as const).find(
    (field) => field.toLowerCase() === key
  );
};

export function setupUserError(failure: unknown, values: SetupUserValues) {
  const data = record(record(failure).data);
  const remote = record(data.error);
  const problem = parseApiProblemDetail(failure);
  const fields: SetupUserErrors = {};
  const add = (name: string, message: unknown) => {
    const field = fieldName(name);
    if (field && text(message)) fields[field] = text(message);
  };
  Object.entries(record(data.errors)).forEach(([name, messages]) =>
    add(name, Array.isArray(messages) ? messages.join(' ') : messages)
  );
  const validation = data.validationErrors ?? remote.validationErrors;
  if (Array.isArray(validation))
    validation.forEach((item) => {
      const entry = record(item);
      if (Array.isArray(entry.members))
        entry.members.forEach((member) => add(text(member), entry.message));
    });
  const { detail } = problem;
  const code = problem.errorCode ?? '';
  let title = 'Unable to add user';
  let message = Object.values(fields).join(' ') || detail;
  if (/DuplicateEmail/i.test(code) || /email.*(already|in use|taken|exists)/i.test(detail)) {
    title = 'Email Already In Use';
    message = `The email address ${values.email.trim()} is already registered. Please use a different email.`;
    fields.email = message;
  } else if (
    /DuplicateUserName/i.test(code) ||
    /user\s*name.*(already|in use|taken|exists)/i.test(detail)
  ) {
    title = 'User name already in use';
    message = `The user name ${values.userName.trim()} is already registered. Please use a different user name.`;
    fields.userName = message;
  } else if (/Password/i.test(code)) {
    fields.password = detail;
  } else if (/InvalidUserName/i.test(code)) {
    fields.userName = detail;
  } else if (/InvalidEmail/i.test(code)) {
    fields.email = detail;
  } else if (
    record(failure).status === 409 ||
    code.startsWith('ShikshaMitra:InitialSetup:') ||
    record(failure).status === 403
  ) {
    message = setupError(failure);
  } else if (
    [
      'Something went wrong',
      'One or more business rules were violated.',
      'One or more validation errors occurred.',
      'Validation failed',
      'Business rule violated',
    ].includes(message) ||
    record(failure).status === 'FETCH_ERROR' ||
    Number(record(failure).status) >= 500
  ) {
    message = 'Unable to add the user. Your entries are still here. Please retry.';
  }
  return { title, message, fields };
}
