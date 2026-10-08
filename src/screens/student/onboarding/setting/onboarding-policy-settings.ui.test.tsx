import { it, vi, expect, describe } from 'vitest';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

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
  it('configures identifier series filters and compact row actions', () => {
    renderSettings(<GrNumberSettingsScreen embedded />);
    const table = within(screen.getByTestId('customizable-table'));
    expect(screen.getByTestId('customizable-table')).toHaveAttribute('data-filters-enabled', 'true');
    expect(table.getByRole('columnheader', { name: 'Series name' })).toHaveAttribute('data-filter-type', 'string');
    expect(table.getByRole('columnheader', { name: 'Academic coverage' })).toHaveAttribute('data-filter-type', 'string');
    expect(table.getByRole('columnheader', { name: 'Sequence scope' }))
      .toHaveAttribute('data-filter-options', 'School-wide|Academic year');
    expect(table.getByRole('columnheader', { name: 'Status' }))
      .toHaveAttribute('data-filter-options', 'Active|Inactive');
    expect(table.getByRole('columnheader', { name: 'Actions' })).toHaveAttribute('data-sortable', 'false');
    expect(table.getByText('Starts at 1 · 6-digit sequence')).toBeInTheDocument();
    expect(table.getByRole('button', { name: 'Edit Default GR series' })).toBeInTheDocument();
  });

  it('configures roll number filters against displayed scope and starting value', () => {
    renderSettings(<RollNumberSettingsScreen embedded />);
    const table = within(screen.getByTestId('customizable-table'));
    expect(screen.getByTestId('customizable-table')).toHaveAttribute('data-filters-enabled', 'true');
    expect(table.getByRole('columnheader', { name: 'Numbering scope' }))
      .toHaveAttribute('data-filter-options', 'Class and division|Entire class');
    expect(table.getByRole('columnheader', { name: 'Starts at' })).toHaveAttribute('data-filter-type', 'number');
    expect(table.getByRole('columnheader', { name: 'Status' }))
      .toHaveAttribute('data-filter-options', 'Active|Inactive');
    expect(table.getByRole('button', { name: 'Edit roll number rule for All classes' })).toBeInTheDocument();
  });

  it('keeps the roll number drawer concise and validates required fields in place', async () => {
    renderSettings(<RollNumberSettingsScreen embedded />);
    fireEvent.click(screen.getByRole('button', { name: 'Add roll number rule' }));

    const drawer = within(screen.getByRole('dialog', { name: 'Add Roll Number Rule' }));
    expect(drawer.getByRole('button', { name: 'Add Roll Number Rule information' })).toBeInTheDocument();
    expect(drawer.getByRole('button', { name: 'Academic Path And Numbering Scope information' })).toBeInTheDocument();
    expect(drawer.getByRole('button', { name: 'Preservation And Governance information' })).toBeInTheDocument();
    expect(drawer.queryByText(/Saved rules are checked when staff assign/)).not.toBeInTheDocument();
    expect(drawer.queryByText('Choose the parent selection first.')).not.toBeInTheDocument();
    expect(drawer.getByRole('combobox', { name: /Numbering scope/ })
      .closest('.MuiFormControl-root')?.querySelector('.MuiFormLabel-asterisk')).toBeInTheDocument();
    expect(drawer.getByRole('spinbutton', { name: /Starting number/ })
      .closest('.MuiFormControl-root')?.querySelector('.MuiFormLabel-asterisk')).toBeInTheDocument();

    const cancel = drawer.getByRole('button', { name: 'Cancel' });
    const submit = drawer.getByRole('button', { name: 'Submit' });
    expect(cancel).toHaveClass('MuiButton-sizeSmall');
    expect(submit).toHaveClass('MuiButton-sizeSmall');
    expect(cancel).not.toHaveStyle({ borderRadius: '0px' });
    expect(submit).not.toHaveStyle({ borderRadius: '0px' });
    expect(cancel.querySelector('.MuiButton-startIcon')).toBeInTheDocument();
    expect(submit.querySelector('.MuiButton-startIcon')).toBeInTheDocument();

    fireEvent.change(drawer.getByRole('spinbutton', { name: /Starting number/ }), {
      target: { value: '0' },
    });
    fireEvent.click(submit);
    expect(await drawer.findByText('Select a board.')).toBeInTheDocument();
    expect(drawer.getByText('Starting number must be at least 1')).toBeInTheDocument();
  }, 30000);

  it('preserves the roll number draft after a failed save or declined close', async () => {
    const persist = vi.fn().mockRejectedValue(new Error('Unavailable'));
    const confirm = vi.fn().mockReturnValue(false);
    vi.stubGlobal('confirm', confirm);
    try {
      renderSettings(<RollNumberSettingsScreen embedded />, persist);
      fireEvent.click(screen.getByRole('button', { name: 'Add roll number rule' }));
      selectAcademicPath();
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      expect(await screen.findByText('The Roll Number Rule could not be saved. Review the values and try again.'))
        .toBeInTheDocument();
      expect(persist).toHaveBeenCalledOnce();
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(confirm).toHaveBeenCalledWith('Discard unsaved Roll Number Rule changes?');
      expect(screen.getByRole('combobox', { name: 'Board' })).toHaveTextContent('CBSE');
    } finally {
      vi.unstubAllGlobals();
    }
  }, 60000);

  it('keeps division rule filters useful and avoids constant columns', () => {
    renderSettings(<DivisionChangesSettingsPanel />);
    const table = within(screen.getByTestId('customizable-table'));
    expect(screen.getByTestId('customizable-table')).toHaveAttribute('data-filters-enabled', 'true');
    expect(table.getByRole('columnheader', { name: 'Approval' }))
      .toHaveAttribute('data-filter-options', 'Required for changes|Readiness rule applies');
    expect(table.getByRole('columnheader', { name: 'Effective date' })).toHaveAttribute('data-sortable', 'false');
    expect(table.getByRole('columnheader', { name: 'Status' }))
      .toHaveAttribute('data-filter-options', 'Active|Inactive');
    expect(table.queryByRole('columnheader', { name: 'Assignment method' })).not.toBeInTheDocument();
    expect(table.queryByRole('columnheader', { name: 'Capacity' })).not.toBeInTheDocument();
  });

  it('shows a concise division assignment drawer with field-level errors', async () => {
    renderSettings(<DivisionChangesSettingsPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Add division rule' }));

    const drawer = within(screen.getByRole('dialog', { name: 'Add Division Assignment Rule' }));
    expect(drawer.getByRole('button', { name: 'Add Division Assignment Rule information' })).toBeInTheDocument();
    expect(drawer.getByRole('button', { name: 'Academic Path information' })).toBeInTheDocument();
    expect(drawer.getByRole('button', { name: 'Change Approval information' })).toBeInTheDocument();
    expect(drawer.queryByText('Assignment and capacity')).not.toBeInTheDocument();
    expect(drawer.queryByText('Choose the parent selection first.')).not.toBeInTheDocument();
    expect(drawer.getByRole('textbox', { name: /Rule name/ })
      .closest('.MuiFormControl-root')?.querySelector('.MuiFormLabel-asterisk')).toBeInTheDocument();

    const reset = drawer.getByRole('button', { name: 'Reset' });
    const cancel = drawer.getByRole('button', { name: 'Cancel' });
    const submit = drawer.getByRole('button', { name: 'Submit' });
    [reset, cancel, submit].forEach((button) => {
      expect(button).toHaveClass('MuiButton-sizeSmall');
      expect(button.querySelector('.MuiButton-startIcon')).toBeInTheDocument();
      expect(button).not.toHaveStyle({ borderRadius: '0px' });
    });

    fireEvent.click(submit);
    expect(await drawer.findByText('Rule name is required.')).toBeInTheDocument();
    expect(drawer.getByText('Select a board.')).toBeInTheDocument();
    await waitFor(() => expect(drawer.getByRole('textbox', { name: /Rule name/ })).toHaveFocus());
  }, 30000);

  it('retains a division assignment draft when saving fails or closing is declined', async () => {
    const persist = vi.fn().mockRejectedValue(new Error('Unavailable'));
    const confirm = vi.fn().mockReturnValue(false);
    vi.stubGlobal('confirm', confirm);
    try {
      renderSettings(<DivisionChangesSettingsPanel />, persist);
      fireEvent.click(screen.getByRole('button', { name: 'Add division rule' }));
      fireEvent.change(screen.getByRole('textbox', { name: /Rule name/ }), {
        target: { value: 'Primary placement' },
      });
      selectAcademicPath();
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      expect(await screen.findByText('The division assignment rule could not be saved. Review the values and try again.'))
        .toBeInTheDocument();
      expect(persist).toHaveBeenCalledOnce();
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(confirm).toHaveBeenCalledWith('Discard unsaved division-assignment rule changes?');
      expect(screen.getByRole('textbox', { name: /Rule name/ })).toHaveValue('Primary placement');
    } finally {
      vi.unstubAllGlobals();
    }
  }, 60000);

  it('shows a concise identifier-series drawer and field-level validation', async () => {
    renderSettings(<GrNumberSettingsScreen embedded />);
    fireEvent.click(screen.getByRole('button', { name: 'Add series' }));

    expect(screen.getByRole('button', { name: 'Add identifier series information' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Series Details information' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Number Format And Range information' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manual Control information' })).toBeInTheDocument();
    expect(screen.queryByText('Choose the parent selection first.')).not.toBeInTheDocument();
    expect(screen.queryByRole('switch', { name: 'Require reason for a manual value' })).not.toBeInTheDocument();
    expect(within(screen.getByRole('dialog', { name: 'Add identifier series' })).getByText('Preview'))
      .toBeInTheDocument();

    const submit = screen.getByRole('button', { name: 'Submit' });
    expect(submit).toHaveClass('MuiButton-sizeSmall');
    expect(submit.querySelector('.MuiButton-startIcon [data-icon="material-symbols-light:save"]'))
      .toBeInTheDocument();
    expect(submit).not.toHaveStyle({ borderRadius: '0px' });

    fireEvent.click(submit);
    expect(await screen.findByText('Series name is required')).toBeInTheDocument();
    expect(screen.getByText('Select a board.')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('textbox', { name: /Series name/ })).toHaveFocus());

    fireEvent.change(screen.getByRole('textbox', { name: /Series name/ }), {
      target: { value: 'Primary GR' },
    });
    selectAcademicPath();
    fireEvent.change(screen.getByRole('spinbutton', { name: /Number padding/ }), {
      target: { value: '0' },
    });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Maximum number/ }), {
      target: { value: '0' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Number padding must be between 1 and 12')).toBeInTheDocument();
    expect(screen.getByText('Maximum number must be at least 1')).toBeInTheDocument();
  }, 60000);

  it('keeps an identifier series draft available after a save failure', async () => {
    const persist = vi.fn().mockRejectedValue(new Error('Unavailable'));
    const confirm = vi.fn().mockReturnValue(false);
    vi.stubGlobal('confirm', confirm);
    try {
      renderSettings(<GrNumberSettingsScreen embedded />, persist);
      fireEvent.click(screen.getByRole('button', { name: 'Add series' }));
      fireEvent.change(screen.getByRole('textbox', { name: /Series name/ }), {
        target: { value: 'Primary GR' },
      });
      selectAcademicPath();
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      expect(await screen.findByText('The series could not be saved. Review the values and try again.'))
        .toBeInTheDocument();
      expect(persist).toHaveBeenCalledOnce();
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(confirm).toHaveBeenCalledWith('Discard unsaved identifier-series changes?');
      expect(screen.getByRole('textbox', { name: /Series name/ })).toHaveValue('Primary GR');
    } finally {
      vi.unstubAllGlobals();
    }
  }, 60000);

  it('requires a reason when manual identifier entry is re-enabled', async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    renderSettings(<GrNumberSettingsScreen embedded />, persist);
    fireEvent.click(screen.getByRole('button', { name: 'Add series' }));
    fireEvent.change(screen.getByRole('textbox', { name: /Series name/ }), {
      target: { value: 'Primary GR' },
    });
    selectAcademicPath();
    const manualEntry = screen.getByRole('switch', { name: 'Allow manual GR entry' });
    fireEvent.click(manualEntry);
    fireEvent.click(manualEntry);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(persist).toHaveBeenCalledOnce());
    expect(persist.mock.calls[0][1].grNumber.configurations.at(-1)).toMatchObject({
      manualEntryAllowed: true,
      requireManualReason: true,
    });
  }, 60000);

  it('presents useful readiness columns and usable filters without a redundant status', () => {
    renderSettings(<ReadinessAccessSettingsScreen />);
    const table = within(screen.getByTestId('customizable-table'));
    expect(table.getByRole('columnheader', { name: 'Rule' })).toHaveAttribute('data-filter-type', 'string');
    expect(table.getByRole('columnheader', { name: 'Admission route' }))
      .toHaveAttribute('data-filter-options', expect.stringContaining('Fresh admission'));
    expect(table.getByRole('columnheader', { name: 'Approval' }))
      .toHaveAttribute('data-filter-options', 'No approval|Every student|Exceptions only');
    expect(table.getByRole('columnheader', { name: 'Portal accounts' }))
      .toHaveAttribute('data-filter-options', expect.stringContaining('Student + guardian'));
    expect(table.getByRole('columnheader', { name: 'Credential emails' }))
      .toHaveAttribute('data-filter-options', 'Off');
    expect(table.getByRole('columnheader', { name: 'Required checks' }))
      .toHaveAttribute('data-filter-type', 'number');
    expect(table.getByRole('columnheader', { name: 'Actions' }))
      .toHaveAttribute('data-filterable', 'false');
    expect(table.getByRole('columnheader', { name: 'Actions' }))
      .toHaveAttribute('data-sortable', 'false');
    expect(table.queryByRole('columnheader', { name: 'Status' })).not.toBeInTheDocument();
  });

  it('links Readiness & Access to the Student, onboarding, and settings pages', () => {
    renderSettings(<ReadinessAccessSettingsScreen />);
    const breadcrumb = within(screen.getByRole('navigation', { name: 'Breadcrumb' }));

    expect(breadcrumb.getByRole('link', { name: 'Student' })).toHaveAttribute(
      'href',
      '/student/dashboard'
    );
    expect(breadcrumb.getByRole('link', { name: 'Onboarding' })).toHaveAttribute(
      'href',
      '/student/onboarding/setup'
    );
    expect(breadcrumb.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/student/onboarding/settings'
    );
    expect(breadcrumb.queryByRole('link', { name: 'Readiness & Access' })).not.toBeInTheDocument();
    expect(breadcrumb.getByText('Readiness & Access')).toBeInTheDocument();
  });

  it('links Numbering & Placement to the same onboarding hierarchy', () => {
    renderSettings(<NumberingPlacementSettingsScreen />);
    const breadcrumb = within(screen.getByRole('navigation', { name: 'Breadcrumb' }));

    expect(breadcrumb.getByRole('link', { name: 'Student' })).toHaveAttribute(
      'href',
      '/student/dashboard'
    );
    expect(breadcrumb.getByRole('link', { name: 'Onboarding' })).toHaveAttribute(
      'href',
      '/student/onboarding/setup'
    );
    expect(breadcrumb.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/student/onboarding/settings'
    );
    expect(
      breadcrumb.queryByRole('link', { name: 'Numbering & Placement' })
    ).not.toBeInTheDocument();
    expect(breadcrumb.getByText('Numbering & Placement')).toBeInTheDocument();
  });

  it('places the create action beside the Numbering & Placement tabs', () => {
    renderSettings(<NumberingPlacementSettingsScreen />);

    const tabRow = screen.getByRole('tablist').parentElement?.parentElement;
    expect(tabRow).toBeTruthy();
    const addButton = within(tabRow!).getByRole('button', { name: 'Add series' });
    expect(screen.queryByText('Saved scope')).not.toBeInTheDocument();

    fireEvent.click(addButton);
    expect(screen.getByRole('dialog', { name: 'Add identifier series' })).toBeInTheDocument();
  });

  it('saves school-level availability with the onboarding configuration', async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    renderSettings(<ReadinessAccessSettingsScreen />, persist);
    fireEvent.click(screen.getByRole('button', { name: 'School levels' }));
    expect(screen.getByRole('dialog', { name: 'Choose Onboarding School Levels' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Show all configured school levels' })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Save school levels' })).toBeDisabled();
    fireEvent.click(screen.getByRole('switch', { name: 'Show all configured school levels' }));
    choose('School levels', 'Secondary', true);
    expect(screen.getByRole('button', { name: 'Save school levels' })).toBeEnabled();
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
    fireEvent.click(screen.getByRole('button', { name: 'Add Readiness Rule' }));
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
    expect(screen.getByRole('button', { name: 'Review rule' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Review rule' }));
    expect(persist).not.toHaveBeenCalled();
    const review = within(await screen.findByRole('dialog', { name: 'Review Readiness Rule', hidden: true }));
    expect(review.getByText('Students covered')).toBeInTheDocument();
    expect(review.getByText(/CBSE \/ English \/ Secondary \/ Grade 6/)).toBeInTheDocument();
    expect(review.queryByText(/Fee assignment and the first installment/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Save and apply'));
    await waitFor(() => expect(persist).toHaveBeenCalledOnce());
    const saved = persist.mock.calls[0][1].onboardingProfiles.at(-1);
    expect(saved.applicability).toMatchObject({ boardIds: ['board-cbse'], academicMediumIds: ['medium-cbse-english'],
      academicMediumStageIds: ['stage-cbse-secondary'], standardIds: ['grade-6'], divisionMode: 'all' });
  });

  it('keeps guidance in accessible info controls and validates rule identity in place', () => {
    renderSettings(<ReadinessAccessSettingsScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Readiness Rule' }));
    expect(screen.getByRole('button', { name: 'Add Readiness Rule information' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Academic Applicability information' })).toBeInTheDocument();
    const hasRequiredMark = (name: string) => Boolean(
      screen.getByRole('combobox', { name }).closest('.MuiFormControl-root')
        ?.querySelector('.MuiFormLabel-asterisk')
    );
    expect(hasRequiredMark('Board')).toBe(true);
    expect(hasRequiredMark('Medium')).toBe(true);
    expect(hasRequiredMark('School levels')).toBe(true);
    expect(hasRequiredMark('Standards')).toBe(true);
    expect(hasRequiredMark('Divisions')).toBe(false);
    expect(hasRequiredMark('Send credentials when')).toBe(true);
    expect(hasRequiredMark('Account creation and sending')).toBe(true);
    expect(screen.getByRole('button', { name: 'Review rule' })).toHaveClass('MuiButton-sizeSmall');
    expect(screen.getByRole('button', { name: 'Reset' })).toHaveClass('MuiButton-outlined');
    ([
      ['Reset', 'ix:reset'],
      ['Cancel', 'basil:cross-solid'],
      ['Review rule', 'mdi:eye-outline'],
    ] as const).forEach(([label, icon]) => {
      const button = screen.getByRole('button', { name: label });
      expect(button.querySelector(`.MuiButton-startIcon [data-icon="${icon}"]`)).toBeInTheDocument();
      expect(button).not.toHaveStyle({ borderRadius: '0px' });
    });
    expect(screen.queryByText('Choose the parent selection first.')).not.toBeInTheDocument();

    const name = screen.getByRole('textbox', { name: /Rule name/ });
    fireEvent.change(name, { target: { value: '  ' } });
    fireEvent.blur(name);
    expect(screen.getByText('Rule name is required.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review rule' })).toBeDisabled();

    fireEvent.change(name, { target: { value: 'New readiness rule' } });
    const route = screen.getByRole('combobox', { name: /Admission route/ });
    fireEvent.change(route, { target: { value: '  ' } });
    fireEvent.blur(route);
    expect(screen.getByText('Admission route is required.')).toBeInTheDocument();
  }, 30000);

  it('shows the enforced optional-document exception without seeding an unavailable capacity override', () => {
    expect(defaultReadinessAccessRules.approvalTriggers).not.toContain('capacity-override');
    expect(defaultOnboardingProfiles.find((profile) => profile.id === 'mid-year-admission')?.rules.approvalTriggers)
      .not.toContain('capacity-override');
    renderSettings(<ReadinessAccessSettingsScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit Returning student rule' }));
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
    fireEvent.click(screen.getByRole('button', { name: 'Add Readiness Rule' }));
    choose('Campuses (optional)', 'North Campus', true);
    selectAcademicPath();
    fireEvent.click(screen.getByRole('button', { name: 'Review rule' }));
    expect(screen.getByText(/Campus: North Campus/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Save and apply'));
    await waitFor(() => expect(persist).toHaveBeenCalledOnce());
    expect(persist.mock.calls[0][1].onboardingProfiles.at(-1).applicability).toMatchObject({
      campusMode: 'selected', campusIds: ['campus-north'], boardIds: ['board-cbse'],
    });
  }, 60000);

  it('saves a school-defined admission route with its readiness rule', async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    renderSettings(<ReadinessAccessSettingsScreen />, persist);
    fireEvent.click(screen.getByRole('button', { name: 'Add Readiness Rule' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Admission route' }), {
      target: { value: 'Scholarship intake' },
    });
    selectAcademicPath();
    expect(screen.getByRole('button', { name: 'Review rule' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Review rule' }));
    const review = within(await screen.findByRole('dialog', { name: 'Review Readiness Rule', hidden: true }));
    expect(review.getByText('Admission route')).toBeInTheDocument();
    expect(review.getByText('Scholarship intake')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Save and apply'));
    await waitFor(() => expect(persist).toHaveBeenCalledOnce());
    expect(persist.mock.calls[0][1].onboardingProfiles.at(-1).admissionRoutes)
      .toEqual(['Scholarship intake']);
  });

  it('keeps an unsaved rule editable when applying fails or closing is declined', async () => {
    const persist = vi.fn().mockRejectedValue(new Error('Save unavailable'));
    renderSettings(<ReadinessAccessSettingsScreen />, persist);
    fireEvent.click(screen.getByRole('button', { name: 'Add Readiness Rule' }));
    selectAcademicPath();
    fireEvent.click(screen.getByRole('button', { name: 'Review rule' }));
    fireEvent.click(screen.getByText('Save and apply'));
    await waitFor(() => expect(screen.getByText(/The rule could not be applied/)).toBeInTheDocument());
    expect(persist).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByText('Back to rule'));
    expect(screen.queryByRole('dialog', { name: 'Discard Unsaved Rule Changes?' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    const confirmation = screen.getByRole('dialog', {
      name: 'Discard Unsaved Rule Changes?', hidden: true,
    });
    expect(within(confirmation).getByText(/Your changes to this readiness rule have not been saved/)).toBeInTheDocument();
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Keep editing', hidden: true }));
    expect(screen.getByRole('button', { name: 'Review rule' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Close Add Readiness Rule' }));
    fireEvent.click(within(screen.getByRole('dialog', {
      name: 'Discard Unsaved Rule Changes?', hidden: true,
    })).getByRole('button', { name: 'Discard changes', hidden: true }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Add Readiness Rule' }))
      .not.toBeInTheDocument());
  }, 60000);

  it('clears descendants on board change and offers the new board’s configured Primary level', () => {
    renderSettings(<ReadinessAccessSettingsScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Readiness Rule' }));
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
    fireEvent.click(screen.getByRole('button', { name: 'Edit Mid-year admission rule' }));
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
  }, 60000);

  it.each([
    ['GR', () => <GrNumberSettingsScreen embedded />, 'Add series'],
    ['Roll', () => <RollNumberSettingsScreen embedded />, 'Add roll number rule'],
    ['Division', () => <DivisionChangesSettingsPanel />, 'Add division rule'],
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
    ['GR', () => <GrNumberSettingsScreen embedded />, 'Add series'],
    ['Roll', () => <RollNumberSettingsScreen embedded />, 'Add roll number rule'],
    ['Division', () => <DivisionChangesSettingsPanel />, 'Add division rule'],
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
  fireEvent.click(screen.getByRole('button', { name: 'Add Readiness Rule' }));
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
  fireEvent.click(screen.getByRole('button', { name: 'Add Readiness Rule' }));
  selectAcademicPath();
  fireEvent.click(screen.getByRole('switch', { name: 'Prepare student account' }));
  fireEvent.click(screen.getByRole('switch', { name: 'Send student credential email' }));
  expect(screen.getByRole('button', { name: 'Review rule' })).toBeDisabled();
  expect(screen.getAllByText('Enable student account preparation before sending student emails.').length).toBeGreaterThan(0);
});
