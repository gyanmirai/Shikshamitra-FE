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

describe('ReadinessAccessSettingsScreen UI', () => {
  const renderWithSettings = (component: React.ReactNode) =>
    render(<OnboardingSettingsProvider>{component}</OnboardingSettingsProvider>);

  it('renders readiness rules in the common table and opens the detailed rules drawer', () => {
    renderWithSettings(<ReadinessAccessSettingsScreen />);

    expect(screen.getByTestId('breadcrumb-heading')).toHaveTextContent('Readiness & Access');
    expect(screen.queryByTestId('configuration-scope')).not.toBeInTheDocument();
    expect(
      screen.getByText(/Readiness rules are saved for the selected scope/i)
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Readiness & access rules' })).toBeInTheDocument();
    expect(screen.getAllByText('Fresh admission').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Transfer student').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mid-year admission').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Returning student').length).toBeGreaterThan(0);
    expect(screen.getByText('Required checks')).toBeInTheDocument();
    expect(screen.getByText('Access release')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit Fresh admission rules' })[0]);

    expect(screen.getByRole('heading', { name: 'Edit Fresh admission Rules' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Academic applicability' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Board coverage' })).toHaveTextContent(
      'All Boards'
    );
    expect(screen.getByRole('combobox', { name: 'Medium coverage' })).toHaveTextContent(
      'All Media'
    );
    expect(screen.getByRole('heading', { name: 'Readiness checks' })).toBeInTheDocument();
    expect(screen.getByText('Admission approved')).toBeInTheDocument();
    expect(screen.getByText('Class and Division')).toBeInTheDocument();
    expect(screen.getByText('GR and Roll numbers')).toBeInTheDocument();
    expect(screen.getByText('Required documents')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Approval and activation' })).toBeInTheDocument();
    expect(screen.getByText('Block activation on failed checks')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Student and guardian access' })
    ).toBeInTheDocument();
    expect(screen.getByText('Prepare student account')).toBeInTheDocument();
    expect(screen.getByText('Prepare guardian account')).toBeInTheDocument();
    expect(screen.getByText('Require verified guardian contact')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Credential release timing' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Apply to Setup' })).toBeDisabled();
  });

  it('toggling a switch marks screen dirty, allows reset, and allows save', () => {
    function AppliedRuleProbe() {
      const { settings } = useOnboardingSettings();
      return (
        <output data-testid="documents-applied">
          {String(settings.onboardingProfiles[0].rules.requireDocuments)}
        </output>
      );
    }

    renderWithSettings(
      <>
        <ReadinessAccessSettingsScreen />
        <AppliedRuleProbe />
      </>
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit Fresh admission rules' })[0]);

    const docSwitch = screen.getByRole('switch', { name: 'Required documents required' });
    expect(docSwitch).toBeChecked();

    fireEvent.click(docSwitch);
    expect(docSwitch).not.toBeChecked();

    const resetButton = screen.getByRole('button', { name: 'Reset' });
    const saveButton = screen.getByRole('button', { name: 'Apply to Setup' });
    expect(resetButton).toBeEnabled();
    expect(saveButton).toBeEnabled();

    fireEvent.click(resetButton);
    expect(docSwitch).toBeChecked();
    expect(resetButton).toBeDisabled();
    expect(saveButton).toBeDisabled();

    fireEvent.click(docSwitch);
    expect(docSwitch).not.toBeChecked();
    expect(saveButton).toBeEnabled();

    fireEvent.click(saveButton);
    expect(saveButton).toBeDisabled();
    expect(resetButton).toBeDisabled();
    expect(docSwitch).not.toBeChecked();
    expect(screen.getByTestId('documents-applied')).toHaveTextContent('false');
  });

  it('changing credential release timing enables save draft and updates state', () => {
    renderWithSettings(<ReadinessAccessSettingsScreen />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit Fresh admission rules' })[0]);

    const select = screen.getByRole('combobox', { name: 'Credential release timing' });
    fireEvent.mouseDown(select);

    const option = screen.getByRole('option', { name: 'Manual release by authorized staff' });
    fireEvent.click(option);

    const saveButton = screen.getByRole('button', { name: 'Apply to Setup' });
    expect(saveButton).toBeEnabled();

    fireEvent.click(saveButton);
    expect(saveButton).toBeDisabled();
  });

  it('keeps profile rules independent and exposes conditional approval triggers', () => {
    function ProfileProbe() {
      const { settings } = useOnboardingSettings();
      const fresh = settings.onboardingProfiles.find((profile) => profile.id === 'fresh-admission');
      const midYear = settings.onboardingProfiles.find(
        (profile) => profile.id === 'mid-year-admission'
      );

      return (
        <>
          <output data-testid="fresh-documents">{String(fresh?.rules.requireDocuments)}</output>
          <output data-testid="mid-year-documents">
            {String(midYear?.rules.requireDocuments)}
          </output>
        </>
      );
    }

    renderWithSettings(
      <>
        <ReadinessAccessSettingsScreen />
        <ProfileProbe />
      </>
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit Mid-year admission rules' })[0]);

    expect(screen.getByRole('combobox', { name: 'Approval requirement' })).toHaveTextContent(
      'Approval only for exceptions'
    );
    expect(screen.getByRole('checkbox', { name: 'Mid-year admission' })).toBeChecked();

    fireEvent.click(screen.getByRole('switch', { name: 'Required documents required' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply to Setup' }));

    expect(screen.getByTestId('mid-year-documents')).toHaveTextContent('false');
    expect(screen.getByTestId('fresh-documents')).toHaveTextContent('true');
  });

  it('allows a school to add its own readiness rule', () => {
    renderWithSettings(<ReadinessAccessSettingsScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'Add readiness rule' }));

    expect(screen.getByRole('heading', { name: 'Add readiness rule' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Rule name' })).toHaveValue('New readiness rule');
    expect(screen.getByRole('combobox', { name: 'Admission route' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Board coverage' })).toHaveTextContent(
      'Selected Boards'
    );
    expect(screen.getByRole('button', { name: 'Add rule' })).toBeDisabled();

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Selected Boards' }));
    fireEvent.click(screen.getByRole('option', { name: 'GSEB' }));
    fireEvent.keyDown(screen.getByRole('listbox', { name: 'Selected Boards' }), {
      key: 'Escape',
    });

    const addButton = screen.getByRole('button', { name: 'Add rule' });
    expect(addButton).toBeEnabled();
    fireEvent.click(addButton);

    expect(screen.getAllByText('New readiness rule').length).toBeGreaterThan(0);
  });
});

describe('OnboardingRulesSettingsScreen and AccountsAccessSettingsScreen UI', () => {
  it('renders OnboardingRulesSettingsScreen properly', () => {
    render(
      <OnboardingSettingsProvider>
        <OnboardingRulesSettingsScreen />
      </OnboardingSettingsProvider>
    );
    expect(screen.getByTestId('breadcrumb-heading')).toHaveTextContent('Onboarding Rules');
    expect(screen.getByText('Admission documents required')).toBeInTheDocument();
    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBe(4);
    expect(switches[0]).toBeChecked();
  });

  it('adds a narrower Readiness academic override while keeping the route fallback', () => {
    render(
      <OnboardingSettingsProvider>
        <ReadinessAccessSettingsScreen />
      </OnboardingSettingsProvider>
    );

    fireEvent.click(
      screen.getAllByRole('button', { name: 'Add Fresh admission academic override' })[0]
    );

    expect(
      screen.getByRole('heading', { name: 'Add Fresh admission Academic Override' })
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Board coverage' })).toHaveTextContent(
      'Selected Boards'
    );
    expect(screen.getByRole('button', { name: 'Add override' })).toBeDisabled();

    const boardField = screen.getByRole('combobox', { name: 'Selected Boards' });
    fireEvent.mouseDown(boardField);
    fireEvent.click(screen.getByRole('option', { name: 'GSEB' }));
    fireEvent.keyDown(screen.getByRole('listbox', { name: 'Selected Boards' }), {
      key: 'Escape',
    });

    const applyButton = screen.getByRole('button', { name: 'Add override' });
    expect(applyButton).toBeEnabled();
    fireEvent.click(applyButton);

    expect(screen.getAllByText('Fresh admission academic override').length).toBeGreaterThan(0);
  });

  it('renders AccountsAccessSettingsScreen properly', () => {
    render(
      <OnboardingSettingsProvider>
        <AccountsAccessSettingsScreen />
      </OnboardingSettingsProvider>
    );
    expect(screen.getByTestId('breadcrumb-heading')).toHaveTextContent('Accounts & Access');
    expect(screen.getByText('Prepare student account')).toBeInTheDocument();
    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBe(3);
    expect(switches[0]).toBeChecked();
  });
});

describe('Numbering settings drawer UI', () => {
  it('removes the shared configuration scope and header assignment selector', () => {
    render(
      <OnboardingSettingsProvider>
        <NumberingPlacementSettingsScreen />
      </OnboardingSettingsProvider>
    );

    expect(screen.getByTestId('breadcrumb-heading')).toHaveTextContent('Numbering & Placement');
    expect(screen.queryByTestId('configuration-scope')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Assignment method' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add configuration' })).toBeInTheDocument();
  });

  it('requires explicit Board and Medium selections in the GR configuration drawer', async () => {
    render(
      <OnboardingSettingsProvider>
        <GrNumberSettingsScreen embedded />
      </OnboardingSettingsProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add configuration' }));

    expect(screen.getByText('Academic Path')).toBeInTheDocument();
    expect(screen.queryByText('Applies To')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Assignment method' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Applicable onboarding profiles')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Board coverage' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'Series name' }), {
      target: { value: 'GSEB GR series' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply configuration' }));
    await waitFor(() => expect(screen.getByText('Select one Board.')).toBeInTheDocument());

    const boardField = screen.getByRole('combobox', { name: 'Board' });
    expect(boardField).toHaveTextContent('Select Board');
    fireEvent.mouseDown(boardField);
    expect(screen.queryByRole('option', { name: 'All Boards' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'CBSE' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'GSEB' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'GSEB' }));

    expect(boardField).toHaveTextContent('GSEB');
    const mediumField = screen.getByRole('combobox', { name: 'Medium' });
    expect(mediumField).toHaveTextContent('Select Medium');
    fireEvent.mouseDown(mediumField);
    expect(screen.queryByRole('option', { name: 'All Media' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'GSEB / Gujarati' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'CBSE / English' })).not.toBeInTheDocument();
  });

  it('does not restore All options when editing the legacy default GR series', () => {
    render(
      <OnboardingSettingsProvider>
        <GrNumberSettingsScreen embedded />
      </OnboardingSettingsProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    const boardField = screen.getByRole('combobox', { name: 'Board' });
    expect(boardField).toHaveTextContent('Select Board');
    expect(screen.getByRole('combobox', { name: 'Medium' })).toHaveTextContent(
      'Select Board first'
    );
    expect(screen.getByRole('combobox', { name: 'School Level' })).toHaveTextContent(
      'Select Medium first'
    );
    expect(screen.getByRole('combobox', { name: 'Class' })).toHaveTextContent(
      'Select School Level first'
    );
    expect(screen.getByRole('combobox', { name: 'Division' })).toHaveTextContent(
      'Select Class first'
    );

    fireEvent.mouseDown(boardField);
    expect(screen.queryByRole('option', { name: 'All Boards' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'CBSE' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'GSEB' })).toBeInTheDocument();
  });

  it('matches the Student Setup drawer hierarchy for Roll configuration', async () => {
    render(
      <OnboardingSettingsProvider>
        <RollNumberSettingsScreen embedded />
      </OnboardingSettingsProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add configuration' }));

    expect(
      screen.getByRole('heading', { name: 'Add Roll Number Configuration' })
    ).toBeInTheDocument();
    expect(screen.getByText('New rule')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Academic path and timing' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Assignment method' })).not.toBeInTheDocument();
    const boardField = screen.getByRole('combobox', { name: 'Board' });
    const mediumField = screen.getByRole('combobox', { name: 'Medium' });
    const schoolLevelField = screen.getByRole('combobox', { name: 'School Level' });
    const classField = screen.getByRole('combobox', { name: 'Class' });
    const divisionField = screen.getByRole('combobox', { name: 'Division' });
    expect(boardField).toHaveTextContent('Select Board');
    expect(mediumField).toHaveTextContent('Select Board first');
    expect(schoolLevelField).toHaveTextContent('Select Medium first');
    expect(classField).toHaveTextContent('Select School Level first');
    expect(divisionField).toHaveTextContent('Select Class first');
    expect(screen.queryByRole('combobox', { name: 'Class coverage' })).not.toBeInTheDocument();

    fireEvent.mouseDown(boardField);
    expect(screen.queryByRole('option', { name: 'All Boards' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'CBSE' }));
    fireEvent.mouseDown(mediumField);
    expect(screen.queryByRole('option', { name: 'All Media' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'CBSE / English' }));
    fireEvent.mouseDown(schoolLevelField);
    fireEvent.click(screen.getByRole('option', { name: 'CBSE / English / Secondary' }));
    fireEvent.mouseDown(classField);
    expect(
      screen.getByRole('option', { name: 'CBSE / English / Secondary / Grade 6' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'GSEB / Gujarati / Primary / Standard 4' })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'CBSE / English / Secondary / Grade 6' }));
    fireEvent.mouseDown(divisionField);
    fireEvent.click(
      screen.getByRole('option', { name: 'CBSE / English / Secondary / Grade 6 / A' })
    );

    expect(boardField).toHaveTextContent('CBSE');
    expect(mediumField).toHaveTextContent('CBSE / English');
    expect(schoolLevelField).toHaveTextContent('CBSE / English / Secondary');
    expect(classField).toHaveTextContent('CBSE / English / Secondary / Grade 6');
    expect(divisionField).toHaveTextContent('CBSE / English / Secondary / Grade 6 / A');

    expect(screen.getByRole('heading', { name: 'Ordering and tie-breakers' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Preservation and governance' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Saved for the selected scope and reused by Student Setup after reload/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Apply configuration' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Add Roll Number Configuration' })
      ).not.toBeInTheDocument()
    );
    expect(screen.getByText('CBSE / English / Secondary / Grade 6 / A')).toBeInTheDocument();
  });

  it('shows Division rules in a table and opens a Board/Class override drawer', () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <OnboardingSettingsProvider>
          <DivisionChangesSettingsPanel />
        </OnboardingSettingsProvider>
      </LocalizationProvider>
    );

    expect(screen.getByRole('heading', { name: 'Division Assignment Rules' })).toBeInTheDocument();
    expect(screen.getByText('Assignment Method')).toBeInTheDocument();
    expect(screen.getByText('Strategy')).toBeInTheDocument();
    expect(screen.getByText('Capacity')).toBeInTheDocument();
    expect(screen.getByText('Approval')).toBeInTheDocument();
    expect(screen.getByText('Roll No. Impact')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add override' }));

    expect(
      screen.getByRole('heading', { name: 'Add Division Assignment Rule' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Academic path' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Board' })).toHaveTextContent('Select Board');
    expect(screen.getByRole('combobox', { name: 'Class' })).toHaveTextContent(
      'Select School Level first'
    );
    expect(screen.queryByRole('combobox', { name: 'Board coverage' })).not.toBeInTheDocument();

    const applyButton = screen.getByRole('button', { name: 'Apply to Setup' });
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    expect(applyButton).toBeDisabled();
    expect(resetButton).toBeDisabled();

    const boardField = screen.getByRole('combobox', { name: 'Board' });
    fireEvent.mouseDown(boardField);
    expect(screen.queryByRole('option', { name: 'All Boards' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'CBSE' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'GSEB' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'CBSE' }));
    expect(boardField).toHaveTextContent('CBSE');
    expect(applyButton).toBeEnabled();
    expect(resetButton).toBeEnabled();

    fireEvent.click(resetButton);
    expect(applyButton).toBeDisabled();
    expect(resetButton).toBeDisabled();
    expect(boardField).toHaveTextContent('Select Board');

    expect(screen.getByRole('heading', { name: 'Assignment and capacity' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Approval and record impact' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('switch', { name: 'Require a change reason' }));
    expect(applyButton).toBeEnabled();
    expect(resetButton).toBeEnabled();

    fireEvent.click(resetButton);
    expect(applyButton).toBeDisabled();
    expect(resetButton).toBeDisabled();
  });
});
