export interface ParsedApiProblemDetail {
  detail: string;
  errorCode?: string;
}

const KNOWN_ERROR_MESSAGES: Record<string, string> = {
  'Volo.Abp.Identity:PasswordRequiresNonAlphanumeric': 'Password must include a special character.',
  'Volo.Abp.Identity:PasswordRequiresLower': 'Password must include a lowercase letter.',
  'Volo.Abp.Identity:PasswordRequiresUpper': 'Password must include an uppercase letter.',
  'Volo.Abp.Identity:PasswordRequiresDigit': 'Password must include a digit.',
  'Volo.Abp.Identity:PasswordTooShort': 'Password is too short. Check the password requirements.',
  'Volo.Abp.Identity:PasswordRequiresUniqueChars':
    'Password must include more different characters. Check the password requirements.',
  'Students.Onboarding.RollNumberDuplicate':
    'This roll number is already assigned or reserved in the selected class/division for this academic year. Enter an unused number, or use Automatic if available.',
  'Admissions.CycleCodeAlreadyExists':
    'An admission cycle already uses this code. Choose a different cycle code and try again.',
  'Admissions:ApplicationStageCannotAdvance':
    "This admission step is not available in the application's current status. Refresh the application, complete the required decision or submission first, then try again.",
  'Admissions.WorkflowConcurrencyConflict':
    'This workflow changed after the list was loaded. Refresh the latest version, review it, and try again.',
  'Admissions.Application.EnrollmentDivisionFull':
    'The selected division has no seats available. Choose another division or assign one later.',
  'Admissions.Application.EnrollmentDivisionInvalid':
    'The selected division is not available for this class. Refresh the enrollment options and try again.',
  'Admissions.Application.EnrollmentDuplicate':
    'This student is already enrolled for the selected academic year.',
  'Admissions.Application.EnrollmentNotReady':
    'The application must have an accepted offer before enrollment can be completed.',
  'Admissions.Application.EnrollmentDataMissing':
    'Required applicant or guardian information is missing. Complete the application data before enrolling.',
  'Admissions.Application.OfferExpiryInvalid':
    'The admission offer has expired or the expiry time is invalid.',
  'Admissions.Application.DecisionReasonRequired': 'A reason is required for this decision.',
  'Admissions.Application.DecisionInvalidState':
    'This application has changed and no longer allows that action. Refresh the application and try again.',
  'Finance:ConcessionPolicy:010001': 'The concession policy could not be found.',
  'Finance:ConcessionPolicy:010005':
    'A concession policy with this name already exists for the academic year.',
  'Finance:ConcessionPolicy:010006':
    'A concession policy with this code already exists for the academic year.',
  'Finance:ConcessionPolicy:010007': 'This concession policy status transition is not allowed.',
  'Finance:ConcessionPolicy:010008': 'Archived concession policies cannot be edited.',
  'Finance:ConcessionPolicy:010009': 'The academic year cannot be changed after creation.',
  'Finance:ConcessionPolicy:010010': 'Only an Active concession policy can be attached or used.',
  'Finance:ConcessionPolicy:010011': 'No concession policy is attached to this fee structure.',
  'Finance:ConcessionPolicy:010012':
    'The selected concession policy version is no longer available.',
  'Finance:ConcessionPolicy:010013': 'Select at least one eligible fee head.',
  'Finance:ConcessionPolicy:010014': 'The concession calculation configuration is invalid.',
  'Finance:ConcessionPolicy:010015': 'The requested concession exceeds the policy limit.',
  'Finance:ConcessionPolicy:010016': 'The entered concession value is not allowed by this policy.',
  'Finance:ConcessionPolicy:010017':
    'The concession policy and fee structure must use the same academic year.',
  'Finance:ConcessionPolicy:010018':
    'This concession policy is attached and cannot be moved to Draft or archived.',
  'Finance:ConcessionPolicy:010019': 'Refresh the concession policy before saving it.',
  'Finance:ConcessionPolicy:010020':
    'This concession policy changed in another session. Refresh and try again.',
  'Finance:ConcessionPolicy:010021':
    'Enter a change reason before updating an Active concession policy.',
  'Finance:ConcessionPolicy:010022': 'Only an Active concession policy can be the default.',
  'Finance:RefundPolicy:010028': 'Only an Active refund policy can be the default.',
  'Finance:FeeRefund:010010':
    "No refund policy is assigned to this student's fee structure. Assign a refund policy before creating a refund request.",
  'Finance:FeeRefund:010002': 'No refundable paid balance remains for the selected fee lines.',
  'Finance:FeeRefund:010004':
    'A refund has already been requested for this payment. Review the existing refund request.',
  'Finance:FeeRefund:010011':
    'The assigned refund policy is unavailable. Ask an administrator to review the fee assignment.',
  'Finance:FeeRefund:010012': 'The selected fee head is not refundable under the assigned policy.',
  'Finance:FeeRefund:010025': 'This payment is not settled yet, so it cannot be refunded.',
  'Finance:ProrationPolicy:010025': 'Only an Active proration policy can be the default.',
  'Finance:PaymentTerm:000039':
    'These template options cannot produce a valid schedule for the selected board period. Review the installment count and date rules, then try again.',
  'Finance:Concession:030002':
    'Refresh the request before approval; concurrency information is missing.',
  'Finance:Concession:030003':
    'The request or fee balances changed. Refresh, review, and approve again.',
  'Finance:Concession:030004': 'Select and review due-fee allocations before approval.',
  'Finance:Concession:010030':
    'The paid fee has no settled receipt available for an automatic refund. Review its payment before approving the concession.',
  'Finance:Concession:010031':
    'Close or reverse the linked refund requests before fully reversing this concession.',
  'Academic:Timetable:020004':
    'This class already has generated timetable assignments. Remove or update those timetable assignments before changing lecture slot timings.',
  'ShikshaMitra.Submission:UseFeedbackToReview':
    'Please save the feedback before marking the homework as Reviewed.',
  'ShikshaMitra.Submission.UseFeedbackToReview':
    'Please save the feedback before marking the homework as Reviewed.',
  'ShikshaMitra.Submission:CannotEvaluateMissingSubmission':
    'Cannot evaluate feedback as the student has not submitted their work yet.',
  'ShikshaMitra.Submission.CannotEvaluateMissingSubmission':
    'Cannot evaluate feedback as the student has not submitted their work yet.',
  'ShikshaMitra.Exam:ScheduleIncomplete':
    'Cannot publish: one or more subjects have incomplete schedule details (date, time, or marks). Open the exam schedule and fill in all required fields.',
  'ShikshaMitra.Exam:DivisionRequired': 'Cannot publish: no divisions are assigned to this exam.',
  'ShikshaMitra.Exam:SubjectRequired': 'Cannot publish: no subjects are added to this exam.',
};

const GENERIC_MESSAGES = new Set([
  'one or more business rules were violated',
  'one or more validation errors occurred',
  'something went wrong',
  'business rule violated',
  'validation error',
]);

const normalizeMessage = (value: string) => value.trim().toLowerCase().replace(/[.]+$/, '');

const isGenericMessage = (value: string) => GENERIC_MESSAGES.has(normalizeMessage(value));

const addCandidate = (candidates: string[], value: unknown) => {
  if (typeof value === 'string' && value.trim()) {
    candidates.push(value.trim());
  }
};

const addErrorDictionaryCandidates = (candidates: string[], errors: unknown) => {
  if (!errors || typeof errors !== 'object') {
    return;
  }

  Object.values(errors as Record<string, unknown>).forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((item) => addCandidate(candidates, item));
      return;
    }

    addCandidate(candidates, value);
  });
};

const addValidationErrorCandidates = (candidates: string[], validationErrors: unknown) => {
  if (!Array.isArray(validationErrors)) {
    return;
  }

  validationErrors.forEach((validationError) => {
    if (typeof validationError === 'string') {
      addCandidate(candidates, validationError);
      return;
    }

    if (validationError && typeof validationError === 'object') {
      const record = validationError as Record<string, unknown>;
      addCandidate(candidates, record.message);
      addCandidate(candidates, record.errorMessage);
    }
  });
};

export function parseApiProblemDetail(error: any): ParsedApiProblemDetail {
  const data = error?.data || {};
  const candidates: string[] = [];

  addCandidate(candidates, data?.data?.Reason);
  addCandidate(candidates, data?.error?.data?.Reason);
  addCandidate(candidates, data?.data?.Message);
  addCandidate(candidates, data?.data?.message);
  addCandidate(candidates, data?.data?.detail);
  addCandidate(candidates, data?.error?.data?.Message);
  addCandidate(candidates, data?.error?.data?.message);
  addCandidate(candidates, data?.error?.data?.detail);
  addCandidate(candidates, data?.error?.details);
  addCandidate(candidates, data?.details);
  addValidationErrorCandidates(candidates, data?.error?.validationErrors);
  addValidationErrorCandidates(candidates, data?.validationErrors);
  addErrorDictionaryCandidates(candidates, data?.errors);
  addCandidate(candidates, data?.detail);
  addCandidate(candidates, data?.error?.message);
  addCandidate(candidates, data?.title);
  addCandidate(candidates, error?.error);
  addCandidate(candidates, error?.message);

  const errorCode = data?.errorCode || data?.error?.code || data?.code;
  const knownMessage =
    typeof errorCode === 'string'
      ? KNOWN_ERROR_MESSAGES[errorCode] ||
        KNOWN_ERROR_MESSAGES[errorCode.replace(/:/g, '.')] ||
        KNOWN_ERROR_MESSAGES[errorCode.replace(/\./g, ':')]
      : undefined;
  const specificCandidate = candidates.find((candidate) => !isGenericMessage(candidate));

  const detail = knownMessage || specificCandidate || candidates[0] || 'Something went wrong';

  return {
    detail: String(detail),
    errorCode,
  };
}
