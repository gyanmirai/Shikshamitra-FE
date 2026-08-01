import type { AdmissionCrmLeadScoringRulesDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

export type LeadScoringPreset = {
  id: 'balanced' | 'family-readiness' | 'digital-intent';
  title: string;
  description: string;
  recommended?: boolean;
  rules: AdmissionCrmLeadScoringRulesDto;
};

const balancedRules: AdmissionCrmLeadScoringRulesDto = {
  baseScore: 20,
  bothContactChannelsScore: 10,
  parentGuardianScore: 10,
  desiredClassScore: 15,
  campaignScore: 10,
  manualBackOfficeChannelScore: 8,
  quickCallEntryChannelScore: 5,
  walkInReceptionChannelScore: 15,
  schoolWebsiteFormChannelScore: 15,
  whatsAppInquiryChannelScore: 10,
  staffSharedLinkChannelScore: 12,
  qrCodeScanChannelScore: 10,
  campaignLinkChannelScore: 12,
  examPassScore: 10,
  examFailPenalty: -10,
  highPerformanceScore: 10,
  highPerformancePercentage: 80,
  maxScore: 100,
};

export const leadScoringPresets: LeadScoringPreset[] = [
  {
    id: 'balanced',
    title: 'Balanced Admissions',
    description: 'Balances complete family details, inquiry intent, and assessment outcomes.',
    recommended: true,
    rules: balancedRules,
  },
  {
    id: 'family-readiness',
    title: 'Family Readiness',
    description: 'Prioritizes inquiries with complete parent, contact, and desired-class details.',
    rules: {
      ...balancedRules,
      baseScore: 15,
      bothContactChannelsScore: 20,
      parentGuardianScore: 15,
      desiredClassScore: 20,
      campaignScore: 5,
      manualBackOfficeChannelScore: 5,
      quickCallEntryChannelScore: 5,
      walkInReceptionChannelScore: 10,
      schoolWebsiteFormChannelScore: 10,
      whatsAppInquiryChannelScore: 8,
      qrCodeScanChannelScore: 8,
      campaignLinkChannelScore: 8,
    },
  },
  {
    id: 'digital-intent',
    title: 'Digital Intent',
    description: 'Gives stronger weight to website, campaign, QR, and WhatsApp engagement.',
    rules: {
      ...balancedRules,
      baseScore: 10,
      parentGuardianScore: 5,
      desiredClassScore: 10,
      campaignScore: 15,
      manualBackOfficeChannelScore: 4,
      quickCallEntryChannelScore: 5,
      walkInReceptionChannelScore: 12,
      schoolWebsiteFormChannelScore: 20,
      whatsAppInquiryChannelScore: 18,
      staffSharedLinkChannelScore: 12,
      qrCodeScanChannelScore: 15,
      campaignLinkChannelScore: 20,
      examPassScore: 15,
    },
  },
];

export const leadScoringGroups: Array<{
  title: string;
  description: string;
  fields: Array<{ field: keyof AdmissionCrmLeadScoringRulesDto; label: string }>;
}> = [
  {
    title: 'Profile Completeness',
    description: 'Reward inquiries that give the team enough information to act immediately.',
    fields: [
      { field: 'baseScore', label: 'Starting score' },
      { field: 'bothContactChannelsScore', label: 'Phone & email' },
      { field: 'parentGuardianScore', label: 'Parent name' },
      { field: 'desiredClassScore', label: 'Desired class' },
      { field: 'campaignScore', label: 'Campaign recorded' },
    ],
  },
  {
    title: 'Inquiry Intent',
    description: 'Reflect how strongly each intake channel signals family intent.',
    fields: [
      { field: 'manualBackOfficeChannelScore', label: 'Manual entry' },
      { field: 'quickCallEntryChannelScore', label: 'Quick call' },
      { field: 'walkInReceptionChannelScore', label: 'Walk-in' },
      { field: 'schoolWebsiteFormChannelScore', label: 'Website' },
      { field: 'whatsAppInquiryChannelScore', label: 'WhatsApp' },
      { field: 'staffSharedLinkChannelScore', label: 'Staff link' },
      { field: 'qrCodeScanChannelScore', label: 'QR scan' },
      { field: 'campaignLinkChannelScore', label: 'Campaign link' },
    ],
  },
  {
    title: 'Assessment Signals',
    description: 'Adjust priority after the entrance assessment without changing eligibility.',
    fields: [
      { field: 'examPassScore', label: 'Exam passed' },
      { field: 'examFailPenalty', label: 'Exam failed' },
      { field: 'highPerformanceScore', label: 'High performance' },
      { field: 'highPerformancePercentage', label: 'High score threshold %' },
      { field: 'maxScore', label: 'Maximum score' },
    ],
  },
];

const capScore = (score: number, maxScore: number) => Math.max(0, Math.min(score, maxScore));

export const getLeadScoringPreviews = (rules: AdmissionCrmLeadScoringRulesDto) => [
  {
    label: 'Complete Website Inquiry',
    score: capScore(
      rules.baseScore +
        rules.bothContactChannelsScore +
        rules.parentGuardianScore +
        rules.desiredClassScore +
        rules.schoolWebsiteFormChannelScore,
      rules.maxScore
    ),
  },
  {
    label: 'Ready Walk-in Family',
    score: capScore(
      rules.baseScore +
        rules.parentGuardianScore +
        rules.desiredClassScore +
        rules.walkInReceptionChannelScore,
      rules.maxScore
    ),
  },
  {
    label: 'Strong Assessment Outcome',
    score: capScore(
      rules.baseScore + rules.examPassScore + rules.highPerformanceScore,
      rules.maxScore
    ),
  },
];

export const matchesLeadScoringPreset = (
  rules: AdmissionCrmLeadScoringRulesDto,
  preset: LeadScoringPreset
) => JSON.stringify(rules) === JSON.stringify(preset.rules);
