import type { ReactNode, ComponentProps } from 'react';
import type { PaymentTermListItem } from 'src/redux/finance/paymentTerm';
import type { ICustomizableTableProps } from 'src/components/customizabaleTable/types';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import PaymentTermTable, {
  canDeletePaymentTerm,
  getPaymentTermDisplayStatus,
} from './PaymentTermTable';

vi.mock('src/components/three-dots-actions', () => ({
  default: ({
    showThreeDots,
    actions,
    directActions = [],
  }: {
    showThreeDots?: boolean;
    actions?: (params: { popover: { onClose: () => void } }) => ReactNode;
    directActions?: { id: string; label: string; disabled?: boolean; onClick?: () => void }[];
  }) => (
    <>
      {directActions.map((action) => (
        <button key={action.id} disabled={action.disabled} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
      {showThreeDots && actions ? actions({ popover: { onClose: vi.fn() } }) : null}
    </>
  ),
}));

vi.mock('src/components/iconify', () => ({
  Iconify: () => null,
}));

vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data }: ICustomizableTableProps) => (
    <div
      data-testid="payment-term-table"
      data-columns={columns.map((column) => column.id).join(',')}
    >
      {data.map((row) => (
        <div key={String(row.id)} data-testid={`row-${String(row.id)}`}>
          {columns.map((column) => (
            <div key={column.id}>
              {column.render ? column.render(row[column.id], row) : String(row[column.id] ?? '')}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

const createTerm = (overrides: Partial<PaymentTermListItem> = {}): PaymentTermListItem => ({
  id: 'term-draft',
  name: 'Quarterly Payment Term',
  code: 'PT-QUARTERLY',
  academicYearId: 'year-id',
  boardId: 'board-id',
  status: 'Draft',
  isDefault: false,
  currentVersionNumber: 1,
  hasDraft: true,
  hasPublishedVersion: false,
  installmentCount: 1,
  referencedStructureCount: 0,
  canDirectEdit: true,
  ...overrides,
});

const callbacks = {
  onPaginationChange: vi.fn(),
  onSearchChange: vi.fn(),
  onView: vi.fn(),
  onVersionHistory: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onPublish: vi.fn(),
  onArchive: vi.fn(),
  onRestore: vi.fn(),
};

const baseProps: ComponentProps<typeof PaymentTermTable> = {
  data: [],
  loading: false,
  totalCount: 0,
  page: 1,
  rowsPerPage: 10,
  searchTerm: '',
  archived: false,
  canView: true,
  canEdit: true,
  canPublish: true,
  canArchive: true,
  canRestore: true,
  canDelete: true,
  actionLoading: false,
  ...callbacks,
};

describe('PaymentTermTable', () => {
  beforeEach(() => {
    Object.values(callbacks).forEach((callback) => callback.mockClear());
  });

  it('renders Status immediately before Actions', () => {
    render(<PaymentTermTable {...baseProps} />);

    expect(screen.getByTestId('payment-term-table')).toHaveAttribute(
      'data-columns',
      'name,currentVersionNumber,usage,status,actions'
    );
  });

  it('shows only Draft, Active, and Archived lifecycle statuses without a toggle', () => {
    const draft = createTerm();
    const active = createTerm({
      id: 'term-active',
      name: 'Annual Payment Term',
      status: 'Active',
      hasDraft: false,
      hasPublishedVersion: true,
      isDefault: true,
    });
    const archived = createTerm({
      id: 'term-archived',
      status: 'Archived',
    });

    render(<PaymentTermTable {...baseProps} data={[draft, active, archived]} totalCount={3} />);

    const draftRow = within(screen.getByTestId('row-term-draft'));
    const activeRow = within(screen.getByTestId('row-term-active'));
    const archivedRow = within(screen.getByTestId('row-term-archived'));

    expect(draftRow.getByText('Draft')).toBeInTheDocument();
    expect(activeRow.getByText('Active')).toBeInTheDocument();
    expect(activeRow.getByText('Default')).toBeInTheDocument();
    expect(activeRow.getByText('v1')).toBeInTheDocument();
    expect(archivedRow.getByText('Archived')).toBeInTheDocument();
    expect(archivedRow.queryByText('Draft')).not.toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  it('keeps activation in row actions after removing the status toggle', () => {
    const draft = createTerm();

    render(<PaymentTermTable {...baseProps} data={[draft]} totalCount={1} />);

    fireEvent.click(within(screen.getByTestId('row-term-draft')).getByText('Activate'));
    expect(callbacks.onPublish).toHaveBeenCalledWith(draft);
  });

  it('offers Restore only from the archived view', () => {
    const archived = createTerm({
      id: 'term-archived',
      status: 'Archived',
    });

    render(<PaymentTermTable {...baseProps} data={[archived]} totalCount={1} archived />);

    const archivedRow = within(screen.getByTestId('row-term-archived'));
    expect(archivedRow.getByText('Archived')).toBeInTheDocument();
    expect(archivedRow.getByText('Restore')).toBeInTheDocument();
    expect(archivedRow.queryByText('Activate')).not.toBeInTheDocument();
    expect(getPaymentTermDisplayStatus({ ...archived, status: 'Draft' })).toBe('Draft');
  });

  it('only permits deletion of an unused first Draft version', () => {
    const draft = createTerm();
    const revisionDraft = createTerm({ currentVersionNumber: 2 });
    const published = createTerm({ status: 'Active', hasDraft: false, hasPublishedVersion: true });

    expect(canDeletePaymentTerm(draft)).toBe(true);
    expect(canDeletePaymentTerm(revisionDraft)).toBe(false);
    expect(canDeletePaymentTerm(published)).toBe(false);
    expect(getPaymentTermDisplayStatus(draft)).toBe('Draft');
    expect(getPaymentTermDisplayStatus(published)).toBe('Active');
    expect(getPaymentTermDisplayStatus(createTerm({ status: 'Archived' }))).toBe('Archived');
  });

  it('opens the usage breakdown with the assigned class, structure, head and version', () => {
    const term = createTerm({
      usage: {
        paymentTermId: 'term-draft',
        feeHeadCount: 1,
        feeStructureCount: 1,
        classCount: 1,
        assignments: [
          {
            classId: 'class3',
            className: 'Class 3',
            feeStructureId: 'fs1',
            feeStructureName: 'Class 3 Fees',
            feeHeadId: 'head1',
            feeHeadName: 'School Fees',
            versionId: 'version1',
            versionNumber: 1,
          },
        ],
      },
    });
    render(<PaymentTermTable {...baseProps} data={[term]} totalCount={1} />);
    fireEvent.click(screen.getByRole('button', { name: '1 fee heads · 1 classes' }));
    expect(screen.getByText('Quarterly Payment Term — Used In')).toBeInTheDocument();
    expect(screen.getByText('Class 3 Fees')).toBeInTheDocument();
    expect(screen.getByText('School Fees')).toBeInTheDocument();
    expect(screen.getByText('Class 3')).toBeInTheDocument();
    expect(screen.getAllByText('v1').length).toBeGreaterThan(0);
  });
});
