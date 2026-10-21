import type { Board, AcademicYear } from 'src/types/school';

import { useState } from 'react';
import { it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { IdentityContextFields } from './identity-context-fields';

it('clears child selections when a parent changes and lists only the selected medium’s organizations', async () => {
  const years = [{ id: 'year', name: '2026-2027' }] as AcademicYear[];
  const boards = [
    {
      id: 'board',
      academicYearId: 'year',
      name: 'Board',
      educationMediums: [
        { id: 'gu', name: 'Gujarati', educationMediumStages: [{ id: 'primary', name: 'Primary' }] },
        {
          id: 'en',
          name: 'English',
          educationMediumStages: [{ id: 'secondary', name: 'Secondary' }],
        },
      ],
    },
  ] as Board[];
  function Context() {
    const [selection, setSelection] = useState(['year', 'board', 'gu', 'primary']);
    return (
      <IdentityContextFields
        years={years}
        boards={boards}
        yearId={selection[0]}
        boardId={selection[1]}
        mediumId={selection[2]}
        organizationId={selection[3]}
        onChange={(year, board, medium, organization = '') =>
          setSelection([year, board, medium, organization])
        }
      />
    );
  }
  render(<Context />);
  const user = userEvent.setup();
  await user.click(screen.getByRole('combobox', { name: 'Medium' }));
  await user.click(screen.getByRole('option', { name: 'English' }));
  expect(screen.getByRole('combobox', { name: 'Organization' })).toHaveTextContent(
    'All organizations'
  );
  await user.click(screen.getByRole('combobox', { name: 'Organization' }));
  expect(screen.queryByRole('option', { name: 'Primary' })).toBeNull();
  await user.click(screen.getByRole('option', { name: 'Secondary' }));
  await user.click(screen.getByRole('combobox', { name: 'Board' }));
  await user.click(screen.getByRole('option', { name: 'Select board' }));
  expect(screen.getByRole('combobox', { name: 'Organization' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
});
