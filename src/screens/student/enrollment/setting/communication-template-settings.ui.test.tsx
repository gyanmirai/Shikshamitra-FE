import type { ReactNode } from 'react';
import type { AdmissionCrmMessageTemplateDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import {
  AdmissionCrmMessageChannel,
  AdmissionCrmMessageTemplateStatus,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { CommunicationTemplateSettings } from './communication-template-settings';

const apiMocks = vi.hoisted(() => ({
  templatesQuery: vi.fn(),
  createMutation: vi.fn(),
  updateMutation: vi.fn(),
  statusMutation: vi.fn(),
}));

vi.mock('src/redux/student/admissions-crm/admissions-crm-api', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('src/redux/student/admissions-crm/admissions-crm-api')>();

  return {
    ...actual,
    useGetAdmissionCrmMessageTemplatesQuery: (...args: unknown[]) =>
      apiMocks.templatesQuery(...args),
    useCreateAdmissionCrmMessageTemplateMutation: () => apiMocks.createMutation(),
    useUpdateAdmissionCrmMessageTemplateMutation: () => apiMocks.updateMutation(),
    useUpdateAdmissionCrmMessageTemplateStatusMutation: () => apiMocks.statusMutation(),
  };
});

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
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
      <div data-testid="template-table" data-loading={String(Boolean(isLoading))}>
        {data.map((row, index) => (
          <div key={index}>{actions?.render?.(undefined, row)}</div>
        ))}
      </div>
    );
  },
}));

const template = {
  id: 'template-1',
  academicYearId: 'year-1',
  templateName: 'Registration follow-up',
  channel: AdmissionCrmMessageChannel.Sms,
  purpose: 'Registration incomplete',
  subject: null,
  body: 'Please complete registration.',
  variables: [],
  status: AdmissionCrmMessageTemplateStatus.Approved,
  isActive: true,
} as AdmissionCrmMessageTemplateDto;

describe('Communication template settings safety', () => {
  const refetch = vi.fn();
  const createTemplate = vi.fn();
  const updateTemplate = vi.fn();
  const updateStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.templatesQuery.mockReturnValue({
      data: { items: [template] },
      isError: false,
      isLoading: false,
      isFetching: false,
      refetch,
    });
    createTemplate.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    updateTemplate.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    updateStatus.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    apiMocks.createMutation.mockReturnValue([createTemplate, { isLoading: false }]);
    apiMocks.updateMutation.mockReturnValue([updateTemplate, { isLoading: false }]);
    apiMocks.statusMutation.mockReturnValue([updateStatus, { isLoading: false }]);
  });

  it('uses explicit confirmation and lets the tenant-wide backend guard decide retirement safety', async () => {
    render(<CommunicationTemplateSettings academicYearId="year-1" />);

    fireEvent.click(screen.getByRole('button', { name: 'Retire Registration follow-up' }));

    expect(screen.getByRole('dialog', { name: 'Retire message template?' })).toHaveTextContent(
      'The server will block retirement while any enabled automation in the school still uses it.'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Retire template' }));

    await waitFor(() =>
      expect(updateStatus).toHaveBeenCalledWith({
        templateId: 'template-1',
        body: { status: AdmissionCrmMessageTemplateStatus.Retired, isActive: false },
      })
    );
  });

  it('retains rows but blocks stale actions while the template list refetches', () => {
    apiMocks.templatesQuery.mockReturnValue({
      data: { items: [template] },
      isError: false,
      isLoading: false,
      isFetching: true,
      refetch,
    });

    render(<CommunicationTemplateSettings academicYearId="year-1" />);

    expect(screen.getByTestId('template-table')).toHaveAttribute('data-loading', 'false');
    expect(screen.getByRole('button', { name: 'Add template' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Edit Registration follow-up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Retire Registration follow-up' })).toBeDisabled();
  });
});
