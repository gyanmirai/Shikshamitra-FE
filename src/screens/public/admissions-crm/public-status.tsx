'use client';

import { useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import {
  AdmissionCrmRouteType,
  AdmissionCrmActivationStatus,
  AdmissionCrmRouteEligibilityStatus,
} from 'src/redux/student/admissions-crm/admissions-crm-api';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Select,
  Divider,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  LinearProgress,
} from '@mui/material';

import { PublicAdmissionsShell } from './public-admissions-shell';
import PublicOffer, { type PublicAdmissionOffer } from './public-offer';
import { readPublicAdmissionStatusProblem } from './public-status-utils';
import PublicDocuments, { type PublicDocumentChecklist } from './public-documents';
import PublicExamScheduling, { type PublicExamSnapshot } from './public-exam-scheduling';
import PublicRegistration, { type PublicRegistrationApplication } from './public-registration';

const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

type OtpChallenge = {
  maskedDestination: string;
  otpExpiresAt: string;
  deliveryConfigured: boolean;
  deliveryStatus: string;
};

type ApplicantStatus = {
  language: 'en' | 'gu' | 'hi';
  supportedLanguages: string[];
  displayName: string;
  stageName: string;
  lastActivityTime: string;
  nextStep: string;
  accessSessionToken?: string | null;
  accessSessionExpiresAt?: string | null;
  registration?: PublicRegistrationApplication | null;
  documents?: PublicDocumentChecklist | null;
  offer?: PublicAdmissionOffer | null;
  admissionRoute?: {
    routeType: AdmissionCrmRouteType;
    eligibilityStatus: AdmissionCrmRouteEligibilityStatus;
    assignedAt: string;
    evaluatedAt?: string | null;
  } | null;
  activation?: {
    activationReference: string;
    status: AdmissionCrmActivationStatus;
    firstDayReadyAt?: string | null;
  } | null;
  financialStatus?: {
    quotationId: string;
    quotationNumber: string;
    currency: string;
    components: Array<{
      name: string;
      amount: number;
      isRefundable: boolean;
      parentDescription?: string | null;
    }>;
    grossAmount: number;
    concessionAmount: number;
    netAmount: number;
    confirmedAmount: number;
    outstandingAmount: number;
    financeState: number;
    isGateSatisfied: boolean;
    validUntil: string;
    financeReference?: string | null;
  } | null;
  checklist: Array<{
    key: string;
    label: string;
    status: string;
    details?: string | null;
  }>;
  applicantChecklist: Array<{
    key: string;
    label: string;
    status: string;
    statusCode?: string | null;
    details?: string | null;
    isRequired?: boolean;
    isComplete?: boolean;
    statusChangedAt?: string | null;
  }>;
  activity: Array<{
    type: string;
    title: string;
    details?: string | null;
    occurredAt: string;
  }>;
  exam?: PublicExamSnapshot | null;
};

type OtpFeedback = {
  code?: string;
  message: string;
  severity: 'error' | 'warning';
};

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const getApplicantChecklistColor = (
  item: ApplicantStatus['applicantChecklist'][number]
): 'default' | 'info' | 'success' | 'warning' => {
  if (item.isComplete) return 'success';
  if (item.status === 'Requested') return 'info';
  if (item.status === 'Required') return 'warning';
  return 'default';
};

export default function PublicAdmissionStatusScreen({
  tenantId,
  token,
}: {
  tenantId: string;
  token: string;
}) {
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [status, setStatus] = useState<ApplicantStatus | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpFeedback, setOtpFeedback] = useState<OtpFeedback | null>(null);
  const [language, setLanguage] = useState<'en' | 'gu' | 'hi'>('en');
  const isOtpLocked = otpFeedback?.code === 'AdmissionCrm:StatusOtpLocked';

  const issueOtp = async () => {
    setIsIssuing(true);
    setOtpFeedback(null);
    try {
      const response = await fetch(
        `${API_BASE}/public/student-enrollment/admissions-crm/${tenantId}/status/${token}/otp`,
        { method: 'POST' }
      );
      if (!response.ok) {
        const problem = await readPublicAdmissionStatusProblem(
          response,
          'Unable to create OTP challenge.'
        );
        setOtpFeedback({
          code: problem.code,
          message: problem.message,
          severity: problem.code === 'AdmissionCrm:StatusOtpResendTooSoon' ? 'warning' : 'error',
        });
        throw new Error(problem.message);
      }

      setChallenge((await response.json()) as OtpChallenge);
      setOtpCode('');
      setOtpFeedback(null);
    } catch (error) {
      shikshaMitraToast.error({
        message: error instanceof Error ? error.message : 'Unable to create OTP challenge.',
      });
    } finally {
      setIsIssuing(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpCode.trim()) {
      shikshaMitraToast.error({ message: 'Enter the OTP code.' });
      return;
    }

    setIsVerifying(true);
    setOtpFeedback(null);
    try {
      const response = await fetch(
        `${API_BASE}/public/student-enrollment/admissions-crm/${tenantId}/status/${token}/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otpCode, language }),
        }
      );
      if (!response.ok) {
        const problem = await readPublicAdmissionStatusProblem(response, 'Unable to verify OTP.');
        setOtpFeedback({
          code: problem.code,
          message: problem.message,
          severity:
            problem.code === 'AdmissionCrm:InvalidStatusOtp' ||
            problem.code === 'AdmissionCrm:StatusOtpExpired'
              ? 'warning'
              : 'error',
        });
        throw new Error(problem.message);
      }

      setStatus((await response.json()) as ApplicantStatus);
      setOtpFeedback(null);
    } catch (error) {
      shikshaMitraToast.error({
        message: error instanceof Error ? error.message : 'Unable to verify OTP.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <PublicAdmissionsShell
      title="Admission Status"
      description="Verify your contact to review schedules, forms, documents, offers, and next actions."
    >
      <Paper
        variant="outlined"
        sx={{ p: { xs: 2, md: 3 }, width: '100%', maxWidth: 680, borderRadius: 1 }}
      >
        <Stack spacing={2}>
          <FormControl size="small" sx={{ alignSelf: 'flex-end', minWidth: 140 }}>
            <InputLabel id="admission-status-language">Language</InputLabel>
            <Select
              labelId="admission-status-language"
              label="Language"
              value={language}
              onChange={(event) => setLanguage(event.target.value as 'en' | 'gu' | 'hi')}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="gu">ગુજરાતી</MenuItem>
              <MenuItem value="hi">हिन्दी</MenuItem>
            </Select>
          </FormControl>
          {isIssuing && <LinearProgress />}

          {!challenge && !status && (
            <LoadingButton variant="contained" loading={isIssuing} onClick={issueOtp}>
              Send OTP
            </LoadingButton>
          )}

          {challenge && !status && (
            <Stack spacing={1.5}>
              <Alert severity={challenge.deliveryConfigured ? 'info' : 'warning'}>
                {challenge.deliveryStatus}
              </Alert>
              {otpFeedback && <Alert severity={otpFeedback.severity}>{otpFeedback.message}</Alert>}
              <Typography variant="body2" color="text.secondary">
                Destination: {challenge.maskedDestination}
              </Typography>
              <TextField
                label="OTP code"
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value)}
                disabled={isOtpLocked}
                name="one-time-code"
                autoComplete="one-time-code"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                fullWidth
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <LoadingButton
                  variant="contained"
                  loading={isVerifying}
                  disabled={isOtpLocked || isIssuing}
                  onClick={verifyOtp}
                >
                  Verify
                </LoadingButton>
                <LoadingButton variant="outlined" loading={isIssuing} onClick={issueOtp}>
                  Resend OTP
                </LoadingButton>
              </Stack>
            </Stack>
          )}

          {status && (
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
                <Typography variant="subtitle1">{status.displayName}</Typography>
                <Chip color="primary" label={status.stageName} />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Last activity: {dateTimeFormatter.format(new Date(status.lastActivityTime))}
              </Typography>
              <Alert severity="info">{status.nextStep}</Alert>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="subtitle2">Checklist</Typography>
                {status.checklist.map((item) => (
                  <Stack
                    key={item.key}
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    gap={1}
                    sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}
                  >
                    <Box>
                      <Typography variant="body2">{item.label}</Typography>
                      {item.details && (
                        <Typography variant="caption" color="text.secondary">
                          {item.details}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      size="small"
                      label={item.status}
                      color={item.status === 'Completed' ? 'success' : 'default'}
                    />
                  </Stack>
                ))}
              </Stack>
              {(status.applicantChecklist ?? []).length > 0 && (
                <>
                  <Divider />
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Applicant checklist</Typography>
                    {(status.applicantChecklist ?? []).map((item) => (
                      <Stack
                        key={item.key}
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        gap={1}
                        sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}
                      >
                        <Box>
                          <Typography variant="body2">{item.label}</Typography>
                          {item.details && (
                            <Typography variant="caption" color="text.secondary">
                              {item.details}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          size="small"
                          label={item.status}
                          color={getApplicantChecklistColor(item)}
                        />
                      </Stack>
                    ))}
                  </Stack>
                </>
              )}
              {status.activity.length > 0 && (
                <>
                  <Divider />
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Recent activity</Typography>
                    {status.activity.map((item, index) => (
                      <Stack
                        key={`${item.type}-${item.occurredAt}-${index}`}
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        gap={1}
                        sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}
                      >
                        <Box>
                          <Typography variant="body2">{item.title}</Typography>
                          {item.details && (
                            <Typography variant="caption" color="text.secondary">
                              {item.details}
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {dateTimeFormatter.format(new Date(item.occurredAt))}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </>
              )}
              {status.exam && (
                <>
                  <Divider />
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">Entrance Exam</Typography>
                    <Typography variant="body2">
                      {status.exam.slotName || 'Entrance exam'} - room {status.exam.roomNo || '-'}
                    </Typography>
                    {status.exam.examStartTime && (
                      <Typography variant="body2" color="text.secondary">
                        {dateTimeFormatter.format(new Date(status.exam.examStartTime))}
                      </Typography>
                    )}
                    {status.exam.obtainedMarks !== null &&
                      status.exam.obtainedMarks !== undefined &&
                      status.exam.totalMarks !== null &&
                      status.exam.totalMarks !== undefined && (
                        <Typography variant="body2" color="text.secondary">
                          Marks: {status.exam.obtainedMarks}/{status.exam.totalMarks}
                          {status.exam.percentage !== null && status.exam.percentage !== undefined
                            ? ` (${status.exam.percentage.toFixed(2)}%)`
                            : ''}
                        </Typography>
                      )}
                    {status.exam.meritRank && (
                      <Typography variant="body2" color="text.secondary">
                        Merit rank: {status.exam.meritRank}
                      </Typography>
                    )}
                    {status.exam.eligibilityDecisionReason && (
                      <Alert severity="success">{status.exam.eligibilityDecisionReason}</Alert>
                    )}
                  </Stack>
                </>
              )}
              {status.registration && status.accessSessionToken ? (
                <PublicRegistration
                  tenantId={tenantId}
                  token={token}
                  accessSessionToken={status.accessSessionToken}
                  application={status.registration}
                  onUpdated={(registration) =>
                    setStatus((current) => (current ? { ...current, registration } : current))
                  }
                />
              ) : null}
              {status.financialStatus ? (
                <>
                  <Divider />
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      gap={1}
                      alignItems="center"
                    >
                      <Box>
                        <Typography variant="subtitle2">Admission quotation</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {status.financialStatus.quotationNumber} - valid until{' '}
                          {dateTimeFormatter.format(new Date(status.financialStatus.validUntil))}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        color={status.financialStatus.isGateSatisfied ? 'success' : 'warning'}
                        label={
                          status.financialStatus.isGateSatisfied
                            ? 'Condition satisfied'
                            : 'Action pending'
                        }
                      />
                    </Stack>
                    {status.financialStatus.components.map((component) => (
                      <Stack
                        key={`${component.name}-${component.amount}`}
                        direction="row"
                        justifyContent="space-between"
                        gap={1}
                        sx={{ py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}
                      >
                        <Box>
                          <Typography variant="body2">{component.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {component.isRefundable ? 'Refundable' : 'Non-refundable'}
                            {component.parentDescription ? ` - ${component.parentDescription}` : ''}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          {status.financialStatus!.currency} {component.amount.toFixed(2)}
                        </Typography>
                      </Stack>
                    ))}
                    <Stack direction="row" gap={0.75} flexWrap="wrap">
                      <Chip
                        size="small"
                        label={`Total: ${status.financialStatus.currency} ${status.financialStatus.grossAmount.toFixed(2)}`}
                      />
                      <Chip
                        size="small"
                        label={`Concession: ${status.financialStatus.currency} ${status.financialStatus.concessionAmount.toFixed(2)}`}
                      />
                      <Chip
                        size="small"
                        color="primary"
                        label={`Payable: ${status.financialStatus.currency} ${status.financialStatus.netAmount.toFixed(2)}`}
                      />
                      <Chip
                        size="small"
                        color="success"
                        label={`Confirmed: ${status.financialStatus.currency} ${status.financialStatus.confirmedAmount.toFixed(2)}`}
                      />
                      <Chip
                        size="small"
                        color={status.financialStatus.outstandingAmount ? 'warning' : 'default'}
                        label={`Outstanding: ${status.financialStatus.currency} ${status.financialStatus.outstandingAmount.toFixed(2)}`}
                      />
                    </Stack>
                    {status.financialStatus.financeReference ? (
                      <Typography variant="caption" color="text.secondary">
                        Finance reference: {status.financialStatus.financeReference}
                      </Typography>
                    ) : null}
                  </Stack>
                </>
              ) : null}
              {status.offer && status.accessSessionToken ? (
                <PublicOffer
                  tenantId={tenantId}
                  token={token}
                  accessSessionToken={status.accessSessionToken}
                  offer={status.offer}
                  onUpdated={(offer) =>
                    setStatus((current) => (current ? { ...current, offer } : current))
                  }
                />
              ) : null}
              {status.admissionRoute ? (
                <>
                  <Divider />
                  <Stack spacing={0.75}>
                    <Typography variant="subtitle2">Admission route</Typography>
                    <Stack direction="row" gap={0.75} flexWrap="wrap">
                      <Chip
                        size="small"
                        label={AdmissionCrmRouteType[status.admissionRoute.routeType]}
                      />
                      <Chip
                        size="small"
                        color={
                          status.admissionRoute.eligibilityStatus ===
                            AdmissionCrmRouteEligibilityStatus.Eligible ||
                          status.admissionRoute.eligibilityStatus ===
                            AdmissionCrmRouteEligibilityStatus.ExceptionApproved
                            ? 'success'
                            : status.admissionRoute.eligibilityStatus ===
                                AdmissionCrmRouteEligibilityStatus.Ineligible
                              ? 'error'
                              : 'warning'
                        }
                        label={
                          AdmissionCrmRouteEligibilityStatus[
                            status.admissionRoute.eligibilityStatus
                          ]
                        }
                      />
                    </Stack>
                  </Stack>
                </>
              ) : null}
              {status.activation ? (
                <>
                  <Divider />
                  <Alert
                    severity={
                      status.activation.status === AdmissionCrmActivationStatus.FirstDayReady
                        ? 'success'
                        : 'info'
                    }
                  >
                    <Typography variant="subtitle2">
                      {status.activation.status === AdmissionCrmActivationStatus.FirstDayReady
                        ? 'Ready to join school'
                        : 'Final enrollment setup in progress'}
                    </Typography>
                    <Typography variant="body2">
                      Reference {status.activation.activationReference}
                      {status.activation.firstDayReadyAt
                        ? ` - completed ${dateTimeFormatter.format(new Date(status.activation.firstDayReadyAt))}`
                        : ''}
                    </Typography>
                  </Alert>
                </>
              ) : null}
              {status.accessSessionToken && (status.exam?.examStatus ?? 0) === 0 ? (
                <PublicExamScheduling
                  tenantId={tenantId}
                  token={token}
                  accessSessionToken={status.accessSessionToken}
                  currentExam={status.exam}
                  onScheduled={(exam) =>
                    setStatus((current) => (current ? { ...current, exam } : current))
                  }
                />
              ) : null}
              {status.documents && status.accessSessionToken ? (
                <PublicDocuments
                  tenantId={tenantId}
                  token={token}
                  accessSessionToken={status.accessSessionToken}
                  checklist={status.documents}
                  onUpdated={(documents) =>
                    setStatus((current) => (current ? { ...current, documents } : current))
                  }
                />
              ) : null}
            </Stack>
          )}
        </Stack>
      </Paper>
    </PublicAdmissionsShell>
  );
}
