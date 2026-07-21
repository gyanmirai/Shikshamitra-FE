import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const read = (...segments: string[]) =>
  fs.readFileSync(path.join(process.cwd(), ...segments), 'utf8');

describe('Enrollment offline registration and bulk-operation contracts', () => {
  it('offers permission-checked direct registration from the registration workspace', () => {
    const workspace = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'registrations-workspace.tsx'
    );
    const dialog = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'direct-registration-dialog.tsx'
    );

    expect(workspace).toContain('Create Registration');
    expect(workspace).toContain('DirectRegistrationDialog');
    expect(workspace).toContain('IssueRegistrationForm');
    expect(dialog).toContain('useCreateDirectAdmissionCrmRegistrationMutation');
    expect(dialog).toContain('AdmissionInquiryChannel.ManualBackOffice');
    expect(dialog).toContain('duplicateFingerprint');
    expect(dialog).toContain('T00:00:00.000Z');
  });

  it('supports staff entry of paper responses without using the public registration API', () => {
    const editor = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'registration-response-editor.tsx'
    );
    const api = read('src', 'redux', 'student', 'admissions-crm', 'admissions-crm-api.ts');

    expect(editor).toContain('useSaveAdmissionCrmStaffRegistrationResponsesMutation');
    expect(editor).toContain('useSubmitAdmissionCrmStaffRegistrationResponsesMutation');
    expect(editor).toContain('Save draft');
    expect(editor).toContain('Submit registration');
    expect(editor).toContain('field.systemField && !field.parentEditable');
    expect(api).toContain('/staff-responses');
    expect(api).toContain('/staff-submit');
  });

  it('exposes backend-enforced admission criteria and online/print template previews', () => {
    const route = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'registration-document-settings-route.tsx'
    );
    const criteria = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'admission-criteria-configuration.tsx'
    );
    const registration = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'admissions-registration-configuration.tsx'
    );
    const preview = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'registration-template-preview.tsx'
    );

    expect(route).toContain("value: 'criteria'");
    expect(criteria).toContain('AdmissionsFinancialConfiguration');
    expect(criteria).toContain('Registration verified');
    expect(criteria).toContain('Required documents resolved');
    expect(criteria).toContain('Payment condition satisfied');
    expect(registration).toContain('Use Starter Template');
    expect(registration).toContain('Blank Template');
    expect(registration).toContain('RegistrationTemplatePreview');
    expect(preview).toContain('label="Online form"');
    expect(preview).toContain('label="Print form"');
  });

  it.each([
    ['pipeline-workspace.tsx', 'Bulk inquiry actions'],
    ['overview-workspace.tsx', 'Bulk work actions'],
    ['exams-workspace.tsx', 'Bulk exam actions'],
    ['operations-queue-workspace.tsx', 'Bulk enrollment actions'],
  ])('keeps checkbox-backed bulk actions in %s', (file, label) => {
    let source = read('src', 'screens', 'student', 'enrollment', 'admissions-crm', file);
    if (file === 'operations-queue-workspace.tsx') {
      source += read(
        'src',
        'screens',
        'student',
        'enrollment',
        'admissions-crm',
        'operations-queue-columns.tsx'
      );
    }

    expect(source).toContain('<Checkbox');
    expect(source).toContain(label);
  });

  it('keeps partial bulk failures selected and persists column filters in saved views', () => {
    const exams = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'exams-workspace.tsx'
    );
    const myWork = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'overview-workspace.tsx'
    );
    const operations = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'operations-queue-workspace.tsx'
    );

    expect(exams).toContain('result.failedCount > 0');
    expect(myWork).toContain('result.failedCount > 0');
    expect(operations).toContain('result.failedCount > 0');
    expect(operations).toContain('restoreSavedColumnFilters');
    expect(operations).toContain(
      "applicantSearch: getLatestStringFilter(columnFilters, 'applicantName')"
    );
  });
});
