import { it, vi, expect, describe, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import PublicRegistration, { type PublicRegistrationApplication } from './public-registration';

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

afterEach(() => {
  vi.restoreAllMocks();
});

const makeApplication = (): PublicRegistrationApplication => ({
  id: 'registration-1',
  concurrencyStamp: 'version-1',
  formNumber: 'REG-001',
  status: 1,
  sections: [
    {
      key: 'student',
      title: 'Student Details',
      parentVisible: true,
      fields: [
        {
          key: 'studentName',
          label: 'Student name',
          fieldType: 0,
          required: true,
          parentEditable: true,
          options: [],
        },
      ],
    },
    {
      key: 'sibling',
      title: 'Sibling Details',
      parentVisible: true,
      fields: [
        {
          key: 'hasSibling',
          label: 'Has sibling',
          fieldType: 8,
          required: false,
          parentEditable: true,
          options: [],
        },
        {
          key: 'siblingName',
          label: 'Sibling name',
          fieldType: 0,
          required: false,
          parentEditable: true,
          visibleWhenFieldKey: 'hasSibling',
          visibleWhenValue: 'true',
          options: [],
        },
      ],
    },
  ],
  prefill: {},
  responses: {},
  correctionFieldKeys: [],
  completionPercentage: 25,
  linkExpiresAt: new Date(Date.now() + 86400000).toISOString(),
  feeAmount: 0,
  feeStatus: 0,
});

describe('PublicRegistration', () => {
  it('renders registration sections as a stepper and preserves conditional fields', () => {
    render(
      <PublicRegistration
        tenantId="tenant-1"
        token="token-1"
        accessSessionToken="session-1"
        application={makeApplication()}
        onUpdated={vi.fn()}
      />
    );

    expect(screen.getAllByText('Student Details').length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Student name/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Has sibling')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByLabelText('Has sibling')).toBeInTheDocument();
    expect(screen.queryByLabelText('Sibling name')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Has sibling'));
    expect(screen.getByLabelText('Sibling name')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByLabelText(/Student name/)).toBeInTheDocument();
  });

  it('sends the loaded response version when saving', async () => {
    const updated = { ...makeApplication(), concurrencyStamp: 'version-2' };
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(updated), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    render(
      <PublicRegistration
        tenantId="tenant-1"
        token="token-1"
        accessSessionToken="session-1"
        application={makeApplication()}
        onUpdated={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save Progress' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(request.body))).toMatchObject({
      accessSessionToken: 'session-1',
      concurrencyStamp: 'version-1',
    });
  });
});
