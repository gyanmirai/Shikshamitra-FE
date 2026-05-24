import { it, expect, describe } from 'vitest';

import {
  buildEmployeeICardPdfUrl,
  buildEmployeeICardAssetParams,
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
});
