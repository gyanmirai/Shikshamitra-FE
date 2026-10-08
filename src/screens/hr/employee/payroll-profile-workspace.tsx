import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';
import type { CompensationRevision } from 'src/redux/hr/compensation-revision-api';
import type { PayrollProfileDetails } from 'src/redux/hr/employee-payroll-profile-api';

import dayjs from 'dayjs';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { fDate } from 'src/utils/format-time';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { hasGrantedPermission } from 'src/utils/permissions';
import { RouterLink } from 'src/routes/components/router-link';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { useGetBankDetailsQuery } from 'src/redux/hr/employeeApi';
import { FormSectionCard } from 'src/components/form-section-card';
import { useGetSalaryTemplateQuery } from 'src/redux/hr/salary-template-api';
import { useGetPolicyAssignmentPreviewQuery } from 'src/redux/hr/hr-policy-api';
import {
  Box,
  Grid,
  Link,
  Alert,
  Stack,
  Button,
  Divider,
  Skeleton,
  Typography,
} from '@mui/material';
import {
  useGetCompensationRevisionsQuery,
  useGetEffectiveCompensationRevisionQuery,
} from 'src/redux/hr/compensation-revision-api';

import { staffSalaryEditorHref } from './payroll-profile-utils';
import { EmployeeEsiDetails } from '../payroll/setting/employee-esi-details';
import { PayrollProfilePolicyEditor } from './payroll-profile-policy-editor';
import { PayrollProfileDetailsEditor } from './payroll-profile-details-editor';
import { useSalaryEditorPrefetch } from '../payroll/structure/use-salary-editor-prefetch';

function DetailRows({ rows }: { rows: Array<[string, string | number | null | undefined]> }) {
  return (
    <Box component="dl" sx={{ m: 0 }}>
      {rows.map(([label, value]) => (
        <Box
          key={label}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'minmax(130px, 1fr) 2fr' },
            gap: 0.5,
            py: 0.75,
          }}
        >
          <Typography component="dt" variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography component="dd" variant="body2" sx={{ m: 0, overflowWrap: 'anywhere' }}>
            {value ?? 'Not provided'}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function SalaryBreakdown({
  revision,
  stacked,
}: {
  revision: CompensationRevision;
  stacked: boolean;
}) {
  const displayLines = [
    ...revision.lines,
    ...(revision.estimatedStatutoryDeductions || []).map((line, index) => ({
      ...line,
      id: `statutory-${line.code}`,
      description: null,
      isEarning: false,
      displayOrder: revision.lines.length + index,
    })),
  ];
  return (
    <Grid container spacing={2}>
      {[true, false].map((isEarning) => (
        <Grid key={String(isEarning)} size={{ xs: 12, lg: stacked ? 12 : 6 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {isEarning ? 'Regular earnings' : 'Regular deductions'}
          </Typography>
          <Stack divider={<Divider />}>
            {displayLines
              .filter((line) => line.isEarning === isEarning)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((line) => (
                <Stack
                  key={line.id}
                  direction="row"
                  justifyContent="space-between"
                  gap={2}
                  sx={{ py: 0.75 }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2">{line.name}</Typography>
                    {line.description && (
                      <Typography variant="caption" color="text.secondary">
                        {line.description}
                      </Typography>
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatCurrency(line.amount)}
                  </Typography>
                </Stack>
              ))}
            {!displayLines.some((line) => line.isEarning === isEarning) && (
              <Typography variant="body2" color="text.secondary">
                No regular {isEarning ? 'earnings' : 'deductions'}.
              </Typography>
            )}
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
}

export function PayrollProfileWorkspace({
  employeeId,
  employeeName = 'Staff',
  origin = 'staff-profile',
  detailsContent,
  actionsDisabled = false,
}: {
  employeeId: string;
  employeeName?: string;
  origin?: 'staff-profile' | 'staff-edit';
  detailsContent?: (values: PayrollProfileDetails, canEdit: boolean) => ReactNode;
  actionsDisabled?: boolean;
}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const prefetchSalaryEditor = useSalaryEditorPrefetch(employeeId);
  const academicYearId = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const can = (permission: string) => hasGrantedPermission(permissions, permission);
  const canManageSalary = can(hrPermissions.payroll.compensationRevisionActions.manage);
  const canReadSalary =
    canManageSalary || can(hrPermissions.payroll.compensationRevisionActions.view);
  const canReadPolicies = can(hrPermissions.policyActions.view);
  const canAssignPolicies =
    can(hrPermissions.policyActions.assign) && can(hrPermissions.policyActions.previewImpact);
  const canEditDetails =
    can(`${hrPermissions.employee.list}.Edit`) &&
    can(hrPermissions.payroll.payrollStructureActions.add);
  const [editor, setEditor] = useState<'details' | 'policies' | null>(null);
  const month = dayjs().format('YYYY-MM');
  const queryOptions = { skip: !employeeId, refetchOnMountOrArgChange: true, refetchOnFocus: true };
  const details = useGetBankDetailsQuery(employeeId, queryOptions);
  const salary = useGetEffectiveCompensationRevisionQuery(
    { employeeId, month },
    { ...queryOptions, skip: !employeeId || !canReadSalary }
  );
  const revisions = useGetCompensationRevisionsQuery(employeeId, {
    ...queryOptions,
    skip: !employeeId || !canReadSalary,
  });
  const policies = useGetPolicyAssignmentPreviewQuery(
    { employeeId, academicYearId, date: dayjs().format('YYYY-MM-DD') },
    { ...queryOptions, skip: !employeeId || !academicYearId || !canReadPolicies }
  );
  const templateId = salary.data?.sourceSalaryTemplateId || '';
  const template = useGetSalaryTemplateQuery(templateId, {
    skip: !templateId || !can(hrPermissions.payroll.settings.salaryTemplateActions.view),
  });
  const scheduled = (revisions.data?.items || [])
    .filter((item) => item.isScheduled && item.status !== 'SUPERSEDED')
    .sort((a, b) => a.effectiveMonth.localeCompare(b.effectiveMonth));
  const bank = details.data?.bankDetails;
  const identifiers = details.data?.salaryDetails;
  const initialDetails: PayrollProfileDetails = {
    bankDetails: {
      bankName: bank?.bankName || '',
      branchName: bank?.branchName || '',
      accountHolderName: bank?.accountHolderName || '',
      accountNumber: bank?.accountNumber || '',
      ifscCode: bank?.ifscCode || '',
    },
    statutoryIdentifiers: {
      epfNumber: identifiers?.epfNumber || '',
      uanNumber: identifiers?.uanNumber || '',
    },
    attendanceIntegration: {
      punchId: identifiers?.punchId || '',
      totalWorkingHourPerMonth: identifiers?.totalWorkingHourPerMonth ?? null,
    },
  };
  const effective = policies.currentData;
  if (!employeeId)
    return <Alert severity="info">Save staff information before setting up payroll.</Alert>;
  return (
    <Stack spacing={1}>
      <FormSectionCard
        icon="mdi:cash-multiple"
        title="Salary"
        action={
          canManageSalary &&
          !salary.isError &&
          !salary.isLoading && (
            <Button
              component={RouterLink}
              href={staffSalaryEditorHref(employeeId, origin)}
              onMouseEnter={actionsDisabled ? undefined : prefetchSalaryEditor}
              onFocus={actionsDisabled ? undefined : prefetchSalaryEditor}
              size="small"
              variant="outlined"
              disabled={actionsDisabled}
            >
              {salary.data ? 'Change salary' : 'Set up salary'}
            </Button>
          )
        }
      >
        {!canReadSalary ? (
          <Typography variant="body2" color="text.secondary">
            You do not have permission to view salary.
          </Typography>
        ) : salary.isLoading ? (
          <Skeleton height={150} variant="rounded" />
        ) : salary.isError ? (
          <Alert severity="error" action={<Button onClick={() => salary.refetch()}>Retry</Button>}>
            Unable to load salary.
          </Alert>
        ) : salary.data ? (
          <>
            <DetailRows
              rows={[
                ['Effective from', fDate(salary.data.effectiveMonth, 'MMM YYYY')],
                ['Gross salary', formatCurrency(salary.data.grossSalary)],
                ['Estimated net salary', formatCurrency(salary.data.netSalary)],
                [
                  'Salary template',
                  templateId
                    ? `${template.data?.name || 'Assigned template'}${salary.data.sourceSalaryTemplateVersion ? ` · Version ${salary.data.sourceSalaryTemplateVersion}` : ''}`
                    : 'No template reference',
                ],
              ]}
            />
            <Typography variant="caption" color="text.secondary">
              Estimated net salary excludes monthly attendance effects and one-time adjustments.
            </Typography>
            <Divider />
            <SalaryBreakdown revision={salary.data} stacked={origin === 'staff-edit'} />
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No salary is effective for {fDate(`${month}-01`, 'MMM YYYY')}. Set up salary before
            processing payroll.
          </Typography>
        )}
        {canReadSalary &&
          (revisions.isLoading ? (
            <Skeleton height={30} />
          ) : revisions.isError ? (
            <Alert
              severity="warning"
              action={<Button onClick={() => revisions.refetch()}>Retry</Button>}
            >
              Scheduled salary changes could not be loaded.
            </Alert>
          ) : (
            scheduled.length > 0 && (
              <Box>
                <Typography variant="subtitle2">Scheduled changes</Typography>
                <DetailRows
                  rows={scheduled.map((revision) => [
                    `From ${fDate(revision.effectiveMonth, 'MMM YYYY')}`,
                    `Gross ${formatCurrency(revision.grossSalary)} · Estimated net ${formatCurrency(revision.netSalary)}`,
                  ])}
                />
              </Box>
            )
          ))}
        {can(`${hrPermissions.payroll.runPayroll}.View`) && (
          <Link href={hrPaths.payroll.runPayroll} variant="body2">
            One-time adjustments are managed in monthly payroll
          </Link>
        )}
      </FormSectionCard>
      <FormSectionCard
        icon="mdi:clipboard-check-outline"
        title="Assigned policies"
        action={
          canAssignPolicies &&
          effective &&
          !policies.isFetching &&
          !policies.isError && (
            <Button
              size="small"
              variant="outlined"
              disabled={actionsDisabled}
              onClick={() => setEditor('policies')}
            >
              Change assignment
            </Button>
          )
        }
      >
        {!canReadPolicies ? (
          <Typography variant="body2" color="text.secondary">
            You do not have permission to view assigned policies.
          </Typography>
        ) : !academicYearId ? (
          <Typography variant="body2">Select an academic year to view policies.</Typography>
        ) : policies.isFetching ? (
          <Skeleton variant="rounded" height={180} />
        ) : policies.isError ? (
          <Alert
            severity="error"
            action={<Button onClick={() => policies.refetch()}>Retry</Button>}
          >
            Unable to resolve policies. Retry to see the applicable assignment.
          </Alert>
        ) : effective ? (
          <>
            <Typography variant="body2">
              {effective.policySource === 'employee'
                ? 'Employee-specific assignment'
                : 'Organization policies'}
              {effective.matchedTargetDisplayName ? ` · ${effective.matchedTargetDisplayName}` : ''}
            </Typography>
            <DetailRows
              rows={[
                [
                  'Effective from',
                  effective.assignment?.effectiveFrom
                    ? fDate(effective.assignment.effectiveFrom)
                    : `Resolved for ${fDate(effective.date)}`,
                ],
                ['Payroll policy', effective.payrollPolicy?.name || 'Not assigned'],
                ['Attendance policy', effective.attendancePolicy?.name || 'Not assigned'],
                [
                  'Leave policy',
                  effective.leavePolicy?.policyTitle ||
                    effective.leavePolicy?.name ||
                    'Not assigned',
                ],
                ['Payroll calendar', effective.payrollWorkCalendarPolicy?.name || 'Not assigned'],
                [
                  'Attendance calendar',
                  effective.attendanceWorkCalendarPolicy?.name || 'Not assigned',
                ],
              ]}
            />
          </>
        ) : (
          <Typography variant="body2">No applicable policies found.</Typography>
        )}
      </FormSectionCard>
      {detailsContent && details.isError && details.data && (
        <Alert severity="warning">Unable to refresh details. Your edits are preserved.</Alert>
      )}
      {details.isLoading ? (
        <Skeleton height={200} variant="rounded" />
      ) : details.isError && (!detailsContent || !details.data) ? (
        <Alert severity="error" action={<Button onClick={() => details.refetch()}>Retry</Button>}>
          Unable to load payroll profile details.
        </Alert>
      ) : detailsContent ? (
        detailsContent(initialDetails, canEditDetails)
      ) : (
        <>
          <FormSectionCard
            icon="mdi:bank-outline"
            title="Bank details"
            action={
              canEditDetails && (
                <Button size="small" variant="outlined" onClick={() => setEditor('details')}>
                  Edit details
                </Button>
              )
            }
          >
            <DetailRows
              rows={[
                ['Bank', bank?.bankName || null],
                ['Branch', bank?.branchName || null],
                ['Account holder', bank?.accountHolderName || null],
                [
                  'Account number',
                  bank?.accountNumber ? `•••• ${bank.accountNumber.slice(-4)}` : null,
                ],
                ['IFSC code', bank?.ifscCode || null],
              ]}
            />
          </FormSectionCard>
          <FormSectionCard
            icon="mdi:card-account-details-outline"
            title="Statutory identifiers"
            action={<EmployeeEsiDetails employeeId={employeeId} employeeName={employeeName} />}
          >
            <DetailRows
              rows={[
                ['EPF number', identifiers?.epfNumber || null],
                ['UAN number', identifiers?.uanNumber || null],
              ]}
            />
          </FormSectionCard>
          <FormSectionCard icon="mdi:clock-outline" title="Attendance integration">
            <DetailRows
              rows={[
                ['Punch ID', identifiers?.punchId || null],
                ['Working hours per month', identifiers?.totalWorkingHourPerMonth],
              ]}
            />
          </FormSectionCard>
        </>
      )}
      {editor === 'details' && canEditDetails && (
        <PayrollProfileDetailsEditor
          employeeId={employeeId}
          initialValues={initialDetails}
          onClose={() => setEditor(null)}
        />
      )}
      {editor === 'policies' && canAssignPolicies && academicYearId && effective && (
        <PayrollProfilePolicyEditor
          employeeId={employeeId}
          academicYearId={academicYearId}
          preview={effective}
          onClose={() => setEditor(null)}
        />
      )}
    </Stack>
  );
}
