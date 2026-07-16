'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionCrmFeeComponentDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { Add, Send, Delete, Publish, Approval } from '@mui/icons-material';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Button,
  Divider,
  Tooltip,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  AdmissionCrmFeePolicyStatus,
  AdmissionCrmPaymentGateType,
  AdmissionCrmPaymentGateMilestone,
  useGetAdmissionCrmFeePoliciesQuery,
  useCreateAdmissionCrmFeePolicyMutation,
  useSubmitAdmissionCrmFeePolicyMutation,
  useApproveAdmissionCrmFeePolicyMutation,
  usePublishAdmissionCrmFeePolicyMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

const startOfToday = () => new Date().toISOString().slice(0, 10);
const oneYearFromNow = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
};

const newComponent = (): AdmissionCrmFeeComponentDto => ({
  key: '',
  name: '',
  amount: 0,
  ownerModule: 'Finance',
  isRefundable: false,
  parentDescription: '',
});

const statusLabels: Record<AdmissionCrmFeePolicyStatus, string> = {
  [AdmissionCrmFeePolicyStatus.Draft]: 'Draft',
  [AdmissionCrmFeePolicyStatus.ApprovalPending]: 'Approval pending',
  [AdmissionCrmFeePolicyStatus.Approved]: 'Approved',
  [AdmissionCrmFeePolicyStatus.Published]: 'Published',
  [AdmissionCrmFeePolicyStatus.Retired]: 'Retired',
};

const gateLabels: Record<AdmissionCrmPaymentGateType, string> = {
  [AdmissionCrmPaymentGateType.None]: 'No financial gate',
  [AdmissionCrmPaymentGateType.ReferenceRecorded]: 'Reference recorded',
  [AdmissionCrmPaymentGateType.PaymentInitiated]: 'Payment initiated',
  [AdmissionCrmPaymentGateType.PartialAmountConfirmed]: 'Partial amount confirmed',
  [AdmissionCrmPaymentGateType.RequiredAmountConfirmed]: 'Required amount confirmed',
  [AdmissionCrmPaymentGateType.FinanceCleared]: 'Finance cleared',
};

const milestoneLabels: Record<AdmissionCrmPaymentGateMilestone, string> = {
  [AdmissionCrmPaymentGateMilestone.OfferAcceptance]: 'Offer acceptance',
  [AdmissionCrmPaymentGateMilestone.FinalApproval]: 'Final approval',
  [AdmissionCrmPaymentGateMilestone.StudentActivation]: 'Student activation',
};

const readError = (error: unknown) => {
  if (typeof error === 'object' && error && 'data' in error) {
    const { data } = error as { data?: { errorCode?: string; detail?: string } };
    return data?.errorCode || data?.detail || 'Unable to update financial policy.';
  }
  return 'Unable to update financial policy.';
};

export default function AdmissionsFinancialConfiguration() {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const academicYearId = currentYear?.id as string | undefined;
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [campus, setCampus] = useState('');
  const [desiredClass, setDesiredClass] = useState('');
  const [board, setBoard] = useState('');
  const [medium, setMedium] = useState('');
  const [admissionRoute, setAdmissionRoute] = useState('');
  const [gateType, setGateType] = useState(AdmissionCrmPaymentGateType.FinanceCleared);
  const [gateMilestone, setGateMilestone] = useState(
    AdmissionCrmPaymentGateMilestone.StudentActivation
  );
  const [requiredAmount, setRequiredAmount] = useState('0');
  const [requiredPercentage, setRequiredPercentage] = useState('0');
  const [gracePeriodHours, setGracePeriodHours] = useState('24');
  const [effectiveFrom, setEffectiveFrom] = useState(startOfToday);
  const [effectiveUntil, setEffectiveUntil] = useState(oneYearFromNow);
  const [components, setComponents] = useState<AdmissionCrmFeeComponentDto[]>([newComponent()]);

  const policiesQuery = useGetAdmissionCrmFeePoliciesQuery(
    { academicYearId: academicYearId || '', maxResultCount: 200 },
    { skip: !academicYearId }
  );
  const [createPolicy, createState] = useCreateAdmissionCrmFeePolicyMutation();
  const [submitPolicy, submitState] = useSubmitAdmissionCrmFeePolicyMutation();
  const [approvePolicy, approveState] = useApproveAdmissionCrmFeePolicyMutation();
  const [publishPolicy, publishState] = usePublishAdmissionCrmFeePolicyMutation();

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      shikshaMitraToast.success({ message: success });
    } catch (error) {
      shikshaMitraToast.error({ message: readError(error) });
    }
  };

  const save = () => {
    if (!academicYearId || !code.trim() || !name.trim()) return;
    const invalid = components.some(
      (item) => !item.key.trim() || !item.name.trim() || item.amount < 0
    );
    if (invalid) {
      shikshaMitraToast.error({
        message: 'Every fee component requires a key, name, and non-negative amount.',
      });
      return;
    }
    run(
      () =>
        createPolicy({
          academicYearId,
          body: {
            code: code.trim().toUpperCase(),
            name: name.trim(),
            applicability: {
              campus: campus.trim() || null,
              desiredClass: desiredClass.trim() || null,
              board: board.trim() || null,
              medium: medium.trim() || null,
              admissionRoute: admissionRoute.trim() || null,
            },
            components: components.map((item) => ({
              ...item,
              key: item.key.trim(),
              name: item.name.trim(),
              parentDescription: item.parentDescription?.trim() || null,
            })),
            currency: 'INR',
            gateType,
            gateMilestone,
            requiredAmount: Number(requiredAmount),
            requiredPercentage: Number(requiredPercentage),
            gracePeriodHours: Number(gracePeriodHours),
            effectiveFrom: new Date(`${effectiveFrom}T00:00:00`).toISOString(),
            effectiveUntil: effectiveUntil
              ? new Date(`${effectiveUntil}T23:59:59`).toISOString()
              : null,
          },
        }).unwrap(),
      'Financial policy draft created.'
    );
  };

  const updateComponent = (index: number, patch: Partial<AdmissionCrmFeeComponentDto>) =>
    setComponents((items) =>
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );

  return (
    <Stack spacing={1.25}>
      <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
        <Stack spacing={1.25}>
          <Box>
            <Typography variant="subtitle2">Admission fee policy</Typography>
            <Typography variant="caption" color="text.secondary">
              Define the parent quotation and the financial condition Enrollment must verify at a
              governed milestone.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
            <TextField
              size="small"
              label="Policy code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
            <TextField
              size="small"
              fullWidth
              label="Policy name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <TextField
              size="small"
              label="Campus"
              value={campus}
              onChange={(event) => setCampus(event.target.value)}
            />
            <TextField
              size="small"
              label="Class"
              value={desiredClass}
              onChange={(event) => setDesiredClass(event.target.value)}
            />
            <TextField
              size="small"
              label="Board"
              value={board}
              onChange={(event) => setBoard(event.target.value)}
            />
            <TextField
              size="small"
              label="Medium"
              value={medium}
              onChange={(event) => setMedium(event.target.value)}
            />
            <TextField
              size="small"
              label="Route"
              value={admissionRoute}
              onChange={(event) => setAdmissionRoute(event.target.value)}
            />
          </Stack>
          <Divider />
          <Stack spacing={0.75}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">Quotation components</Typography>
              <Button
                size="small"
                startIcon={<Add />}
                onClick={() => setComponents((items) => [...items, newComponent()])}
              >
                Component
              </Button>
            </Stack>
            {components.map((component, index) => (
              <Stack
                key={`component-${index}`}
                direction={{ xs: 'column', md: 'row' }}
                gap={1}
                alignItems={{ md: 'center' }}
              >
                <TextField
                  size="small"
                  label="Key"
                  value={component.key}
                  onChange={(event) => updateComponent(index, { key: event.target.value })}
                />
                <TextField
                  size="small"
                  fullWidth
                  label="Parent label"
                  value={component.name}
                  onChange={(event) => updateComponent(index, { name: event.target.value })}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Amount"
                  value={component.amount}
                  onChange={(event) =>
                    updateComponent(index, { amount: Number(event.target.value) })
                  }
                />
                <TextField
                  size="small"
                  select
                  label="Refundability"
                  value={component.isRefundable ? 'yes' : 'no'}
                  onChange={(event) =>
                    updateComponent(index, { isRefundable: event.target.value === 'yes' })
                  }
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="no">Non-refundable</MenuItem>
                  <MenuItem value="yes">Refundable</MenuItem>
                </TextField>
                <TextField
                  size="small"
                  fullWidth
                  label="Parent description"
                  value={component.parentDescription || ''}
                  onChange={(event) =>
                    updateComponent(index, { parentDescription: event.target.value })
                  }
                />
                <Tooltip title="Remove component">
                  <span>
                    <IconButton
                      size="small"
                      disabled={components.length === 1}
                      onClick={() =>
                        setComponents((items) =>
                          items.filter((_, itemIndex) => itemIndex !== index)
                        )
                      }
                    >
                      <Delete />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            ))}
          </Stack>
          <Divider />
          <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
            <TextField
              select
              size="small"
              label="Payment gate"
              value={gateType}
              onChange={(event) =>
                setGateType(Number(event.target.value) as AdmissionCrmPaymentGateType)
              }
              sx={{ minWidth: 210 }}
            >
              {Object.entries(gateLabels).map(([value, label]) => (
                <MenuItem key={value} value={Number(value)}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Blocking milestone"
              value={gateMilestone}
              onChange={(event) =>
                setGateMilestone(Number(event.target.value) as AdmissionCrmPaymentGateMilestone)
              }
              sx={{ minWidth: 180 }}
            >
              {Object.entries(milestoneLabels).map(([value, label]) => (
                <MenuItem key={value} value={Number(value)}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              type="number"
              label="Required amount"
              value={requiredAmount}
              onChange={(event) => setRequiredAmount(event.target.value)}
            />
            <TextField
              size="small"
              type="number"
              label="Required %"
              value={requiredPercentage}
              onChange={(event) => setRequiredPercentage(event.target.value)}
            />
            <TextField
              size="small"
              type="number"
              label="Grace hours"
              value={gracePeriodHours}
              onChange={(event) => setGracePeriodHours(event.target.value)}
            />
            <TextField
              size="small"
              type="date"
              label="Effective from"
              value={effectiveFrom}
              onChange={(event) => setEffectiveFrom(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              type="date"
              label="Effective until"
              value={effectiveUntil}
              onChange={(event) => setEffectiveUntil(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
          <LoadingButton
            variant="contained"
            startIcon={<Add />}
            loading={createState.isLoading}
            disabled={!academicYearId || !code.trim() || !name.trim()}
            onClick={save}
            sx={{ alignSelf: 'flex-start' }}
          >
            Create draft
          </LoadingButton>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">Policy versions</Typography>
            <Chip size="small" label={`${policiesQuery.data?.totalCount || 0} version(s)`} />
          </Stack>
          {policiesQuery.isFetching && <LinearProgress />}
          {!policiesQuery.data?.items.length ? (
            <Alert severity="info">No admission fee policies are configured for this cycle.</Alert>
          ) : null}
          {(policiesQuery.data?.items || []).map((policy) => (
            <Stack
              key={policy.id}
              direction={{ xs: 'column', md: 'row' }}
              gap={1}
              alignItems={{ md: 'center' }}
              justifyContent="space-between"
              sx={{ py: 0.75, borderTop: '1px solid', borderColor: 'divider' }}
            >
              <Box>
                <Typography variant="body2">
                  {policy.name}{' '}
                  <Typography component="span" variant="caption" color="text.secondary">
                    {policy.code} v{policy.version}
                  </Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {gateLabels[policy.gateType]} at {milestoneLabels[policy.gateMilestone]} - INR{' '}
                  {policy.components.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                </Typography>
              </Box>
              <Stack direction="row" gap={1} alignItems="center">
                <Chip
                  size="small"
                  label={statusLabels[policy.status]}
                  color={
                    policy.status === AdmissionCrmFeePolicyStatus.Published ? 'success' : 'default'
                  }
                />
                {policy.status === AdmissionCrmFeePolicyStatus.Draft ? (
                  <LoadingButton
                    size="small"
                    startIcon={<Send />}
                    loading={submitState.isLoading}
                    onClick={() =>
                      run(
                        () => submitPolicy({ policyId: policy.id }).unwrap(),
                        'Policy submitted for approval.'
                      )
                    }
                  >
                    Submit
                  </LoadingButton>
                ) : null}
                {policy.status === AdmissionCrmFeePolicyStatus.ApprovalPending ? (
                  <LoadingButton
                    size="small"
                    startIcon={<Approval />}
                    loading={approveState.isLoading}
                    onClick={() =>
                      run(() => approvePolicy({ policyId: policy.id }).unwrap(), 'Policy approved.')
                    }
                  >
                    Approve
                  </LoadingButton>
                ) : null}
                {policy.status === AdmissionCrmFeePolicyStatus.Approved ? (
                  <LoadingButton
                    size="small"
                    startIcon={<Publish />}
                    loading={publishState.isLoading}
                    onClick={() =>
                      run(
                        () => publishPolicy({ policyId: policy.id }).unwrap(),
                        'Policy published.'
                      )
                    }
                  >
                    Publish
                  </LoadingButton>
                ) : null}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}
