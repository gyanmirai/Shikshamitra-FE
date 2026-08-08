import type { PublicAdmissionsLanguage } from './public-admissions-copy';

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

const recoveryCopy = {
  en: {
    wait: 'Please wait before requesting another OTP.',
    waitSeconds: (seconds: number) =>
      `Please wait ${seconds} second${seconds === 1 ? '' : 's'} before requesting another OTP.`,
    invalidOtp: 'The OTP code is incorrect. Check the latest code and try again.',
    locked: 'Too many incorrect OTP attempts. Request a new OTP to continue.',
    otpExpired: 'This OTP has expired. Request a new OTP to continue.',
    notIssued: 'Request an OTP before checking the admission status.',
    linkExpired: 'This status link has expired. Contact the school admissions office.',
    linkInvalid:
      'This status link is invalid. Check the link or contact the school admissions office.',
    registrationChanged:
      'This registration changed in another tab. Your entries remain on this page; reload the latest version and review them before saving again.',
  },
  gu: {
    wait: 'બીજો OTP માંગતા પહેલાં થોડી રાહ જુઓ.',
    waitSeconds: (seconds: number) => `બીજો OTP માંગતા પહેલાં ${seconds} સેકન્ડ રાહ જુઓ.`,
    invalidOtp: 'OTP કોડ ખોટો છે. તાજેતરનો કોડ તપાસીને ફરી પ્રયાસ કરો.',
    locked: 'ઘણા ખોટા OTP પ્રયાસ થયા. આગળ વધવા માટે નવો OTP માંગો.',
    otpExpired: 'આ OTP ની મુદત પૂરી થઈ છે. આગળ વધવા માટે નવો OTP માંગો.',
    notIssued: 'પ્રવેશ સ્થિતિ તપાસતા પહેલાં OTP માંગો.',
    linkExpired: 'આ સ્થિતિ લિંકની મુદત પૂરી થઈ છે. શાળા પ્રવેશ કચેરીનો સંપર્ક કરો.',
    linkInvalid: 'આ સ્થિતિ લિંક અમાન્ય છે. લિંક તપાસો અથવા શાળા પ્રવેશ કચેરીનો સંપર્ક કરો.',
    registrationChanged:
      'આ નોંધણી બીજી ટૅબમાં બદલાઈ છે. તમારી વિગતો આ પેજ પર છે; નવીનતમ આવૃત્તિ ફરી લોડ કરીને સાચવતા પહેલાં તપાસો.',
  },
  hi: {
    wait: 'दूसरा OTP माँगने से पहले कुछ समय प्रतीक्षा करें।',
    waitSeconds: (seconds: number) => `दूसरा OTP माँगने से पहले ${seconds} सेकंड प्रतीक्षा करें।`,
    invalidOtp: 'OTP कोड गलत है। नवीनतम कोड जाँचकर फिर प्रयास करें।',
    locked: 'बहुत अधिक गलत OTP प्रयास हुए। आगे बढ़ने के लिए नया OTP माँगें।',
    otpExpired: 'इस OTP की समय-सीमा समाप्त हो गई है। आगे बढ़ने के लिए नया OTP माँगें।',
    notIssued: 'प्रवेश स्थिति देखने से पहले OTP माँगें।',
    linkExpired:
      'इस स्थिति लिंक की समय-सीमा समाप्त हो गई है। विद्यालय प्रवेश कार्यालय से संपर्क करें।',
    linkInvalid:
      'यह स्थिति लिंक अमान्य है। लिंक जाँचें या विद्यालय प्रवेश कार्यालय से संपर्क करें।',
    registrationChanged:
      'यह पंजीकरण दूसरे टैब में बदल गया है। आपकी प्रविष्टियाँ इस पेज पर हैं; नवीनतम संस्करण फिर से लोड करके सहेजने से पहले जाँचें।',
  },
} satisfies Record<
  PublicAdmissionsLanguage,
  Record<string, string | ((seconds: number) => string)>
>;

const formatRetryAfter = (
  problem: PublicAdmissionStatusProblem | null | undefined,
  language: PublicAdmissionsLanguage
) => {
  const retryAfter = Number(
    getProblemDataValue(problem, 'RetryAfterSeconds') ??
      getProblemDataValue(problem, 'retryAfterSeconds')
  );

  if (!Number.isFinite(retryAfter) || retryAfter <= 0) {
    return recoveryCopy[language].wait;
  }

  const seconds = Math.ceil(retryAfter);
  return recoveryCopy[language].waitSeconds(seconds);
};

export const getPublicAdmissionStatusProblemMessage = (
  problem: PublicAdmissionStatusProblem | null | undefined,
  fallback: string,
  language: PublicAdmissionsLanguage = 'en'
): PublicAdmissionStatusProblemResult => {
  const code = getProblemCode(problem);
  const copy = recoveryCopy[language];

  switch (code) {
    case 'AdmissionCrm:StatusOtpResendTooSoon':
      return { code, message: formatRetryAfter(problem, language) };
    case 'AdmissionCrm:InvalidStatusOtp':
      return { code, message: copy.invalidOtp };
    case 'AdmissionCrm:StatusOtpLocked':
      return { code, message: copy.locked };
    case 'AdmissionCrm:StatusOtpExpired':
      return { code, message: copy.otpExpired };
    case 'AdmissionCrm:StatusOtpNotIssued':
      return { code, message: copy.notIssued };
    case 'AdmissionCrm:StatusTokenExpired':
      return {
        code,
        message: copy.linkExpired,
      };
    case 'AdmissionCrm:StatusTokenInvalid':
      return {
        code,
        message: copy.linkInvalid,
      };
    case 'AdmissionCrm:RegistrationConcurrencyConflict':
      return {
        code,
        message: copy.registrationChanged,
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
  fallback: string,
  language: PublicAdmissionsLanguage = 'en'
): Promise<PublicAdmissionStatusProblemResult> {
  let payload: PublicAdmissionStatusProblem | null = null;

  try {
    payload = (await response.json()) as PublicAdmissionStatusProblem;
  } catch {
    payload = null;
  }

  return getPublicAdmissionStatusProblemMessage(payload, fallback, language);
}
