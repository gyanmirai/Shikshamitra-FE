import { parseApiProblemDetail } from 'src/utils/api-problem-details';

export function getAccountSettingSaveError(error: unknown, kind: 'category' | 'bank') {
  const problem = parseApiProblemDetail(error);
  if (problem.errorCode === 'Finance:Accounts:Settings:DuplicateName') {
    return kind === 'bank'
      ? {
          field: 'accountNumber',
          message: 'This account number already exists for the academic year.',
        }
      : { field: 'name', message: 'This category name already exists for the academic year.' };
  }
  if (problem.errorCode === 'Finance:Accounts:Settings:BankAccountInUse') {
    return {
      message:
        'This bank account is in use. Its account number, IFSC and UPI ID cannot be changed.',
    };
  }
  return { message: problem.detail };
}
