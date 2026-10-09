import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { OnboardingSettingsProvider } from '../onboarding-settings-context';
import { ReadinessAccessSettingsScreen } from './onboarding-policy-settings';
import { defaultOnboardingSettings, defaultOnboardingProfiles } from '../onboarding-settings-model';

const state = vi.hoisted(() => ({ failed: false, canConfigure: true }));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({
      auth: {
        permissions: [
          { name: 'Students.Onboarding.Add', isGranted: state.canConfigure },
          { name: 'Students.Admissions.Workflows.View', isGranted: true },
        ],
      },
    }),
}));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading, action }: any) => (
    <div>
      <h1>{heading}</h1>
      {action}
    </div>
  ),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, noDataText }: any) => (
    <div>
      {data.length ? data.map((row: any) => <span key={row.id}>{row.name}</span>) : noDataText}
    </div>
  ),
}));
vi.mock('./onboarding-settings-drawer', () => ({
  SettingsDrawer: ({ open, title, children, onSubmit, submitDisabled, busy }: any) =>
    open ? (
      <div role="dialog" aria-label={title}>
        {children}
        <button type="button" disabled={busy || submitDisabled} onClick={onSubmit}>
          Submit
        </button>
      </div>
    ) : null,
  SettingsSectionCard: ({ title, children }: any) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange }: any) => (
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetAvailableOnboardingOfferingsQuery: () => ({
    isLoading: false,
    isFetching: false,
    isError: state.failed,
    refetch: vi.fn(),
    data: state.failed
      ? undefined
      : [
          {
            id: 'offering-1',
            name: 'CBSE English Class 1',
            admissionCycleName: '2026-2027',
            boardId: 'cbse',
            boardName: 'CBSE',
            mediumId: 'english',
            mediumName: 'English',
            stageId: 'primary',
            stageName: 'Primary',
            standardId: 'class-1',
            standardName: 'Class 1',
            workflowName: 'Fresh admission',
            workflowDefinitionId: 'workflow-1',
            academicYearId: 'year-1',
          },
        ],
  }),
}));
beforeEach(() => {
  state.failed = false;
  state.canConfigure = true;
});

const fillRule = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Add Readiness Rule' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Rule name' }), {
    target: { value: 'Class 1 readiness' },
  });
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Admission Offerings' }));
  fireEvent.click(await screen.findByRole('option', { name: /CBSE English Class 1/ }));
  fireEvent.keyDown(screen.getByRole('combobox', { name: 'Admission Offerings' }), {
    key: 'Escape',
  });
};

it('removes template rows and redundant account or academic controls, then persists Offering-linked requirements', async () => {
  const persist = vi.fn().mockResolvedValue(undefined);
  render(
    <OnboardingSettingsProvider onPersist={persist}>
      <ReadinessAccessSettingsScreen />
    </OnboardingSettingsProvider>
  );
  expect(screen.getByText(/No Offering-based readiness rules yet/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'School levels' })).not.toBeInTheDocument();
  await fillRule();
  expect(screen.queryByLabelText('Prepare student account')).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox', { name: 'Board' })).not.toBeInTheDocument();
  expect(screen.getByText('CBSE · English · Class 1')).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: 'View requirements for CBSE English Class 1' })
  ).toHaveAttribute('href', '/student/admissions/settings/workflows/workflow-1');
  fireEvent.click(screen.getByRole('switch', { name: 'Email login details to parent/guardian' }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(persist).toHaveBeenCalledOnce());
  expect(persist.mock.calls[0][1].onboardingProfiles.at(-1)).toMatchObject({
    offeringIds: ['offering-1'],
    admissionRoutes: [],
    rules: {
      guardianAccount: true,
      studentAccount: false,
      sendGuardianCredentialEmail: true,
      requireDocuments: true,
      credentialSendingTime: 'activation',
    },
  });
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

it('blocks a second rule for an already-linked Offering', async () => {
  const persist = vi.fn();
  render(
    <OnboardingSettingsProvider
      initialSettings={{
        ...defaultOnboardingSettings,
        onboardingProfiles: [{ ...defaultOnboardingProfiles[0], offeringIds: ['offering-1'] }],
      }}
      onPersist={persist}
    >
      <ReadinessAccessSettingsScreen />
    </OnboardingSettingsProvider>
  );
  await fillRule();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText(/An Offering already has a readiness rule/)).toBeInTheDocument();
  expect(persist).not.toHaveBeenCalled();
});

it('retains entered values after failed save and allows retry', async () => {
  const persist = vi
    .fn()
    .mockRejectedValueOnce(new Error('conflict'))
    .mockResolvedValueOnce(undefined);
  render(
    <OnboardingSettingsProvider onPersist={persist}>
      <ReadinessAccessSettingsScreen />
    </OnboardingSettingsProvider>
  );
  await fillRule();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText(/Your changes are retained/)).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Rule name' })).toHaveValue('Class 1 readiness');
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(persist).toHaveBeenCalledTimes(2));
});

it('does not expose a create action without the exact settings permission', () => {
  state.canConfigure = false;
  render(
    <OnboardingSettingsProvider>
      <ReadinessAccessSettingsScreen />
    </OnboardingSettingsProvider>
  );
  expect(screen.queryByRole('button', { name: 'Add Readiness Rule' })).not.toBeInTheDocument();
});
