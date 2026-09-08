import dayjs from 'dayjs';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { DayType } from 'src/enums/academic-calendar';
import { render, screen } from '@testing-library/react';
import { it, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';

import { CurriculumReportPreviewTable } from './curriculum-management/reports/CurriculumReportPreviewTable';
import { SubjectImpactStatusCard } from './curriculum-management/setting/subjectCreation/components/SubjectImpactStatusCard';
import { TeacherEmptyState } from './curriculum-management/subjectAssignment/component/viewDetailComponents/TeacherEmptyState';
import { CalendarMonthEventsPanel } from './academic-calendar-management/calendarManagement/components/CalendarMonthEventsPanel';
import { getDayTypeSemanticColor } from './academic-calendar-management/calendarManagement/components/calendarDayTypePresentation';

const darkTheme = createTheme({ ...defaultSettings, colorScheme: 'dark' });

function renderInDarkMode(node: React.ReactNode) {
  return render(
    <ThemeProvider theme={darkTheme} defaultMode="dark">
      {node}
    </ThemeProvider>
  );
}

describe('academic dark-mode contrast surfaces', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('data-mui-color-scheme', 'dark');
  });

  it('renders readable subject usage status content for both states', () => {
    const { rerender } = renderInDarkMode(<SubjectImpactStatusCard isInUse />);

    expect(screen.getByText('Impact & System Restrictions')).toBeVisible();
    expect(screen.getByText('Restricted Deletion')).toBeVisible();

    rerender(
      <ThemeProvider theme={darkTheme} defaultMode="dark">
        <SubjectImpactStatusCard isInUse={false} />
      </ThemeProvider>
    );

    expect(screen.getByText('Safe to Modify or Delete')).toBeVisible();
    expect(screen.getByText('Fully Modifiable')).toBeVisible();
  });

  it('renders the teaching-staff empty state with explanatory text', () => {
    renderInDarkMode(<TeacherEmptyState teacherRole="secondary" />);

    expect(screen.getByText('No secondary teachers assigned')).toBeVisible();
  });

  it('renders report column headers as table headers', () => {
    renderInDarkMode(
      <CurriculumReportPreviewTable
        columns={[{ id: 'chapterName', label: 'Chapter Name' }]}
        isLoading={false}
        rows={[{ chapterName: 'The Atom' }]}
        rowsPerPage={10}
      />
    );

    expect(screen.getByRole('columnheader', { name: 'Chapter Name' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'The Atom' })).toBeVisible();
  });

  it('maps calendar events to a semantic palette and renders their metadata', () => {
    expect(getDayTypeSemanticColor(DayType.Holiday)).toBe('error');

    renderInDarkMode(
      <CalendarMonthEventsPanel
        currentMonth={dayjs('2026-09-01')}
        events={[{ date: '2026-09-14', dayType: DayType.Holiday, title: 'Ganesh Chaturthi' }]}
      />
    );

    expect(screen.getByText('Ganesh Chaturthi')).toBeVisible();
    expect(screen.getByText('Holiday')).toBeVisible();
    expect(screen.getByText('Mon, 14 Sep')).toBeVisible();
  });
});
