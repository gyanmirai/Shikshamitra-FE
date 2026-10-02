import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { createFormColumns } from './form-columns';

const handlers = {
  canManage: true,
  canPublish: true,
  canDelete: true,
  onEdit: vi.fn(),
  onClone: vi.fn(),
  onValidate: vi.fn(),
  onPublish: vi.fn(),
  onHistory: vi.fn(),
  onCreateVersion: vi.fn(),
  onArchive: vi.fn(),
  onDelete: vi.fn(),
};

describe('Admission form list columns', () => {
  it.each(['Inquiry', 'Registration'])(
    'uses lifecycle status without an approval column for %s forms',
    (purpose) => {
      const columns = createFormColumns(handlers);

      expect(columns.map((column) => column.label)).not.toContain('Approval');
      expect(columns.map((column) => column.id)).not.toContain('approvalStatus');

      const statusColumn = columns.find((column) => column.id === 'status');
      expect(statusColumn?.render).toBeDefined();

      render(<>{statusColumn?.render?.(0, { purpose })}</>);
      expect(screen.getByText('Draft')).toBeVisible();
      expect(screen.queryByText(/approval|pending review/i)).not.toBeInTheDocument();
    }
  );
});
