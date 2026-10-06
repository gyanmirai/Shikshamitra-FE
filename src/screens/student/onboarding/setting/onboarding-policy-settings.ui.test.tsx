import { it, vi, expect, describe } from 'vitest';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { OnboardingSettingsProvider } from '../onboarding-settings-context';
import {
  ReadinessAccessSettingsScreen,
} from './onboarding-policy-settings';
import { defaultOnboardingProfiles, defaultReadinessAccessRules } from '../onboarding-settings-model';
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

vi.mock('./use-onboarding-academic-structure', () => {
  const boards = [
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
  choose('School levels', 'Secondary', true);
  choose('Standards', 'Grade 6', true);
};
const renderSettings = (children: React.ReactNode, onPersist?: any) => render(
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <OnboardingSettingsProvider onPersist={onPersist}>{children}</OnboardingSettingsProvider>
  </LocalizationProvider>
);

describe('Readiness and Numbering academic scope', () => {
  it('saves school-level availability with the onboarding configuration', async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    renderSettings(<ReadinessAccessSettingsScreen />, persist);
    fireEvent.click(screen.getByRole('button', { name: 'School levels' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Show all configured school levels' }));
    choose('School levels', 'Secondary', true);
    fireEvent.click(screen.getByRole('button', { name: 'Save school levels' }));
    await waitFor(() => expect(persist).toHaveBeenCalledOnce());
    expect(persist.mock.calls[0][1].academicAvailability.schoolLevelNames).toEqual(['Secondary']);
  });

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
    expect(screen.getByRole('button', { name: 'Review rule' })).toBeDisabled();
    choose('Board', 'CBSE');
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Medium' }));
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Gujarati' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'English' }));
    choose('School levels', 'Secondary', true);
    choose('Standards', 'Grade 6', true);
    fireEvent.click(screen.getByRole('button', { name: 'Review rule' }));
    expect(persist).not.toHaveBeenCalled();
    expect(screen.getByText(/Students covered:/)).toHaveTextContent(
      'CBSE / English / Secondary / Grade 6'
    );
    fireEvent.click(screen.getByText('Save and apply'));
    await waitFor(() => expect(persist).toHaveBeenCalledOnce());
    const saved = persist.mock.calls[0][1].onboardingProfiles.at(-1);
    expect(saved.applicability).toMatchObject({ boardIds: ['board-cbse'], academicMediumIds: ['medium-cbse-english'],
      academicMediumStageIds: ['stage-cbse-secondary'], standardIds: ['grade-6'], divisionMode: 'all' });
  });

  it('shows the enforced optional-document exception without seeding an unavailable capacity override', () => {
    expect(defaultReadinessAccessRules.approvalTriggers).not.toContain('capacity-override');
    expect(defaultOnboardingProfiles.find((profile) => profile.id === 'mid-year-admission')?.rules.approvalTriggers)
      .not.toContain('capacity-override');
    renderSettings(<ReadinessAccessSettingsScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit Returning student rules' }));
    const optionalDocuments = screen.getByRole('checkbox', {
      name: 'Optional document check is incomplete',
    });
    expect(optionalDocuments).toBeChecked();
    fireEvent.click(optionalDocuments);
    expect(optionalDocuments).not.toBeChecked();
  });

  it('saves a campus-specific readiness rule without changing the academic path', async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    renderSettings(<ReadinessAccessSettingsScreen />, persist);
    fireEvent.click(screen.getByRole('button', { name: 'Add readiness rule' }));
    choose('Campuses (optional)', 'North Campus', true);
    selectAcademicPath();
    fireEvent.click(screen.getByRole('button', { name: 'Review rule' }));
    expect(screen.getByText(/Students covered:/)).toHaveTextContent('Campus: North Campus');
    fireEvent.click(screen.getByText('Save and apply'));
    await waitFor(() => expect(persist).toHaveBeenCalledOnce());
    expect(persist.mock.calls[0][1].onboardingProfiles.at(-1).applicability).toMatchObject({
      campusMode: 'selected', campusIds: ['campus-north'], boardIds: ['board-cbse'],
    });
  }, 15000);

  it('saves a school-defined admission route with its readiness rule', async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    renderSettings(<ReadinessAccessSettingsScreen />, persist);
    fireEvent.click(screen.getByRole('button', { name: 'Add readiness rule' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Admission route' }), {
      target: { value: 'Scholarship intake' },
    });
    selectAcademicPath();
    fireEvent.click(screen.getByRole('button', { name: 'Review rule' }));
    expect(screen.getByText('Admission route: Scholarship intake')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Save and apply'));
    await waitFor(() => expect(persist).toHaveBeenCalledOnce());
    expect(persist.mock.calls[0][1].onboardingProfiles.at(-1).admissionRoutes)
      .toEqual(['Scholarship intake']);
  });

  it('keeps an unsaved rule editable when applying fails or closing is declined', async () => {
    const persist = vi.fn().mockRejectedValue(new Error('Save unavailable'));
    const confirm = vi.fn().mockReturnValue(false);
    vi.stubGlobal('confirm', confirm);
    try {
      renderSettings(<ReadinessAccessSettingsScreen />, persist);
      fireEvent.click(screen.getByRole('button', { name: 'Add readiness rule' }));
      selectAcademicPath();
      fireEvent.click(screen.getByRole('button', { name: 'Review rule' }));
      fireEvent.click(screen.getByText('Save and apply'));
      await waitFor(() => expect(screen.getByText(/The rule could not be applied/)).toBeInTheDocument());
      expect(persist).toHaveBeenCalledOnce();
      fireEvent.click(screen.getByText('Back to rule'));
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(confirm).toHaveBeenCalledWith('Discard unsaved readiness-rule changes?');
      expect(screen.getByRole('button', { name: 'Review rule' })).toBeEnabled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('clears descendants on board change and offers the new board’s configured Primary level', () => {
    renderSettings(<ReadinessAccessSettingsScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Add readiness rule' }));
    selectAcademicPath();
    choose('Board', 'GSEB');
    expect(screen.getByRole('combobox', { name: 'Medium' })).not.toHaveTextContent('English');
    expect(screen.getByRole('combobox', { name: 'Standards' })).toHaveAttribute('aria-disabled', 'true');
    choose('Medium', 'Gujarati');
    choose('School levels', 'Primary', true);
    choose('Standards', 'Standard 4', true);
    expect(screen.getByRole('button', { name: 'Review rule' })).toBeEnabled();
  }, 15000);

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
    fireEvent.click(screen.getByRole('button', { name: 'Review rule' }));
    fireEvent.click(screen.getByText('Save and apply'));
    await waitFor(() => expect(persist).toHaveBeenCalledOnce());
    const profiles = persist.mock.calls[0][1].onboardingProfiles;
    expect(profiles.find((p: any) => p.id === 'mid-year-admission').rules.requireDocuments).toBe(false);
    expect(profiles.find((p: any) => p.id === 'fresh-admission').rules.requireDocuments).toBe(true);
  }, 15000);

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
  }, 15000);

  it.each([
    ['GR', () => <GrNumberSettingsScreen embedded />, 'Add configuration'],
    ['Roll', () => <RollNumberSettingsScreen embedded />, 'Add configuration'],
    ['Division', () => <DivisionChangesSettingsPanel />, 'Add override'],
  ] as const)('keeps the selected campus when the %s academic path changes', (_name, component, action) => {
    renderSettings(component());
    fireEvent.click(screen.getByRole('button', { name: action }));
    choose('Campuses (optional)', 'North Campus', true);
    selectAcademicPath();
    choose('Board', 'GSEB');
    expect(screen.getByRole('combobox', { name: 'Campuses (optional)' }))
      .toHaveTextContent('North Campus');
    expect(screen.getByRole('combobox', { name: 'Medium' })).not.toHaveTextContent('English');
  });
});
it('persists school email timing and automatic provisioning with independent OFF defaults', async () => {
  const persist = vi.fn().mockResolvedValue(undefined);
  renderSettings(<ReadinessAccessSettingsScreen />, persist);
  fireEvent.click(screen.getByRole('button', { name: 'Add readiness rule' }));
  selectAcademicPath();
  expect(screen.getByRole('switch', { name: 'Send student credential email' })).not.toBeChecked();
  expect(screen.getByRole('switch', { name: 'Send parent/guardian credential email' })).not.toBeChecked();
  fireEvent.click(screen.getByRole('switch', { name: 'Send parent/guardian credential email' }));
  choose('Send credentials when', 'After full onboarding completion');
  choose('Account creation and sending', 'Automatically when ready');
  choose('Parent/guardian account owner', 'Mother');
  fireEvent.click(screen.getByRole('button', { name: 'Review rule' }));
  fireEvent.click(screen.getByText('Save and apply'));
  await waitFor(() => expect(persist).toHaveBeenCalledOnce());
  expect(persist.mock.calls[0][1].onboardingProfiles.at(-1).rules).toMatchObject({
    sendStudentCredentialEmail: false, sendGuardianCredentialEmail: true,
    credentialSendingTime: 'completion', credentialProvisioningMode: 'automatic', guardianAccountRelationship: 'mother',
  });
});

it('blocks email configuration when corresponding account preparation is disabled', () => {
  renderSettings(<ReadinessAccessSettingsScreen />);
  fireEvent.click(screen.getByRole('button', { name: 'Add readiness rule' }));
  selectAcademicPath();
  fireEvent.click(screen.getByRole('switch', { name: 'Prepare student account' }));
  fireEvent.click(screen.getByRole('switch', { name: 'Send student credential email' }));
  expect(screen.getByRole('button', { name: 'Review rule' })).toBeDisabled();
  expect(screen.getAllByText('Enable student account preparation before sending student emails.').length).toBeGreaterThan(0);
});
