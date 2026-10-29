import { describe, expect, it } from 'vitest';

import { concessionRequestErrorMessage } from './concession-request-error';

describe('concession benefit error recovery', () => {
  it('explains the student/year/type scope of an existing pending request', () => {
    expect(concessionRequestErrorMessage('Finance:Concession:010010')).toMatch(
      /pending.*concession type.*academic year/i
    );
    expect(concessionRequestErrorMessage('Finance:Concession:010010')).not.toContain('these fees');
  });
  it('explains why another approved benefit cannot be requested or approved', () => {
    expect(concessionRequestErrorMessage('Finance:Concession:010034')).toBe(
      'This student already has an approved benefit for this concession type in this academic year. Another benefit cannot be requested or approved.'
    );
  });
});
