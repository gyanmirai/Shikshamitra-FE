import { it, vi, expect, describe } from 'vitest';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import OnboardingSettingsPage from './onboarding-settings-page';
import { defaultOnboardingSettings } from '../onboarding-settings-model';
import { OnboardingSettingsProvider } from '../onboarding-settings-context';
import { GrNumberSettingsScreen, RollNumberSettingsScreen } from './onboarding-number-settings';

vi.mock('./portal-access-settings', () => ({ default: () => <div>Portal settings</div> }));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('src/components/custom-tabs', () => ({
  CustomTabs: ({ children }: { children: React.ReactNode }) => <div role="tablist">{children}</div>,
}));

vi.mock('src/components/customDialog', () => ({
  default: ({ open, title, children }: { open: boolean; title: string; children: React.ReactNode }) =>
    open ? <div role="dialog" aria-label={title}>{children}</div> : null,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('src/routes/hooks', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/student/onboarding/settings/numbering-placement',
  useSearchParams: () => new URLSearchParams('tab=gr-number'),
}));

vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({
    heading,
    description,
    action,
    links,
  }: {
    heading: string;
    description: string;
    action?: React.ReactNode;
    links: Array<{ name: string; href?: string }>;
  }) => (
    <div data-testid="custom-breadcrumbs">
      <h1 data-testid="breadcrumb-heading">{heading}</h1>
      <p>{description}</p>
      <nav aria-label="Breadcrumb">
        {links.map((link) =>
          link.href ? (
            <a key={link.name} href={link.href}>
              {link.name}
            </a>
          ) : (
            <span key={link.name}>{link.name}</span>
          )
        )}
      </nav>
      {action}
    </div>
  ),
}));

vi.mock('../onboarding-configuration-scope-bar', () => ({
  OnboardingConfigurationScopeBar: () => <div data-testid="configuration-scope" />,
}));

vi.mock('src/components/customizabaleTable', () => ({
  default: ({
    tableTitle,
    columns,
    data = [],
    isFilter,
    searchFieldProps,
  }: {
    tableTitle: string;
    columns: Array<{
      id: string;
      label: string;
      filterType?: string;
      enumOptions?: Array<{ label: string; value: string }>;
      isFilter?: boolean;
      isSort?: boolean;
      render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
    }>;
    data?: Array<Record<string, unknown>>;
    isFilter?: boolean;
    searchFieldProps?: { placeholder?: string };
  }) => (
    <div data-testid="customizable-table" data-filters-enabled={isFilter !== false}
      data-search-placeholder={searchFieldProps?.placeholder}>
      <h3>{tableTitle}</h3>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.id} data-filter-type={column.filterType}
                data-filter-options={column.enumOptions?.map((option) => option.value).join('|')}
                data-filterable={column.isFilter !== false}
                data-sortable={column.isSort !== false}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={String(row.id ?? rowIndex)}>
              {columns.map((column) => (
                <td key={column.id}>
                  {column.render
                    ? column.render(row[column.id], row)
                    : String(row[column.id] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
}));

vi.mock('./use-onboarding-academic-structure', () => {
  const boards = [
      {
        id: 'board-cbse',
        name: 'CBSE', type: 0,
        educationMediums: [
          {
            id: 'medium-cbse-english',
            name: 'English',
            educationMediumStages: [
              {
                id: 'stage-cbse-secondary',
                name: 'Secondary',
                standards: [
                  {
                    id: 'grade-6',
                    name: 'Grade 6',
                    divisions: [{ id: 'division-cbse-6-a', name: 'A' }],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'board-gseb',
        name: 'GSEB', type: 1,
        educationMediums: [
          {
            id: 'medium-gseb-gujarati',
            name: 'Gujarati',
            educationMediumStages: [
              {
                id: 'stage-gseb-primary',
                name: 'Primary',
                standards: [
                  {
                    id: 'standard-4',
                    name: 'Standard 4',
                    divisions: [{ id: 'division-gseb-4-a', name: 'A' }],
                  },
                ],
              },
            ],
          },
        ],
      },
  ];
  return {
    useOnboardingAcademicStructure: () => ({
      boards, allBoards: boards,
      campuses: [
        { id: 'campus-north', code: 'N', name: 'North Campus' },
        { id: 'campus-south', code: 'S', name: 'South Campus' },
      ],
      campusesLoading: false, campusesError: false,
    }),
    getOnboardingSchoolLevelName: (_board: string, _medium: string, stage: string) => stage,
  };
});


const choose = (label: string, option: string, multiple = false) => {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
  fireEvent.click(screen.getByRole('option', { name: option }));
  if (multiple) fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
};
const selectAcademicPath = () => {
  choose('Board', 'CBSE');
  choose('Medium', 'English');
  choose('Class', 'Grade 6', true);
};
const renderSettings = (children: React.ReactNode, onPersist?: any, initialSettings = defaultOnboardingSettings) => render(
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <OnboardingSettingsProvider onPersist={onPersist} initialSettings={initialSettings}>{children}</OnboardingSettingsProvider>
  </LocalizationProvider>
);

describe('Onboarding numbering settings', () => {
  it('splits academic columns and exposes the draft/published lifecycle', () => {
    renderSettings(<GrNumberSettingsScreen />);
    const table = within(screen.getByTestId('customizable-table'));
    ['Board', 'Medium', 'School level', 'Class', 'Version'].forEach((name) =>
      expect(table.getByRole('columnheader', { name })).toBeInTheDocument());
    expect(table.getByRole('columnheader', { name: 'Status' }))
      .toHaveAttribute('data-filter-options', 'draft|published|superseded');
    expect(table.queryByRole('columnheader', { name: 'Sequence scope' })).not.toBeInTheDocument();
  });

  it('shows only board, medium and class for CBSE GR, and saves a draft', async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    renderSettings(<GrNumberSettingsScreen />, persist);
    fireEvent.click(screen.getByRole('button', { name: 'Add series' }));
    fireEvent.change(screen.getByRole('textbox', { name: /Series name/ }), { target: { value: 'CBSE Class 6' } });
    selectAcademicPath();
    ['School levels', 'Divisions', 'Sequence scope', 'Reset policy', 'Format pattern', 'Effective from'].forEach((name) =>
      expect(screen.queryByLabelText(name, { exact: false })).not.toBeInTheDocument());
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(persist).toHaveBeenCalledTimes(1));
    const saved = persist.mock.calls[0][1].grNumber.configurations.at(-1);
    expect(saved).toMatchObject({ status: 'draft', version: 1, isActive: false, stageMode: 'all', divisionMode: 'all', requireManualApproval: false });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 10000 });
    fireEvent.click(await screen.findByRole('button', { name: 'Publish CBSE Class 6' }));
    await waitFor(() => expect(persist).toHaveBeenCalledTimes(2));
    expect(persist.mock.calls[1][1].grNumber.configurations.at(-1)).toMatchObject({ status: 'published', isActive: true });
  });

  it('keeps school levels for GSEB GR and removes them for every Roll rule', () => {
    renderSettings(<GrNumberSettingsScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Add series' }));
    choose('Board', 'GSEB'); choose('Medium', 'Gujarati');
    choose('School levels', 'Primary', true); choose('Class', 'Standard 4', true);
    expect(screen.getByRole('combobox', { name: 'School levels' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Divisions' })).not.toBeInTheDocument();
  });

  it('saves Roll rules at 1 with class/division scope and the reason control in Academic Path', async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    renderSettings(<RollNumberSettingsScreen />, persist);
    fireEvent.click(screen.getByRole('button', { name: 'Add roll number rule' }));
    selectAcademicPath();
    expect(screen.queryByRole('combobox', { name: 'School levels' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Divisions' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /Numbering scope/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton', { name: /Starting number/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(persist).toHaveBeenCalledTimes(1));
    expect(persist.mock.calls[0][1].rollNumber.configurations.at(-1)).toMatchObject({ startingNumber: 1, numberingScope: 'class-division', requireChangeReason: true, status: 'draft', isActive: false });
  });

  it('creates a new draft identity for a published rule and supersedes it only on publish', async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    const publishedSettings = structuredClone(defaultOnboardingSettings);
    publishedSettings.grNumber.configurations[0] = { ...publishedSettings.grNumber.configurations[0], status: 'published', isActive: true };
    renderSettings(<GrNumberSettingsScreen />, persist, publishedSettings);
    fireEvent.click(screen.getByRole('button', { name: 'Create draft version of Default GR series' }));
    fireEvent.change(screen.getByRole('textbox', { name: /Series name/ }), { target: { value: 'Updated series' } });
    selectAcademicPath();
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(persist).toHaveBeenCalledTimes(1));
    const configs = persist.mock.calls[0][1].grNumber.configurations;
    expect(configs[0].isActive).toBe(true);
    expect(configs.at(-1)).toMatchObject({ version: 2, previousVersionId: 'default-gr-series', status: 'draft' });
    expect(configs.at(-1).id).not.toBe('default-gr-series');
    fireEvent.click(await screen.findByRole('button', { name: 'Publish Updated series' }));
    await waitFor(() => expect(persist).toHaveBeenCalledTimes(2));
    expect(persist.mock.calls[1][1].grNumber.configurations[0]).toMatchObject({ status: 'superseded', isActive: false });
  });

  it('preserves a failed draft and shows an error without reporting success', async () => {
    const persist = vi.fn().mockRejectedValue(new Error('Save failed'));
    renderSettings(<GrNumberSettingsScreen />, persist);
    fireEvent.click(screen.getByRole('button', { name: 'Add series' }));
    fireEvent.change(screen.getByRole('textbox', { name: /Series name/ }), { target: { value: 'Retry series' } });
    selectAcademicPath(); fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(await screen.findByText('The draft could not be saved. Review the values and try again.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Series name/ })).toHaveValue('Retry series');
  });

  it('merges login and numbering settings without a division tab or duplicate page heading', () => {
    renderSettings(<OnboardingSettingsPage />);
    expect(screen.getAllByTestId('breadcrumb-heading')).toHaveLength(1);
    expect(screen.getByRole('tab', { name: 'Portal Access' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'GR Number' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Roll Number' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Division Changes' })).not.toBeInTheDocument();
  });
});
