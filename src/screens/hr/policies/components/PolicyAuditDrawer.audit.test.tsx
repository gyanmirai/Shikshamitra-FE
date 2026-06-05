import { it, vi, expect, describe } from 'vitest';
import { render, screen, within } from '@testing-library/react';

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

describe('PolicyAuditDrawer audit rendering', () => {
  it('renders changed fields and context without raw JSON or GUIDs', () => {
    render(
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
                      field: 'holidaySummary',
                      oldValue:
                        '{"totalCount":8,"includedCount":3,"removedCount":5,"manualCount":0}',
                      newValue:
                        '[{"id":"3a2170d2-084c-e067-2a5c-0539716dd973","holidayName":"Annual day","date":"20250601T00:00:00+00:00","source":"manual"}]',
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
    expect(scope.getByText('Annual day')).toBeInTheDocument();
    expect(scope.getByText('Source Policy ID')).toBeInTheDocument();
    expect(scope.getAllByText('Linked record').length).toBeGreaterThan(0);
    expect(drawer?.textContent).not.toContain('{');
    expect(drawer?.textContent).not.toContain('3a216aea-8273-8586-a1a3-3bffdc298e2e');
    expect(drawer?.textContent).not.toContain('3a2170d2-084c-e067-2a5c-0539716dd973');
  });

  it('sanitizes fallback audit summaries from summary endpoint events', () => {
    render(
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
    expect(drawer?.textContent).not.toContain('{');
    expect(drawer?.textContent).not.toContain('"totalCount"');
    expect(drawer?.textContent).not.toContain('3a216aea-8273-8586-a1a3-3bffdc298e2e');
  });
});
