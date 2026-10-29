import { salaryPreviewError } from 'src/utils/salary-preview-error';

/** User-facing HR recovery contract. Never keep request bodies, files or raw exceptions here. */
export type HrSetup =
  | 'salary'
  | 'templates'
  | 'leave'
  | 'assignments'
  | 'statutory'
  | 'pf'
  | 'components'
  | 'staffPayroll'
  | 'attendance';
export type HrFailure = {
  kind?: 'salaryPreview';
  title: string;
  message: string;
  guidance: string;
  details?: string;
  fields: { name: string; message: string }[];
  setup?: HrSetup;
};

const generic =
  /^(one or more (validation errors occurred|business rules were violated)|validation error|business rule violated|something went wrong|an internal error occurred during your request|internal server error)[.!]?$/i;
// Exception details, permission identifiers and infrastructure diagnostics are never recovery copy.
export function safeHrText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const text = value.trim();
  if (
    !text ||
    text.length > 700 ||
    generic.test(text) ||
    /(?:stack\s*trace|\bat\s+[\w.]+\([^)]*\)|(?:System|Microsoft|Npgsql|SqlClient|ShikshaMitra)\.[A-Z]\w*|exception\b|sqlstate|connection\s*string|access[_ -]?token|bearer\s|password\s*[:=]|[A-Z]:\\|\/home\/|https?:\/\/)/i.test(
      text
    )
  )
    return undefined;
  return text;
}

const known: Record<string, { message: string; setup?: HrSetup }> = {
  'HR:Payroll:PfEnrollmentBlocked': {
    message:
      'PF enrollment prevents salary saving. Review previous PF membership, the enrollment decision and any required consent reference.',
    setup: 'pf',
  },
  'HR:Payroll:CompensationStatutoryCalculationBlocked': {
    message:
      'ESIC setup prevents salary saving. Review the ESIC policy, registration details and the issues shown in the salary preview.',
    setup: 'statutory',
  },
  'HR:Payroll:CompensationTargetNotExact': {
    message:
      'The salary breakdown does not match the requested amount. Review the amount, basis and template before previewing again.',
    setup: 'templates',
  },
  'HR:Employee:010201': {
    message:
      'Staff salary or statutory setup is not ready for activation. Review the activation blockers in salary setup.',
    setup: 'salary',
  },
  'HR:Employee:010202': {
    message: 'Payroll details are required for this staff member.',
    setup: 'salary',
  },
  'HR:Payroll:030007': {
    message: 'The salary structure could not be found. Review the staff salary setup.',
    setup: 'salary',
  },
  'HR:Payroll:030008': {
    message: 'No salary structure is assigned to the selected staff member.',
    setup: 'salary',
  },
  'HR:Leave:020015': {
    message: 'No leave policy was found for the selected leave type.',
    setup: 'leave',
  },
  'HR:Leave:020019': { message: 'The selected leave policy is inactive.', setup: 'leave' },
  'HR:Leave:020017': {
    message: 'There is not enough leave balance for this request. Review the dates and leave type.',
  },
  'HR:Leave:020014': {
    message:
      'These leave dates overlap an existing leave request. Review your dates and existing requests.',
  },
  'HR:Leave:020028': { message: 'Leave dates must be within the selected academic year.' },
  'HR:Leave:020040': {
    message: 'This leave request requires an attachment. Add the required document.',
  },
  'HR:Employee:010211': { message: 'Enter a valid IFSC code in bank details.' },
  'HR:Employee:010212': { message: 'Enter a valid bank account number.' },
  'HR:Employee:010213': { message: 'Enter the bank name in bank details.' },
  'HR:Employee:010214': { message: 'Enter the account holder name in bank details.' },
  'HR:Employee:010004': {
    message: 'This email is already used. Check the email and the existing staff record.',
  },
  'HR:Employee:010030': {
    message: 'This PAN is already used. Check the identity details and the existing staff record.',
  },
  'HR:Employee:010031': {
    message:
      'This Aadhaar number is already used. Check the identity details and the existing staff record.',
  },
  'HR:Employee:010032': {
    message:
      'This manager still has active direct reports. Reassign those staff before changing the manager’s status.',
  },
  'HR:Payroll:030039': {
    message: 'The statutory establishment setup is not ready.',
    setup: 'statutory',
  },
  'HR:Payroll:030041': {
    message: 'The statutory rule could not be found. Review the statutory setup.',
    setup: 'statutory',
  },
  'HR:Payroll:030037': {
    message: 'A salary component dependency is unavailable. Review its component setup.',
    setup: 'components',
  },
  PAYROLL_PREVIEW_STALE: {
    message:
      'Payroll inputs changed after this preview. Refresh the preview and review it before continuing.',
  },
  ESI_PREVIEW_STALE: {
    message:
      'ESIC setup changed after this preview. Refresh the preview and review it before continuing.',
  },
  'HR:Payroll:CompensationPreviewStale': {
    message:
      'ESIC setup changed after this salary preview. Refresh the preview and review it before saving.',
  },
};

const record = (value: unknown): Record<string, any> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, any>) : {};

const fieldName = (value: unknown) =>
  typeof value === 'string' && /^[\w.[\]]{1,100}$/.test(value)
    ? value
        .replace(/^\$\.?/, '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[._]/g, ' ')
    : 'Field';

export function normalizeHrFailure(error: unknown): HrFailure {
  const outer = record(error);
  const body = record(outer.response?.data ?? outer.data ?? error);
  const business = record(body.error);
  const code = body.errorCode ?? business.code ?? body.code;
  const status = outer.status ?? body.status;
  const fields: HrFailure['fields'] = [];
  const add = (name: unknown, message: unknown) => {
    const text = safeHrText(message);
    if (text && fields.length < 12) fields.push({ name: fieldName(name), message: text });
  };
  if (status !== 401 && status !== 403 && !(Number(status) >= 500)) {
    Object.entries(record(body.errors)).forEach(([name, messages]) =>
      (Array.isArray(messages) ? messages : [messages]).forEach((message) => add(name, message))
    );
    const validations = business.validationErrors ?? body.validationErrors;
    if (Array.isArray(validations))
      validations.forEach((value) => {
        const validation = record(value);
        const members = validation.members ?? validation.memberNames;
        (Array.isArray(members) && members.length ? members : ['Field']).forEach((name) =>
          add(
            name,
            typeof value === 'string' ? value : (validation.message ?? validation.errorMessage)
          )
        );
      });
  }
  if (status === 401 || status === 403)
    return {
      title: 'Access Required',
      fields: [],
      message:
        status === 401
          ? 'Your session needs to be renewed.'
          : 'You do not have access to complete this action.',
      guidance:
        'Ask your administrator for the appropriate access. Keep this form open; signing out or reloading can lose unsaved changes.',
    };
  if (
    ['FETCH_ERROR', 'TIMEOUT_ERROR', 'PARSING_ERROR'].includes(String(status)) ||
    Number(status) >= 500
  )
    return {
      title: 'Request Could Not Be Confirmed',
      fields: [],
      message: 'The request did not finish with a confirmed result.',
      guidance:
        'Your entries are still in the form. Check the saved record or history before retrying to avoid a duplicate change.',
    };
  const mapped = typeof code === 'string' ? known[code] : undefined;
  const preview = salaryPreviewError(code, body.data ?? business.data);
  if (preview) {
    const labels: Record<string, string> = { 'monthly Amount': 'Monthly amount', rules: 'Earning rules',
      deductions: 'Deduction rules', 'pf Rule Id': 'PF rule', 'effective Month': 'Preview month' };
    fields.forEach((field) => { field.name = labels[field.name] ?? field.name; });
  }
  const message =
    preview?.message ??
    fields[0]?.message ??
    safeHrText(business.data?.Reason) ??
    safeHrText(body.data?.Reason) ??
    safeHrText(business.data?.Message) ??
    safeHrText(body.data?.Message) ??
    safeHrText(business.data?.message) ??
    safeHrText(business.data?.detail) ??
    safeHrText(body.detail) ??
    safeHrText(business.message) ??
    safeHrText(body.message) ??
    mapped?.message ??
    'The server did not provide a specific reason for rejecting this request.';
  return {
    ...(preview ? { kind: 'salaryPreview' as const, details: preview.details } : {}),
    title: Number(status) === 409 ? 'Review the Latest Record' : preview ? 'Review Salary Preview' : 'Action Could Not Be Completed',
    message,
    fields,
    setup: mapped?.setup ?? (preview ? 'templates' : undefined),
    guidance:
      Number(status) === 409
        ? 'The request conflicts with the current saved state. Keep your entries, review the latest record, and try again when the conflict is resolved.'
        : preview?.guidance ?? 'Your entries are still in the form. Review the fields or setup below, then submit again. The server will validate the request again.',
  };
}
