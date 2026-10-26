import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { PolicyAuditDrawer } from './PolicyAuditDrawer';

vi.mock('./HRPolicySharedUI', () => ({
  DrawerHeader: ({ title, onClose }: { title: string; onClose?: () => void }) => (
    <div>
      <h2>{title}</h2>
      <button type="button" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-testid="iconify" data-icon={icon} />,
}));

describe('PolicyAuditDrawer audit rendering', () => {
  it('renders changed fields and context without raw JSON or GUIDs', async () => {
    renderThemed(
      <PolicyAuditDrawer
        ctx={
          {
            auditTarget: {
              title: 'Part-Time Academic Calendar Copy',
              entityType: 'work_calendar_policy',
            },
            auditSummary: {
              name: 'Part-Time Academic Calendar Copy',
              creationTime: '2026-05-25T10:47:00Z',
              createdByName: 'Admin',
              lastModificationTime: '2026-05-25T15:49:00Z',
              lastModifiedByName: 'Admin',
            },
            auditEvents: {
              items: [
                {
                  id: 'event-1',
                  action: 'edited',
                  actionLabel: 'Edited',
                  occurredAt: '2026-05-25T15:49:00Z',
                  summary: 'Edited source 3a216aea-8273-8586-a1a3-3bffdc298e2e for calendar policy',
                  actorUserId: '3a216aea-8273-8586-a1a3-3bffdc298e2e',
                  changedFields: [
                    {
                      field: 'holidays',
                      oldValue: '[]',
                      newValue:
                        '[{"id":"3a2170d2-084c-e067-2a5c-0539716dd973","holidayName":"Annual day","date":"20250601T00:00:00+00:00","source":"manual"}]',
                    },
                    {
                      field: 'effectiveFrom',
                      oldValue: '20250601T00:00:00+00:00',
                      newValue: '20250602T00:00:00+00:00',
                    },
                  ],
                  contextJson:
                    '{"sourcePolicyId":"3a216aea-8273-8586-a1a3-3bffdc298e2e","holidaySummary":{"totalCount":8,"includedCount":3}}',
                },
              ],
            },
            auditLoading: false,
            setAuditTarget: vi.fn(),
          } as any
        }
      />
    );

    const drawer = screen.getByText('Part-Time Academic Calendar Copy').closest('.MuiDrawer-paper');
    expect(drawer).toBeTruthy();
    const scope = within(drawer as HTMLElement);

    expect(scope.getAllByText('Total 8').length).toBeGreaterThan(0);
    expect(scope.getAllByText('Included 3').length).toBeGreaterThan(0);
    fireEvent.click(
      scope.getByRole('button', {
        name: 'Show changes for Edited source Linked record for calendar policy',
      })
    );
    fireEvent.click(await scope.findByRole('button', { name: 'Show 1 holiday' }));
    expect(await scope.findByText('Annual day')).toBeInTheDocument();
    expect(scope.getAllByText('01 Jun 2025').length).toBeGreaterThan(0);
    expect(scope.getByText('02 Jun 2025')).toBeInTheDocument();
    expect(scope.getByText('Source Policy ID')).toBeInTheDocument();
    expect(scope.getAllByText('Linked record').length).toBeGreaterThan(0);
    expect(scope.getAllByText('25 May 2026, 09:19 PM').length).toBeGreaterThan(0);
    expect(drawer?.textContent).not.toContain('{');
    expect(drawer?.textContent).not.toContain('3a216aea-8273-8586-a1a3-3bffdc298e2e');
    expect(drawer?.textContent).not.toContain('3a2170d2-084c-e067-2a5c-0539716dd973');
    expect(drawer?.textContent).not.toContain('05:30 AM');
    expect(drawer?.textContent).not.toContain('25 May 2026, 03:49 PM');
  });

  it('sanitizes fallback audit summaries from summary endpoint events', () => {
    renderThemed(
      <PolicyAuditDrawer
        ctx={
          {
            auditTarget: {
              title: 'Fallback Calendar',
              entityType: 'work_calendar_policy',
            },
            auditSummary: {
              name: 'Fallback Calendar',
              creationTime: '2026-05-25T10:47:00Z',
              createdByName: 'Admin',
              events: [
                {
                  timestamp: '2026-05-25T15:49:00Z',
                  action: 'edited',
                  actorId: '3a216aea-8273-8586-a1a3-3bffdc298e2e',
                  changedFieldsSummary:
                    'HolidaySummary: {"totalCount":8,"includedCount":3} -> {"totalCount":9,"includedCount":4}',
                },
              ],
            },
            auditEvents: { items: [] },
            auditLoading: false,
            setAuditTarget: vi.fn(),
          } as any
        }
      />
    );

    const drawer = screen.getByText('Fallback Calendar').closest('.MuiDrawer-paper');
    expect(drawer).toBeTruthy();
    expect(drawer?.textContent).toContain('HolidaySummary: Total: 8; Included: 3');
    expect(drawer?.textContent).toContain('25 May 2026, 09:19 PM');
    expect(drawer?.textContent).not.toContain('{');
    expect(drawer?.textContent).not.toContain('"totalCount"');
    expect(drawer?.textContent).not.toContain('3a216aea-8273-8586-a1a3-3bffdc298e2e');
    expect(drawer?.textContent).not.toContain('25 May 2026, 03:49 PM');
  });

  it('does not render a fabricated last-editor line for a newly created policy', () => {
    renderThemed(
      <PolicyAuditDrawer
        ctx={
          {
            auditTarget: {
              title: 'New Calendar',
              entityType: 'work_calendar_policy',
            },
            auditSummary: {
              name: 'New Calendar',
              creationTime: '2026-05-25T10:47:00Z',
              createdByName: 'Admin',
              lastModificationTime: null,
              lastModifiedByName: null,
            },
            auditEvents: { items: [] },
            auditLoading: false,
            setAuditTarget: vi.fn(),
          } as any
        }
      />
    );

    const drawer = screen.getByText('New Calendar').closest('.MuiDrawer-paper');
    expect(drawer).toBeTruthy();
    expect(drawer?.textContent).toContain('Created by Admin');
    expect(drawer?.textContent).not.toContain('Last edited');
    expect(drawer?.textContent).not.toContain('Unknown user on -');
  });

  it('shows only the requested target title while its audit data is loading', () => {
    renderThemed(
      <PolicyAuditDrawer
        ctx={
          {
            auditTarget: {
              title: 'Replacement Calendar',
              entityType: 'work_calendar_policy',
            },
            auditSummary: undefined,
            auditEvents: undefined,
            auditLoading: true,
            setAuditTarget: vi.fn(),
          } as any
        }
      />
    );

    const drawer = screen.getByText('Replacement Calendar').closest('.MuiDrawer-paper');
    expect(drawer).toBeTruthy();
    expect(drawer?.textContent).not.toContain('Created by');
    expect(drawer?.textContent).not.toContain('Last edited');
    expect(drawer?.querySelector('.MuiLinearProgress-root')).toBeTruthy();
  });

  it('reveals every semantic change when an event contains more than eight fields', async () => {
    renderThemed(
      <PolicyAuditDrawer
        ctx={
          {
            auditTarget: {
              title: 'Ten Change Policy',
              entityType: 'attendance_policy',
            },
            auditSummary: {
              name: 'Ten Change Policy',
              creationTime: '2026-05-25T10:47:00Z',
              createdByName: 'Admin',
            },
            auditEvents: {
              items: [
                {
                  id: 'event-ten-changes',
                  action: 'edited',
                  actionLabel: 'Edited',
                  occurredAt: '2026-05-25T15:49:00Z',
                  summary: 'Updated ten settings',
                  actorDisplayName: 'Admin',
                  changedFields: Array.from({ length: 10 }, (_, index) => ({
                    field: `setting${index + 1}`,
                    oldValue: `before-${index + 1}`,
                    newValue: `after-${index + 1}`,
                  })),
                },
              ],
            },
            auditLoading: false,
            setAuditTarget: vi.fn(),
          } as any
        }
      />
    );

    const user = userEvent.setup();
    const disclosure = screen.getByRole('button', {
      name: 'Show changes for Updated ten settings',
    });
    disclosure.focus();
    await user.keyboard(' ');
    expect(disclosure).toHaveAttribute('aria-expanded', 'true');

    expect(await screen.findByText('after-1')).toBeInTheDocument();
    expect(screen.getByText('after-8')).toBeInTheDocument();
    expect(screen.queryByText('after-9')).not.toBeInTheDocument();
    expect(screen.queryByText('after-10')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(await screen.findByText('after-9')).toBeInTheDocument();
    expect(screen.getByText('after-10')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Go to previous page' }));
    expect(screen.queryByText('after-9')).not.toBeInTheDocument();
    expect(screen.queryByText('after-10')).not.toBeInTheDocument();
  });
});

function renderThemed(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider theme={createTheme(defaultSettings)}>{children}</ThemeProvider>
    ),
  });
}
