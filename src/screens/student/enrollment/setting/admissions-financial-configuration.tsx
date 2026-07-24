'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionCrmFeeComponentDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import {
  Add,
  Send,
  Delete,
  Publish,
  Approval,
  ExpandMore,
  ReceiptLong,
  AutoAwesome,
  TuneOutlined,
} from '@mui/icons-material';
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
  Accordion,
  IconButton,
  Typography,
  LinearProgress,
  AccordionDetails,
  AccordionSummary,
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

import {
  calculateFeeTotal,
  feePolicyTemplates,
  cloneFeeComponents,
  formatIndianCurrency,
  validateFeePolicyDraft,
  calculateRequiredPayment,
} from './admissions-financial-configuration-utils';

import type { FeePolicyTemplateId } from './admissions-financial-configuration-utils';

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
  [AdmissionCrmPaymentGateType.None]: 'Do not block admission',
  [AdmissionCrmPaymentGateType.ReferenceRecorded]: 'Payment reference recorded',
  [AdmissionCrmPaymentGateType.PaymentInitiated]: 'Payment started',
  [AdmissionCrmPaymentGateType.PartialAmountConfirmed]: 'Deposit confirmed by Finance',
  [AdmissionCrmPaymentGateType.RequiredAmountConfirmed]: 'Required amount confirmed by Finance',
  [AdmissionCrmPaymentGateType.FinanceCleared]: 'Payment cleared by Finance',
};

const gateDescriptions: Record<AdmissionCrmPaymentGateType, string> = {
  [AdmissionCrmPaymentGateType.None]: 'Families may continue without a finance confirmation.',
  [AdmissionCrmPaymentGateType.ReferenceRecorded]:
    'Use when a receipt, UTR, cheque, or another payment reference is enough.',
  [AdmissionCrmPaymentGateType.PaymentInitiated]:
    'Use when starting a supported payment flow is enough for this milestone.',
  [AdmissionCrmPaymentGateType.PartialAmountConfirmed]:
    'Finance must confirm that at least part of the quotation was received.',
  [AdmissionCrmPaymentGateType.RequiredAmountConfirmed]:
    'Finance must confirm the minimum fixed amount shown below.',
  [AdmissionCrmPaymentGateType.FinanceCleared]:
    'Finance remains the authoritative source; this does not imply online payment only.',
};

const milestoneLabels: Record<AdmissionCrmPaymentGateMilestone, string> = {
  [AdmissionCrmPaymentGateMilestone.OfferAcceptance]: 'Offer acceptance',
  [AdmissionCrmPaymentGateMilestone.FinalApproval]: 'Final admission approval',
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
  const [selectedTemplate, setSelectedTemplate] =
    useState<FeePolicyTemplateId>('full-advance');
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [code, setCode] = useState('FULL-ADVANCE');
  const [name, setName] = useState('100% before activation');
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
  const [requiredPercentage, setRequiredPercentage] = useState('100');
  const [gracePeriodHours, setGracePeriodHours] = useState('24');
  const [effectiveFrom, setEffectiveFrom] = useState(startOfToday);
  const [effectiveUntil, setEffectiveUntil] = useState(oneYearFromNow);
  const [components, setComponents] = useState<AdmissionCrmFeeComponentDto[]>([
    {
      key: 'ADMISSION_FEE',
      name: 'Admission fee',
      amount: 0,
      ownerModule: 'Finance',
      isRefundable: false,
      parentDescription: '',
    },
    {
      key: 'TUITION_FEE',
      name: 'Tuition fee',
      amount: 0,
      ownerModule: 'Finance',
      isRefundable: false,
      parentDescription: '',
    },
  ]);

  const policiesQuery = useGetAdmissionCrmFeePoliciesQuery(
    { academicYearId: academicYearId || '', maxResultCount: 200 },
    { skip: !academicYearId }
  );
  const [createPolicy, createState] = useCreateAdmissionCrmFeePolicyMutation();
  const [submitPolicy, submitState] = useSubmitAdmissionCrmFeePolicyMutation();
  const [approvePolicy, approveState] = useApproveAdmissionCrmFeePolicyMutation();
  const [publishPolicy, publishState] = usePublishAdmissionCrmFeePolicyMutation();

  const feeTotal = useMemo(() => calculateFeeTotal(components), [components]);
  const minimumDue = useMemo(
    () =>
      calculateRequiredPayment(
        feeTotal,
        Number(requiredAmount),
        Number(requiredPercentage)
      ),
    [feeTotal, requiredAmount, requiredPercentage]
  );
  const validationErrors = useMemo(
    () =>
      validateFeePolicyDraft({
        code,
        name,
        components,
        gateType,
        requiredAmount: Number(requiredAmount),
        requiredPercentage: Number(requiredPercentage),
        gracePeriodHours: Number(gracePeriodHours),
        effectiveFrom,
        effectiveUntil,
      }),
    [
      code,
      components,
      effectiveFrom,
      effectiveUntil,
      gateType,
      gracePeriodHours,
      name,
      requiredAmount,
      requiredPercentage,
    ]
  );

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      shikshaMitraToast.success({ message: success });
      return true;
    } catch (error) {
      shikshaMitraToast.error({ message: readError(error) });
      return false;
    }
  };

  const save = async () => {
    setAttemptedSave(true);
    if (!academicYearId || Object.keys(validationErrors).length) return;

    const saved = await run(
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
              key: item.key.trim().toUpperCase(),
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
    if (saved) setAttemptedSave(false);
  };

  const applyTemplate = (templateId: FeePolicyTemplateId) => {
    const template = feePolicyTemplates.find((item) => item.id === templateId);
    if (!template) return;
    setSelectedTemplate(templateId);
    setCode(template.suggestedCode);
    setName(template.suggestedName);
    setComponents(cloneFeeComponents(template.components));
    setGateType(template.gateType);
    setGateMilestone(template.gateMilestone);
    setRequiredAmount(String(template.requiredAmount));
    setRequiredPercentage(String(template.requiredPercentage));
    setAttemptedSave(false);
  };

  const updateComponent = (index: number, patch: Partial<AdmissionCrmFeeComponentDto>) =>
    setComponents((items) =>
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );

  return (
    <Stack spacing={1.5}>
      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1.5 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            gap={1}
          >
            <Box>
              <Typography component="h2" variant="subtitle1">
                Admission fee policy
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Build the family-facing fee breakdown and choose the Finance-confirmed payment
                condition that can stop admission.
              </Typography>
            </Box>
            <Chip size="small" icon={<ReceiptLong />} label="Parent quotation · INR" />
          </Stack>

          <Box>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
              <AutoAwesome fontSize="small" color="primary" />
              <Typography variant="subtitle2">Quick start</Typography>
            </Stack>
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              {feePolicyTemplates.map((template) => (
                <Tooltip key={template.id} title={template.description}>
                  <Chip
                    clickable
                    color={selectedTemplate === template.id ? 'primary' : 'default'}
                    variant={selectedTemplate === template.id ? 'filled' : 'outlined'}
                    label={template.label}
                    onClick={() => applyTemplate(template.id)}
                  />
                </Tooltip>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'minmax(180px, 0.45fr) 1fr' },
              gap: 1,
            }}
          >
            <TextField
              size="small"
              name="fee-policy-code"
              label="Policy code"
              value={code}
              error={attemptedSave && Boolean(validationErrors.code)}
              helperText={attemptedSave ? validationErrors.code : 'Used internally and in audit history.'}
              onChange={(event) => setCode(event.target.value)}
            />
            <TextField
              size="small"
              fullWidth
              name="fee-policy-name"
              label="Policy name"
              value={name}
              error={attemptedSave && Boolean(validationErrors.name)}
              helperText={attemptedSave ? validationErrors.name : 'A clear name staff can recognise.'}
              onChange={(event) => setName(event.target.value)}
            />
          </Box>

          <Divider />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.55fr) minmax(300px, 0.75fr)' },
              gap: 2,
              alignItems: 'start',
            }}
          >
            <Stack spacing={2} minWidth={0}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2">Fee breakdown</Typography>
                    <Typography variant="caption" color="text.secondary">
                      These labels and descriptions appear on the family quotation.
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() => setComponents((items) => [...items, newComponent()])}
                  >
                    Add fee
                  </Button>
                </Stack>
                {attemptedSave && validationErrors.components ? (
                  <Alert severity="error">{validationErrors.components}</Alert>
                ) : null}
                {components.map((component, index) => (
                  <Paper
                    key={`component-${index}`}
                    variant="outlined"
                    sx={{ p: 1.25, borderRadius: 1 }}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          md: 'minmax(140px, 0.65fr) minmax(180px, 1fr) minmax(130px, 0.55fr) minmax(150px, 0.65fr) auto',
                        },
                        gap: 1,
                        alignItems: 'start',
                      }}
                    >
                      <TextField
                        size="small"
                        name={`fee-component-code-${index}`}
                        label="Internal code"
                        value={component.key}
                        onChange={(event) =>
                          updateComponent(index, { key: event.target.value })
                        }
                      />
                      <TextField
                        size="small"
                        fullWidth
                        name={`fee-component-label-${index}`}
                        label="Parent label"
                        value={component.name}
                        onChange={(event) =>
                          updateComponent(index, { name: event.target.value })
                        }
                      />
                      <TextField
                        size="small"
                        type="number"
                        name={`fee-component-amount-${index}`}
                        label="Amount (₹)"
                        value={component.amount}
                        slotProps={{ htmlInput: { min: 0, step: 1 } }}
                        onChange={(event) =>
                          updateComponent(index, { amount: Number(event.target.value) })
                        }
                      />
                      <TextField
                        size="small"
                        select
                        name={`fee-component-refundability-${index}`}
                        label="Refundability"
                        value={component.isRefundable ? 'yes' : 'no'}
                        onChange={(event) =>
                          updateComponent(index, {
                            isRefundable: event.target.value === 'yes',
                          })
                        }
                      >
                        <MenuItem value="no">Non-refundable</MenuItem>
                        <MenuItem value="yes">Refundable</MenuItem>
                      </TextField>
                      <Tooltip title="Remove fee line">
                        <span>
                          <IconButton
                            size="small"
                            aria-label={`Remove fee ${component.name || index + 1}`}
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
                    </Box>
                    <TextField
                      size="small"
                      fullWidth
                      name={`fee-component-description-${index}`}
                      label="Explanation for families"
                      value={component.parentDescription || ''}
                      onChange={(event) =>
                        updateComponent(index, { parentDescription: event.target.value })
                      }
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                ))}
              </Stack>

              <Stack spacing={1}>
                <Box>
                  <Typography variant="subtitle2">Payment condition</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Finance owns payment truth; Enrollment only checks the selected confirmation.
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                    gap: 1,
                  }}
                >
                  <TextField
                    select
                    size="small"
                    name="payment-confirmation"
                    label="Payment confirmation needed"
                    value={gateType}
                    helperText={gateDescriptions[gateType]}
                    onChange={(event) =>
                      setGateType(Number(event.target.value) as AdmissionCrmPaymentGateType)
                    }
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
                    name="payment-blocking-milestone"
                    label="Stop admission if not paid at"
                    value={gateMilestone}
                    helperText="Later milestones remain available until this checkpoint."
                    disabled={gateType === AdmissionCrmPaymentGateType.None}
                    onChange={(event) =>
                      setGateMilestone(
                        Number(event.target.value) as AdmissionCrmPaymentGateMilestone
                      )
                    }
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
                    name="required-payment-percentage"
                    label="Minimum payment (%)"
                    value={requiredPercentage}
                    error={attemptedSave && Boolean(validationErrors.requiredPercentage)}
                    helperText={
                      attemptedSave && validationErrors.requiredPercentage
                        ? validationErrors.requiredPercentage
                        : 'Calculated from the final quotation after concessions.'
                    }
                    disabled={gateType === AdmissionCrmPaymentGateType.None}
                    slotProps={{ htmlInput: { min: 0, max: 100, step: 1 } }}
                    onChange={(event) => setRequiredPercentage(event.target.value)}
                  />
                  <TextField
                    size="small"
                    type="number"
                    name="required-payment-amount"
                    label="Minimum fixed amount (₹)"
                    value={requiredAmount}
                    error={attemptedSave && Boolean(validationErrors.requiredAmount)}
                    helperText={
                      attemptedSave && validationErrors.requiredAmount
                        ? validationErrors.requiredAmount
                        : 'The higher of this amount or the percentage is required.'
                    }
                    disabled={gateType === AdmissionCrmPaymentGateType.None}
                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                    onChange={(event) => setRequiredAmount(event.target.value)}
                  />
                </Box>
              </Stack>
            </Stack>

            <Paper
              variant="outlined"
              aria-label="Live parent fee slip preview"
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                position: { lg: 'sticky' },
                top: { lg: 16 },
              }}
            >
              <Stack spacing={1.25}>
                <Stack direction="row" justifyContent="space-between" gap={1}>
                  <Box>
                    <Typography variant="overline" color="primary.main">
                      Live parent preview
                    </Typography>
                    <Typography variant="subtitle1">Admission fee slip</Typography>
                  </Box>
                  <ReceiptLong color="action" />
                </Stack>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {name.trim() || 'Untitled admission policy'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {code.trim().toUpperCase() || 'POLICY CODE'}
                  </Typography>
                </Box>
                <Divider />
                <Stack spacing={0.75}>
                  {components.map((item, index) => (
                    <Stack
                      key={`${item.key}-${index}`}
                      direction="row"
                      justifyContent="space-between"
                      gap={1}
                    >
                      <Box minWidth={0}>
                        <Typography variant="body2">
                          {item.name.trim() || `Fee ${index + 1}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.isRefundable ? 'Refundable' : 'Non-refundable'}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {formatIndianCurrency(item.amount)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2">Total</Typography>
                  <Typography variant="subtitle2">{formatIndianCurrency(feeTotal)}</Typography>
                </Stack>
                {gateType === AdmissionCrmPaymentGateType.None ? (
                  <Alert severity="info">This policy does not block admission for payment.</Alert>
                ) : (
                  <Alert severity={minimumDue > 0 ? 'warning' : 'info'}>
                    <Typography variant="caption" component="div">
                      Minimum due by {milestoneLabels[gateMilestone]}
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {formatIndianCurrency(minimumDue)}
                    </Typography>
                  </Alert>
                )}
              </Stack>
            </Paper>
          </Box>

          <Accordion disableGutters variant="outlined">
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TuneOutlined fontSize="small" />
                <Box>
                  <Typography variant="subtitle2">Add specific filters and timing</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Optional campus, class, board, medium, route, dates, and grace period.
                  </Typography>
                </Box>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(3, minmax(0, 1fr))',
                  },
                  gap: 1,
                }}
              >
                <TextField
                  size="small"
                  name="fee-policy-campus"
                  label="Campus"
                  value={campus}
                  onChange={(event) => setCampus(event.target.value)}
                />
                <TextField
                  size="small"
                  name="fee-policy-class"
                  label="Class"
                  value={desiredClass}
                  onChange={(event) => setDesiredClass(event.target.value)}
                />
                <TextField
                  size="small"
                  name="fee-policy-board"
                  label="Board"
                  value={board}
                  onChange={(event) => setBoard(event.target.value)}
                />
                <TextField
                  size="small"
                  name="fee-policy-medium"
                  label="Medium"
                  value={medium}
                  onChange={(event) => setMedium(event.target.value)}
                />
                <TextField
                  size="small"
                  name="fee-policy-route"
                  label="Admission route"
                  value={admissionRoute}
                  onChange={(event) => setAdmissionRoute(event.target.value)}
                />
                <TextField
                  size="small"
                  type="number"
                  name="fee-policy-grace-hours"
                  label="Payment grace period (hours)"
                  value={gracePeriodHours}
                  error={attemptedSave && Boolean(validationErrors.gracePeriodHours)}
                  helperText={attemptedSave ? validationErrors.gracePeriodHours : undefined}
                  slotProps={{ htmlInput: { min: 0, step: 1 } }}
                  onChange={(event) => setGracePeriodHours(event.target.value)}
                />
                <TextField
                  size="small"
                  type="date"
                  name="fee-policy-effective-from"
                  label="Effective from"
                  value={effectiveFrom}
                  error={attemptedSave && Boolean(validationErrors.effectiveFrom)}
                  helperText={attemptedSave ? validationErrors.effectiveFrom : undefined}
                  slotProps={{ inputLabel: { shrink: true } }}
                  onChange={(event) => setEffectiveFrom(event.target.value)}
                />
                <TextField
                  size="small"
                  type="date"
                  name="fee-policy-effective-until"
                  label="Effective until"
                  value={effectiveUntil}
                  error={attemptedSave && Boolean(validationErrors.effectiveUntil)}
                  helperText={attemptedSave ? validationErrors.effectiveUntil : undefined}
                  slotProps={{ inputLabel: { shrink: true } }}
                  onChange={(event) => setEffectiveUntil(event.target.value)}
                />
              </Box>
            </AccordionDetails>
          </Accordion>

          <LoadingButton
            variant="contained"
            startIcon={<Add />}
            loading={createState.isLoading}
            disabled={!academicYearId}
            onClick={save}
            sx={{ alignSelf: 'flex-start' }}
          >
            Create policy draft
          </LoadingButton>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography component="h2" variant="subtitle2">
              Policy versions
            </Typography>
            <Chip size="small" label={`${policiesQuery.data?.totalCount || 0} version(s)`} />
          </Stack>
          {policiesQuery.isFetching && <LinearProgress aria-label="Loading fee policies" />}
          {policiesQuery.isError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => policiesQuery.refetch()}>
                  Retry
                </Button>
              }
            >
              Fee policies could not be loaded.
            </Alert>
          ) : null}
          {!policiesQuery.isFetching &&
          !policiesQuery.isError &&
          !policiesQuery.data?.items.length ? (
            <Alert severity="info">No admission fee policies are configured for this cycle.</Alert>
          ) : null}
          {(policiesQuery.data?.items || []).map((policy) => (
            <Stack
              key={policy.id}
              direction={{ xs: 'column', md: 'row' }}
              gap={1}
              alignItems={{ md: 'center' }}
              justifyContent="space-between"
              sx={{ py: 1, borderTop: '1px solid', borderColor: 'divider' }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {policy.name}{' '}
                  <Typography component="span" variant="caption" color="text.secondary">
                    {policy.code} v{policy.version}
                  </Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {gateLabels[policy.gateType]} at {milestoneLabels[policy.gateMilestone]} ·{' '}
                  {formatIndianCurrency(calculateFeeTotal(policy.components))}
                </Typography>
              </Box>
              <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
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
