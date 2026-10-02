import type {
  StudentRecordsPolicy,
  StudentRecordsSettings,
} from 'src/redux/student/records/student-records-types';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import RecordsSettings from './records-settings';
import { recordActions, recordOutcomes, recordsPolicySchema } from './records-settings-model';

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams(),
  permissions: [] as { name: string; isGranted: boolean }[],
  query: {} as any,
  save: vi.fn(),
  preview: vi.fn(),
  publish: vi.fn(),
  navigate: vi.fn(),
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({
      globalState: { currentYear: { id: 'year-1', name: '2026–27' } },
      auth: { permissions: mocks.permissions },
    }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.navigate }),
  usePathname: () => '/student/records/settings/documents',
  useSearchParams: () => mocks.params,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/routes/components', () => ({
  RouterLink: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: any) => <h1>{heading}</h1>,
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, title, children }: any) =>
    open ? (
      <div role="dialog" aria-label={title}>
        {children}
      </div>
    ) : null,
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/hooks/use-unsaved-navigation', () => ({
  useUnsavedNavigation: () => ({
    requestNavigation: (work: () => unknown) => work(),
    confirmation: null,
  }),
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange, multiple, disabled }: any) => (
    <label htmlFor={label}>
      {label}
      <select
        id={label}
        aria-label={label}
        multiple={multiple}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            multiple
              ? [...event.target.selectedOptions].map((option) => option.value)
              : event.target.value
          )
        }
      >
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  ),
}));
vi.mock('src/redux/student/records/student-records-api', () => ({
  useGetStudentRecordsSettingsQuery: () => mocks.query,
  useGetStudentRecordsSettingsRolesQuery: () => ({ data: { items: [{ name: 'admin' }] } }),
  useSaveStudentRecordsDraftMutation: () => [mocks.save, { isLoading: false }],
  usePreviewStudentRecordsPolicyMutation: () => [mocks.preview, { isLoading: false }],
  usePublishStudentRecordsPolicyMutation: () => [mocks.publish, { isLoading: false }],
}));

function policy(): StudentRecordsPolicy {
  return {
    schemaVersion: 1,
    changes: Object.fromEntries(
      recordActions.map((action) => [
        action,
        {
          mode: 'Approval',
          requireReason: true,
          stages: [{ roleNames: ['admin'] }],
          condition: null,
        },
      ])
    ) as StudentRecordsPolicy['changes'],
    provisioning: { mode: 'Summary', allowPlacementEdits: false },
    access: { masks: [] },
    guardianAccess: { onApprovedChange: 'SuspendUntilReview' },
    documents: {
      enabledCertificateTypes: ['Bonafide', 'Character', 'Leaving', 'FirstTrial'],
      certificateNumberPrefix: 'CERT',
      idNumberPrefix: 'ID',
      leavingCertificateStage: 'ApprovedExit',
    },
    transitions: {
      outcomeChecks: Object.fromEntries(
        recordOutcomes.map((outcome) => [
          outcome,
          {
            requireAcademicResult: false,
            requireFinanceClearance: false,
            requireLibraryClearance: false,
            requireTransportClearance: false,
          },
        ])
      ) as StudentRecordsPolicy['transitions']['outcomeChecks'],
      allowPastDates: false,
      maxPastDays: 30,
      allowFutureDates: true,
      maxFutureDays: 365,
      rosterRemovalTiming: 'EffectiveDate',
      allowedReturnRoutes: ['ReuseProfile'],
      defaultReturnRoute: 'ReuseProfile',
      annualRenewalMode: 'ShortChecklist',
      batchExceptionMode: 'ReadyOnly',
    },
  };
}
let saved: StudentRecordsSettings;
beforeEach(() => {
  vi.clearAllMocks();
  mocks.params = new URLSearchParams();
  mocks.permissions = ['Students.Records.Settings.Add', 'Students.Records.Settings.Publish'].map(
    (name) => ({ name, isGranted: true })
  );
  saved = {
    id: 'config-1',
    concurrencyStamp: 'stamp-1',
    draftPolicy: policy(),
    effectivePolicy: policy(),
    publishedVersionNumber: 1,
    isStarter: false,
  };
  mocks.query = { currentData: saved, isError: false, refetch: vi.fn() };
  mocks.save.mockImplementation((body) => ({
    unwrap: () =>
      Promise.resolve({ ...saved, draftPolicy: body.policy, concurrencyStamp: 'stamp-2' }),
  }));
  mocks.preview.mockImplementation((body) => ({
    unwrap: () =>
      Promise.resolve({
        policy: body.policy,
        summary: ['Leaving certificates need an approved exit.'],
      }),
  }));
  mocks.publish.mockImplementation(() => ({
    unwrap: () => Promise.resolve({ ...saved, publishedVersionNumber: 2 }),
  }));
});

describe('Student Records settings', () => {
  it('offers four real task links without a Directory/Profile settings page', () => {
    render(<RecordsSettings />);
    expect(screen.getByRole('link', { name: /Change Rules & Approvals/ })).toHaveAttribute(
      'href',
      '/student/records/settings/changes'
    );
    expect(screen.getByRole('link', { name: /Documents & IDs/ })).toHaveAttribute(
      'href',
      '/student/records/settings/documents'
    );
    expect(screen.getByRole('link', { name: /Year-End & Transitions/ })).toBeVisible();
    expect(screen.getByRole('link', { name: /Access & Visibility/ })).toBeVisible();
  });
  it('requires a saved current preview and includes the concurrency stamp when publishing', async () => {
    render(<RecordsSettings task="documents" />);
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Preview rules' }));
    await screen.findByRole('dialog', { name: 'Review Student Records rules' });
    fireEvent.click(screen.getByRole('button', { name: 'Close preview' }));
    fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
    fireEvent.click(screen.getByRole('button', { name: 'Publish rules' }));
    await waitFor(() =>
      expect(mocks.publish).toHaveBeenCalledWith({
        academicYearId: undefined,
        concurrencyStamp: 'stamp-1',
      })
    );
  });
  it('invalidates a preview after editing and saves the exact policy without publishing', async () => {
    render(<RecordsSettings task="documents" />);
    fireEvent.click(screen.getByRole('button', { name: 'Preview rules' }));
    await screen.findByRole('dialog', { name: 'Review Student Records rules' });
    fireEvent.click(screen.getByRole('button', { name: 'Close preview' }));
    fireEvent.change(screen.getByLabelText('Certificate number prefix'), {
      target: { value: 'NEW' },
    });
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalled());
    expect(mocks.save.mock.calls[0][0].policy.documents.certificateNumberPrefix).toBe('NEW');
    expect(mocks.publish).not.toHaveBeenCalled();
  });
  it('preserves edits when a save conflicts', async () => {
    mocks.save.mockImplementation(() => ({
      unwrap: () => Promise.reject(Object.assign(new Error('Conflict'), { status: 409 })),
    }));
    render(<RecordsSettings task="documents" />);
    fireEvent.change(screen.getByLabelText('Certificate number prefix'), {
      target: { value: 'NEW' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await screen.findByText(/Another staff member changed this configuration/);
    expect(screen.getByLabelText('Certificate number prefix')).toHaveValue('NEW');
  });
  it('disables editing and publishing when exact action permissions are absent', () => {
    mocks.permissions = [{ name: 'Students.Records.Settings.View', isGranted: true }];
    render(<RecordsSettings task="documents" />);
    expect(screen.getByLabelText('Certificate number prefix')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();
  });
  it('keeps the header visible on load failure and offers retry', () => {
    const retry = vi.fn();
    mocks.query = { currentData: undefined, isError: true, refetch: retry };
    render(<RecordsSettings task="documents" />);
    expect(screen.getByRole('heading', { name: 'Documents & IDs', level: 1 })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledOnce();
  });
  it('rejects unsafe prefixes and a default return route that is not allowed', async () => {
    const invalid = policy();
    invalid.documents.idNumberPrefix = 'ID /';
    invalid.transitions.defaultReturnRoute = 'FreshApplication';
    await expect(recordsPolicySchema.validate(invalid)).rejects.toThrow();
    await expect(recordsPolicySchema.validate(policy())).resolves.toBeDefined();
  });
});
