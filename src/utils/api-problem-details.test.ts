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

  it('uses timetable lecture-slot message when only generic detail and error code are returned', () => {
    const parsed = parseApiProblemDetail({
      data: {
        errorCode: 'Academic:Timetable:020004',
        detail: 'One or more business rules were violated.',
      },
    });

    expect(parsed.detail).toBe(
      'This class already has generated timetable assignments. Remove or update those timetable assignments before changing lecture slot timings.'
    );
    expect(parsed.errorCode).toBe('Academic:Timetable:020004');
  });

  it('extracts ABP exception data messages before generic business-rule text', () => {
    const parsed = parseApiProblemDetail({
      data: {
        error: {
          code: 'Academic:Timetable:020004',
          message: 'One or more business rules were violated.',
          data: {
            message:
              'This class already has generated timetable assignments. Remove or update those timetable assignments before changing lecture slot timings.',
          },
        },
      },
    });

    expect(parsed.detail).toBe(
      'This class already has generated timetable assignments. Remove or update those timetable assignments before changing lecture slot timings.'
    );
  });
});
