import { it, expect, describe } from 'vitest';

import { getOfferingConfigurationAccess } from './admission-offering-configuration-access';

describe('Offering setup editing lifecycle', () => {
  const unused = {
    isActive: false,
    applicationCount: 0,
    inquiryCount: 0,
    hasConfigurationUsage: false,
    canEditConfiguration: true,
  };

  it('allows setup changes only for an inactive, unused offering confirmed by the server', () => {
    expect(getOfferingConfigurationAccess(unused).locked).toBe(false);
    expect(getOfferingConfigurationAccess({ ...unused, canEditConfiguration: false }).locked).toBe(
      true
    );
  });

  it('requires deactivation for an active unused offering', () => {
    expect(
      getOfferingConfigurationAccess({ ...unused, isActive: true, canEditConfiguration: false })
    ).toMatchObject({ locked: true, canDeactivateToEdit: true, hasUsage: false });
  });

  it.each([{ inquiryCount: 1 }, { applicationCount: 1 }, { hasConfigurationUsage: true }])(
    'keeps a used offering locked even when inactive: %j',
    (usage) => {
      expect(getOfferingConfigurationAccess({ ...unused, ...usage })).toMatchObject({
        locked: true,
        canDeactivateToEdit: false,
        hasUsage: true,
      });
    }
  );

  it('fails closed when an older server does not provide usage metadata', () => {
    expect(getOfferingConfigurationAccess({ isActive: false, applicationCount: 0 })).toMatchObject({
      locked: true,
      canDeactivateToEdit: false,
    });
    expect(
      getOfferingConfigurationAccess({ isActive: true, applicationCount: 0 }).canDeactivateToEdit
    ).toBe(false);
    expect(
      getOfferingConfigurationAccess({ isActive: true, applicationCount: 0 }).helpText
    ).not.toContain('unused');
  });
});
