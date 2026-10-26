import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, within, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import ElectiveGroupUsageDrawer from './ElectiveGroupUsageDrawer';

import type { IElectiveSubject } from '../type';
import type { ElectiveGroupUsageDrawerProps } from './electiveGroupUsageTypes';

const mocks = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));

const group: IElectiveSubject = {
  id: 'group-1',
  name: 'Languages',
  groupType: 'Language',
  description: 'Saved language choices.',
  color: '#8E33FF',
  status: 'Active',
  createdBy: 'Admin',
  subjectIds: ['english', 'hindi'],
  subjects: [
    { id: 'english', name: 'English' },
    { id: 'hindi', name: 'Hindi' },
  ],
};

function renderUsage(overrides: Partial<ElectiveGroupUsageDrawerProps> = {}) {
  const props = {
    open: true,
    onClose: vi.fn(),
    selectedGroup: group,
    usageData: { canDelete: true },
    ...overrides,
  };
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ElectiveGroupUsageDrawer {...props} />
    </ThemeProvider>
  );
}

function section(name: string) {
  const card = screen.getByRole('heading', { name }).closest('section');
  expect(card).not.toBeNull();
  return card as HTMLElement;
}

describe('Elective group detail presentation', () => {
  it('retains saved identity and subjects in matching form/view sections with help', () => {
    renderUsage();
    expect(within(section('Group Details')).getByText('Languages')).toBeVisible();
    expect(within(section('Group Details')).getByText('Language')).toBeVisible();
    expect(within(section('Group Details')).getByText(group.description!)).toBeVisible();
    expect(within(section('Group Details')).getByText(group.color)).toBeVisible();
    expect(within(section('Subject Selection')).getByText('English')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Group Details information' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Student Distribution information' })).toBeVisible();
    expect(screen.queryByText('6 Tracked Metrics')).not.toBeInTheDocument();
  });

  it('preserves real zero usage counts and uses the shared student illustration for empty distribution', () => {
    renderUsage();
    expect(within(section('Dependencies & Usage')).getAllByText('0')).toHaveLength(5);
    const distribution = section('Student Distribution');
    expect(within(distribution).getByText('0 total students')).toBeVisible();
    expect(within(distribution).getByText('No student distribution recorded yet')).toBeVisible();
    expect(distribution.querySelector('svg[viewBox="0 0 320 280"]')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Archive group' })).not.toBeInTheDocument();
  });

  it('keeps distribution totals, relative bars and show-all navigation for populated data', () => {
    renderUsage({
      usageData: {
        usage: {
          studentSelectionsCount: 99,
          subjectWiseStudentCount: Array.from({ length: 6 }, (_, index) => ({
            subject: `Subject ${index + 1}`,
            count: index + 1,
          })),
        },
      },
    });
    const distribution = section('Student Distribution');
    expect(within(distribution).getByText('21 total students')).toBeVisible();
    expect(
      within(distribution).getByRole('progressbar', { name: 'Subject 1 relative student count' })
    ).toHaveAttribute('aria-valuenow', '17');
    expect(within(distribution).queryByText('Subject 6')).not.toBeInTheDocument();
    fireEvent.click(within(distribution).getByRole('button', { name: 'View all (6 subjects)' }));
    expect(within(distribution).getByText('Subject 6')).toBeVisible();
  });

  it('keeps dependency routes and closes the view before the permitted archive action', () => {
    mocks.push.mockClear();
    const onClose = vi.fn();
    const onArchive = vi.fn();
    renderUsage({
      canArchive: true,
      onClose,
      onArchive,
      usageData: { canDelete: false, usage: { classAllocationsCount: 2 } },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Class allocations (2)' }));
    expect(screen.getByText('Used across 1 module')).toBeVisible();
    expect(mocks.push).toHaveBeenCalledWith('/academic/curriculumSubjects');
    onClose.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Archive group' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onArchive).toHaveBeenCalledWith(group);
    expect(onClose.mock.invocationCallOrder[0]).toBeLessThan(
      onArchive.mock.invocationCallOrder[0]
    );
  });

  it('retains the loading presentation and omits archive for archived groups', () => {
    renderUsage({
      isLoading: true,
      canArchive: true,
      onArchive: vi.fn(),
      selectedGroup: { ...group, status: 'Archived' },
    });
    expect(screen.getByLabelText('Loading elective group details')).toHaveAttribute(
      'aria-busy',
      'true'
    );
    expect(screen.queryByRole('heading', { name: 'Student Distribution' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Archive group' })).not.toBeInTheDocument();
  });
});
