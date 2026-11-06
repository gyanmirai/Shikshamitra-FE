import { it, expect, describe } from 'vitest';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import {
  buildEmployeeICardPdfUrl,
  buildEmployeeICardAssetParams,
  handleEmployeeICardPdfResponse,
} from './employee-icard-template-api';

describe('employeeICardTemplateApi contracts', () => {
  it('builds authenticated asset query params with the raw blob name', () => {
    expect(buildEmployeeICardAssetParams('employee-icards/assets/tenant/logo.png')).toEqual({
      blobName: 'employee-icards/assets/tenant/logo.png',
    });
  });

  it('builds the bulk PDF export URL from the saved template id', () => {
    expect(buildEmployeeICardPdfUrl('template-1')).toBe(
      '/employees/i-card/templates/template-1/pdf'
    );
  });

  it('keeps successful PDF responses as blobs', async () => {
    const result = await handleEmployeeICardPdfResponse(
      new Response('%PDF-1.7', {
        status: 200,
        headers: { 'Content-Type': 'application/pdf' },
      })
    );
    expect(result).toBeInstanceOf(Blob);
    expect(await (result as Blob).text()).toBe('%PDF-1.7');
  });

  it('parses the actual failed PDF response handler into structured overflow guidance', async () => {
    const detail =
      'front: Staff name exceeds its text box. Enlarge the box or reduce the font size.';
    const response = new Response(
      JSON.stringify({
        error: {
          code: 'ShikshaMitra:IdentityCard:InvalidConfiguration',
          message: 'One or more business rules were violated.',
          data: { detail },
        },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
    const data = await handleEmployeeICardPdfResponse(response);
    expect(data).not.toBeInstanceOf(Blob);
    expect(parseApiProblemDetail({ status: response.status, data })).toEqual({
      detail,
      errorCode: 'ShikshaMitra:IdentityCard:InvalidConfiguration',
    });
  });

  it('provides safe guidance when a failed PDF response has unreadable JSON', async () => {
    await expect(
      handleEmployeeICardPdfResponse(new Response('<html>Unavailable</html>', { status: 502 }))
    ).resolves.toEqual({ detail: 'Could not export Staff I-card PDF' });
  });
});
