import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Inquiry Source form wiring', () => {
  it('loads inquiry and registration sources from the selected academic year', () => {
    const inquiryHook = readSource(
      'src/screens/student/enrollment/Inquiry/hooks/useInquiryForm.ts'
    );
    const inquiryBasicDetails = readSource(
      'src/screens/student/enrollment/Inquiry/components/form-sections/BasicStudentDetails.tsx'
    );
    const registrationSource = readSource(
      'src/screens/student/enrollment/register/RenderInquiryPrefrance.tsx'
    );
    const registrationAcademicYear = readSource(
      'src/screens/student/enrollment/register/RenderAcademicYear.tsx'
    );

    expect(inquiryHook).toContain('resolveInquirySourceAcademicYearId(\n    values.academicYear');
    expect(inquiryHook).toContain('academicYearId: inquirySourceAcademicYearId');
    expect(inquiryHook).toContain('skip: !inquirySourceAcademicYearId');
    expect(inquiryBasicDetails).toContain("setFieldValue('inquiryPreferences', '')");
    expect(registrationSource).toContain('formik.values.academicYear');
    expect(registrationSource).toContain('academicYearId: inquirySourceAcademicYearId');
    expect(registrationAcademicYear).toContain("setFieldValue('inquiryPreference', null)");
    expect(registrationAcademicYear).toContain("setFieldValue('inquiryPreferenceName', '')");
  });

  it('posts quick-added sources to the selected academic year', () => {
    const inquiryForm = readSource('src/screens/student/enrollment/Inquiry/inquiry-form.tsx');
    const registrationSource = readSource(
      'src/screens/student/enrollment/register/RenderInquiryPrefrance.tsx'
    );
    const settingsSource = readSource(
      'src/screens/student/enrollment/setting/inquiryPreference.tsx'
    );

    expect(inquiryForm).toContain('academicYearId={values.academicYear}');
    expect(registrationSource).toContain('academicYearId={inquirySourceAcademicYearId}');
    expect(settingsSource).toContain('academicYearId={currentYear?.id}');
    expect(settingsSource).toContain('academicYearId?: string | null');
    expect(settingsSource).toContain(
      'const targetAcademicYearId = academicYearId || currentYear?.id'
    );
  });

  it('unwraps settings mutations before showing success or closing dialogs', () => {
    const settingsSource = readSource(
      'src/screens/student/enrollment/setting/inquiryPreference.tsx'
    );

    expect(settingsSource).toContain('await deletePreference(editData?.id).unwrap();');
    expect(settingsSource).toMatch(/await updatePreferenceStatus\(\{[\s\S]*?\}\)\.unwrap\(\);/);
    expect(settingsSource).toMatch(/await updatePreference\(\{[\s\S]*?\}\)\.unwrap\(\);/);
    expect(settingsSource).toMatch(/await addPreference\(\{[\s\S]*?\}\)\.unwrap\(\);/);
    expect(settingsSource).not.toContain(
      'await deletePreference(editData?.id);\n              shikshaMitraToast.success'
    );
  });
});
