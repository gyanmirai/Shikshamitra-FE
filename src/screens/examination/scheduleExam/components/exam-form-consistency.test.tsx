import dayjs from 'dayjs';
import { useState } from 'react';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { defaultExamFormValues } from './initialValues';
import { RoomAssignmentToggle } from './RoomAssignmentToggle';
import { fullExamValidationSchema } from '../validationSchema';
import { ExamValidationSummary } from './ExamValidationSummary';

vi.mock('src/components/iconify', () => ({
  Iconify: () => <span aria-hidden="true" />,
}));

dayjs.extend(isSameOrAfter);

const makeValidForm = () => ({
  ...defaultExamFormValues,
  examName: 'Term exam',
  examType: 'term',
  className: 'class-1',
  gradingScaleId: 'scale-100',
  divisions: ['division-a'],
  subjects: [
    {
      subjectId: 'english',
      subjectName: 'English',
      subjectColor: '#1976D2',
      examDate: dayjs().add(2, 'day'),
      startTime: dayjs('2000-01-01T10:00:00'),
      endTime: dayjs('2000-01-01T11:00:00'),
      totalMarks: 100,
      passingMarks: 33,
      gradeScalingId: 'scale-100',
    },
  ],
});

describe('exam review validation', () => {
  it('validates basic details, schedule, and required rooms before finishing', async () => {
    const valid = makeValidForm();
    await expect(fullExamValidationSchema.isValid(valid)).resolves.toBe(true);
    await expect(fullExamValidationSchema.isValid({ ...valid, examName: '' })).resolves.toBe(false);
    await expect(fullExamValidationSchema.isValid({ ...valid, subjects: [] })).resolves.toBe(false);
    await expect(
      fullExamValidationSchema.isValid({
        ...valid,
        subjects: [{ ...valid.subjects[0], endTime: null }],
      })
    ).resolves.toBe(false);
    await expect(fullExamValidationSchema.isValid({ ...valid, isRoomAssign: true })).resolves.toBe(
      false
    );
    await expect(
      fullExamValidationSchema.isValid({
        ...valid,
        isRoomAssign: true,
        roomDetails: { english: { 'division-a': { roomIds: ['room-1'], capacity: 30 } } },
      })
    ).resolves.toBe(true);
  });

  it('provides a return action for errors in earlier steps', async () => {
    const onEditStep = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <ExamValidationSummary
          errors={{
            examName: 'Required',
            subjects: 'Required',
            roomDetails: { english: { 'division-a': { roomIds: 'Required' } } },
          }}
          onEditStep={onEditStep}
        />
      </ThemeProvider>
    );
    const user = userEvent.setup();
    expect(screen.getByRole('alert')).toHaveTextContent('Resolve the validation errors');
    await user.click(screen.getByRole('button', { name: 'Edit Basic Details' }));
    await user.click(screen.getByRole('button', { name: 'Edit Schedule' }));
    await user.click(screen.getByRole('button', { name: 'Edit Room Details' }));
    expect(onEditStep.mock.calls).toEqual([[0], [1], [2]]);
  });
});

describe('room assignment keyboard control', () => {
  it('changes once per Space press without a parent button intercepting the event', async () => {
    const onChange = vi.fn();
    const Harness = () => {
      const [checked, setChecked] = useState(false);
      return (
        <RoomAssignmentToggle
          checked={checked}
          onChange={(value) => {
            onChange(value);
            setChecked(value);
          }}
        />
      );
    };
    const { container } = render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Harness />
      </ThemeProvider>
    );
    const user = userEvent.setup();
    const toggle = screen.getByRole('switch', { name: 'Assign rooms' });
    toggle.focus();
    await user.keyboard(' ');
    expect(toggle).toBeChecked();
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
    await user.keyboard(' ');
    expect(toggle).not.toBeChecked();
    expect(onChange.mock.calls).toEqual([[true], [false]]);
    expect(container.querySelector('[role="button"] input')).toBeNull();
  });
});
