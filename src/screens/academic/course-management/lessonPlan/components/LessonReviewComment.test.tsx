import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { LessonReviewComment } from './LessonReviewComment';

describe('LessonReviewComment', () => {
  it('identifies the user who requested changes', () => {
    render(
      <LessonReviewComment inline remarks="Do it some other way." reviewerName="School Admin" />
    );

    expect(screen.getByText('School Admin requested:')).toBeInTheDocument();
    expect(screen.queryByText(/HOD requested/i)).not.toBeInTheDocument();
  });

  it('uses a neutral label when reviewer identity is unavailable', () => {
    render(<LessonReviewComment inline remarks="Please revise this plan." />);

    expect(screen.getByText('Reviewer requested:')).toBeInTheDocument();
  });

  it('identifies the reviewer in the expanded comment view', () => {
    render(
      <LessonReviewComment remarks="Please revise this plan." reviewerName="Academic Admin" />
    );

    expect(screen.getByText('Academic Admin comment')).toBeInTheDocument();
  });
});
