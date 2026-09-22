import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

export type InquiryCommunicationTemplateId = 'acknowledgement' | 'follow-up' | 'application';

type TemplateCopy = { title: string; subject: string; body: string };

const COPY: Record<string, Record<InquiryCommunicationTemplateId, TemplateCopy>> = {
  en: {
    acknowledgement: {
      title: 'Inquiry acknowledgement',
      subject: 'We received your admission inquiry',
      body: 'Hello, we have received the admission inquiry for {name}. Our admissions team will contact you shortly. Thank you.',
    },
    'follow-up': {
      title: 'Admission inquiry follow-up',
      subject: 'Follow-up on your admission inquiry',
      body: 'Hello, we are following up on the admission inquiry for {name}. Please reply with a convenient time to speak with our admissions team.',
    },
    application: {
      title: 'Application next step',
      subject: 'Next step for the admission application',
      body: 'Hello, the inquiry for {name} is ready for the next admission step. Our admissions team will help you open and complete the application.',
    },
  },
  hi: {
    acknowledgement: {
      title: 'प्रवेश पूछताछ प्राप्त हुई',
      subject: 'हमें आपकी प्रवेश पूछताछ मिल गई है',
      body: 'नमस्ते, हमें {name} के लिए प्रवेश पूछताछ प्राप्त हुई है। हमारी प्रवेश टीम शीघ्र ही आपसे संपर्क करेगी। धन्यवाद।',
    },
    'follow-up': {
      title: 'प्रवेश पूछताछ फॉलो-अप',
      subject: 'आपकी प्रवेश पूछताछ के बारे में',
      body: 'नमस्ते, हम {name} की प्रवेश पूछताछ के संबंध में संपर्क कर रहे हैं। कृपया बात करने का सुविधाजनक समय बताएं।',
    },
    application: {
      title: 'आवेदन का अगला चरण',
      subject: 'प्रवेश आवेदन का अगला चरण',
      body: 'नमस्ते, {name} की पूछताछ अब अगले प्रवेश चरण के लिए तैयार है। हमारी प्रवेश टीम आवेदन पूरा करने में आपकी सहायता करेगी।',
    },
  },
  mr: {
    acknowledgement: {
      title: 'प्रवेश चौकशी प्राप्त झाली',
      subject: 'आम्हाला तुमची प्रवेश चौकशी मिळाली आहे',
      body: 'नमस्कार, आम्हाला {name} साठी प्रवेश चौकशी प्राप्त झाली आहे. आमची प्रवेश टीम लवकरच तुमच्याशी संपर्क साधेल. धन्यवाद.',
    },
    'follow-up': {
      title: 'प्रवेश चौकशी पाठपुरावा',
      subject: 'तुमच्या प्रवेश चौकशीबद्दल',
      body: 'नमस्कार, आम्ही {name} यांच्या प्रवेश चौकशीबाबत पाठपुरावा करत आहोत. कृपया बोलण्यासाठी सोयीची वेळ कळवा.',
    },
    application: {
      title: 'अर्जाची पुढील पायरी',
      subject: 'प्रवेश अर्जाची पुढील पायरी',
      body: 'नमस्कार, {name} यांची चौकशी पुढील प्रवेश टप्प्यासाठी तयार आहे. आमची प्रवेश टीम अर्ज पूर्ण करण्यासाठी मदत करेल.',
    },
  },
};

export const inquiryCommunicationTemplateOptions = [
  { value: 'acknowledgement', label: 'Inquiry acknowledgement' },
  { value: 'follow-up', label: 'Follow-up reminder' },
  { value: 'application', label: 'Application next step' },
] as const;

export function getInquiryCommunicationTemplate(
  templateId: InquiryCommunicationTemplateId,
  inquiry: Pick<AdmissionInquiry, 'applicantName' | 'preferredLanguageCode'>
) {
  const language = inquiry.preferredLanguageCode?.split('-')[0]?.toLowerCase() || 'en';
  const copy = (COPY[language] ?? COPY.en)[templateId];
  return {
    ...copy,
    body: copy.body.replace('{name}', inquiry.applicantName),
    usedFallbackLanguage: !COPY[language],
  };
}
