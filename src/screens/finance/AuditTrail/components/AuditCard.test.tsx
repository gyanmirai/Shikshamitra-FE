import { vi, it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import AuditCard from './AuditCard';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('src/components/label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

describe('AuditCard', () => {
  it('uses API display timestamp for exact finance audit tooltip', async () => {
    render(
      <AuditCard
        log={{
          id: 'evt-1',
          subModule: 'Collections',
          action: 'PAYMENT',
          description: 'Fee payment received',
          performedBy: 'Admin',
          createdAt: '2026-06-08T17:51:05.304718+00:00',
          createdAtDisplay: '08 Jun 2026, 11:21 PM',
        }}
      />
    );

    expect(screen.getByLabelText('08 Jun 2026, 11:21 PM')).toBeInTheDocument();
    expect(screen.queryByText('08 Jun 2026, 05:51 PM')).not.toBeInTheDocument();
  });

  it('formats changed business date fields without timezone-shifted clock times', () => {
    render(
      <AuditCard
        log={{
          id: 'evt-2',
          subModule: 'Charges',
          action: 'UPDATE',
          description: 'Charge schedule updated',
          performedBy: 'Admin',
          createdAt: '2026-06-08T17:51:05.304718+00:00',
          beforeData: { effectiveFrom: '20250601T00:00:00+00:00' },
          afterData: { effectiveFrom: '20250602T00:00:00+00:00' },
        }}
      />
    );

    expect(screen.getByText('Effective From')).toBeInTheDocument();
    expect(screen.getByText('01 Jun 2025')).toBeInTheDocument();
    expect(screen.getByText('02 Jun 2025')).toBeInTheDocument();
    expect(screen.queryByText(/05:30 AM/)).not.toBeInTheDocument();
  });
});
