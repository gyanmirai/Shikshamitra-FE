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

  it('uses Admission Year Setup options and sends one consistent academic target', () => {
    expect(pipelineSource).toContain('useGetAdmissionCrmQuickInquiryOptionsQuery');
    expect(pipelineSource).toContain('useGetAdmissionCrmOperationalStandardOptionsQuery');
    expect(pipelineSource).not.toContain('useGetAdmissionCrmAdmissionYearStandardOptionsQuery');
    expect(pipelineSource).toContain('mapQuickInquiryOptions(quickInquiryOptionsQuery.data)');
    expect(pipelineSource).toContain('quickInquiryOptions.routes.map');
    expect(pipelineSource).toContain('quickInquiryOptions.channels.map');
    expect(pipelineSource).toContain('quickInquiryOptions.sources.filter');
    expect(pipelineSource).toContain('quickInquiryOptions.inquiryTypes.map');
    expect(pipelineSource).toContain(
      'intendedRouteDefinitionId: selectedQuickInquiryRoute.definitionId'
    );
    expect(pipelineSource).toContain('academicBoardId: selectedStandard.boardId');
    expect(pipelineSource).toContain('academicMediumId: selectedStandard.mediumId');
    expect(pipelineSource).toContain('academicMediumStageId: selectedStandard.mediumStageId');
    expect(pipelineSource).toContain('targetStandardId: selectedStandard.standardId');
    expect(pipelineSource).not.toContain('intendedRouteType: AdmissionCrmRouteType.Fresh');
    expect(pipelineSource).toContain(
      'quickInquiryOptionsQuery.data?.registrationFormRequiredBeforeExam'
    );
    expect(pipelineSource).toContain('quickInquiryOptionsQuery.data?.entranceExamRequired');
    expect(pipelineSource).not.toContain('useGetAdmissionCrmCycleConfigurationQuery');
  });

  it('uses school-facing academic fields and progressively discloses optional fields', () => {
    expect(pipelineSource).toContain('label="Inquiry source"');
    expect(pipelineSource).toContain('label="Inquiry type"');
    expect(pipelineSource).toContain('label="Board"');
    expect(pipelineSource).toContain('label="Medium"');
    expect(pipelineSource).toContain('label="Standard"');
    expect(pipelineSource).not.toContain('label="Academic stage"');
    expect(pipelineSource).toContain('New applicants start in New Inquiry.');
    expect(pipelineSource).toContain('name="parentGuardianName"');
    expect(pipelineSource).toContain('name="primaryContactNo"');
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
