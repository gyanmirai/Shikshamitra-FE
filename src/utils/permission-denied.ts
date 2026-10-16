export type PermissionDeniedContext = {
  operation?: string;
  administrator?: 'administrator' | 'platform administrator';
};

const recovery =
  'to review your permissions and assigned data access, then try again.';

const permissionOperations: Readonly<Record<string, string>> = {
  getEmployee: 'view the staff directory',
  getEmployeeById: 'view staff details',
  getEmployeeOptions: 'view staff options',
  getCurrentEmployee: 'view your staff details',
  getEmployeeDashboard: 'view the staff dashboard',
  getEmployeeAssignableRoles: 'view assignable staff roles',
  addBasicInformation: 'add staff',
  updateEmployee: 'update staff details',
  getBasicInformation: 'view staff details',
  updateEmployeeStatus: 'change staff status',
  getEmployeeDocuments: 'view staff documents',
  getEmployeeDocumentById: 'download staff documents',
  getRoles: 'view roles',
  addRole: 'add roles',
  updateRole: 'update roles',
  deleteRole: 'delete roles',
  getPayrollPolicies: 'view payroll policies',
  createPayrollPolicy: 'add payroll policies',
  createPayrollPolicyWithToken: 'add payroll policies',
  updatePayrollPolicy: 'update payroll policies',
  updatePayrollPolicyWithToken: 'update payroll policies',
  deletePayrollPolicy: 'delete payroll policies',
  deletePayrollPolicyWithToken: 'delete payroll policies',
  getAttendancePolicies: 'view attendance policies',
  createAttendancePolicy: 'add attendance policies',
  updateAttendancePolicy: 'update attendance policies',
  deleteAttendancePolicy: 'delete attendance policies',
  getLeavePolicies: 'view leave policies',
  getLeavePolicyById: 'view leave policies',
  createLeavePolicy: 'add leave policies',
  updateLeavePolicy: 'update leave policies',
  deleteLeavePolicy: 'delete leave policies',
  getHrPolicyAssignments: 'view staff policy assignments',
  createHrPolicyAssignment: 'assign staff policies',
  createHrPolicyAssignmentWithToken: 'assign staff policies',
  upsertEmployeePolicyOverride: 'assign staff policies',
  previewPolicyAssignmentImpact: 'preview policy assignment impact',
  previewPolicyImpact: 'preview policy changes',
  downloadHrReportExport: 'download HR reports',
  downloadAcademicReport: 'download academic reports',
  downloadLibraryReportExport: 'download library reports',
  downloadVehicleDocument: 'download vehicle documents',
  downloadAttendanceTemplate: 'download attendance templates',
  downloadAttendanceImportFile: 'download attendance import files',
  downloadAttendanceImportErrorReport: 'download attendance import error reports',
  getFuelTypes: 'view fuel types',
  addFuelType: 'add fuel types',
  updateFuelType: 'update fuel types',
  deleteFuelType: 'delete fuel types',
  getSectionManagement: 'view library sections',
  getSectionManagementById: 'view library sections',
  addSectionManagement: 'add library sections',
  updateSectionManagement: 'update library sections',
  deleteSectionManagement: 'delete library sections',
  getBoards: 'view academic boards',
  getBoardById: 'view academic boards',
  getBoardOptions: 'view academic board options',
  addBoard: 'add academic boards',
  updateBoard: 'update academic boards',
  deleteBoard: 'delete academic boards',
};

export function getPermissionOperation(endpointName: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(permissionOperations, endpointName)
    ? permissionOperations[endpointName]
    : undefined;
}

export function formatPermissionDenied(context: PermissionDeniedContext = {}): string {
  return `Your account cannot ${context.operation || 'complete this action'}. Ask your ${context.administrator || 'administrator'} ${recovery}`;
}

const normalizedText = (value: string) =>
  value.trim().replace(/[’‘]/g, "'").replace(/[.!]+$/g, '').toLowerCase();

const genericPermissionMessages = new Set([
  'forbidden',
  '403 forbidden',
  'access denied',
  'permission denied',
  'authorization failed',
  "you don't have permission to access this resource",
  'you do not have permission to access this resource',
  "you don't have permission to perform this action",
  'you do not have permission to perform this action',
  'you do not have permission to make this change',
  'you are not authorized',
  'you are not authorized to access this resource',
  'you are not authorized to perform this action',
  'you are not authorized to perform this operation',
  'you are not allowed to perform this operation',
  'request failed with status code 403',
  `access denied for this action. ask your administrator ${recovery.slice(0, -1)}`,
]);

export function isGenericPermissionMessage(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const message = normalizedText(value);
  return (
    genericPermissionMessages.has(message) ||
    /^authorization failed! given (?:polic(?:y has|ies have)|requirements? has) not (?:been )?granted(?: for given resource)?(?:[.:][\s\S]*)?$/.test(
      message
    )
  );
}

export function isPermissionDeniedMessage(value: unknown): boolean {
  return (
    typeof value === 'string' &&
    /^(?:Your account cannot [^\r\n]+|Access denied for [^\r\n]+)\. Ask your (?:platform )?administrator to review your permissions and assigned data access, then try again\.$/.test(
      value
    )
  );
}

type ErrorRecord = Record<string, unknown>;

const record = (value: unknown): ErrorRecord | undefined =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as ErrorRecord)
    : undefined;

const genericWrappers = new Set([
  'error',
  'something went wrong',
  'business rule violated',
  'validation error',
  'validation failed',
  'one or more business rules were violated',
  'one or more validation errors occurred',
]);

const messageFields = ['Reason', 'Message', 'message', 'detail', 'details', 'title'] as const;

const hasSpecificMessage = (value: unknown, depth = 0): boolean => {
  if (typeof value === 'string') {
    return Boolean(
      value.trim() &&
        !isGenericPermissionMessage(value) &&
        !genericWrappers.has(normalizedText(value))
    );
  }
  if (depth > 3) return false;
  if (Array.isArray(value)) return value.some((item) => hasSpecificMessage(item, depth + 1));
  const source = record(value);
  if (!source) return false;
  return (
    messageFields.some((key) => hasSpecificMessage(source[key], depth + 1)) ||
    ['error', 'data', 'validationErrors'].some((key) =>
      hasSpecificMessage(source[key], depth + 1)
    ) ||
    Object.values(record(source.errors) ?? {}).some((item) =>
      hasSpecificMessage(item, depth + 1)
    )
  );
};

const getCode = (payload: ErrorRecord | undefined): unknown =>
  payload?.errorCode ?? payload?.code ?? record(payload?.error)?.code;

const isAuthorizationCode = (code: unknown) =>
  code === 403 ||
  (typeof code === 'string' &&
    (/^Volo\.Authorization:01000[1-5]$/.test(code) ||
      ['403', 'FORBIDDEN', 'Forbidden', 'PERMISSION_DENIED', 'AUTHORIZATION_FAILED'].includes(code)));

const replaceGenericFields = (value: unknown, message: string, depth = 0): ErrorRecord => {
  const source = record(value) ?? {};
  const result = { ...source };
  messageFields.forEach((key) => {
    if (isGenericPermissionMessage(source[key])) result[key] = message;
  });
  if (isGenericPermissionMessage(source.error)) result.error = message;
  if (depth < 3) {
    ['error', 'data'].forEach((key) => {
      if (record(source[key])) result[key] = replaceGenericFields(source[key], message, depth + 1);
    });
  }
  return result;
};

const normalizePayload = (value: unknown, message: string): ErrorRecord => {
  const result: ErrorRecord = { ...replaceGenericFields(value, message), detail: message, message };
  const remote = record(result.error);
  if (remote) result.error = { ...remote, message };
  return result;
};

export function normalizePermissionDeniedError<T>(
  error: T,
  context: PermissionDeniedContext = {}
): T {
  if (typeof error === 'string') {
    return (isGenericPermissionMessage(error) ? formatPermissionDenied(context) : error) as T;
  }

  const source = record(error);
  if (!source) return error;
  const response = record(source.response);
  const status =
    source.status === 'PARSING_ERROR'
      ? source.originalStatus
      : source.status ?? response?.status;
  if (status !== undefined && status !== 403 && status !== '403') return error;

  const hasResponseData = Boolean(response && 'data' in response);
  const hasProblemBody =
    messageFields.some((key) => key !== 'message' && key in source) ||
    'errorCode' in source ||
    'code' in source ||
    Boolean(record(source.error));
  const hasTransportData = 'data' in source && !hasProblemBody;
  const payload = hasResponseData
    ? response?.data
    : hasTransportData
      ? source.data
      : source;
  const code = getCode(record(payload));
  if (code !== undefined && code !== null && code !== '' && !isAuthorizationCode(code)) return error;
  if (hasSpecificMessage(payload) || (payload !== source && hasSpecificMessage(source.message))) {
    return error;
  }

  const remote = record(record(payload)?.error);
  const hasGenericDenial = [
    payload,
    ...messageFields.map((key) => record(payload)?.[key]),
    remote?.message,
    source.message,
    source.error,
  ].some(isGenericPermissionMessage);
  if (status !== 403 && status !== '403' && !hasGenericDenial) return error;

  const message = formatPermissionDenied(context);
  const normalizedPayload = normalizePayload(payload, message);
  if (hasResponseData) {
    return { ...source, message, response: { ...response, data: normalizedPayload } } as T;
  }
  if (hasTransportData || (!hasProblemBody && (status === 403 || status === '403'))) {
    const result: ErrorRecord = { ...source, data: normalizedPayload };
    if (isGenericPermissionMessage(source.message)) result.message = message;
    if (isGenericPermissionMessage(source.error)) result.error = message;
    return result as T;
  }
  return normalizedPayload as T;
}
