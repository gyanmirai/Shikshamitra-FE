import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';

import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import StudentDirectoryDocuments from './student-directory-documents';

const state = vi.hoisted(() => ({
  year: 'year-1',
  permissions: [] as { name: string; isGranted: boolean }[],
  builder: vi.fn(),
  certificate: vi.fn(),
  drawer: vi.fn(),
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({
      globalState: { currentYear: { id: state.year } },
      auth: { permissions: state.permissions },
    }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/customDialog', () => ({
  default: (props: any) => {
    state.drawer(props);
    return (
      <section role="dialog" aria-label={props.title}>
        {props.children}
      </section>
    );
  },
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('../onboarding/student-setup/student-assignment-drawer', () => ({
  default: (props: any) => {
    state.drawer(props);
    return (
      <section role="dialog" aria-label={props.title}>
        {props.children}
      </section>
    );
  },
}));
vi.mock('./student-icard-builder', () => ({
  default: (props: any) => {
    state.builder(props);
    return <div>I-card builder</div>;
  },
}));
vi.mock('./student-certificate-form', () => ({
  default: (props: any) => {
    state.certificate(props);
    return <div>Certificate form</div>;
  },
}));
const student: StudentDirectoryItem = {
  id: 'student-1',
  studentId: 'student-1',
  firstName: 'Asha',
  maskedFields: [],
  academicYearId: 'year-1',
  status: 6,
  entrySource: 'CompletedOnboarding',
  hasPhoto: false,
};
beforeEach(() => {
  state.builder.mockClear();
  state.certificate.mockClear();
  state.drawer.mockClear();
  state.year = 'year-1';
  state.permissions = [
    'Students.Records.StudentICard.View',
    'Students.Records.StudentICard.Add',
    'Students.Records.Certificates.View',
    'Students.Records.Certificates.Add',
  ].map((name) => ({ name, isGranted: true }));
});
it('passes selected students and their source year to the existing I-card workflow', () => {
  render(
    <StudentDirectoryDocuments
      request={{ kind: 'id-card', students: [student], academicYearId: 'year-1' }}
      onClose={vi.fn()}
    />
  );
  expect(screen.getByRole('dialog', { name: 'Print Student I-Cards' })).toBeInTheDocument();
  expect(state.builder.mock.lastCall?.[0]).toMatchObject({
    initialStudents: [student],
    academicYearId: 'year-1',
    contextInvalid: false,
  });
});
it('pins all four academic fields and provides heading help for a bulk I-card request', () => {
  const academicScope = {
    boardIds: ['board-1'],
    mediumIds: ['medium-1'],
    standardIds: ['class-1'],
    divisionIds: ['division-1'],
  };
  render(
    <StudentDirectoryDocuments
      request={{
        kind: 'id-card',
        students: [student],
        academicYearId: 'year-1',
        academicScope,
        lockAcademicScope: true,
      }}
      onClose={vi.fn()}
    />
  );
  expect(state.builder.mock.lastCall?.[0]).toMatchObject({
    initialAcademicScope: academicScope,
    lockAcademicScope: true,
  });
  expect(state.drawer.mock.lastCall?.[0].titleInfo).toMatch(/review.*PDF.*issue/i);
});
it('keeps the selected students when choosing an existing certificate type', () => {
  render(
    <StudentDirectoryDocuments
      request={{ kind: 'certificate', students: [student], academicYearId: 'year-1' }}
      onClose={vi.fn()}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Bonafide' }));
  expect(state.certificate.mock.lastCall?.[0]).toMatchObject({
    certificateType: 1,
    initialStudents: [student],
    academicYearId: 'year-1',
  });
});
it('does not mount issuing workflows without their exact permissions', () => {
  state.permissions = [];
  render(
    <StudentDirectoryDocuments
      request={{ kind: 'id-card', students: [student], academicYearId: 'year-1' }}
      onClose={vi.fn()}
    />
  );
  expect(
    screen.getByText('You do not have permission to issue these documents.')
  ).toBeInTheDocument();
  expect(state.builder).not.toHaveBeenCalled();
});
it('blocks a stale academic-year request without mounting document workflows', () => {
  state.year = 'year-2';
  render(
    <StudentDirectoryDocuments
      request={{ kind: 'certificate', students: [student], academicYearId: 'year-1' }}
      onClose={vi.fn()}
    />
  );
  expect(
    screen.getByText('The academic year changed. Close this workspace and select students again.')
  ).toBeInTheDocument();
  expect(state.certificate).not.toHaveBeenCalled();
});
it('rejects masked identity selections instead of silently issuing a partial batch', () => {
  render(
    <StudentDirectoryDocuments
      request={{
        kind: 'id-card',
        students: [{ ...student, maskedFields: ['Identity'] }],
        academicYearId: 'year-1',
      }}
      onClose={vi.fn()}
    />
  );
  expect(
    screen.getByText('Select between 1 and 100 students with available identity details.')
  ).toBeInTheDocument();
  expect(state.builder).not.toHaveBeenCalled();
});
it('retains the source year and disables the open I-card workflow after a global year change', () => {
  const request = { kind: 'id-card' as const, students: [student], academicYearId: 'year-1' };
  const { rerender } = render(<StudentDirectoryDocuments request={request} onClose={vi.fn()} />);
  state.year = 'year-2';
  rerender(<StudentDirectoryDocuments request={request} onClose={vi.fn()} />);
  expect(state.builder.mock.lastCall?.[0]).toMatchObject({
    academicYearId: 'year-1',
    contextInvalid: true,
  });
});
