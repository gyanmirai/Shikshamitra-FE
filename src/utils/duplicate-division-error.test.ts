import { it, expect, describe } from 'vitest';

import { parseApiProblemDetail } from './api-problem-details';
import { duplicateDivisionCode } from './duplicate-division-error';

describe('division conflict feedback', () => {
  it.each([
    { errorCode: duplicateDivisionCode, data: { name: ' A ' } },
    { error: { code: duplicateDivisionCode, data: { name: ' A ' } } },
    {
      errorCode: 'ShikshaMitra.TenantSettings:00001',
      data: { entityName: 'division', name: ' A ' },
    },
    {
      error: {
        code: 'ShikshaMitra.TenantSettings:00001',
        data: { entityName: 'Division', name: ' A ' },
      },
    },
  ])('supports current and legacy API envelopes', (data) => {
    expect(parseApiProblemDetail({ data })).toEqual({
      errorCode: duplicateDivisionCode,
      detail: "A division named 'A' already exists in this standard.",
    });
  });

  it('explains a conflict without a name and preserves unrelated legacy errors', () => {
    expect(parseApiProblemDetail({ data: { errorCode: duplicateDivisionCode } }).detail).toBe(
      'A division with this name already exists in this standard.'
    );
    expect(
      parseApiProblemDetail({
        data: {
          errorCode: 'ShikshaMitra.TenantSettings:00001',
          data: { entityName: 'medium' },
          detail: 'Medium already exists.',
        },
      }).detail
    ).toBe('Medium already exists.');
  });
});
