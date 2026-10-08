import type { ComponentProps } from 'react';

import { useState } from 'react';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { WorkflowProcessChoice } from './components/workflow-process-choice';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const assessmentOptions = [
  {
    value: 'legacy',
    title: 'Complete manually',
    description: 'Use the existing workflow controls.',
    icon: 'mdi:check-circle-outline',
  },
  {
    value: 'result',
    title: 'Record an assessment result',
    description: 'Record a result without sessions or bookings.',
    icon: 'mdi:clipboard-text-outline',
  },
  {
    value: 'scheduled',
    title: 'Schedule an entrance exam',
    description: 'Book an exam session before recording results.',
    icon: 'mdi:calendar-check-outline',
  },
] as const;

type HarnessProps = Partial<
  Pick<ComponentProps<typeof WorkflowProcessChoice>, 'options' | 'disabled'>
> & {
  initialValue?: string;
  onChange: (value: string) => void;
};

function Harness({
  options = assessmentOptions,
  disabled = false,
  initialValue = 'legacy',
  onChange,
}: HarnessProps) {
  const [value, setValue] = useState(initialValue);
  return (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <WorkflowProcessChoice
        label="Stage process"
        value={value}
        options={options}
        disabled={disabled}
        onChange={(next) => {
          onChange(next);
          setValue(next);
        }}
      />
    </ThemeProvider>
  );
}

describe('workflow process cards', () => {
  it('does not write configuration when selecting the already selected process', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} />);
    await user.click(screen.getByRole('radio', { name: 'Complete manually' }));
    await user.keyboard('{Home}');
    expect(screen.getByRole('radio', { name: 'Complete manually' })).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });
  it('keeps all three Assessment choices and updates the controlled selection using its exact value', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} />);
    const group = screen.getByRole('radiogroup', { name: 'Stage process' });
    expect(within(group).getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Complete manually' })).toBeChecked();
    const result = screen.getByRole('radio', { name: 'Record an assessment result' });
    expect(result).toHaveAccessibleDescription(assessmentOptions[1].description);
    await user.click(result);
    expect(onChange).toHaveBeenLastCalledWith('result');
    expect(result).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Complete manually' })).not.toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Schedule an entrance exam' }));
    expect(onChange).toHaveBeenLastCalledWith('scheduled');
    expect(screen.queryByRole('button', { name: /information/ })).not.toBeInTheDocument();
  });

  it('uses one Tab stop and supports arrow, Home and End selection with wrapping', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} />);
    const manual = screen.getByRole('radio', { name: 'Complete manually' });
    const result = screen.getByRole('radio', { name: 'Record an assessment result' });
    const scheduled = screen.getByRole('radio', { name: 'Schedule an entrance exam' });
    await user.tab();
    expect(manual).toHaveFocus();
    expect(result).toHaveAttribute('tabindex', '-1');
    await user.keyboard('{ArrowRight}');
    expect(result).toHaveFocus();
    expect(result).toBeChecked();
    expect(manual).toHaveAttribute('tabindex', '-1');
    expect(result).toHaveAttribute('tabindex', '0');
    await user.keyboard('{End}');
    expect(scheduled).toHaveFocus();
    expect(scheduled).toBeChecked();
    await user.keyboard('{ArrowDown}');
    expect(manual).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(scheduled).toHaveFocus();
    await user.keyboard('{Home}');
    expect(manual).toHaveFocus();
    expect(manual).toBeChecked();
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([
      'result',
      'scheduled',
      'legacy',
      'scheduled',
      'legacy',
    ]);
  });

  it('skips disabled choices during keyboard navigation and rejects their clicks', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Harness
        onChange={onChange}
        options={assessmentOptions.map((option) => ({
          ...option,
          disabled: option.value === 'result',
        }))}
      />
    );
    const result = screen.getByRole('radio', { name: 'Record an assessment result' });
    expect(result).toBeDisabled();
    fireEvent.click(result);
    expect(onChange).not.toHaveBeenCalled();
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Schedule an entrance exam' })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('scheduled');
    expect(onChange).not.toHaveBeenCalledWith('result');
  });

  it('preserves the selected process in read-only mode without permitting writes', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} disabled initialValue="scheduled" />);
    screen.getAllByRole('radio').forEach((option) => {
      expect(option).toBeDisabled();
      expect(option).toHaveAttribute('tabindex', '-1');
      fireEvent.click(option);
    });
    expect(screen.getByRole('radio', { name: 'Schedule an entrance exam' })).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps Form submission with rules unavailable when its published form is missing', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Harness
        initialValue="basic"
        onChange={onChange}
        options={[
          {
            value: 'basic',
            title: 'Submission only',
            description: 'Use simple submission.',
            icon: 'mdi:file-document-outline',
          },
          {
            value: 'managed',
            title: 'Submission with rules',
            description: 'Choose a published form before enabling rules.',
            icon: 'mdi:account-group-outline',
            disabled: true,
          },
        ]}
      />
    );
    const managed = screen.getByRole('radio', { name: 'Submission with rules' });
    expect(managed).toBeDisabled();
    fireEvent.click(managed);
    expect(onChange).not.toHaveBeenCalled();
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Submission only' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Submission only' })).toBeChecked();
    expect(onChange).not.toHaveBeenCalledWith('managed');
  });
});
