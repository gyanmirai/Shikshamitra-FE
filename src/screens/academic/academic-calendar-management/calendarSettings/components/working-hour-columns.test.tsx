import { mswServer } from 'src/test/mswServer';
import { iconApiHandlers } from 'src/test/icon-api-handlers';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { workingHourColumns } from './working-hour-columns';

describe('working hours table row context', () => {
  beforeEach(() => mswServer.use(...iconApiHandlers));
  it('assigns the clicked class rather than its cell value', () => {
    const onAssign = vi.fn();
    const columns = workingHourColumns({
      deleting: false,
      onAssign,
      onEdit: vi.fn(),
      onDelete: vi.fn(),
    });
    const row = { id: 'class-10', className: 'Class 10' };
    render(<>{columns.find(({ id }) => id === 'actions')!.render!('-', row)}</>);
    fireEvent.click(screen.getByRole('button', { name: 'Assign shift for Class 10' }));
    expect(onAssign).toHaveBeenCalledWith(row);
    expect(columns.find(({ id }) => id === 'actions')).toMatchObject({
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
    });
  });
});
