import { it, expect, describe } from 'vitest';

import { parseApiProblemDetail } from './api-problem-details';

describe('parseApiProblemDetail', () => {
  it('identifies an unassigned refund policy from the eligibility error code', () => {
    const parsed = parseApiProblemDetail({
      status: 400,
      data: {
        title: 'Business rule violated',
        detail: 'One or more business rules were violated.',
        errorCode: 'Finance:FeeRefund:010010',
      },
    });

    expect(parsed.detail).toBe(
      "No refund policy is assigned to this student's fee structure. Assign a refund policy before creating a refund request."
    );
  });

  it('shows the Income Category dependency reason from problem details', () => {
    const parsed = parseApiProblemDetail({
      status: 400,
      data: {
        title: 'Business rule violated',
        detail: 'One or more business rules were violated.',
        errorCode: 'Finance:Accounts:Settings:CategoryInUse',
        data: {
          Reason: 'Deactivate or remap the active Fee Heads using this Income Category first.',
        },
      },
    });

    expect(parsed.detail).toBe(
      'Deactivate or remap the active Fee Heads using this Income Category first.'
    );
    expect(parsed.errorCode).toBe('Finance:Accounts:Settings:CategoryInUse');
  });

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

  it('preserves actionable locally thrown Error messages', () => {
    const parsed = parseApiProblemDetail(
      new Error('Current academic year is required before creating an employee.')
    );

    expect(parsed.detail).toBe('Current academic year is required before creating an employee.');
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

  it('maps the homework feedback review business rule to an actionable message', () => {
    const parsed = parseApiProblemDetail({
      data: {
        status: 400,
        title: 'Business rule violated',
        detail: 'One or more business rules were violated.',
        errorCode: 'ShikshaMitra.Submission:UseFeedbackToReview',
      },
    });

    expect(parsed.detail).toBe('Please save the feedback before marking the homework as Reviewed.');
    expect(parsed.errorCode).toBe('ShikshaMitra.Submission:UseFeedbackToReview');
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

  it('maps CannotEvaluateMissingSubmission error code to user-friendly message', () => {
    const parsed = parseApiProblemDetail({
      data: {
        status: 400,
        title: 'Business rule violated.',
        detail: 'One or more business rules were violated.',
        errorCode: 'ShikshaMitra.Submission.CannotEvaluateMissingSubmission',
      },
    });

    expect(parsed.detail).toBe(
      'Cannot evaluate feedback as the student has not submitted their work yet.'
    );
    expect(parsed.errorCode).toBe('ShikshaMitra.Submission.CannotEvaluateMissingSubmission');
  });

  it('explains that a different user must review a form approval request', () => {
    const parsed = parseApiProblemDetail({
      data: {
        status: 400,
        title: 'Business rule violated',
        detail: 'One or more business rules were violated.',
        errorCode: 'Admissions.FormMakerCheckerRequired',
      },
    });

    expect(parsed.detail).toBe(
      'A different authorized user must review this form. The user who requested approval cannot approve or reject the same form.'
    );
  });

  it('maps an admission workflow concurrency conflict to a safe retry message', () => {
    const parsed = parseApiProblemDetail({
      data: {
        status: 400,
        title: 'Business rule violated',
        detail: 'One or more business rules were violated.',
        errorCode: 'Admissions.WorkflowConcurrencyConflict',
      },
    });

    expect(parsed.detail).toBe(
      'This workflow changed after the list was loaded. Refresh the latest version, review it, and try again.'
    );
    expect(parsed.errorCode).toBe('Admissions.WorkflowConcurrencyConflict');
  });

  it('maps a duplicate admission cycle code to an actionable retry message', () => {
    const parsed = parseApiProblemDetail({
      data: {
        status: 400,
        title: 'Business rule violated',
        detail: 'One or more business rules were violated.',
        errorCode: 'Admissions.CycleCodeAlreadyExists',
      },
    });

    expect(parsed.detail).toBe(
      'An admission cycle already uses this code. Choose a different cycle code and try again.'
    );
    expect(parsed.errorCode).toBe('Admissions.CycleCodeAlreadyExists');
  });

  it('maps an admission stage status conflict to an actionable message', () => {
    const parsed = parseApiProblemDetail({
      data: {
        status: 400,
        title: 'Business rule violated',
        detail: 'One or more business rules were violated.',
        errorCode: 'Admissions:ApplicationStageCannotAdvance',
      },
    });

    expect(parsed.detail).toBe(
      "This admission step is not available in the application's current status. Refresh the application, complete the required decision or submission first, then try again."
    );
    expect(parsed.errorCode).toBe('Admissions:ApplicationStageCannotAdvance');
  });
});
