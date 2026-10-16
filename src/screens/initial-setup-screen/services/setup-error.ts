import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { normalizePermissionDeniedError } from 'src/utils/permission-denied';

const messages: Record<string, string> = {
  'ShikshaMitra:InitialSetup:EarlierStepsRequired': 'Complete the earlier setup steps first.',
  'ShikshaMitra:InitialSetup:ReviewRequired': 'Review the setup before finishing.',
  'ShikshaMitra:InitialSetup:AlreadyCompleted': 'Initial setup is already complete.',
  'ShikshaMitra:InitialSetup:YearRequired': 'Create the academic year first.',
  'ShikshaMitra:InitialSetup:InvalidStructure':
    'Enter a board, medium, stage, class, division, positive minimum age and capacity.',
  'ShikshaMitra:InitialSetup:SaveStepRequired':
    'Save this step’s required information before continuing.',
  'ShikshaMitra:InitialSetup:ProfileRequired': 'Complete the institute profile before finishing.',
  'ShikshaMitra:InitialSetup:ValidYearRequired': 'Create a valid academic year before finishing.',
  'ShikshaMitra:InitialSetup:CompleteStructureRequired':
    'Complete a board, medium, stage, class and division for this academic year.',
  'ShikshaMitra:InitialSetup:ActiveAdministratorRequired':
    'An active administrator account is required to complete setup.',
  'ShikshaMitra:InitialSetup:UserRequestReused':
    'This request already created another account. Start a new user form.',
  'ShikshaMitra:InitialSetup:UserLimitReached':
    'Add further users from User management after setup.',
  'ShikshaMitra:InitialSetup:LegacyWriteUnsupported':
    'Use the initial setup workflow to save and validate each step.',
  'ShikshaMitra:InitialSetup:UnconfirmedChanges': 'Save the changed setup steps before finishing.',
};
export function setupError(error: unknown) {
  const status = error && typeof error === 'object' && 'status' in error ? error.status : undefined;
  if (status === 409)
    return 'Another administrator changed this setup. Your entries are still here. Reload the saved setup before continuing.';
  const problem = parseApiProblemDetail(
    normalizePermissionDeniedError(error, { operation: 'change institute setup' })
  );
  if (problem.errorCode && messages[problem.errorCode]) return messages[problem.errorCode];
  return problem.detail === 'Something went wrong'
    ? 'Unable to save your progress. Your entries are still here; please retry.'
    : problem.detail;
}

export function isSetupConflict(error: unknown) {
  if (!error || typeof error !== 'object' || !('status' in error) || error.status !== 409)
    return false;
  const problem = parseApiProblemDetail(error);
  return (
    !/DuplicateEmail|DuplicateUserName/i.test(problem.errorCode ?? '') &&
    !/(email|user\s*name).*(already|in use|taken|exists)/i.test(problem.detail)
  );
}
