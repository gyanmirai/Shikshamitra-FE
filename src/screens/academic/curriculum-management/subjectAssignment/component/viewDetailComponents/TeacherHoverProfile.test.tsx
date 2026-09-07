import type { ReactNode } from 'react';

import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import TeacherHoverProfile from './TeacherHoverProfile';

vi.mock('src/components/custom-tooltip', () => ({
  default: ({ title, children }: { title: ReactNode; children: ReactNode }) => (
    <>
      {children}
      {title}
    </>
  ),
}));

describe('TeacherHoverProfile', () => {
  it('renders the email and experience supplied by the subject detail API', () => {
    render(
      <TeacherHoverProfile
        teacher={{
          name: 'Jignesh Jinjala',
          email: 'jignesh.jinjala@ddvs.com',
          experience: '5 years 2 months',
        }}
        avatarComp={<span>Teacher</span>}
      />
    );

    expect(screen.getByText('jignesh.jinjala@ddvs.com')).toBeInTheDocument();
    expect(screen.getByText('5 years 2 months')).toBeInTheDocument();
  });

  it('never leaves profile values visually blank when employee data is unavailable', () => {
    render(
      <TeacherHoverProfile teacher={{ name: 'Jignesh Jinjala' }} avatarComp={<span>Teacher</span>} />
    );

    expect(screen.getAllByText('Not available')).toHaveLength(2);
  });
});
