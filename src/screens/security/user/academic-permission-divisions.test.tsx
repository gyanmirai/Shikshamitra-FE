import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { savedPayloads } from './academic-permission.test.support';
import { renderDivisionPermission } from './academic-permission-divisions.test.fixture';

const setup = (full = false) => ({ ...renderDivisionPermission(full), user: userEvent.setup() });

const checkbox = (name: string) => screen.getByRole('checkbox', { name: `Access to ${name}` });

async function save(user: ReturnType<typeof setup>['user']) {
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(savedPayloads).toHaveLength(1));
  return savedPayloads[0];
}

describe('academic permission division selection', () => {
  it('refreshes every sibling toggle while the medium remains partially selected', async () => {
    const { user } = setup();
    await screen.findByRole('checkbox', { name: 'Access to A' });
    await user.click(checkbox('A'));
    await user.click(checkbox('B'));
    expect(checkbox('A')).toBeChecked();
    expect(checkbox('B')).toBeChecked();
    await user.click(checkbox('A'));
    expect(checkbox('A')).not.toBeChecked();
    expect(checkbox('B')).toBeChecked();
    await user.click(checkbox('C'));
    expect(checkbox('C')).toBeChecked();
    await user.click(checkbox('B'));
    expect(checkbox('B')).not.toBeChecked();
    expect(checkbox('C')).toBeChecked();
    expect(checkbox('D')).not.toBeChecked();
  });

  it('removes covering grants when a division is unchecked from loaded full access', async () => {
    const { user } = setup(true);
    expect(await screen.findByRole('checkbox', { name: 'Access to A' })).toBeChecked();
    await user.click(checkbox('A'));
    expect(checkbox('A')).not.toBeChecked();
    expect(checkbox('B')).toBeChecked();
    expect(checkbox('CBSE')).toHaveAttribute('data-indeterminate', 'true');
    expect(await save(user)).toEqual({
      academicYearId: 'year-1',
      userIds: ['user-1'],
      clearExisting: false,
      scopes: [
        {
          educationBoardId: 'board-1',
          educationMediumId: 'medium-1',
          educationMediumStageId: 'stage-1',
          standardId: 'std-1',
          divisionId: 'div-b',
        },
        {
          educationBoardId: 'board-1',
          educationMediumId: 'medium-1',
          educationMediumStageId: 'stage-1',
          standardId: 'std-1',
          divisionId: 'div-c',
        },
        {
          educationBoardId: 'board-1',
          educationMediumId: 'medium-1',
          educationMediumStageId: 'stage-1',
          standardId: 'std-2',
        },
      ],
    });
  });

  it.each(['CBSE', 'English', 'Primary', 'Class 3'])(
    'can revoke a division after selecting %s',
    async (parent) => {
      const { user } = setup();
      await screen.findByRole('checkbox', { name: 'Access to A' });
      await user.click(checkbox(parent));
      await user.click(checkbox('B'));
      expect(checkbox('B')).not.toBeChecked();
      expect(checkbox('A')).toBeChecked();
      expect(checkbox('C')).toBeChecked();
      const payload = await save(user);
      expect(payload).toMatchObject({
        scopes: expect.arrayContaining([
          expect.objectContaining({ standardId: 'std-1', divisionId: 'div-a' }),
          expect.objectContaining({ standardId: 'std-1', divisionId: 'div-c' }),
        ]),
      });
      expect(JSON.stringify(payload)).not.toContain('div-b');
      expect(JSON.stringify(payload)).not.toContain('"standardId":"std-1"}');
    }
  );

  it('toggles labels and Space once, and expansion does not change selections', async () => {
    const { user } = setup();
    await screen.findByRole('checkbox', { name: 'Access to A' });
    await user.click(screen.getByText('A', { exact: true }));
    expect(checkbox('A')).toBeChecked();
    await user.keyboard(' ');
    expect(checkbox('A')).not.toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Expand Class 3' }));
    expect(screen.queryByRole('checkbox', { name: 'Access to A' })).not.toBeInTheDocument();
    expect(checkbox('Class 3')).not.toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Expand Class 3' }));
    expect(checkbox('A')).not.toBeChecked();
  });

  it('clears all grants when every division is unchecked', async () => {
    const { user } = setup(true);
    await screen.findByRole('checkbox', { name: 'Access to A' });
    await user.click(checkbox('A'));
    await user.click(checkbox('B'));
    await user.click(checkbox('C'));
    await user.click(checkbox('D'));
    expect(checkbox('CBSE')).not.toBeChecked();
    expect(await save(user)).toEqual({
      academicYearId: 'year-1',
      userIds: ['user-1'],
      scopes: [],
      clearExisting: true,
    });
  });
});
