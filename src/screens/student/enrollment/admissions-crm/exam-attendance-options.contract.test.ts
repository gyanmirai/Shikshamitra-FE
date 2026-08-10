import { it, expect, describe } from 'vitest';
import { AdmissionCrmExamAttendanceStatus } from 'src/redux/student/admissions-crm/communication-exams-events-contracts';
import { readEnrollmentSource } from '../enrollment-source-contract';

const workspaceSource = readEnrollmentSource(
  'src',
  'screens',
  'student',
  'enrollment',
  'admissions-crm',
  'exams-workspace.tsx'
);

describe('entrance exam attendance options', () => {
  it('keeps stable API values for distinct non-attendance reasons', () => {
    expect(AdmissionCrmExamAttendanceStatus.NoShow).toBe(3);
    expect(AdmissionCrmExamAttendanceStatus.Excused).toBe(4);
  });

  it('offers all valid staff actions and excludes Not Marked from the edit selector', () => {
    expect(workspaceSource).toContain('Mark present');
    expect(workspaceSource).toContain('Mark absent');
    expect(workspaceSource).toContain('Mark no-show');
    expect(workspaceSource).toContain('Mark excused');
    expect(workspaceSource).toContain('{editableAttendanceStatuses.map((value) => (');
  });
});
