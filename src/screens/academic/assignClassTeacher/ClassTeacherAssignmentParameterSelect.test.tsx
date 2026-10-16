import { useState } from 'react';
import { it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { ClassTeacherAssignmentParameterSelect } from './ClassTeacherAssignmentParameterSelect';

const assignmentTypes = ['Permanent', 'Temporary', 'Acting'];
const changeReasons = ['New Academic Year', 'Long Leave', 'Transfer'];

function AssignmentParameterHarness() {
  const [assignmentType, setAssignmentType] = useState('Permanent');
  const [changeReason, setChangeReason] = useState('New Academic Year');

  return (
    <>
      <ClassTeacherAssignmentParameterSelect
        ariaLabel="Assignment Type"
        options={assignmentTypes}
        value={assignmentType}
        onChange={setAssignmentType}
      />
      <ClassTeacherAssignmentParameterSelect
        ariaLabel="Change Reason"
        options={changeReasons}
        value={changeReason}
        onChange={setChangeReason}
      />
    </>
  );
}

describe('ClassTeacherAssignmentParameterSelect', () => {
  it('prevents changes when the caller cannot manage assignments', () => {
    render(
      <ClassTeacherAssignmentParameterSelect
        ariaLabel="Assignment Type"
        options={assignmentTypes}
        value="Permanent"
        onChange={() => {}}
        disabled
      />
    );

    const assignmentType = screen.getByRole('combobox', { name: 'Assignment Type' });
    expect(assignmentType).toHaveAttribute('aria-disabled', 'true');
    fireEvent.mouseDown(assignmentType);
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  it('updates the assignment type after selecting another option', () => {
    render(<AssignmentParameterHarness />);

    const assignmentType = screen.getByRole('combobox', { name: 'Assignment Type' });
    fireEvent.mouseDown(assignmentType);
    fireEvent.click(screen.getByRole('option', { name: 'Temporary' }));

    expect(assignmentType).toHaveTextContent('Temporary');
  });

  it('updates the change reason after selecting another option', () => {
    render(<AssignmentParameterHarness />);

    const changeReason = screen.getByRole('combobox', { name: 'Change Reason' });
    fireEvent.mouseDown(changeReason);
    fireEvent.click(screen.getByRole('option', { name: 'Long Leave' }));

    expect(changeReason).toHaveTextContent('Long Leave');
  });
});
