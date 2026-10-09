import { parseApiProblemDetail } from 'src/utils/api-problem-details';

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
  if (status === 403) return 'You do not have permission to make this change.';
  const problem = parseApiProblemDetail(error);
  if (problem.errorCode && messages[problem.errorCode]) return messages[problem.errorCode];
  return problem.detail === 'Something went wrong'
    ? 'Unable to save your progress. Your entries are still here; please retry.'
    : problem.detail;
}
