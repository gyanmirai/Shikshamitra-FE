import type { AdmissionCrmRouteType } from 'src/redux/student/admissions-crm/final-admission-contracts';

import type {
  AdmissionInquiryChannel,
  AdmissionCrmQuickInquiryOptionsDto,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

export type QuickInquiryChannelOption = {
  value: AdmissionInquiryChannel;
  label: string;
  isDefault: boolean;
};

export type QuickInquiryRouteOption = {
  id: string;
  definitionId?: string;
  label: string;
  routeType: AdmissionCrmRouteType;
  version?: number;
  isDefault: boolean;
};

export type QuickInquirySourceOption = {
  id: string;
  label: string;
  allowedChannels: AdmissionInquiryChannel[];
  isDefault: boolean;
};

export type QuickInquiryTypeOption = {
  id: string;
  label: string;
  isDefault: boolean;
};

export type QuickInquiryOptions = {
  channels: QuickInquiryChannelOption[];
  sources: QuickInquirySourceOption[];
  inquiryTypes: QuickInquiryTypeOption[];
  routes: QuickInquiryRouteOption[];
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const quickInquiryFieldLimits = {
  name: 100,
  contact: 32,
  email: 256,
  intent: 250,
  campaign: 120,
  notes: 2000,
} as const;

export const isValidQuickInquiryEmail = (value: string) =>
  !value.trim() || emailPattern.test(value.trim());

export const isValidQuickInquiryPhone = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.length > quickInquiryFieldLimits.contact) return false;

  const phoneSyntax = [...trimmed].reduce(
    (state, character, index) => {
      if (!state.valid) return state;
      if (/\d/.test(character) || character === ' ' || character === '-' || character === '.') {
        return state;
      }
      if (character === '+' && index === 0) return state;
      if (character === '(' && state.parenthesisDepth === 0) {
        return { valid: true, parenthesisDepth: 1 };
      }
      if (character === ')' && state.parenthesisDepth === 1) {
        return { valid: true, parenthesisDepth: 0 };
      }
      return { ...state, valid: false };
    },
    { valid: true, parenthesisDepth: 0 }
  );

  const digitCount = [...trimmed].filter((character) => /\d/.test(character)).length;
  return (
    phoneSyntax.valid && phoneSyntax.parenthesisDepth === 0 && digitCount >= 7 && digitCount <= 15
  );
};

export const mapQuickInquiryOptions = (
  response: AdmissionCrmQuickInquiryOptionsDto | undefined
): QuickInquiryOptions => ({
  channels: [...(response?.channels || [])]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map((option) => ({
      value: option.channel,
      label: option.label,
      isDefault: option.isDefault === true,
    })),
  sources: (response?.sources || []).map((option) => ({
    id: option.inquirySourceId,
    label: option.name,
    allowedChannels: option.allowedChannels,
    isDefault: option.isDefault === true,
  })),
  inquiryTypes: (response?.inquiryTypes || []).map((option) => ({
    id: option.inquiryTypeId,
    label: option.name,
    isDefault: option.isDefault === true,
  })),
  routes: (response?.routes || []).map((option) => ({
    id: option.routeDefinitionId || `route-type:${option.routeType}`,
    definitionId: option.routeDefinitionId || undefined,
    label: option.name,
    routeType: option.routeType,
    version: option.version ?? undefined,
    isDefault: option.isDefault === true,
  })),
});

export const getDefaultQuickInquiryOption = <T extends { isDefault: boolean }>(
  options: T[]
): T | undefined => options.find((option) => option.isDefault) || options[0];
