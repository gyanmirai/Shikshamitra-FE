import { it, expect, describe } from 'vitest';

import { buildPublicAdmissionTrackingFieldValues } from './public-inquiry-utils';

describe('public admissions inquiry tracking', () => {
  it('maps campaign query aliases into reserved field values', () => {
    expect(
      buildPublicAdmissionTrackingFieldValues({
        utm_campaign: '  Monsoon QR Drive  ',
      })
    ).toEqual({ CampaignName: 'Monsoon QR Drive' });
  });

  it('uses the first supported campaign alias in priority order', () => {
    expect(
      buildPublicAdmissionTrackingFieldValues({
        campaignName: 'Primary Campaign',
        campaign: 'Secondary Campaign',
        utm_campaign: 'UTM Campaign',
      })
    ).toEqual({ CampaignName: 'Primary Campaign' });
  });

  it('maps staff shared link owner aliases into reserved field values', () => {
    expect(
      buildPublicAdmissionTrackingFieldValues({
        staffUserId: '  owner-1  ',
      })
    ).toEqual({ OwnerUserId: 'owner-1' });
  });

  it('keeps campaign and staff tracking together', () => {
    expect(
      buildPublicAdmissionTrackingFieldValues({
        campaignName: 'Open Day',
        ownerUserId: 'owner-2',
      })
    ).toEqual({ CampaignName: 'Open Day', OwnerUserId: 'owner-2' });
  });

  it('ignores empty tracking values', () => {
    expect(
      buildPublicAdmissionTrackingFieldValues({
        campaign: '   ',
        ownerUserId: '   ',
        utm_campaign: undefined,
      })
    ).toEqual({});
  });
});
