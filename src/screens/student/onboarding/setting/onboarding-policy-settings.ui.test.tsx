import { it, vi, expect, describe } from 'vitest';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useOnboardingSettings, OnboardingSettingsProvider } from '../onboarding-settings-context';
import {
  GrNumberSettingsScreen,
  RollNumberSettingsScreen,
  DivisionChangesSettingsPanel,
} from './onboarding-number-settings';
import {
  AccountsAccessSettingsScreen,
  ReadinessAccessSettingsScreen,
  OnboardingRulesSettingsScreen,
} from './onboarding-policy-settings';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
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
  }: {
    tableTitle: string;
    columns: Array<{ id: string; label: string }>;
  }) => (
    <div data-testid="numbering-configurations-table">
      <h3>{tableTitle}</h3>
      {columns.map((column) => (
        <span key={column.id}>{column.label}</span>
      ))}
    </div>
  ),
}));

vi.mock('src/screens/finance/hooks/useFinanceAcademicFilters', () => ({
  useFinanceAcademicFilters: () => ({
    boards: [
      { id: 'board-cbse', name: 'CBSE' },
      { id: 'board-gseb', name: 'GSEB' },
    ],
    classOptions: [{ id: 'grade-6', name: 'Grade 6' }],
    setSelectedBoard: vi.fn(),
  }),
}));

describe('ReadinessAccessSettingsScreen UI', () => {
  const renderWithSettings = (component: React.ReactNode) =>
    render(<OnboardingSettingsProvider>{component}</OnboardingSettingsProvider>);

  it('renders a compact profile overview and opens the detailed rules drawer', () => {
    renderWithSettings(<ReadinessAccessSettingsScreen />);

    // Breadcrumbs & Notice Banner
    expect(screen.getByTestId('breadcrumb-heading')).toHaveTextContent('Readiness & Access');
    expect(
      screen.getByText(/Frontend session mode — applying these rules updates Student Setup/i)
    ).toBeInTheDocument();

    // Profile overview
    expect(screen.getByText('Readiness profiles')).toBeInTheDocument();
    expect(screen.getAllByText('Fresh admission').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Transfer student').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mid-year admission').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Returning student').length).toBeGreaterThan(0);
    expect(screen.getByText('Required checks')).toBeInTheDocument();
    expect(screen.getByText('Access release')).toBeInTheDocument();
    expect(screen.getByText('Connected to Setup')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit Fresh admission rules' })[0]);

    // Detailed drawer
    expect(screen.getByRole('heading', { name: 'Edit Fresh admission Rules' })).toBeInTheDocument();
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

    // Toggle off
    fireEvent.click(docSwitch);
    expect(docSwitch).not.toBeChecked();

    // Buttons become enabled
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    const saveButton = screen.getByRole('button', { name: 'Apply to Setup' });
    expect(resetButton).toBeEnabled();
    expect(saveButton).toBeEnabled();

    // Test Reset
    fireEvent.click(resetButton);
    expect(docSwitch).toBeChecked();
    expect(resetButton).toBeDisabled();
    expect(saveButton).toBeDisabled();

    // Toggle off and Save
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
  it('shows the configured Boards directly in the GR configuration drawer', () => {
    render(
      <OnboardingSettingsProvider>
        <GrNumberSettingsScreen embedded />
      </OnboardingSettingsProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add configuration' }));

    const boardField = screen.getByRole('combobox', { name: 'Board' });
    expect(boardField).toHaveTextContent('All boards');
    fireEvent.mouseDown(boardField);
    expect(screen.getByRole('option', { name: 'CBSE' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'GSEB' })).toBeInTheDocument();
  });

  it('matches the Student Setup drawer hierarchy for Roll configuration', () => {
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
    expect(screen.getByRole('heading', { name: 'Applicability and timing' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Board' })).toHaveTextContent('All boards');
    expect(screen.getByRole('heading', { name: 'Ordering and tie-breakers' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Preservation and governance' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Applies to Student Setup in this frontend session/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply configuration' })).toBeInTheDocument();
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
    expect(screen.getByRole('heading', { name: 'Applicability' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Board' })).toHaveTextContent('All boards');
    expect(screen.getByRole('combobox', { name: 'Class applicability' })).toBeInTheDocument();

    const applyButton = screen.getByRole('button', { name: 'Apply to Setup' });
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    expect(applyButton).toBeDisabled();
    expect(resetButton).toBeDisabled();

    const boardField = screen.getByRole('combobox', { name: 'Board' });
    fireEvent.mouseDown(boardField);
    expect(screen.getByRole('option', { name: 'All boards' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'CBSE' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'GSEB' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'CBSE' }));
    expect(boardField).toHaveTextContent('CBSE');
    expect(applyButton).toBeEnabled();
    expect(resetButton).toBeEnabled();

    fireEvent.click(resetButton);
    expect(applyButton).toBeDisabled();
    expect(resetButton).toBeDisabled();
    expect(boardField).toHaveTextContent('All boards');

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
