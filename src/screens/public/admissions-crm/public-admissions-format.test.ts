import { it, expect, describe } from 'vitest';
import {
  AdmissionCrmRouteType,
  AdmissionCrmRouteEligibilityStatus,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import {
  formatPublicNumber,
  getPublicRouteLabel,
  formatPublicDateTime,
  formatPublicCurrency,
  getPublicStatusLabel,
  getPublicRouteEligibilityLabel,
} from './public-admissions-format';

describe('public admissions formatting', () => {
  it.each(['en', 'gu', 'hi'] as const)('uses localized product terminology for %s', (language) => {
    expect(getPublicRouteLabel(AdmissionCrmRouteType.RteEws, language)).not.toContain('RteEws');
    expect(
      getPublicRouteEligibilityLabel(AdmissionCrmRouteEligibilityStatus.PendingReview, language)
    ).not.toContain('PendingReview');
    expect(getPublicStatusLabel('UnderReview', language)).not.toContain('UnderReview');
  });

  it('formats Indian currency without exposing backend numeric formatting', () => {
    expect(formatPublicCurrency(125000, 'INR', 'en')).toContain('1,25,000');
  });

  it.each(['en', 'gu', 'hi'] as const)(
    'formats dates, numbers, and currency safely for %s',
    (language) => {
      expect(formatPublicDateTime('2026-08-08T12:30:00.000Z', language).trim()).not.toBe('');
      expect(formatPublicNumber(123456.75, language).trim()).not.toBe('');
      expect(formatPublicCurrency(123456.75, 'INR', language).trim()).not.toBe('');
    }
  );
});
