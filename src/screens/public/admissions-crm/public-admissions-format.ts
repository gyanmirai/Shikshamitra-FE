import { AdmissionCrmRouteType } from 'src/redux/student/admissions-crm/final-admission-contracts';

import { AdmissionCrmRouteEligibilityStatus } from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import type { PublicAdmissionsLanguage } from './public-admissions-copy';

const locales: Record<PublicAdmissionsLanguage, string> = {
  en: 'en-IN',
  gu: 'gu-IN',
  hi: 'hi-IN',
};

const routeLabels: Record<PublicAdmissionsLanguage, Record<AdmissionCrmRouteType, string>> = {
  en: {
    [AdmissionCrmRouteType.Fresh]: 'Fresh admission',
    [AdmissionCrmRouteType.SiblingPriority]: 'Sibling priority',
    [AdmissionCrmRouteType.AlumniPreference]: 'Alumni preference',
    [AdmissionCrmRouteType.StaffChild]: 'Staff child',
    [AdmissionCrmRouteType.RteEws]: 'RTE / EWS',
    [AdmissionCrmRouteType.Transfer]: 'Transfer admission',
    [AdmissionCrmRouteType.Lateral]: 'Lateral admission',
    [AdmissionCrmRouteType.MidYear]: 'Mid-year admission',
    [AdmissionCrmRouteType.ReturningStudent]: 'Returning student',
    [AdmissionCrmRouteType.Interstate]: 'Interstate transfer',
    [AdmissionCrmRouteType.OverseasReturn]: 'Overseas return',
    [AdmissionCrmRouteType.Direct]: 'Direct admission',
    [AdmissionCrmRouteType.ManagementApproved]: 'Management approved',
    [AdmissionCrmRouteType.SchoolDefined]: 'School-defined route',
  },
  gu: {
    [AdmissionCrmRouteType.Fresh]: 'નવો પ્રવેશ',
    [AdmissionCrmRouteType.SiblingPriority]: 'ભાઈ-બહેન અગ્રતા',
    [AdmissionCrmRouteType.AlumniPreference]: 'ભૂતપૂર્વ વિદ્યાર્થી અગ્રતા',
    [AdmissionCrmRouteType.StaffChild]: 'કર્મચારીનું બાળક',
    [AdmissionCrmRouteType.RteEws]: 'RTE / EWS',
    [AdmissionCrmRouteType.Transfer]: 'સ્થાનાંતરણ પ્રવેશ',
    [AdmissionCrmRouteType.Lateral]: 'લેટરલ પ્રવેશ',
    [AdmissionCrmRouteType.MidYear]: 'મધ્ય-વર્ષ પ્રવેશ',
    [AdmissionCrmRouteType.ReturningStudent]: 'પાછા ફરતા વિદ્યાર્થી',
    [AdmissionCrmRouteType.Interstate]: 'આંતરરાજ્ય સ્થાનાંતરણ',
    [AdmissionCrmRouteType.OverseasReturn]: 'વિદેશથી પરત',
    [AdmissionCrmRouteType.Direct]: 'સીધો પ્રવેશ',
    [AdmissionCrmRouteType.ManagementApproved]: 'સંચાલન મંજૂર',
    [AdmissionCrmRouteType.SchoolDefined]: 'શાળા નિર્ધારિત માર્ગ',
  },
  hi: {
    [AdmissionCrmRouteType.Fresh]: 'नया प्रवेश',
    [AdmissionCrmRouteType.SiblingPriority]: 'भाई-बहन प्राथमिकता',
    [AdmissionCrmRouteType.AlumniPreference]: 'पूर्व छात्र प्राथमिकता',
    [AdmissionCrmRouteType.StaffChild]: 'कर्मचारी का बच्चा',
    [AdmissionCrmRouteType.RteEws]: 'RTE / EWS',
    [AdmissionCrmRouteType.Transfer]: 'स्थानांतरण प्रवेश',
    [AdmissionCrmRouteType.Lateral]: 'पार्श्व प्रवेश',
    [AdmissionCrmRouteType.MidYear]: 'मध्य-वर्ष प्रवेश',
    [AdmissionCrmRouteType.ReturningStudent]: 'वापसी करने वाला छात्र',
    [AdmissionCrmRouteType.Interstate]: 'अंतरराज्यीय स्थानांतरण',
    [AdmissionCrmRouteType.OverseasReturn]: 'विदेश से वापसी',
    [AdmissionCrmRouteType.Direct]: 'प्रत्यक्ष प्रवेश',
    [AdmissionCrmRouteType.ManagementApproved]: 'प्रबंधन अनुमोदित',
    [AdmissionCrmRouteType.SchoolDefined]: 'विद्यालय निर्धारित मार्ग',
  },
};

const eligibilityLabels: Record<
  PublicAdmissionsLanguage,
  Record<AdmissionCrmRouteEligibilityStatus, string>
> = {
  en: {
    [AdmissionCrmRouteEligibilityStatus.PendingReview]: 'Review pending',
    [AdmissionCrmRouteEligibilityStatus.EvidencePending]: 'Evidence pending',
    [AdmissionCrmRouteEligibilityStatus.Eligible]: 'Eligible',
    [AdmissionCrmRouteEligibilityStatus.Ineligible]: 'Not eligible',
    [AdmissionCrmRouteEligibilityStatus.ExceptionApproved]: 'Exception approved',
    [AdmissionCrmRouteEligibilityStatus.Withdrawn]: 'Withdrawn',
    [AdmissionCrmRouteEligibilityStatus.Superseded]: 'Replaced',
  },
  gu: {
    [AdmissionCrmRouteEligibilityStatus.PendingReview]: 'ચકાસણી બાકી',
    [AdmissionCrmRouteEligibilityStatus.EvidencePending]: 'પુરાવો બાકી',
    [AdmissionCrmRouteEligibilityStatus.Eligible]: 'પાત્ર',
    [AdmissionCrmRouteEligibilityStatus.Ineligible]: 'અપાત્ર',
    [AdmissionCrmRouteEligibilityStatus.ExceptionApproved]: 'અપવાદ મંજૂર',
    [AdmissionCrmRouteEligibilityStatus.Withdrawn]: 'પાછું ખેંચ્યું',
    [AdmissionCrmRouteEligibilityStatus.Superseded]: 'બદલાયું',
  },
  hi: {
    [AdmissionCrmRouteEligibilityStatus.PendingReview]: 'समीक्षा लंबित',
    [AdmissionCrmRouteEligibilityStatus.EvidencePending]: 'प्रमाण लंबित',
    [AdmissionCrmRouteEligibilityStatus.Eligible]: 'पात्र',
    [AdmissionCrmRouteEligibilityStatus.Ineligible]: 'अपात्र',
    [AdmissionCrmRouteEligibilityStatus.ExceptionApproved]: 'अपवाद स्वीकृत',
    [AdmissionCrmRouteEligibilityStatus.Withdrawn]: 'वापस लिया गया',
    [AdmissionCrmRouteEligibilityStatus.Superseded]: 'प्रतिस्थापित',
  },
};

const commonStatusLabels: Record<PublicAdmissionsLanguage, Record<string, string>> = {
  en: {
    Completed: 'Completed',
    Pending: 'Pending',
    Required: 'Required',
    Requested: 'Requested',
    Uploaded: 'Uploaded',
    UnderReview: 'Under review',
    Verified: 'Verified',
    Rejected: 'Needs correction',
    Expired: 'Expired',
    Waived: 'Waived',
    OriginalSeen: 'Original checked',
    ApprovalPending: 'Approval pending',
    Approved: 'Approved',
    Issued: 'Issued',
    Opened: 'Opened',
    Accepted: 'Accepted',
    Declined: 'Declined',
    Revoked: 'Revoked',
    Superseded: 'Replaced',
    Cancelled: 'Cancelled',
  },
  gu: {
    Completed: 'પૂર્ણ',
    Pending: 'બાકી',
    Required: 'જરૂરી',
    Requested: 'વિનંતી કરેલ',
    Uploaded: 'અપલોડ થયેલ',
    UnderReview: 'ચકાસણી હેઠળ',
    Verified: 'ચકાસાયેલ',
    Rejected: 'સુધારો જરૂરી',
    Expired: 'મુદત પૂરી',
    Waived: 'માફ',
    OriginalSeen: 'મૂળ દસ્તાવેજ ચકાસાયેલ',
    ApprovalPending: 'મંજૂરી બાકી',
    Approved: 'મંજૂર',
    Issued: 'જારી',
    Opened: 'ખોલેલ',
    Accepted: 'સ્વીકારેલ',
    Declined: 'નકારેલ',
    Revoked: 'રદ કરેલ',
    Superseded: 'બદલાયેલ',
    Cancelled: 'રદ',
  },
  hi: {
    Completed: 'पूर्ण',
    Pending: 'लंबित',
    Required: 'आवश्यक',
    Requested: 'अनुरोधित',
    Uploaded: 'अपलोड किया गया',
    UnderReview: 'समीक्षा में',
    Verified: 'सत्यापित',
    Rejected: 'सुधार आवश्यक',
    Expired: 'समाप्त',
    Waived: 'माफ़',
    OriginalSeen: 'मूल दस्तावेज़ जाँचा गया',
    ApprovalPending: 'अनुमोदन लंबित',
    Approved: 'अनुमोदित',
    Issued: 'जारी',
    Opened: 'खोला गया',
    Accepted: 'स्वीकृत',
    Declined: 'अस्वीकृत',
    Revoked: 'निरस्त',
    Superseded: 'प्रतिस्थापित',
    Cancelled: 'रद्द',
  },
};

export const formatPublicDateTime = (value: string | Date, language: PublicAdmissionsLanguage) =>
  new Intl.DateTimeFormat(locales[language], { dateStyle: 'medium', timeStyle: 'short' }).format(
    typeof value === 'string' ? new Date(value) : value
  );

export const formatPublicNumber = (
  value: number,
  language: PublicAdmissionsLanguage,
  options?: Intl.NumberFormatOptions
) => new Intl.NumberFormat(locales[language], options).format(value);

export const formatPublicCurrency = (
  value: number,
  currency: string,
  language: PublicAdmissionsLanguage
) => {
  try {
    return new Intl.NumberFormat(locales[language], {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
    }).format(value);
  } catch {
    return `${currency} ${formatPublicNumber(value, language, { minimumFractionDigits: 2 })}`;
  }
};

export const getPublicRouteLabel = (
  route: AdmissionCrmRouteType,
  language: PublicAdmissionsLanguage
) => routeLabels[language][route];

export const getPublicRouteEligibilityLabel = (
  status: AdmissionCrmRouteEligibilityStatus,
  language: PublicAdmissionsLanguage
) => eligibilityLabels[language][status];

export const getPublicStatusLabel = (status: string, language: PublicAdmissionsLanguage) =>
  commonStatusLabels[language][status.replace(/\s+/g, '')] ??
  status.replace(/([a-z])([A-Z])/g, '$1 $2');
