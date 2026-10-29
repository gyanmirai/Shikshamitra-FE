import { describe, expect, it } from 'vitest';

import { concessionBenefitBlockerMessage } from './concession-benefit-blocker';

const approvedCode = 'Finance:Concession:010034';
const pendingCode = 'Finance:Concession:010010';
const approvedMessage =
  'This student already has an approved benefit for this concession type in this academic year. Another benefit cannot be requested or approved.';
const pendingMessage =
  'A pending concession request already exists for this concession type in this academic year. Review the existing request.';

describe('concession benefit blocker feedback', () => {
  it.each([
    [approvedCode, approvedCode, approvedMessage],
    [pendingCode, pendingCode, pendingMessage],
    [approvedCode, '', approvedMessage],
    [pendingCode, '  ', pendingMessage],
    [approvedCode, 'One or more business rules were violated.', approvedMessage],
    [pendingCode, 'Bad request', pendingMessage],
    ['Unknown:Benefit:999999', approvedCode, approvedMessage],
  ])('resolves code %s and unusable message %s to a readable reason', (code, message, expected) => {
    expect(concessionBenefitBlockerMessage({ code, message })).toBe(expected);
  });

  it('preserves a specific server reason even when the code has a default message', () => {
    const message = 'Review concession request CR-123 before creating another benefit.';
    expect(concessionBenefitBlockerMessage({ code: approvedCode, message })).toBe(message);
    expect(concessionBenefitBlockerMessage({ code: 'Unknown:Benefit:999999', message })).toBe(
      message
    );
  });

  it.each(['Unknown:Benefit:999999', '', 'Something went wrong'])(
    'uses safe fallback for an unknown blocker with message %s',
    (message) => {
      expect(concessionBenefitBlockerMessage({ code: 'Unknown:Benefit:999999', message })).toBe(
        'This concession type is unavailable. Review existing requests or contact support.'
      );
    }
  );

  it('does not invent a blocker when eligibility has no blocker', () => {
    expect(concessionBenefitBlockerMessage(null)).toBeUndefined();
    expect(concessionBenefitBlockerMessage(undefined)).toBeUndefined();
  });
});
