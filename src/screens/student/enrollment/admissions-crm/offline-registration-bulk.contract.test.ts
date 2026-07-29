import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const read = (...segments: string[]) =>
  fs.readFileSync(path.join(process.cwd(), ...segments), 'utf8');

describe('Enrollment offline registration and bulk-operation contracts', () => {
  it('offers permission-checked paper registration from the registration workspace', () => {
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

    expect(workspace).toContain('Enter Paper Registration');
    expect(workspace).toContain('DirectRegistrationDialog');
    expect(workspace).toContain('IssueRegistrationForm');
    expect(dialog).toContain('useCreatePaperAdmissionCrmRegistrationMutation');
    expect(dialog).toContain('physicalFormNumber');
    expect(dialog).toContain('physicalFormReceivedDate');
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

  it('keeps registration focused on information capture and online/print previews', () => {
    const route = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'registration-document-settings-route.tsx'
    );
    const financeRoute = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'finance-handoff-settings-route.tsx'
    );
    const finance = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'finance-handoff-configuration.tsx'
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

    expect(route).not.toContain("value: 'criteria'");
    expect(route).not.toContain('fee');
    expect(financeRoute).toContain('FinanceHandoffConfiguration');
    expect(finance).toContain('Finance remains the source of truth');
    expect(finance).toContain('financeVerificationRequired');
    expect(registration).toContain('feeRequired: false');
    expect(registration).toContain('feeAmount: 0');
    expect(registration).not.toContain('label="Registration fee"');
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
