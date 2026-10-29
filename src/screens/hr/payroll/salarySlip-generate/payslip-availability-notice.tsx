import type { RootState } from 'src/redux/store';
import type { PayslipAvailability } from 'src/redux/runPayroll/payslip-availability-api';

import { useSelector } from 'react-redux';
import { useRef, useEffect } from 'react';
import { RouterLink } from 'src/routes/components';
import { Stack, Button, Typography } from '@mui/material';
import { hasGrantedPermission } from 'src/utils/permissions';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { HrNotice, HrLoadingNotice } from 'src/screens/hr/components/hr-notice';
import { useGetPayslipAvailabilityQuery } from 'src/redux/runPayroll/payslip-availability-api';

const messages: Record<PayslipAvailability['status'], string> = {
  UNAVAILABLE:
    'Payroll is unavailable for this staff member and pay period. Choose an eligible pay period or ask your HR administrator to review employment dates and payroll eligibility.',
  NOT_PREPARED:
    'Payroll has not been prepared for this staff member and pay period. Prepare, review and lock payroll to issue the payslip.',
  PREPARING:
    'Payroll is being prepared for this pay period. Wait for calculation to finish, then review and lock payroll for this staff member.',
  FAILED:
    'Payroll preparation did not finish. Retry the payroll preview, resolve its issues, then review and lock payroll for this staff member.',
  PENDING:
    'Payroll is not locked for this staff member and pay period. Review the current payroll amounts and resolve any blocking issues before locking.',
  REVIEWED:
    'Payroll is reviewed but not locked for this staff member and pay period. Lock the reviewed row to issue the payslip.',
  ISSUANCE_REQUIRED:
    'Payroll is finalized, but the issued payslip document is unavailable. Ask your HR administrator to investigate the missing document.',
  AVAILABLE:
    'Payroll is locked and the payslip has been issued. Reload payslips to display the document.',
};

export default function PayslipAvailabilityNotice({
  employeeId,
  monthYear,
  reload,
}: {
  employeeId: string;
  monthYear: string;
  reload: () => void;
}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const year = useSelector((state: RootState) => state.globalState?.currentYear);
  const academicYearId =
    year?.id &&
    (!year.startDate || monthYear >= year.startDate.slice(0, 7)) &&
    (!year.endDate || monthYear <= year.endDate.slice(0, 7))
      ? year.id
      : undefined;
  const canOpenPayroll = hasGrantedPermission(
    permissions,
    `${hrPermissions.payroll.runPayroll}.View`
  );
  const availability = useGetPayslipAvailabilityQuery(
    { employeeId, monthYear, ...(academicYearId ? { academicYearId } : {}) },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      pollingInterval: 10000,
      skipPollingIfUnfocused: true,
    }
  );
  const data = availability.currentData;
  const matches = data?.employeeId === employeeId && data.monthYear === monthYear;
  const reloaded = useRef('');
  useEffect(() => {
    const key = `${employeeId}:${monthYear}`;
    if (
      matches &&
      !availability.isError &&
      data?.status === 'AVAILABLE' &&
      reloaded.current !== key
    ) {
      reloaded.current = key;
      reload();
    }
  }, [employeeId, monthYear, matches, data?.status, availability.isError, reload]);
  if (availability.isError) {
    const denied =
      availability.error &&
      'status' in availability.error &&
      [401, 403].includes(Number(availability.error.status));
    return (
      <HrNotice
        severity="error"
        action={
          <Button size="small" onClick={() => availability.refetch()}>
            Retry status
          </Button>
        }
      >
        {denied
          ? 'You do not have access to payroll status for this staff member.'
          : 'Payroll status could not be checked. Retry to find out whether this payslip is available.'}
      </HrNotice>
    );
  }
  if (!matches)
    return (
      <HrLoadingNotice>
        Checking payslip availability for this staff member and pay period…
      </HrLoadingNotice>
    );
  const message = messages[data.status];
  const showPayrollLink =
    canOpenPayroll &&
    ['NOT_PREPARED', 'PREPARING', 'FAILED', 'PENDING', 'REVIEWED'].includes(data.status);
  return (
    <HrNotice
      severity={
        data.status === 'FAILED' || data.status === 'ISSUANCE_REQUIRED' ? 'warning' : 'info'
      }
    >
      <Stack spacing={1} alignItems="flex-start">
        <Typography variant="body2">
          {message ??
            'Payslip availability is unknown. Retry the status check or ask your HR administrator for help.'}
        </Typography>
        {showPayrollLink ? (
          <Button
            size="small"
            component={RouterLink}
            href={`${hrPaths.payroll.runPayroll}?month=${encodeURIComponent(monthYear)}&employeeId=${encodeURIComponent(employeeId)}`}
          >
            Open Run Payroll
          </Button>
        ) : null}
        {!canOpenPayroll &&
          data.status !== 'AVAILABLE' &&
          data.status !== 'ISSUANCE_REQUIRED' &&
          data.status !== 'UNAVAILABLE' && (
            <Typography variant="body2">
              Ask your HR administrator to complete payroll for this staff member.
            </Typography>
          )}
        <Button
          size="small"
          onClick={() => {
            availability.refetch();
            reload();
          }}
        >
          Reload payslips
        </Button>
      </Stack>
    </HrNotice>
  );
}
