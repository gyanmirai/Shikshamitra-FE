import type { EmployeeStatusDeactivationCheck } from 'src/redux/hr/employeeApi';

import { Alert, Stack, AlertTitle } from '@mui/material';

export function StaffLibraryClearanceNotice({
  check,
}: {
  check?: EmployeeStatusDeactivationCheck;
}) {
  const status = check?.libraryClearanceStatus;
  if (!status) return null;
  const count = check?.libraryOutstandingLoanCount;
  const custody = check?.libraryOutstandingCustodyCount;
  let message: string;
  switch (status) {
    case 'Pending':
      message =
        count == null
          ? 'The outstanding loan count is unavailable.'
          : count === 1
            ? '1 outstanding Library loan is recorded.'
            : `${count} outstanding Library loans are recorded.`;
      break;
    case 'Clear':
      message = 'Library records show 0 outstanding loans.';
      break;
    case 'Limited':
      message =
        count == null
          ? 'School-wide clearance requires full Library scope.'
          : `${count} outstanding Library ${count === 1 ? 'loan' : 'loans'} in your scope. School-wide clearance requires full Library scope.`;
      break;
    case 'Restricted':
      message = 'Library member access is required to review outstanding loans.';
      break;
    default:
      return null;
  }
  return (
    <Alert
      severity={status === 'Pending' || (custody ?? 0) > 0 ? 'warning' : 'info'}
      variant="outlined"
    >
      <AlertTitle>Library clearance</AlertTitle>
      <Stack spacing={0.5}>
        <span>{message}</span>
        {custody != null && (
          <span>
            {custody} outstanding classroom custody {custody === 1 ? 'copy' : 'copies'}.
          </span>
        )}
      </Stack>
    </Alert>
  );
}
