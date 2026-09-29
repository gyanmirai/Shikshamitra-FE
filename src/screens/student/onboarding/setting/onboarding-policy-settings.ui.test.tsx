import { it, vi, expect, describe } from 'vitest';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useOnboardingSettings, OnboardingSettingsProvider } from '../onboarding-settings-context';
import {
  AccountsAccessSettingsScreen,
  ReadinessAccessSettingsScreen,
  OnboardingRulesSettingsScreen,
} from './onboarding-policy-settings';
import {
  GrNumberSettingsScreen,
  RollNumberSettingsScreen,
  DivisionChangesSettingsPanel,
  NumberingPlacementSettingsScreen,
} from './onboarding-number-settings';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('src/components/custom-tabs', () => ({
  CustomTabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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
  }: {
    heading: string;
    description: string;
    action?: React.ReactNode;
  }) => (
    <div data-testid="custom-breadcrumbs">
      <h1 data-testid="breadcrumb-heading">{heading}</h1>
      <p>{description}</p>
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
  }: {
    tableTitle: string;
    columns: Array<{
      id: string;
      label: string;
      render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
    }>;
    data?: Array<Record<string, unknown>>;
  }) => (
    <div data-testid="customizable-table">
      <h3>{tableTitle}</h3>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.id}>{column.label}</th>
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

vi.mock('src/screens/finance/hooks/useFinanceAcademicFilters', () => ({
  useFinanceAcademicFilters: () => ({
    boards: [
      {
        id: 'board-cbse',
        name: 'CBSE',
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
        name: 'GSEB',
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
    ],
    classOptions: [{ id: 'grade-6', name: 'Grade 6' }],
    setSelectedBoard: vi.fn(),
  }),
}));


const choose = (label: string, option: string, multiple = false) => {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
  fireEvent.click(screen.getByRole('option', { name: option }));
  if (multiple) fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
};
const selectAcademicPath = () => {
  choose('Board', 'CBSE');
  choose('Medium', 'English');
  choose('School levels', 'Secondary', true);
  choose('Standards', 'Grade 6', true);
};
const renderSettings = (children: React.ReactNode, onPersist?: any) => render(
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <OnboardingSettingsProvider onPersist={onPersist}>{children}</OnboardingSettingsProvider>
  </LocalizationProvider>
);

describe('Readiness and Numbering academic scope', () => {
  it('removes duplicate saved-settings entry points', () => {
    renderSettings(<><ReadinessAccessSettingsScreen /><NumberingPlacementSettingsScreen /></>);
    expect(screen.queryByRole('button', { name: 'Saved Defaults' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Saved GR & Seat Settings' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Policy preview' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('configuration-scope')).not.toBeInTheDocument();
  });

  it('requires a complete dependent path and persists a new readiness rule', async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    renderSettings(<ReadinessAccessSettingsScreen />, persist);
    fireEvent.click(screen.getByRole('button', { name: 'Add readiness rule' }));
    expect(screen.queryByRole('combobox', { name: 'Board coverage' })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Medium' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Add rule' })).toBeDisabled();
    choose('Board', 'CBSE');
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Medium' }));
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Gujarati' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'English' }));
    choose('School levels', 'Secondary', true);
    choose('Standards', 'Grade 6', true);
    fireEvent.click(screen.getByRole('button', { name: 'Add rule' }));
    await waitFor(() => expect(persist).toHaveBeenCalledOnce());
    const saved = persist.mock.calls[0][1].onboardingProfiles.at(-1);
    expect(saved.applicability).toMatchObject({ boardIds: ['board-cbse'], academicMediumIds: ['medium-cbse-english'],
      academicMediumStageIds: ['stage-cbse-secondary'], standardIds: ['grade-6'], divisionMode: 'all' });
  });

  it('clears descendants on board change and excludes Primary', () => {
    renderSettings(<ReadinessAccessSettingsScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Add readiness rule' }));
    selectAcademicPath();
    choose('Board', 'GSEB');
    expect(screen.getByRole('combobox', { name: 'Medium' })).not.toHaveTextContent('English');
    expect(screen.getByRole('combobox', { name: 'Standards' })).toHaveAttribute('aria-disabled', 'true');
    choose('Medium', 'Gujarati');
    expect(screen.getByRole('combobox', { name: 'School levels' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Add rule' })).toBeDisabled();
  });

  it('preserves other routes when saving a profile and resets unsaved switches', async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    renderSettings(<ReadinessAccessSettingsScreen />, persist);
    fireEvent.click(screen.getByRole('button', { name: 'Edit Mid-year admission rules' }));
    expect(screen.getByRole('checkbox', { name: 'Mid-year admission' })).toBeChecked();
    selectAcademicPath();
    const documents = screen.getByRole('switch', { name: 'Required documents required' });
    fireEvent.click(documents);
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(documents).toBeChecked();
    selectAcademicPath();
    fireEvent.click(documents);
    fireEvent.click(screen.getByRole('button', { name: 'Apply to Setup' }));
    await waitFor(() => expect(persist).toHaveBeenCalledOnce());
    const profiles = persist.mock.calls[0][1].onboardingProfiles;
    expect(profiles.find((p: any) => p.id === 'mid-year-admission').rules.requireDocuments).toBe(false);
    expect(profiles.find((p: any) => p.id === 'fresh-admission').rules.requireDocuments).toBe(true);
  });

  it.each([
    ['GR', () => <GrNumberSettingsScreen embedded />, 'Add configuration'],
    ['Roll', () => <RollNumberSettingsScreen embedded />, 'Add configuration'],
    ['Division', () => <DivisionChangesSettingsPanel />, 'Add override'],
  ] as const)('uses the same checkbox hierarchy in the %s editor', (_name, component, action) => {
    renderSettings(component());
    fireEvent.click(screen.getByRole('button', { name: action }));
    expect(screen.queryByRole('combobox', { name: 'Board coverage' })).not.toBeInTheDocument();
    choose('Board', 'CBSE');
    choose('Medium', 'English');
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'School levels' }));
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'Secondary' }));
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Standards' }));
    expect(screen.getByRole('option', { name: 'Grade 6' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });
});
