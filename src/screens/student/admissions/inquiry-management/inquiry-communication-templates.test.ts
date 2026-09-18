import { describe, expect, it } from 'vitest';

import { getInquiryCommunicationTemplate } from './inquiry-communication-templates';

describe('inquiry communication templates', () => {
  it('uses the inquiry language and applicant name', () => {
    const template = getInquiryCommunicationTemplate('acknowledgement', {
      applicantName: 'Aanya Shah',
      preferredLanguageCode: 'hi-IN',
    });

    expect(template.body).toContain('Aanya Shah');
    expect(template.body).toContain('प्रवेश');
    expect(template.usedFallbackLanguage).toBe(false);
  });

  it('falls back to English for languages without a local template', () => {
    const template = getInquiryCommunicationTemplate('follow-up', {
      applicantName: 'Aanya Shah',
      preferredLanguageCode: 'gu',
    });

    expect(template.body).toContain('following up');
    expect(template.usedFallbackLanguage).toBe(true);
  });
});
