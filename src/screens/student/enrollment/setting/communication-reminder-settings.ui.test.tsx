import type { ReactNode } from 'react';
import type {
  AdmissionCrmJourneyRuleDto,
  AdmissionCrmMessageTemplateDto,
  AdmissionCrmCycleConfigurationDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import {
  AdmissionCrmMessageChannel,
  AdmissionCrmJourneyTrigger,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { CommunicationReminderSettings } from './communication-reminder-settings';

const apiMocks = vi.hoisted(() => ({
  configurationQuery: vi.fn(),
  templatesQuery: vi.fn(),
  updateConfigurationMutation: vi.fn(),
  previewImpactMutation: vi.fn(),
}));

vi.mock('src/redux/student/admissions-crm/admissions-crm-api', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('src/redux/student/admissions-crm/admissions-crm-api')>();

  return {
    ...actual,
    useGetAdmissionCrmCycleConfigurationQuery: (...args: unknown[]) =>
      apiMocks.configurationQuery(...args),
    useGetAdmissionCrmMessageTemplatesQuery: (...args: unknown[]) =>
      apiMocks.templatesQuery(...args),
    useUpdateAdmissionCrmCycleConfigurationMutation: () => apiMocks.updateConfigurationMutation(),
    usePreviewAdmissionCrmConfigurationImpactMutation: () => apiMocks.previewImpactMutation(),
  };
});

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('src/components/customizabaleTable', () => ({
  default: ({
    columns,
    data,
    isLoading,
  }: {
    columns: Array<{
      id: string;
      render?: (value: unknown, row: unknown) => ReactNode;
    }>;
    data: unknown[];
    isLoading?: boolean;
  }) => {
    const actions = columns.find((column) => column.id === 'actions');
    return (
      <div data-testid="reminder-table" data-loading={String(Boolean(isLoading))}>
        {data.map((row, index) => (
          <div key={index}>{actions?.render?.(undefined, row)}</div>
        ))}
      </div>
    );
  },
}));

const reminder: AdmissionCrmJourneyRuleDto = {
  ruleName: 'Admission reminder: Registration follow-up',
  isEnabled: true,
  priority: 10,
  trigger: AdmissionCrmJourneyTrigger.RegistrationIncomplete,
  stage: null,
  channel: null,
  inquirySourceId: null,
  campaignContains: null,
  leadStage: null,
  leadPriority: null,
  ownerUserId: null,
  targetStandardId: null,
  desiredClassContains: null,
  campusBranchContains: null,
  preferredLanguageContains: null,
  minimumLeadScore: null,
  maximumLeadScore: null,
  daysSinceLastActivity: 2,
  daysSinceCreation: null,
  createTask: false,
  taskTitle: null,
  taskDueOffsetHours: 0,
  taskNotes: null,
  sendMessage: true,
  messageTemplateId: 'template-1',
};

const configuration = {
  id: 'configuration-1',
  academicYearId: 'year-1',
  cycleName: '2026-27',
  isActive: true,
  journeyRules: [reminder],
} as AdmissionCrmCycleConfigurationDto;

const approvedTemplate = {
  id: 'template-1',
  templateName: 'Registration follow-up',
  channel: AdmissionCrmMessageChannel.Sms,
} as AdmissionCrmMessageTemplateDto;

describe('Communication reminder settings safety', () => {
  const configurationRefetch = vi.fn();
  const templatesRefetch = vi.fn();
  const updateConfiguration = vi.fn();
  const previewImpact = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    configurationRefetch.mockResolvedValue(undefined);
    templatesRefetch.mockResolvedValue(undefined);
    updateConfiguration.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    previewImpact.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          academicYearId: 'year-1',
          affectedApplicantCount: 0,
          configurationReferenceCount: 0,
          changedFields: ['journeyRules'],
          referenceFamilies: [],
          warnings: [],
          fingerprint: 'preview-fingerprint',
        }),
    });
    apiMocks.configurationQuery.mockReturnValue({
      data: configuration,
      isError: false,
      isLoading: false,
      isFetching: false,
      refetch: configurationRefetch,
    });
    apiMocks.templatesQuery.mockReturnValue({
      data: { items: [approvedTemplate] },
      isError: false,
      isLoading: false,
      isFetching: false,
      refetch: templatesRefetch,
    });
    apiMocks.updateConfigurationMutation.mockReturnValue([
      updateConfiguration,
      { isLoading: false },
    ]);
    apiMocks.previewImpactMutation.mockReturnValue([previewImpact, { isLoading: false }]);
  });

  it('blocks the editor and retries when the approved-template dependency fails', () => {
    apiMocks.templatesQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
      isFetching: false,
      refetch: templatesRefetch,
    });

    render(<CommunicationReminderSettings academicYearId="year-1" />);

    expect(screen.getByText('Reminder settings could not be loaded.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add reminder' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('reminder-table')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(templatesRefetch).toHaveBeenCalledTimes(1);
    expect(configurationRefetch).not.toHaveBeenCalled();
  });

  it('requires confirmation before deleting even when the impact preview is empty', async () => {
    render(<CommunicationReminderSettings academicYearId="year-1" />);

    fireEvent.click(screen.getByRole('button', { name: 'Remove Registration follow-up' }));

    expect(screen.getByRole('dialog', { name: 'Remove reminder?' })).toBeInTheDocument();
    expect(previewImpact).not.toHaveBeenCalled();
    expect(updateConfiguration).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Remove reminder' }));

    await waitFor(() => expect(previewImpact).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(updateConfiguration).toHaveBeenCalledTimes(1));
  });

  it('retains reminder rows and uses a contained progress treatment during refetch', () => {
    apiMocks.configurationQuery.mockReturnValue({
      data: configuration,
      isError: false,
      isLoading: false,
      isFetching: true,
      refetch: configurationRefetch,
    });

    render(<CommunicationReminderSettings academicYearId="year-1" />);

    expect(screen.getByTestId('reminder-table')).toHaveAttribute('data-loading', 'false');
    expect(
      screen.getByRole('progressbar', { name: 'Refreshing admission reminder settings' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add reminder' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove Registration follow-up' })).toBeDisabled();
  });
});
