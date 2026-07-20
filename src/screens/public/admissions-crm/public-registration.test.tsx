import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import PublicRegistration, { type PublicRegistrationApplication } from './public-registration';

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const makeApplication = (): PublicRegistrationApplication => ({
  id: 'registration-1',
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
});
