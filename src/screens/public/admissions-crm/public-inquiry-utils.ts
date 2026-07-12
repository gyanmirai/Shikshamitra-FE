export type PublicAdmissionInquiryTrackingParams = Record<string, string | string[] | undefined>;

const getFirstQueryValue = (params: PublicAdmissionInquiryTrackingParams, keys: string[]) => {
  const value = keys
    .map((key) => {
      const raw = params[key];
      return (Array.isArray(raw) ? raw[0] : raw)?.trim();
    })
    .find(Boolean);

  return value || null;
};

export const buildPublicAdmissionTrackingFieldValues = (
  params: PublicAdmissionInquiryTrackingParams = {}
) => {
  const fieldValues: Record<string, string> = {};
  const campaignName = getFirstQueryValue(params, [
    'campaignName',
    'campaign',
    'utm_campaign',
    'utmCampaign',
  ]);

  if (campaignName) {
    fieldValues.CampaignName = campaignName;
  }

  const ownerUserId = getFirstQueryValue(params, [
    'ownerUserId',
    'staffUserId',
    'sharedByUserId',
    'referrerUserId',
  ]);

  if (ownerUserId) {
    fieldValues.OwnerUserId = ownerUserId;
  }

  return fieldValues;
};
