import { vi, it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { SubjectAssignmentStatus } from '../../enum/subjectType';
import { getSubjectTableStatusColumns } from './subjectTableStatusColumns';

import type { ISubjectFormValues } from '../type';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const createSubject = (status: SubjectAssignmentStatus): ISubjectFormValues => ({
  status,
  classId: 'class-1',
  className: 'LKG',
  subjectName: 'Science',
  subjectType: 0,
});

const getStatusColumn = (onToggleStatus = vi.fn()) => {
  const columns = getSubjectTableStatusColumns({
    canAdd: true,
    canDelete: true,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onToggleStatus,
  });

  return {
    onToggleStatus,
    statusColumn: columns.find((column) => column.id === 'statusValue'),
  };
};

describe('subject table status column', () => {
  it('keeps the status column limited to the draft state', () => {
    const subject = createSubject(SubjectAssignmentStatus.Draft);
    const { statusColumn } = getStatusColumn();

    render(<>{statusColumn?.render?.('Draft', subject)}</>);

    expect(screen.getByText('Draft')).toBeInTheDocument();

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows published as a state without a publish action', () => {
    const subject = createSubject(SubjectAssignmentStatus.Published);
    const { statusColumn } = getStatusColumn();

    render(<>{statusColumn?.render?.('Published', subject)}</>);

    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /publish subject allocation/i })).toBeNull();
  });
});
