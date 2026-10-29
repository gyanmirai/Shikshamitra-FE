import { describe, expect, it } from 'vitest';

import { parseApiProblemDetail } from './api-problem-details';

describe('concession API error message fallback', () => {
  it.each(['Finance:Concession:010034', 'One or more business rules were violated.'])(
    'uses the concession reason when the API message is %s',
    (message) => {
      expect(
        parseApiProblemDetail({ errorCode: 'Finance:Concession:010034', message }).detail
      ).toBe(
        'This student already has an approved benefit for this concession type in this academic year. Another benefit cannot be requested or approved.'
      );
    }
  );

  it('keeps a specific server concession reason ahead of the mapped fallback', () => {
    const detail = 'Review concession request CR-123 before requesting another benefit.';
    expect(parseApiProblemDetail({ errorCode: 'Finance:Concession:010034', detail }).detail).toBe(
      detail
    );
  });
});
