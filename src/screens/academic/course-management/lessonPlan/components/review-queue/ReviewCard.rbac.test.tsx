import { vi, it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ReviewCard } from './ReviewCard';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

describe('ReviewCard reviewer actions', () => {
  it('keeps a changes-requested teacher plan read-only for reviewers', () => {
    render(
      <ReviewCard
        item={{
          id: 'plan-4',
          targetType: 'plan',
          teacherId: 'teacher-1',
          teacherName: 'Akshay Patel',
          submittedDate: '2026-09-16',
          pendingSince: '2026-09-16',
          classDivision: 'Class 12-A',
          subjectName: 'Core Mathematics',
          chapterName: 'Intro to Nums CORE',
          topic: 'Topic on Tuesday',
          plannedPct: 5,
          actualPct: 0,
          progressGap: -5,
          evidenceCount: 0,
          status: 'changes',
        }}
        canReview
        canReviewSubmissions
        onViewDetails={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Revise' })).not.toBeInTheDocument();
    expect(screen.getByText('Lesson Plan')).toBeInTheDocument();
    expect(screen.getByText('Class 12-A')).toBeInTheDocument();
    expect(screen.getByText('Core Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Intro to Nums CORE')).toBeInTheDocument();
    expect(screen.getByText('Topic on Tuesday')).toBeInTheDocument();
  });
});
