import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const source = fs.readFileSync(
  path.join(
    process.cwd(),
    'src',
    'screens',
    'student',
    'enrollment',
    'admissions-crm',
    'direct-registration-dialog.tsx'
  ),
  'utf8'
);

describe('Admissions CRM direct registration contract', () => {
  it('uses published operational route definitions instead of static route enums', () => {
    expect(source).toContain('useGetAdmissionCrmQuickInquiryOptionsQuery');
    expect(source).toContain('mapQuickInquiryOptions(quickInquiryOptionsQuery.data)');
    expect(source).toContain('directRegistrationOptions.routes.map');
    expect(source).toContain('getDefaultQuickInquiryOption(directRegistrationOptions.routes)');
    expect(source).toContain('intendedRouteDefinitionId: selectedRoute.id');
    expect(source).not.toContain('Object.values(AdmissionCrmRouteType)');
    expect(source).not.toContain('intendedRouteType:');
  });

  it('submits the selected academic stage and keeps class selection in the academic step', () => {
    expect(source).toContain('academicMediumStageId: form.mediumStageId');
    expect(source).toContain('targetStandardId: selectedStandard.id');
    expect(source).toMatch(
      /activeStep === 1[\s\S]*label="Academic stage"[\s\S]*label="Target class"[\s\S]*label="Admission pathway"/
    );
    expect(source).toMatch(
      /activeStep === 2[\s\S]*label="Registration template"[\s\S]*label="Form number series"/
    );
  });

  it('validates email before advancing and shows the same at-sign affordance as Quick Inquiry', () => {
    expect(source).toContain('isValidQuickInquiryEmail(form.email)');
    expect(source).toContain('if (emailInvalid)');
    expect(source).toContain('Enter a valid email address, for example parent@example.com.');
    expect(source).toContain('<InputAdornment position="start">@</InputAdornment>');
    expect(source).toContain('onBlur={() => setEmailTouched(true)}');
  });

  it('keeps the backend-required manual entry channel and blocks unavailable configuration', () => {
    expect(source).toContain('channel: AdmissionInquiryChannel.ManualBackOffice');
    expect(source).toContain('channel.value === AdmissionInquiryChannel.ManualBackOffice');
    expect(source).toContain('quickInquiryOptionsQuery.data?.isAdmissionCycleActive === false');
    expect(source).toContain('optionConfigurationUnavailable');
  });
});
