'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { EsiPolicy, EsiPolicyVersionInput } from 'src/redux/hr/esi-policy-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hrPermissions } from 'src/constants/hr-menus';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { formatPayrollCurrency } from 'src/utils/payroll-currency';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useGetEsiComponentTreatmentsQuery } from 'src/redux/hr/statutory-scheme-api';
import {
  Box,
  Grid,
  Chip,
  Stack,
  Alert,
  Button,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  useGetEsiPoliciesQuery,
  useCreateEsiPolicyMutation,
  useArchiveEsiPolicyMutation,
  useAddEsiPolicyVersionMutation,
} from 'src/redux/hr/esi-policy-api';

import { SectionCard } from '../../employee/employee-form-fields/InformationFields';

export default function EsiPolicies({ hasSchoolWideScope }: { hasSchoolWideScope: boolean }) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const rights = hrPermissions.payroll.settings.statutorySchemeActions;
  const canWrite =
    hasSchoolWideScope &&
    [rights.edit, rights.activate, rights.configureCalculation].every((permission) =>
      hasGrantedPermission(permissions, permission)
    );
  const query = useGetEsiPoliciesQuery();
  const [target, setTarget] = useState<EsiPolicy | 'new' | null>(null);
  const [view, setView] = useState<EsiPolicy | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<EsiPolicy | null>(null);
  const [archive, archiveState] = useArchiveEsiPolicyMutation();
  const [error, setError] = useState('');
  const rows = (query.data || []).map((policy) => ({
    ...policy,
    employeeRate: policy.versions[0]?.employeePercentage,
    employerRate: policy.versions[0]?.employerPercentage,
    ceiling: policy.versions[0]?.standardWageCeiling,
    effectiveFrom: policy.versions[0]?.effectiveFrom.slice(0, 10),
    status: policy.isArchived
      ? 'Archived'
      : !policy.versions.length
        ? 'Needs setup'
        : policy.versions.every(
              (version) => version.effectiveFrom.slice(0, 7) > dayjs().format('YYYY-MM')
            )
          ? 'Scheduled'
          : 'Active',
  }));
  const columns: IColumn[] = [
    {
      id: 'name',
      label: 'Policy',
      minWidth: 200,
      filterType: 'string',
      render: (value, row) => (
        <Button
          color="inherit"
          onClick={() => setView(row as EsiPolicy)}
          sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
        >
          {value}
        </Button>
      ),
    },
    { id: 'code', label: 'Code', minWidth: 150, filterType: 'string' },
    {
      id: 'employeeRate',
      label: 'Employee share',
      align: 'right',
      render: (value) => (value == null ? '-' : `${value}%`),
    },
    {
      id: 'employerRate',
      label: 'School share',
      align: 'right',
      render: (value) => (value == null ? '-' : `${value}%`),
    },
    {
      id: 'ceiling',
      label: 'Wage ceiling',
      align: 'right',
      render: (value) => (value == null ? '-' : formatPayrollCurrency(Number(value))),
    },
    { id: 'effectiveFrom', label: 'Latest version from', minWidth: 150 },
    {
      id: 'status',
      label: 'Status',
      render: (value) => <Chip size="small" variant="outlined" label={value} />,
    },
    {
      id: 'actions',
      label: 'Actions',
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      sticky: true,
      stickyPosition: 'right',
      minWidth: 120,
      render: (_, row) => (
        <ThreeDotsActions
          deleteLabel={`Delete ${String(row.fullName || row.employeeName || row.name || row.title || row.policyTitle || row.id || 'record')}`}
          showViewIcon
          showEditIcon={canWrite && !row.isArchived}
          showThreeDots={canWrite && !row.isArchived && !row.isDefault}
          viewLabel={`View ${row.name}`}
          editLabel={`New version of ${row.name}`}
          moreLabel={`More actions for ${row.name}`}
          handleViewClick={() => setView(row as EsiPolicy)}
          handleEditClick={() => setTarget(row as EsiPolicy)}
          actions={({ popover }) => (
            <MenuList dense>
              <MenuItem
                onClick={() => {
                  popover.onClose();
                  setArchiveTarget(row as EsiPolicy);
                }}
              >
                Archive
              </MenuItem>
            </MenuList>
          )}
        />
      ),
    },
  ];
  return (
    <Stack spacing={2} sx={{ minWidth: 0, minHeight: 0, height: 1 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h6">ESIC Policies</Typography>
          <Typography variant="body2" color="text.secondary">
            Choose a policy in salary templates. Payroll uses its effective version for each month.
          </Typography>
        </Box>
        {canWrite && (
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.addIcon} />}
            onClick={() => setTarget('new')}
          >
            Create policy
          </Button>
        )}
      </Stack>
      {!hasSchoolWideScope && (
        <Alert severity="info">School-wide HR scope is required to manage ESIC policies.</Alert>
      )}
      {query.isError ? (
        <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
          ESIC policies could not be loaded.
        </Alert>
      ) : (
        <CustomizableTable
          tableId="esi-policy-table"
          tableTitle="ESIC policies"
          columns={columns}
          data={rows}
          isLoading={query.isLoading}
          showColumns
          showExport
          exportScope="all"
          noDataText="No ESIC policies. Create a policy to use in salary templates."
          wrapperProps={{ sx: { minWidth: 0, flex: 1, minHeight: 0, overflow: 'hidden' } }}
          tableContainerProps={{ sx: { height: 1 } }}
        />
      )}
      {target && (
        <EsiPolicyEditor
          key={typeof target === 'string' ? target : target.id}
          policy={target === 'new' ? undefined : target}
          onClose={() => setTarget(null)}
        />
      )}
      <CustomDialog
        open={Boolean(view)}
        handleClose={() => setView(null)}
        title={view?.name || 'ESIC policy'}
        maxWidth="md"
        hasForm={false}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            <Typography variant="body2">
              {view?.code}
              {view?.isDefault ? ' · School default' : ''}
              {view?.isArchived ? ' · Archived' : ''}
            </Typography>
            {view?.versions.map((version) => (
              <SectionCard
                key={version.id}
                title={`Version ${version.version}`}
                gridProps={{ spacing: 2 }}
              >
                {[
                  ['Effective from', version.effectiveFrom.slice(0, 10)],
                  ['Applies until', version.appliesUntil?.slice(0, 10) || 'Until replaced'],
                  ['Employee share', `${version.employeePercentage}%`],
                  ['School share', `${version.employerPercentage}%`],
                  ['Standard wage ceiling', formatPayrollCurrency(version.standardWageCeiling)],
                  ['Disability wage ceiling', formatPayrollCurrency(version.disabilityWageCeiling)],
                  [
                    'Employee daily wage exemption',
                    formatPayrollCurrency(version.employeeShareDailyWageExemption),
                  ],
                  ['Rounding', version.roundingPolicy],
                  [
                    'Eligibility basis',
                    version.calculationSettings?.eligibilityBasis || 'School settings',
                  ],
                  [
                    'Contribution basis',
                    version.calculationSettings?.calculationBasis || 'School settings',
                  ],
                  ['Source', version.sourceUrl],
                  ['Verified on', version.sourceVerifiedOn.slice(0, 10)],
                ].map(([label, value]) => (
                  <Grid key={label} size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                      {value}
                    </Typography>
                  </Grid>
                ))}
              </SectionCard>
            ))}
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setView(null)}>
            Close
          </Button>
        </DialogActions>
      </CustomDialog>
      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onClose={() => {
          if (!archiveState.isLoading) {
            setArchiveTarget(null);
            setError('');
          }
        }}
        title={`Archive ${archiveTarget?.name || 'ESIC policy'}?`}
        content={
          <Stack spacing={1}>
            <Typography>
              New salary assignments cannot select this policy. Existing assignments and payroll
              history retain it.
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        }
        disableCancel={archiveState.isLoading}
        action={
          <Button
            variant="contained"
            loading={archiveState.isLoading}
            onClick={async () => {
              if (!archiveTarget) return;
              try {
                await archive({
                  id: archiveTarget.id,
                  concurrencyStamp: archiveTarget.concurrencyStamp,
                }).unwrap();
                setArchiveTarget(null);
                setError('');
                shikshaMitraToast.success({ message: 'ESIC policy archived.' });
              } catch (cause) {
                setError(parseApiProblemDetail(cause).detail);
              }
            }}
          >
            Archive
          </Button>
        }
      />
    </Stack>
  );
}

type Values = Record<
  | 'name'
  | 'code'
  | 'effectiveFrom'
  | 'sourceUrl'
  | 'sourceVerifiedOn'
  | 'employeePercentage'
  | 'employerPercentage'
  | 'standardWageCeiling'
  | 'disabilityWageCeiling'
  | 'employeeShareDailyWageExemption'
  | 'establishmentThreshold'
  | 'exclusionCapPercentage'
  | 'inKindCapPercentage'
  | 'roundingPolicy'
  | 'eligibilityBasis'
  | 'calculationBasis'
  | 'eligibilityComponentId'
  | 'calculationComponentId',
  string
>;
const numberSchema = (max: number) =>
  Yup.number().typeError('Enter a number.').required('Required.').min(0).max(max);
const schema = Yup.object({
  name: Yup.string().trim().required('Policy name is required.').max(160),
  code: Yup.string()
    .trim()
    .required('Policy code is required.')
    .matches(/^[A-Z][A-Z0-9_]*$/, 'Use uppercase letters, numbers and underscores.')
    .max(60),
  effectiveFrom: Yup.string()
    .required('Choose the effective month.')
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/),
  employeePercentage: numberSchema(100),
  employerPercentage: numberSchema(100),
  standardWageCeiling: numberSchema(100000000).moreThan(0),
  disabilityWageCeiling: numberSchema(100000000).min(
    Yup.ref('standardWageCeiling'),
    'Must be at least the standard ceiling.'
  ),
  employeeShareDailyWageExemption: numberSchema(100000000),
  establishmentThreshold: numberSchema(1000000).integer().moreThan(0),
  exclusionCapPercentage: numberSchema(100),
  inKindCapPercentage: numberSchema(100),
  sourceUrl: Yup.string()
    .required('Enter the policy source.')
    .url('Enter an HTTPS URL.')
    .matches(/^https:\/\//, 'Use an HTTPS URL.')
    .max(1000),
  sourceVerifiedOn: Yup.string().required('Choose the verification date.'),
  eligibilityComponentId: Yup.string().when('eligibilityBasis', {
    is: 'COMPONENT',
    then: (field) => field.required('Choose a component.'),
  }),
  calculationComponentId: Yup.string().when('calculationBasis', {
    is: 'COMPONENT',
    then: (field) => field.required('Choose a component.'),
  }),
});

function EsiPolicyEditor({ policy, onClose }: { policy?: EsiPolicy; onClose: () => void }) {
  const version = policy?.versions[0];
  const components = useGetEsiComponentTreatmentsQuery();
  const [create, creation] = useCreateEsiPolicyMutation();
  const [addVersion, addition] = useAddEsiPolicyVersionMutation();
  const [error, setError] = useState('');
  const request = useRef<{ signature: string; key: string } | null>(null);
  const form = useFormik<Values>({
    initialValues: {
      name: policy?.name || '',
      code: policy?.code || '',
      effectiveFrom: dayjs().add(1, 'month').format('YYYY-MM'),
      employeePercentage: String(version?.employeePercentage ?? 0.75),
      employerPercentage: String(version?.employerPercentage ?? 3.25),
      standardWageCeiling: String(version?.standardWageCeiling ?? 21000),
      disabilityWageCeiling: String(version?.disabilityWageCeiling ?? 25000),
      employeeShareDailyWageExemption: String(version?.employeeShareDailyWageExemption ?? 176),
      establishmentThreshold: String(version?.establishmentThreshold ?? 10),
      exclusionCapPercentage: String(version?.exclusionCapPercentage ?? 50),
      inKindCapPercentage: String(version?.inKindCapPercentage ?? 15),
      roundingPolicy: version?.roundingPolicy || 'NextHigherRupee',
      sourceUrl: version?.sourceUrl || '',
      sourceVerifiedOn: dayjs().format('YYYY-MM-DD'),
      eligibilityBasis: version?.calculationSettings?.eligibilityBasis || 'CLASSIFIED_EARNINGS',
      calculationBasis: version?.calculationSettings?.calculationBasis || 'CLASSIFIED_EARNINGS',
      eligibilityComponentId: version?.calculationSettings?.eligibilityComponentId || '',
      calculationComponentId: version?.calculationSettings?.calculationComponentId || '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const body: EsiPolicyVersionInput = {
        effectiveFrom: `${values.effectiveFrom}-01T00:00:00.000Z`,
        employeePercentage: Number(values.employeePercentage),
        employerPercentage: Number(values.employerPercentage),
        standardWageCeiling: Number(values.standardWageCeiling),
        disabilityWageCeiling: Number(values.disabilityWageCeiling),
        employeeShareDailyWageExemption: Number(values.employeeShareDailyWageExemption),
        establishmentThreshold: Number(values.establishmentThreshold),
        exclusionCapPercentage: Number(values.exclusionCapPercentage),
        inKindCapPercentage: Number(values.inKindCapPercentage),
        roundingPolicy: values.roundingPolicy,
        sourceUrl: values.sourceUrl.trim(),
        sourceVerifiedOn: values.sourceVerifiedOn,
        calculationSettings: {
          eligibilityBasis: values.eligibilityBasis as
            'CLASSIFIED_EARNINGS' | 'GROSS' | 'COMPONENT',
          calculationBasis: values.calculationBasis as
            'CLASSIFIED_EARNINGS' | 'GROSS' | 'COMPONENT',
          eligibilityComponentId:
            values.eligibilityBasis === 'COMPONENT' ? values.eligibilityComponentId : null,
          calculationComponentId:
            values.calculationBasis === 'COMPONENT' ? values.calculationComponentId : null,
        },
        concurrencyStamp: policy?.concurrencyStamp || '',
        idempotencyKey: '',
      };
      const signature = JSON.stringify({
        ...body,
        name: values.name.trim(),
        code: values.code.trim(),
      });
      if (request.current?.signature !== signature)
        request.current = { signature, key: crypto.randomUUID() };
      body.idempotencyKey = request.current.key;
      setError('');
      try {
        if (policy) await addVersion({ id: policy.id, body }).unwrap();
        else await create({ ...body, name: values.name.trim(), code: values.code.trim() }).unwrap();
        shikshaMitraToast.success({
          message: policy ? 'ESIC policy version saved.' : 'ESIC policy created.',
        });
        onClose();
      } catch (cause) {
        setError(parseApiProblemDetail(cause).detail);
      }
    },
  });
  const busy = creation.isLoading || addition.isLoading;
  const field = (key: keyof Values, label: string, type?: string) => (
    <ShakingTextField error={Boolean(form.touched[key] && form.errors[key])}>
      <TextField
        size="small"
        fullWidth
        required
        label={label}
        type={type}
        {...form.getFieldProps(key)}
        disabled={busy || Boolean(policy && (key === 'name' || key === 'code'))}
        error={Boolean(form.touched[key] && form.errors[key])}
        helperText={form.touched[key] && form.errors[key]}
        slotProps={type ? { inputLabel: { shrink: true } } : undefined}
      />
    </ShakingTextField>
  );
  const numeric = (key: keyof Values, label: string, percent = false) => (
    <ShakingTextField error={Boolean(form.touched[key] && form.errors[key])}>
      <NumericFormatCustom
        size="small"
        fullWidth
        required
        name={key}
        label={label}
        prefix={percent || key === 'establishmentThreshold' ? '' : undefined}
        suffix={percent ? '%' : undefined}
        decimalScale={key === 'establishmentThreshold' ? 0 : percent ? 4 : 2}
        roundToWholeRupees={false}
        value={form.values[key]}
        disabled={busy}
        onValueChange={({ value }, { source }) => {
          if (source === 'event') form.setFieldValue(key, value);
        }}
        onBlur={form.handleBlur}
        error={Boolean(form.touched[key] && form.errors[key])}
        helperText={form.touched[key] && form.errors[key]}
      />
    </ShakingTextField>
  );
  return (
    <CustomDialog
      open
      title={policy ? `New version - ${policy.name}` : 'Create ESIC policy'}
      maxWidth="md"
      hasForm={false}
      handleClose={onClose}
      disableClose={busy}
      hasUnsavedChanges={form.dirty}
    >
      <Box component="form" onSubmit={form.handleSubmit} noValidate>
        <DialogScrollContent onSubmit={() => form.submitForm()}>
          <Stack spacing={2}>
            <SectionCard title="Policy details" gridProps={{ spacing: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>{field('name', 'Policy name')}</Grid>
              <Grid size={{ xs: 12, sm: 6 }}>{field('code', 'Policy code')}</Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {field('effectiveFrom', 'Effective from', 'month')}
              </Grid>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  Versions are immutable. A new version replaces the previous version from its
                  effective month.
                </Typography>
              </Grid>
            </SectionCard>
            <SectionCard title="Contributions and coverage" gridProps={{ spacing: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                {numeric('employeePercentage', 'Employee share', true)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {numeric('employerPercentage', 'School share', true)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {numeric('standardWageCeiling', 'Standard wage ceiling')}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {numeric('disabilityWageCeiling', 'Disability wage ceiling')}
              </Grid>
            </SectionCard>
            <Box component="details">
              <Typography component="summary" variant="subtitle2" sx={{ cursor: 'pointer', py: 1 }}>
                Advanced calculation settings
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {numeric('employeeShareDailyWageExemption', 'Employee daily wage exemption')}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {numeric('establishmentThreshold', 'Establishment threshold')}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {numeric('exclusionCapPercentage', 'Exclusion cap', true)}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {numeric('inKindCapPercentage', 'In-kind cap', true)}
                </Grid>
                {(['eligibility', 'calculation'] as const).map((kind) => (
                  <Grid key={kind} size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={2}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label={kind === 'eligibility' ? 'Eligibility basis' : 'Contribution basis'}
                        {...form.getFieldProps(`${kind}Basis`)}
                        disabled={busy}
                      >
                        <MenuItem value="CLASSIFIED_EARNINGS">Classified earnings</MenuItem>
                        <MenuItem value="GROSS">Gross salary</MenuItem>
                        <MenuItem value="COMPONENT">Salary component</MenuItem>
                      </TextField>
                      {form.values[`${kind}Basis`] === 'COMPONENT' && (
                        <ShakingTextField
                          error={Boolean(
                            form.touched[`${kind}ComponentId`] && form.errors[`${kind}ComponentId`]
                          )}
                        >
                          <TextField
                            select
                            required
                            fullWidth
                            size="small"
                            label={
                              kind === 'eligibility'
                                ? 'Eligibility component'
                                : 'Contribution component'
                            }
                            {...form.getFieldProps(`${kind}ComponentId`)}
                            disabled={busy || components.isLoading || components.isError}
                            error={Boolean(
                              form.touched[`${kind}ComponentId`] &&
                              form.errors[`${kind}ComponentId`]
                            )}
                            helperText={
                              form.touched[`${kind}ComponentId`] &&
                              form.errors[`${kind}ComponentId`]
                            }
                          >
                            {components.data?.map((item) => (
                              <MenuItem key={item.componentId} value={item.componentId}>
                                {item.componentName}
                              </MenuItem>
                            ))}
                          </TextField>
                        </ShakingTextField>
                      )}
                    </Stack>
                  </Grid>
                ))}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Rounding"
                    {...form.getFieldProps('roundingPolicy')}
                    disabled={busy}
                  >
                    <MenuItem value="NextHigherRupee">Next higher rupee</MenuItem>
                    <MenuItem value="TwoDecimalsAwayFromZero">Two decimals</MenuItem>
                  </TextField>
                </Grid>
                {components.isError && (
                  <Grid size={12}>
                    <Alert
                      severity="error"
                      action={<Button onClick={() => components.refetch()}>Retry</Button>}
                    >
                      Salary components could not be loaded.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
            <SectionCard title="Policy source" gridProps={{ spacing: 2 }}>
              <Grid size={12}>{field('sourceUrl', 'Source URL')}</Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {field('sourceVerifiedOn', 'Verified on', 'date')}
              </Grid>
            </SectionCard>
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" loading={busy}>
            {policy ? 'Save version' : 'Create policy'}
          </Button>
        </DialogActions>
      </Box>
    </CustomDialog>
  );
}
