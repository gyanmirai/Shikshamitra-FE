import { it, expect, describe } from 'vitest';

import { parseApiProblemDetail } from './api-problem-details';

describe('parseApiProblemDetail', () => {
  it('prefers specific ABP business details over generic messages', () => {
    const parsed = parseApiProblemDetail({
      data: {
        error: {
          code: 'ST:Records:050006',
          message: 'One or more business rules were violated.',
          details: 'Roll numbers must be greater than zero.',
        },
      },
    });

    expect(parsed.detail).toBe('Roll numbers must be greater than zero.');
    expect(parsed.errorCode).toBe('ST:Records:050006');
  });

  it('extracts validation messages from RFC-style error dictionaries', () => {
    const parsed = parseApiProblemDetail({
      data: {
        title: 'One or more validation errors occurred.',
        errors: {
          formNumber: ['Form number is required.'],
        },
      },
    });

    expect(parsed.detail).toBe('Form number is required.');
  });

  it('supports nested middleware detail payloads', () => {
    const parsed = parseApiProblemDetail({
      data: {
        data: {
          message: 'Document type name already exists.',
        },
      },
    });

    expect(parsed.detail).toBe('Document type name already exists.');
  });
});
