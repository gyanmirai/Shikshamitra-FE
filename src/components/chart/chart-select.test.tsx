import { useState } from 'react';
import { addIcon } from '@iconify/react';
import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { ChartSelect } from './chart-select';

const theme = createTheme(defaultSettings);
const arrowIcon = { body: '<path d="m6 14 6-5 6 5"/>', width: 24, height: 24 };
addIcon('eva:arrow-ios-upward-fill', arrowIcon);
addIcon('eva:arrow-ios-downward-fill', arrowIcon);

function ChartSelectFixture() {
  const [value, setValue] = useState('Week');

  return (
    <ThemeProvider theme={theme}>
      <button type="button">Previous field</button>
      <ChartSelect options={['Week', 'Month', 'Year']} value={value} onChange={setValue} />
      <button type="button">Next field</button>
      <output aria-label="Selected period">{value}</output>
    </ThemeProvider>
  );
}

describe('ChartSelect keyboard selection', () => {
  it.each(['{Enter}', ' '])('opens with %s and selects the highlighted period', async (key) => {
    const user = userEvent.setup();
    render(<ChartSelectFixture />);
    await user.tab();
    await user.tab();
    await user.keyboard(key);

    expect(screen.getByRole('menuitem', { name: 'Week' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard(key);

    expect(screen.getByLabelText('Selected period')).toHaveTextContent('Month');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Month' })).toHaveFocus();
  });

  it('selects the highlighted period with Tab and advances to the next control', async () => {
    const user = userEvent.setup();
    render(<ChartSelectFixture />);
    await user.click(screen.getByRole('button', { name: 'Week' }));
    await user.keyboard('{ArrowDown}');
    await user.tab();

    expect(screen.getByLabelText('Selected period')).toHaveTextContent('Month');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next field' })).toHaveFocus();
  });

  it('closes with Shift+Tab without changing the period and returns to the previous control', async () => {
    const user = userEvent.setup();
    render(<ChartSelectFixture />);
    await user.click(screen.getByRole('button', { name: 'Week' }));
    await user.keyboard('{ArrowDown}');
    await user.tab({ shift: true });

    expect(screen.getByLabelText('Selected period')).toHaveTextContent('Week');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous field' })).toHaveFocus();
  });
});
