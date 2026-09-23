import { vi, it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import ElectiveContextBar from './ElectiveContextBar';

vi.mock('src/components/custom-select', () => ({
  default: ({ label }: { label: string }) => <div>{label}</div>,
}));

describe('ElectiveContextBar', () => {
  it('places the workflow actions inside the context card and aligns them to the right', () => {
    render(
      <ElectiveContextBar
        allClass={[]}
        classes=""
        onClassChange={vi.fn()}
        allDivision={[]}
        division=""
        onDivisionChange={vi.fn()}
        electiveGroups={[]}
        electiveGroupId=""
        onElectiveGroupChange={vi.fn()}
        actions={<button type="button">Workflow action</button>}
      />
    );

    const actionGroup = screen.getByRole('group', {
      name: 'Elective assignment context actions',
    });

    expect(actionGroup).toContainElement(screen.getByRole('button', { name: 'Workflow action' }));
    expect(actionGroup.closest('.MuiCard-root')).not.toBeNull();
    expect(actionGroup).toHaveStyle({ justifyContent: 'flex-end' });
  });
});
