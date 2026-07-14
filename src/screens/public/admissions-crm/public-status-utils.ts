export type PublicAdmissionStatusProblem = {
  code?: string;
  title?: string;
  detail?: string;
  data?: Record<string, unknown>;
  error?: {
    code?: string;
    message?: string;
    details?: string;
    data?: Record<string, unknown>;
  };
};

export type PublicAdmissionStatusProblemResult = {
  code?: string;
  message: string;
};

const admissionCrmCodePattern = /AdmissionCrm:[A-Za-z0-9]+/;

const getProblemCode = (problem?: PublicAdmissionStatusProblem | null) => {
  const explicitCode = problem?.error?.code || problem?.code;
  if (explicitCode) return explicitCode;

  const text = [problem?.detail, problem?.title, problem?.error?.message, problem?.error?.details]
    .filter(Boolean)
    .join(' ');

  return text.match(admissionCrmCodePattern)?.[0];
};

const getProblemDataValue = (
  problem: PublicAdmissionStatusProblem | null | undefined,
  key: string
) => problem?.error?.data?.[key] ?? problem?.data?.[key];

const formatRetryAfter = (problem?: PublicAdmissionStatusProblem | null) => {
  const retryAfter = Number(
    getProblemDataValue(problem, 'RetryAfterSeconds') ??
      getProblemDataValue(problem, 'retryAfterSeconds')
  );

  if (!Number.isFinite(retryAfter) || retryAfter <= 0) {
    return 'Please wait before requesting another OTP.';
  }

  const seconds = Math.ceil(retryAfter);
  return `Please wait ${seconds} second${seconds === 1 ? '' : 's'} before requesting another OTP.`;
};

export const getPublicAdmissionStatusProblemMessage = (
  problem: PublicAdmissionStatusProblem | null | undefined,
  fallback: string
): PublicAdmissionStatusProblemResult => {
  const code = getProblemCode(problem);

  switch (code) {
    case 'AdmissionCrm:StatusOtpResendTooSoon':
      return { code, message: formatRetryAfter(problem) };
    case 'AdmissionCrm:InvalidStatusOtp':
      return { code, message: 'The OTP code is incorrect. Check the latest code and try again.' };
    case 'AdmissionCrm:StatusOtpLocked':
      return { code, message: 'Too many incorrect OTP attempts. Request a new OTP to continue.' };
    case 'AdmissionCrm:StatusOtpExpired':
      return { code, message: 'This OTP has expired. Request a new OTP to continue.' };
    case 'AdmissionCrm:StatusOtpNotIssued':
      return { code, message: 'Request an OTP before checking the admission status.' };
    case 'AdmissionCrm:StatusTokenExpired':
      return {
        code,
        message: 'This status link has expired. Contact the school admissions office.',
      };
    case 'AdmissionCrm:StatusTokenInvalid':
      return {
        code,
        message:
          'This status link is invalid. Check the link or contact the school admissions office.',
      };
    default:
      return {
        code,
        message:
          problem?.detail ||
          problem?.error?.details ||
          problem?.error?.message ||
          problem?.title ||
          fallback,
      };
  }
};

export async function readPublicAdmissionStatusProblem(
  response: Response,
  fallback: string
): Promise<PublicAdmissionStatusProblemResult> {
  let payload: PublicAdmissionStatusProblem | null = null;

  try {
    payload = (await response.json()) as PublicAdmissionStatusProblem;
  } catch {
    payload = null;
  }

  return getPublicAdmissionStatusProblemMessage(payload, fallback);
}
