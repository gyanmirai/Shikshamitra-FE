import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, within } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import SubjectNavigator from './SubjectNavigator';
import SubjectWorkspaceHeader from './SubjectWorkspaceHeader';
import { SubjectInformationCard } from './SubjectInformationCard';

import type { ISubjectDetail, INavigatorSubjectItem } from '../type';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const subject: ISubjectDetail = {
  id: 'subject-one',
  classId: 'class-one',
  subjectId: 'science',
  subjectCode: 'SCI001',
  subjectName: 'Science',
  primaryTeacher: { id: 'teacher-one', name: 'Akshay Patel' },
  primaryTeacherId: 'teacher-one',
  secondaryTeachers: [],
  prerequisites: '',
  learningGoals: '',
  description: '',
};

const navigatorItem: INavigatorSubjectItem = {
  assignmentId: 'assignment-one',
  subjectId: 'science',
  subjectCode: 'SCI001',
  subjectName: 'Science',
  status: 1,
  subjectType: 0,
  primaryTeacher: { id: 'teacher-one', name: 'Akshay Patel' },
};

function renderWithTheme(node: React.ReactNode) {
  return render(
    <ThemeProvider theme={createTheme(defaultSettings)}>{node}</ThemeProvider>
  );
}

describe('subject detail presentation', () => {
  it('keeps only the subject name and navigation in the workspace header', () => {
    renderWithTheme(
      <SubjectWorkspaceHeader
        subject={subject}
        activeNavigatorItem={navigatorItem}
        coreSubjects={[navigatorItem]}
        electiveGroups={[]}
        selectedAssignmentId="assignment-one"
        selectedSubjectCode="SCI001"
        selectedSubjectId="science"
        onSelectSubject={vi.fn()}
        navigationInfo={{
          positionText: '1 of 1',
          hasPrevious: false,
          hasNext: false,
          goToPrevious: vi.fn(),
          goToNext: vi.fn(),
        }}
      />
    );

    expect(screen.getByText('Science')).toBeVisible();
    expect(screen.queryByText('SCI001')).not.toBeInTheDocument();
    expect(screen.queryByText('Core')).not.toBeInTheDocument();
    expect(screen.queryByText('Published')).not.toBeInTheDocument();
    expect(screen.queryByText('Akshay Patel')).not.toBeInTheDocument();
  });

  it('shows status with the remaining subject information', () => {
    renderWithTheme(<SubjectInformationCard subject={subject} status={1} />);

    const information = screen.getByText('Subject Information').parentElement;
    expect(information).not.toBeNull();
    expect(within(information!).getByText('SCI001')).toBeVisible();
    expect(within(information!).getByText('Science')).toBeVisible();
    expect(within(information!).getByText('Status')).toBeVisible();
    expect(within(information!).getByText('Published')).toBeVisible();
  });

  it('exposes the selected subject without relying on a filled background', () => {
    renderWithTheme(
      <SubjectNavigator
        coreSubjects={[navigatorItem]}
        electiveGroups={[]}
        totalSubjectsCount={1}
        totalFilteredCount={1}
        selectedAssignmentId="assignment-one"
        selectedSubjectCode="SCI001"
        selectedSubjectId="science"
        onSelectSubject={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        expandedGroups={{}}
        onToggleGroup={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Select Science' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});
