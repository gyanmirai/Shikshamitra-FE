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
import { Box, Link, Alert, Stack, Button, Divider, Skeleton, Typography } from '@mui/material';
import {
  useGetCompensationRevisionsQuery,
  useGetEffectiveCompensationRevisionQuery,
} from 'src/redux/hr/compensation-revision-api';

import { staffSalaryEditorHref } from './payroll-profile-utils';
import { StatutoryProfileEditor } from './statutory-profile-editor';
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

function DetailRowsSkeleton({ label, rows = 4 }: { label: string; rows?: number }) {
  return (
    <Stack role="status" aria-label={label} spacing={1}>
      {Array.from({ length: rows }, (_, index) => (
        <Box
          key={index}
          aria-hidden
          sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2 }}
        >
          <Skeleton width="70%" />
          <Skeleton width={index % 2 ? '80%' : '55%'} />
        </Box>
      ))}
    </Stack>
  );
}

const salaryColumns = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
  gap: 2,
};

function SalarySummary({ revision }: { revision?: CompensationRevision }) {
  return (
    <Box
      component={revision ? 'dl' : 'div'}
      sx={{ m: 0, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}
    >
      {(['Gross salary', 'Estimated net salary'] as const).map((label, index) => (
        <Box
          key={label}
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: 1,
            bgcolor: 'background.neutral',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            component={revision ? 'dt' : 'div'}
            variant="body2"
            color="text.secondary"
            sx={{ pb: 0.5 }}
          >
            {label}
          </Typography>
          {revision ? (
            <Typography
              component="dd"
              variant="h5"
              sx={{
                m: 0,
                mt: 'auto',
                overflowWrap: 'anywhere',
                fontVariantNumeric: 'tabular-nums',
                color: index ? 'primary.main' : 'text.primary',
              }}
            >
              {formatCurrency(index ? revision.netSalary : revision.grossSalary)}
            </Typography>
          ) : (
            <Skeleton aria-hidden width="70%" height={36} sx={{ mt: 'auto' }} />
          )}
        </Box>
      ))}
    </Box>
  );
}

function SalarySkeleton() {
  return (
    <Stack role="status" aria-label="Loading salary details" spacing={2}>
      <SalarySummary />
      <DetailRowsSkeleton label="Loading salary reference" rows={2} />
      <Divider />
      <Box sx={salaryColumns}>
        {['Regular earnings', 'Regular deductions'].map((label) => (
          <Stack key={label} spacing={1}>
            <Typography variant="subtitle2">{label}</Typography>
            <DetailRowsSkeleton label={`Loading ${label.toLowerCase()}`} rows={3} />
          </Stack>
        ))}
      </Box>
    </Stack>
  );
}

function SalaryBreakdown({ revision }: { revision: CompensationRevision }) {
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
    <Box sx={salaryColumns}>
      {[true, false].map((isEarning) => (
        <Box key={String(isEarning)} sx={{ minWidth: 0 }}>
          <Typography
            component="h3"
            variant="subtitle2"
            sx={{
              pb: 1,
              borderBottom: '2px solid',
              borderColor: isEarning ? 'primary.main' : 'warning.main',
            }}
          >
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
                  sx={{ py: 1 }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                      {line.name}
                    </Typography>
                    {line.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', overflowWrap: 'anywhere' }}
                      >
                        {line.description}
                      </Typography>
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      flexShrink: 0,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      fontVariantNumeric: 'tabular-nums',
                    }}
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
        </Box>
      ))}
    </Box>
  );
}

export function PayrollProfileWorkspace({
  employeeId,
  employeeName = 'Staff',
  origin = 'staff-profile',
  detailsContent,
  actionsDisabled = false,
  statutoryEditorRef,
  onStatutoryStateChange,
}: {
  employeeId: string;
  employeeName?: string;
  origin?: 'staff-profile' | 'staff-edit';
  detailsContent?: (values: PayrollProfileDetails, canEdit: boolean) => ReactNode;
  actionsDisabled?: boolean;
  statutoryEditorRef?: React.Ref<import('./statutory-profile-editor').StatutoryProfileEditHandle>;
  onStatutoryStateChange?: (state: { dirty: boolean; busy: boolean }) => void;
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
    <Stack
      spacing={2}
      sx={{
        minWidth: 0,
        '@media (prefers-reduced-motion: reduce)': { '& .MuiSkeleton-root': { animation: 'none' } },
      }}
    >
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
              target="_blank"
              rel="noopener noreferrer"
              title="Opens salary setup in a new tab. Unsaved payroll changes stay in this tab."
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
        {origin === 'staff-edit' && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Salary setup opens in a new tab. Keep this tab open to preserve unsaved payroll changes,
            then use Save &amp; Next when you return.
          </Typography>
        )}
        {!canReadSalary ? (
          <Typography variant="body2" color="text.secondary">
            You do not have permission to view salary.
          </Typography>
        ) : salary.isLoading ? (
          <SalarySkeleton />
        ) : salary.isError ? (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => salary.refetch()}>
                Retry
              </Button>
            }
          >
            Unable to load salary.
          </Alert>
        ) : salary.data ? (
          <>
            <SalarySummary revision={salary.data} />
            <DetailRows
              rows={[
                ['Effective from', fDate(salary.data.effectiveMonth, 'MMM YYYY')],
                [
                  'Salary template',
                  templateId
                    ? `${template.data?.name || 'Assigned template'}${salary.data.sourceSalaryTemplateVersion ? ` · Version ${salary.data.sourceSalaryTemplateVersion}` : ''}`
                    : 'No template reference',
                ],
              ]}
            />
            <Typography variant="caption" color="text.secondary">
              Payroll uses current registration, rules, attendance and adjustments. This saved net
              estimate excludes monthly attendance effects and one-time adjustments.
            </Typography>
            <Divider />
            <SalaryBreakdown revision={salary.data} />
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No salary is effective for {fDate(`${month}-01`, 'MMM YYYY')}. Set up salary before
            processing payroll.
          </Typography>
        )}
        {canReadSalary &&
          (revisions.isLoading ? (
            <Skeleton aria-label="Loading scheduled salary changes" width="45%" />
          ) : revisions.isError ? (
            <Alert
              severity="warning"
              action={
                <Button size="small" onClick={() => revisions.refetch()}>
                  Retry
                </Button>
              }
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
      {(canReadSalary || can(hrPermissions.payroll.settings.statutorySchemes)) && (
        <FormSectionCard
          icon="mdi:shield-check-outline"
          title="PF and ESIC"
          action={<EmployeeEsiDetails employeeId={employeeId} employeeName={employeeName} />}
        >
          <StatutoryProfileEditor
            employeeId={employeeId}
            grossSalary={salary.data?.grossSalary}
            disabled={actionsDisabled}
            editorRef={statutoryEditorRef}
            onEditorStateChange={onStatutoryStateChange}
            guardNavigation={!onStatutoryStateChange}
          />
        </FormSectionCard>
      )}
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
          <DetailRowsSkeleton label="Loading assigned policies" rows={6} />
        ) : policies.isError ? (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => policies.refetch()}>
                Retry
              </Button>
            }
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
        <>
          <FormSectionCard icon="mdi:bank-outline" title="Bank details">
            <DetailRowsSkeleton label="Loading bank details" rows={5} />
          </FormSectionCard>
          <FormSectionCard icon="mdi:clock-outline" title="Attendance integration">
            <DetailRowsSkeleton label="Loading attendance integration" rows={2} />
          </FormSectionCard>
        </>
      ) : details.isError && (!detailsContent || !details.data) ? (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => details.refetch()}>
              Retry
            </Button>
          }
        >
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
