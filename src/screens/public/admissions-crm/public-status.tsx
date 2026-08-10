'use client';

import { useState, useEffect } from 'react';
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

import PublicEvents from './public-events';
import { PublicAdmissionsShell } from './public-admissions-shell';
import { getFamilyStatusStorageKey } from './public-family-session';
import PublicOffer, { type PublicAdmissionOffer } from './public-offer';
import { getAccessibleStatusChipProps } from './public-admissions-styles';
import { usePublicAdmissionsPortal } from './use-public-admissions-portal';
import PublicDocuments, { type PublicDocumentChecklist } from './public-documents';
import PublicExamScheduling, { type PublicExamSnapshot } from './public-exam-scheduling';
import { publicAdmissionsCopy, publicAdmissionsStatusCopy } from './public-admissions-copy';
import PublicRegistration, { type PublicRegistrationApplication } from './public-registration';
import PublicFamilyControls, {
  type PublicAdmissionCommunicationPreferences,
} from './public-family-controls';
import {
  createPublicAdmissionSafeError,
  readPublicAdmissionStatusProblem,
  getPublicAdmissionRequestErrorMessage,
} from './public-status-utils';
import {
  getPublicAdmissionsCoreLanguage,
  getPublicAdmissionsLanguageLabel,
  getPublicAdmissionsLanguageOptions,
} from './public-admissions-portal';
import {
  formatPublicNumber,
  getPublicRouteLabel,
  formatPublicCurrency,
  formatPublicDateTime,
  getPublicStatusLabel,
  getPublicRouteEligibilityLabel,
} from './public-admissions-format';

type OtpChallenge = {
  maskedDestination: string;
  otpExpiresAt: string;
  deliveryConfigured: boolean;
  deliveryStatus: string;
};

type ApplicantStatus = {
  language: string;
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
  familyApplications?: Array<{
    leadId: string;
    academicYearId: string;
    statusToken: string;
    displayName: string;
    desiredClassName?: string | null;
    stageName: string;
    lastActivityTime: string;
  }>;
  communicationPreferences?: PublicAdmissionCommunicationPreferences;
  canWithdrawApplication?: boolean;
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
  const portal = usePublicAdmissionsPortal(tenantId);
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [status, setStatus] = useState<ApplicantStatus | null>(() => {
    if (typeof window === 'undefined') return null;
    const storageKey = getFamilyStatusStorageKey(tenantId, token);
    const stored = window.sessionStorage.getItem(storageKey);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored) as ApplicantStatus;
      if (
        !parsed.accessSessionExpiresAt ||
        new Date(parsed.accessSessionExpiresAt).getTime() <= Date.now()
      ) {
        window.sessionStorage.removeItem(storageKey);
        return null;
      }
      return parsed;
    } catch {
      window.sessionStorage.removeItem(storageKey);
      return null;
    }
  });
  const [isIssuing, setIsIssuing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpFeedback, setOtpFeedback] = useState<OtpFeedback | null>(null);
  const [language, setLanguage] = useState('en');
  const [currentToken, setCurrentToken] = useState(token);
  const [isSwitchingApplication, setIsSwitchingApplication] = useState(false);
  const copyLanguage = getPublicAdmissionsCoreLanguage(language);
  const copy = publicAdmissionsCopy[copyLanguage];
  const statusCopy = publicAdmissionsStatusCopy[copyLanguage];
  const languageOptions = getPublicAdmissionsLanguageOptions(
    status?.supportedLanguages ?? portal?.supportedLanguages
  );
  const isOtpLocked = otpFeedback?.code === 'AdmissionCrm:StatusOtpLocked';

  useEffect(() => {
    if (portal?.defaultLanguage && language === 'en') setLanguage(portal.defaultLanguage);
  }, [language, portal?.defaultLanguage]);

  useEffect(() => {
    if (!status?.accessSessionToken || !status.accessSessionExpiresAt) return;
    try {
      window.sessionStorage.setItem(
        getFamilyStatusStorageKey(tenantId, currentToken),
        JSON.stringify(status)
      );
    } catch {
      // The verified journey remains usable when browser session storage is unavailable.
    }
  }, [currentToken, status, tenantId]);

  const issueOtp = async () => {
    setIsIssuing(true);
    setOtpFeedback(null);
    try {
      const response = await fetch(
        `${API_BASE}/public/student-enrollment/admissions-crm/${tenantId}/status/${currentToken}/otp`,
        { method: 'POST' }
      );
      if (!response.ok) {
        const problem = await readPublicAdmissionStatusProblem(
          response,
          statusCopy.unableIssueOtp,
          copyLanguage
        );
        setOtpFeedback({
          code: problem.code,
          message: problem.message,
          severity: problem.code === 'AdmissionCrm:StatusOtpResendTooSoon' ? 'warning' : 'error',
        });
        throw createPublicAdmissionSafeError(problem.message);
      }

      setChallenge((await response.json()) as OtpChallenge);
      setOtpCode('');
      setOtpFeedback(null);
    } catch (error) {
      shikshaMitraToast.error({
        message: getPublicAdmissionRequestErrorMessage(
          error,
          statusCopy.unableIssueOtp,
          copyLanguage
        ),
      });
    } finally {
      setIsIssuing(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpCode.trim()) {
      shikshaMitraToast.error({ message: statusCopy.enterOtp });
      return;
    }

    setIsVerifying(true);
    setOtpFeedback(null);
    try {
      const response = await fetch(
        `${API_BASE}/public/student-enrollment/admissions-crm/${tenantId}/status/${currentToken}/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otpCode, language }),
        }
      );
      if (!response.ok) {
        const problem = await readPublicAdmissionStatusProblem(
          response,
          statusCopy.unableVerifyOtp,
          copyLanguage
        );
        setOtpFeedback({
          code: problem.code,
          message: problem.message,
          severity:
            problem.code === 'AdmissionCrm:InvalidStatusOtp' ||
            problem.code === 'AdmissionCrm:StatusOtpExpired'
              ? 'warning'
              : 'error',
        });
        throw createPublicAdmissionSafeError(problem.message);
      }

      setStatus((await response.json()) as ApplicantStatus);
      setOtpFeedback(null);
    } catch (error) {
      shikshaMitraToast.error({
        message: getPublicAdmissionRequestErrorMessage(
          error,
          statusCopy.unableVerifyOtp,
          copyLanguage
        ),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const switchApplication = async (nextToken: string) => {
    if (!status?.accessSessionToken || nextToken === currentToken) return;

    setIsSwitchingApplication(true);
    try {
      const response = await fetch(
        `${API_BASE}/public/student-enrollment/admissions-crm/${tenantId}/status/${nextToken}?language=${language}`,
        { headers: { 'X-Admission-Access-Session': status.accessSessionToken } }
      );
      if (!response.ok) {
        const problem = await readPublicAdmissionStatusProblem(
          response,
          statusCopy.unableSwitchApplication,
          copyLanguage
        );
        throw createPublicAdmissionSafeError(problem.message);
      }

      setStatus((await response.json()) as ApplicantStatus);
      setCurrentToken(nextToken);
    } catch (error) {
      shikshaMitraToast.error({
        message: getPublicAdmissionRequestErrorMessage(
          error,
          statusCopy.unableSwitchApplication,
          copyLanguage
        ),
      });
    } finally {
      setIsSwitchingApplication(false);
    }
  };

  return (
    <PublicAdmissionsShell
      title={copy.statusTitle}
      description={copy.statusDescription}
      language={copyLanguage}
      portal={portal}
    >
      <Paper
        variant="outlined"
        sx={{ p: { xs: 2, md: 3 }, width: '100%', maxWidth: 680, borderRadius: 1 }}
      >
        <Stack spacing={2}>
          <FormControl size="small" sx={{ alignSelf: 'flex-end', minWidth: 140 }}>
            <InputLabel id="admission-status-language">{copy.language}</InputLabel>
            <Select
              labelId="admission-status-language"
              label={copy.language}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {languageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {getPublicAdmissionsLanguageLabel(option, copyLanguage)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {isIssuing && <LinearProgress />}

          {!challenge && !status && (
            <LoadingButton variant="contained" loading={isIssuing} onClick={issueOtp}>
              {copy.sendOtp}
            </LoadingButton>
          )}

          {challenge && !status && (
            <Stack spacing={1.5}>
              <Alert severity={challenge.deliveryConfigured ? 'info' : 'warning'}>
                {challenge.deliveryStatus}
              </Alert>
              {otpFeedback && <Alert severity={otpFeedback.severity}>{otpFeedback.message}</Alert>}
              <Typography variant="body2" color="text.secondary">
                {copy.destination}: {challenge.maskedDestination}
              </Typography>
              <TextField
                label={copy.otpCode}
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
                  {copy.verify}
                </LoadingButton>
                <LoadingButton variant="outlined" loading={isIssuing} onClick={issueOtp}>
                  {copy.resendOtp}
                </LoadingButton>
              </Stack>
            </Stack>
          )}

          {status && (
            <Stack spacing={1.5}>
              {(status.familyApplications?.length ?? 0) > 1 ? (
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">{statusCopy.familyApplications}</Typography>
                    <FormControl size="small" fullWidth>
                      <InputLabel id="family-application-select-label">
                        {statusCopy.familyApplications}
                      </InputLabel>
                      <Select
                        labelId="family-application-select-label"
                        label={statusCopy.familyApplications}
                        value={currentToken}
                        disabled={isSwitchingApplication}
                        onChange={(event) => switchApplication(event.target.value)}
                      >
                        {status.familyApplications?.map((application) => (
                          <MenuItem key={application.leadId} value={application.statusToken}>
                            {application.displayName}
                            {application.desiredClassName
                              ? ` · ${statusCopy.desiredClass}: ${application.desiredClassName}`
                              : ''}
                            {` · ${application.stageName}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {isSwitchingApplication ? (
                      <LinearProgress aria-label={statusCopy.familyApplications} />
                    ) : null}
                  </Stack>
                </Paper>
              ) : null}
              <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
                <Typography variant="subtitle1">{status.displayName}</Typography>
                <Chip {...getAccessibleStatusChipProps('primary')} label={status.stageName} />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {statusCopy.lastActivity}:{' '}
                {formatPublicDateTime(status.lastActivityTime, copyLanguage)}
              </Typography>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" gap={1}>
                    <Typography variant="subtitle2">{statusCopy.progress}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {status.checklist.filter((item) => item.status === 'Completed').length}/
                      {status.checklist.length}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={
                      status.checklist.length
                        ? (status.checklist.filter((item) => item.status === 'Completed').length /
                            status.checklist.length) *
                          100
                        : 0
                    }
                    aria-label={statusCopy.progress}
                  />
                  <Typography variant="body2">
                    <strong>{statusCopy.currentStep}:</strong> {status.stageName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{statusCopy.nextStep}:</strong> {status.nextStep}
                  </Typography>
                </Stack>
              </Paper>
              <Alert severity="info">{status.nextStep}</Alert>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="subtitle2">{statusCopy.checklist}</Typography>
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
                      label={getPublicStatusLabel(item.status, copyLanguage)}
                      {...getAccessibleStatusChipProps(
                        item.status === 'Completed' ? 'success' : 'default'
                      )}
                    />
                  </Stack>
                ))}
              </Stack>
              {(status.applicantChecklist ?? []).length > 0 && (
                <>
                  <Divider />
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">{statusCopy.applicantChecklist}</Typography>
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
                          label={getPublicStatusLabel(item.status, copyLanguage)}
                          {...getAccessibleStatusChipProps(getApplicantChecklistColor(item))}
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
                    <Typography variant="subtitle2">{statusCopy.recentActivity}</Typography>
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
                          {formatPublicDateTime(item.occurredAt, copyLanguage)}
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
                    <Typography variant="subtitle2">{statusCopy.entranceExam}</Typography>
                    <Typography variant="body2">
                      {status.exam.slotName || statusCopy.entranceExamFallback} - {statusCopy.room}{' '}
                      {status.exam.roomNo || '-'}
                    </Typography>
                    {status.exam.examStartTime && (
                      <Typography variant="body2" color="text.secondary">
                        {formatPublicDateTime(status.exam.examStartTime, copyLanguage)}
                      </Typography>
                    )}
                    {status.exam.obtainedMarks !== null &&
                      status.exam.obtainedMarks !== undefined &&
                      status.exam.totalMarks !== null &&
                      status.exam.totalMarks !== undefined && (
                        <Typography variant="body2" color="text.secondary">
                          {statusCopy.marks}:{' '}
                          {formatPublicNumber(status.exam.obtainedMarks, copyLanguage)}/
                          {formatPublicNumber(status.exam.totalMarks, copyLanguage)}
                          {status.exam.percentage !== null && status.exam.percentage !== undefined
                            ? ` (${formatPublicNumber(status.exam.percentage, copyLanguage, { maximumFractionDigits: 2 })}%)`
                            : ''}
                        </Typography>
                      )}
                    {status.exam.meritRank && (
                      <Typography variant="body2" color="text.secondary">
                        {statusCopy.meritRank}:{' '}
                        {formatPublicNumber(status.exam.meritRank, copyLanguage)}
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
                  token={currentToken}
                  accessSessionToken={status.accessSessionToken}
                  application={status.registration}
                  language={copyLanguage}
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
                        <Typography variant="subtitle2">{statusCopy.admissionQuotation}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {status.financialStatus.quotationNumber} - {statusCopy.validUntil}{' '}
                          {formatPublicDateTime(status.financialStatus.validUntil, copyLanguage)}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        {...getAccessibleStatusChipProps(
                          status.financialStatus.isGateSatisfied ? 'success' : 'warning'
                        )}
                        label={
                          status.financialStatus.isGateSatisfied
                            ? statusCopy.conditionSatisfied
                            : statusCopy.actionPending
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
                            {component.isRefundable
                              ? statusCopy.refundable
                              : statusCopy.nonRefundable}
                            {component.parentDescription ? ` - ${component.parentDescription}` : ''}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          {formatPublicCurrency(
                            component.amount,
                            status.financialStatus!.currency,
                            copyLanguage
                          )}
                        </Typography>
                      </Stack>
                    ))}
                    <Stack direction="row" gap={1} flexWrap="wrap">
                      <Chip
                        size="small"
                        label={`${statusCopy.total}: ${formatPublicCurrency(status.financialStatus.grossAmount, status.financialStatus.currency, copyLanguage)}`}
                      />
                      <Chip
                        size="small"
                        label={`${statusCopy.concession}: ${formatPublicCurrency(status.financialStatus.concessionAmount, status.financialStatus.currency, copyLanguage)}`}
                      />
                      <Chip
                        size="small"
                        {...getAccessibleStatusChipProps('primary')}
                        label={`${statusCopy.payable}: ${formatPublicCurrency(status.financialStatus.netAmount, status.financialStatus.currency, copyLanguage)}`}
                      />
                      <Chip
                        size="small"
                        {...getAccessibleStatusChipProps('success')}
                        label={`${statusCopy.confirmed}: ${formatPublicCurrency(status.financialStatus.confirmedAmount, status.financialStatus.currency, copyLanguage)}`}
                      />
                      <Chip
                        size="small"
                        {...getAccessibleStatusChipProps(
                          status.financialStatus.outstandingAmount ? 'warning' : 'default'
                        )}
                        label={`${statusCopy.outstanding}: ${formatPublicCurrency(status.financialStatus.outstandingAmount, status.financialStatus.currency, copyLanguage)}`}
                      />
                    </Stack>
                    {status.financialStatus.financeReference ? (
                      <Typography variant="caption" color="text.secondary">
                        {statusCopy.financeReference}: {status.financialStatus.financeReference}
                      </Typography>
                    ) : null}
                  </Stack>
                </>
              ) : null}
              {status.offer && status.accessSessionToken ? (
                <PublicOffer
                  tenantId={tenantId}
                  token={currentToken}
                  accessSessionToken={status.accessSessionToken}
                  offer={status.offer}
                  language={copyLanguage}
                  onUpdated={(offer) =>
                    setStatus((current) => (current ? { ...current, offer } : current))
                  }
                />
              ) : null}
              {status.admissionRoute ? (
                <>
                  <Divider />
                  <Stack spacing={0.75}>
                    <Typography variant="subtitle2">{statusCopy.admissionRoute}</Typography>
                    <Stack direction="row" gap={0.75} flexWrap="wrap">
                      <Chip
                        size="small"
                        label={getPublicRouteLabel(status.admissionRoute.routeType, copyLanguage)}
                      />
                      <Chip
                        size="small"
                        {...getAccessibleStatusChipProps(
                          status.admissionRoute.eligibilityStatus ===
                            AdmissionCrmRouteEligibilityStatus.Eligible ||
                            status.admissionRoute.eligibilityStatus ===
                              AdmissionCrmRouteEligibilityStatus.ExceptionApproved
                            ? 'success'
                            : status.admissionRoute.eligibilityStatus ===
                                AdmissionCrmRouteEligibilityStatus.Ineligible
                              ? 'error'
                              : 'warning'
                        )}
                        label={getPublicRouteEligibilityLabel(
                          status.admissionRoute.eligibilityStatus,
                          copyLanguage
                        )}
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
                        ? statusCopy.readyToJoin
                        : statusCopy.setupInProgress}
                    </Typography>
                    <Typography variant="body2">
                      {statusCopy.reference} {status.activation.activationReference}
                      {status.activation.firstDayReadyAt
                        ? ` - ${statusCopy.completedOn} ${formatPublicDateTime(status.activation.firstDayReadyAt, copyLanguage)}`
                        : ''}
                    </Typography>
                  </Alert>
                </>
              ) : null}
              {status.accessSessionToken && (status.exam?.examStatus ?? 0) === 0 ? (
                <PublicExamScheduling
                  tenantId={tenantId}
                  token={currentToken}
                  accessSessionToken={status.accessSessionToken}
                  currentExam={status.exam}
                  language={copyLanguage}
                  onScheduled={(exam) =>
                    setStatus((current) => (current ? { ...current, exam } : current))
                  }
                />
              ) : null}
              {status.accessSessionToken ? (
                <PublicEvents
                  tenantId={tenantId}
                  token={currentToken}
                  accessSessionToken={status.accessSessionToken}
                  language={copyLanguage}
                />
              ) : null}
              {status.documents && status.accessSessionToken ? (
                <PublicDocuments
                  tenantId={tenantId}
                  token={currentToken}
                  accessSessionToken={status.accessSessionToken}
                  checklist={status.documents}
                  language={copyLanguage}
                  onUpdated={(documents) =>
                    setStatus((current) => (current ? { ...current, documents } : current))
                  }
                />
              ) : null}
              {status.communicationPreferences && status.accessSessionToken ? (
                <PublicFamilyControls
                  tenantId={tenantId}
                  token={currentToken}
                  accessSessionToken={status.accessSessionToken}
                  language={copyLanguage}
                  preferences={status.communicationPreferences}
                  canWithdrawApplication={status.canWithdrawApplication ?? false}
                  onUpdated={(updated) => setStatus(updated as unknown as ApplicantStatus)}
                />
              ) : null}
            </Stack>
          )}
        </Stack>
      </Paper>
    </PublicAdmissionsShell>
  );
}
