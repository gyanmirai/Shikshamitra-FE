export const buildPublicAdmissionInquiryPath = (
  tenantId?: string | null,
  templateId?: string | null
) => {
  if (!tenantId || !templateId) {
    return null;
  }

  return `/student/admissions/inquiry/${encodeURIComponent(tenantId)}/${encodeURIComponent(
    templateId
  )}`;
};

export const attachAdmissionCrmImpactFingerprint = <T extends object>(
  body: T,
  fingerprint: string
): T & { impactPreviewFingerprint: string } => ({
  ...body,
  impactPreviewFingerprint: fingerprint,
});

export const buildPublicAdmissionInquiryUrl = ({
  origin,
  tenantId,
  templateId,
  campaignName,
  ownerUserId,
}: {
  origin?: string | null;
  tenantId?: string | null;
  templateId?: string | null;
  campaignName?: string | null;
  ownerUserId?: string | null;
}) => {
  const path = buildPublicAdmissionInquiryPath(tenantId, templateId);

  if (!path) {
    return null;
  }

  const normalizedOrigin = origin?.replace(/\/+$/, '');
  const query = new URLSearchParams();
  const trimmedCampaignName = campaignName?.trim();

  if (trimmedCampaignName) {
    query.set('campaignName', trimmedCampaignName);
  }
  const trimmedOwnerUserId = ownerUserId?.trim();
  if (trimmedOwnerUserId) {
    query.set('ownerUserId', trimmedOwnerUserId);
  }

  const queryString = query.toString();
  const pathWithQuery = queryString ? `${path}?${queryString}` : path;

  return normalizedOrigin ? `${normalizedOrigin}${pathWithQuery}` : pathWithQuery;
};

export const buildAdmissionCrmProviderDeliveryCallbackPath = ({
  tenantId,
  academicYearId,
  channel,
}: {
  tenantId?: string | null;
  academicYearId?: string | null;
  channel?: number | string | null;
}) => {
  if (!tenantId || !academicYearId || channel === null || channel === undefined || channel === '') {
    return null;
  }

  return `/api/public/student-enrollment/admissions-crm/${encodeURIComponent(
    tenantId
  )}/communication/${encodeURIComponent(academicYearId)}/${encodeURIComponent(
    String(channel)
  )}/delivery-callback`;
};

export const buildAdmissionCrmProviderDeliveryCallbackUrl = ({
  apiOrigin,
  tenantId,
  academicYearId,
  channel,
}: {
  apiOrigin?: string | null;
  tenantId?: string | null;
  academicYearId?: string | null;
  channel?: number | string | null;
}) => {
  const path = buildAdmissionCrmProviderDeliveryCallbackPath({
    tenantId,
    academicYearId,
    channel,
  });

  if (!path) {
    return null;
  }

  const normalizedOrigin = apiOrigin?.replace(/\/+$/, '');
  return normalizedOrigin ? `${normalizedOrigin}${path}` : path;
};

export type AdmissionCrmProviderSettingsJson = {
  adapter?: string;
  payloadMode?: string;
  responseProviderMessageIdPath?: string;
  callbackSecret?: string;
  callbackMappings?: AdmissionCrmProviderCallbackMappings;
  headers?: Record<string, string>;
  parameters?: Record<string, string>;
  [key: string]: unknown;
};

export type AdmissionCrmProviderCallbackMappings = {
  statusPath?: string;
  statusDetailsPath?: string;
  providerMessageIdPath?: string;
  callbackSecretPath?: string;
};

export type AdmissionCrmProviderCallbackMappingField = keyof AdmissionCrmProviderCallbackMappings;

export const parseAdmissionCrmProviderSettings = (
  settingsJson: string
): AdmissionCrmProviderSettingsJson => {
  if (!settingsJson.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(settingsJson);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const formatAdmissionCrmProviderSettings = (settings: AdmissionCrmProviderSettingsJson) =>
  JSON.stringify(settings, null, 2);

export const getAdmissionCrmProviderAdapter = (settingsJson: string) =>
  parseAdmissionCrmProviderSettings(settingsJson).adapter || 'webhook';

export const getAdmissionCrmProviderPayloadMode = (settingsJson: string) =>
  parseAdmissionCrmProviderSettings(settingsJson).payloadMode || 'default';

export const updateAdmissionCrmProviderPayloadMode = (
  settingsJson: string,
  payloadMode: string
) => {
  const settings = parseAdmissionCrmProviderSettings(settingsJson);
  settings.payloadMode = payloadMode || 'default';
  return formatAdmissionCrmProviderSettings(settings);
};

export const getAdmissionCrmProviderKeyValueSettings = (
  settingsJson: string,
  field: 'headers' | 'parameters'
) => parseAdmissionCrmProviderSettings(settingsJson)[field] || {};

export const updateAdmissionCrmProviderKeyValueSettings = (
  settingsJson: string,
  field: 'headers' | 'parameters',
  values: Record<string, string>
) => {
  const settings = parseAdmissionCrmProviderSettings(settingsJson);
  settings[field] = values;
  return formatAdmissionCrmProviderSettings(settings);
};

export const getAdmissionCrmProviderResponseMessageIdPath = (settingsJson: string) =>
  parseAdmissionCrmProviderSettings(settingsJson).responseProviderMessageIdPath || '';

export const getAdmissionCrmProviderCallbackSecret = (settingsJson: string) =>
  parseAdmissionCrmProviderSettings(settingsJson).callbackSecret || '';

export const getAdmissionCrmProviderCallbackMappingPath = (
  settingsJson: string,
  field: AdmissionCrmProviderCallbackMappingField
) => {
  const mappings = parseAdmissionCrmProviderSettings(settingsJson).callbackMappings;
  return mappings && typeof mappings === 'object' && !Array.isArray(mappings)
    ? mappings[field] || ''
    : '';
};

export const updateAdmissionCrmProviderAdapter = (settingsJson: string, adapter: string) => {
  const settings = parseAdmissionCrmProviderSettings(settingsJson);
  settings.adapter = adapter || 'webhook';

  return formatAdmissionCrmProviderSettings(settings);
};

export const updateAdmissionCrmProviderResponseMessageIdPath = (
  settingsJson: string,
  value: string
) => {
  const settings = parseAdmissionCrmProviderSettings(settingsJson);
  if (value.trim()) {
    settings.responseProviderMessageIdPath = value;
  } else {
    delete settings.responseProviderMessageIdPath;
  }

  return formatAdmissionCrmProviderSettings(settings);
};

export const updateAdmissionCrmProviderCallbackSecret = (settingsJson: string, value: string) => {
  const settings = parseAdmissionCrmProviderSettings(settingsJson);
  if (value.trim()) {
    settings.callbackSecret = value;
  } else {
    delete settings.callbackSecret;
  }

  return formatAdmissionCrmProviderSettings(settings);
};

export const updateAdmissionCrmProviderCallbackMappingPath = (
  settingsJson: string,
  field: AdmissionCrmProviderCallbackMappingField,
  value: string
) => {
  const settings = parseAdmissionCrmProviderSettings(settingsJson);
  const existingMappings = settings.callbackMappings;
  const callbackMappings =
    existingMappings && typeof existingMappings === 'object' && !Array.isArray(existingMappings)
      ? { ...existingMappings }
      : {};

  if (value.trim()) {
    callbackMappings[field] = value;
  } else {
    delete callbackMappings[field];
  }

  if (Object.keys(callbackMappings).length) {
    settings.callbackMappings = callbackMappings;
  } else {
    delete settings.callbackMappings;
  }

  return formatAdmissionCrmProviderSettings(settings);
};

export type CrmUserOption = {
  id: string;
  displayName?: string | null;
  name?: string | null;
  surname?: string | null;
  userName?: string | null;
  email?: string | null;
  emailAddress?: string | null;
  isActive?: boolean | null;
  [key: string]: unknown;
};

export const getCrmUserOptionLabel = (user: CrmUserOption) => {
  const displayName =
    user.displayName ||
    [user.name, user.surname].filter(Boolean).join(' ').trim() ||
    user.userName ||
    user.email ||
    user.emailAddress ||
    user.id;
  const employeeCode =
    typeof user.employeeCode === 'string' && user.employeeCode.trim()
      ? user.employeeCode.trim()
      : null;
  return employeeCode ? `${displayName} (${employeeCode})` : displayName;
};

export const buildCrmUserSelectOptions = (
  users: CrmUserOption[] = [],
  selectedUserIds: Array<string | null | undefined> = []
) => {
  const sortedUsers = [...users].sort((left, right) =>
    getCrmUserOptionLabel(left).localeCompare(getCrmUserOptionLabel(right))
  );
  const existingIds = new Set(sortedUsers.map((user) => user.id));
  const missingSelectedUsers = selectedUserIds
    .filter((id): id is string => Boolean(id && !existingIds.has(id)))
    .filter((id, index, ids) => ids.indexOf(id) === index)
    .map((id) => ({
      id,
      name: `Unknown user (${id.slice(0, 8)})`,
      isActive: false,
    }));

  return [...sortedUsers, ...missingSelectedUsers];
};

export const getCrmUserLabel = (users: CrmUserOption[], userId?: string | null) => {
  if (!userId) {
    return '';
  }

  const user = users.find((item) => item.id === userId);
  return user ? getCrmUserOptionLabel(user) : `Unknown user (${userId.slice(0, 8)})`;
};
