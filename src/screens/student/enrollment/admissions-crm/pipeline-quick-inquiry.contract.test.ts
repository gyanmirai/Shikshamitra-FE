import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const pipelineSource = fs.readFileSync(
  path.join(
    process.cwd(),
    'src',
    'screens',
    'student',
    'enrollment',
    'admissions-crm',
    'pipeline-workspace.tsx'
  ),
  'utf8'
);

describe('Admissions Pipeline Quick Inquiry contract', () => {
  it('captures reusable structured names and validates email inline', () => {
    expect(pipelineSource).toContain('label="First name"');
    expect(pipelineSource).toContain('label="Middle name (optional)"');
    expect(pipelineSource).toContain('label="Last name (optional)"');
    expect(pipelineSource).toContain('isValidQuickInquiryEmail(quickForm.email)');
    expect(pipelineSource).toContain('<InputAdornment position="start">@</InputAdornment>');
    expect(pipelineSource).toContain('Enter a valid email address');
    expect(pipelineSource).toContain('middleName: quickForm.middleName.trim() || undefined');
    expect(pipelineSource).toContain('lastName: quickForm.lastName.trim() || undefined');
  });

  it('uses operational options and sends the selected route definition', () => {
    expect(pipelineSource).toContain('useGetAdmissionCrmQuickInquiryOptionsQuery');
    expect(pipelineSource).toContain('mapQuickInquiryOptions(quickInquiryOptionsQuery.data)');
    expect(pipelineSource).toContain('quickInquiryOptions.routes.map');
    expect(pipelineSource).toContain('quickInquiryOptions.channels.map');
    expect(pipelineSource).toContain('intendedRouteDefinitionId: selectedQuickInquiryRoute.id');
    expect(pipelineSource).toContain('academicMediumStageId: quickForm.mediumStageId');
    expect(pipelineSource).not.toContain('intendedRouteType: AdmissionCrmRouteType.Fresh');
    expect(pipelineSource).toContain(
      'quickInquiryOptionsQuery.data?.registrationFormRequiredBeforeExam'
    );
    expect(pipelineSource).toContain('quickInquiryOptionsQuery.data?.entranceExamRequired');
    expect(pipelineSource).not.toContain('useGetAdmissionCrmCycleConfigurationQuery');
  });

  it('explains the academic mapping and progressively discloses optional fields', () => {
    expect(pipelineSource).toContain('label="Academic stage"');
    expect(pipelineSource).toContain('Derived from the selected board and medium.');
    expect(pipelineSource).toContain('New inquiries start in the New Inquiry stage.');
    expect(pipelineSource).toContain('<Collapse in={showOptionalQuickInquiryFields}>');
    expect(pipelineSource).toContain('Add optional details');
  });

  it('opens the dedicated applicant page from the pointer row and semantic applicant control', () => {
    expect(pipelineSource).toContain('createApplicantRowNavigationProps');
    expect(pipelineSource).toContain(
      "onOpen: () => openApplicant((row as AdmissionCrmLeadDto).id, 'overview')"
    );
    expect(pipelineSource).toContain('createApplicantLinkNavigationProps');
    expect(pipelineSource).toContain("href: getApplicantHref(lead.id, 'overview')");
    expect(pipelineSource).toContain("onOpen: () => openApplicant(lead.id, 'overview')");
    expect(pipelineSource).not.toContain('component="button"');
    expect(pipelineSource).toMatch(
      /`pipeline:\$\{academicYearId \|\| 'none'\}:\$\{sessionIdentity\}`/
    );
    expect(pipelineSource).not.toContain('<ApplicantWorkspaceDrawer');
    expect(pipelineSource).not.toContain('component={NextLink}');
  });

  it('displays the immutable configured pathway snapshot when the API supplies it', () => {
    expect(pipelineSource).toContain('intendedRouteNameSnapshot');
    expect(pipelineSource).toContain('intendedRouteDefinitionVersion');
    expect(pipelineSource).toContain('Version {lead.intendedRouteDefinitionVersion}');
  });
});
