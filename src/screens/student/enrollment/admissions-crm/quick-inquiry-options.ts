import type {
  AdmissionCrmRouteType,
  AdmissionInquiryChannel,
  AdmissionCrmQuickInquiryOptionsDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

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

export const isValidQuickInquiryEmail = (value: string) =>
  !value.trim() || emailPattern.test(value.trim());

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
