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

describe('Admissions CRM paper registration contract', () => {
  it('uses published operational route definitions instead of static route enums', () => {
    expect(source).toContain('useGetAdmissionCrmQuickInquiryOptionsQuery');
    expect(source).toContain('mapQuickInquiryOptions(quickInquiryOptionsQuery.data)');
    expect(source).toContain('directRegistrationOptions.routes.map');
    expect(source).toContain('getDefaultQuickInquiryOption(directRegistrationOptions.routes)');
    expect(source).toContain('intendedRouteDefinitionId: selectedRoute.definitionId || null');
    expect(source).toContain('intendedRouteType: selectedRoute.routeType');
    expect(source).not.toContain('Object.values(AdmissionCrmRouteType)');
  });

  it('submits one published hierarchy option and keeps the academic target in one step', () => {
    expect(source).toContain('useGetAdmissionCrmOperationalStandardOptionsQuery');
    expect(source).not.toContain('useGetAdmissionCrmAdmissionYearStandardOptionsQuery');
    expect(source).toContain('academicBoardId: selectedStandard.boardId');
    expect(source).toContain('academicMediumId: selectedStandard.mediumId');
    expect(source).toContain('academicMediumStageId: selectedStandard.mediumStageId');
    expect(source).toContain('targetStandardId: selectedStandard.standardId');
    expect(source).toMatch(
      /activeStep === 1[\s\S]*label="Board"[\s\S]*label="Medium"[\s\S]*label="Standard"[\s\S]*label="Admission pathway"/
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

  it('creates paper registrations through the paper endpoint contract', () => {
    expect(source).toContain('useCreatePaperAdmissionCrmRegistrationMutation');
    expect(source).toContain('physicalFormNumber');
    expect(source).toContain('physicalFormReceivedDate');
    expect(source).toContain('Create From Paper Form');
    expect(source).toContain('OCR is not used in this workflow');
    expect(source).not.toContain('useCreateDirectAdmissionCrmRegistrationMutation');
  });

  it('guards rapid creation and rechecks duplicates after an ambiguous request failure', () => {
    expect(source).toContain('createRegistrationInFlightRef.current');
    expect(source).toMatch(/catch \(error\) \{\s+setDuplicateReviewed\(false\)/);
    expect(source).toContain('createRegistrationInFlightRef.current = false');
  });
});
