import { useState } from 'react';
import { it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import CustomAccordion from './index';

function AccordionHarness({ custom = false }: { custom?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [edited, setEdited] = useState(false);
  return (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <CustomAccordion
        title="School details"
        expanded={expanded}
        onChange={() => setExpanded((value) => !value)}
        summary={
          custom ? (
            <div id="school-heading" aria-controls="school-content">
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setExpanded((value) => !value)}
              >
                Toggle school details
              </button>
              <button type="button" onClick={() => setEdited(true)}>
                Edit heading
              </button>
            </div>
          ) : undefined
        }
        content={<p>{edited ? 'Edited school' : 'School details content'}</p>}
      />
    </ThemeProvider>
  );
}

it('preserves the standard controlled accordion summary for existing consumers', () => {
  render(<AccordionHarness />);
  const summary = screen.getByRole('button', { name: 'School details' });
  const chevron = screen.getByTestId('ExpandMoreIcon');
  expect(summary).toHaveAttribute('aria-expanded', 'false');
  expect(chevron.parentElement).not.toHaveClass('Mui-expanded');
  fireEvent.click(summary);
  expect(summary).toHaveAttribute('aria-expanded', 'true');
  expect(chevron.parentElement).toHaveClass('Mui-expanded');
  fireEvent.click(summary);
  expect(summary).toHaveAttribute('aria-expanded', 'false');
  expect(chevron.parentElement).not.toHaveClass('Mui-expanded');
});

it('supports Enter and Space expansion with the default uncontrolled summary', async () => {
  const user = userEvent.setup();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <CustomAccordion title="Additional details" content={<p>Additional content</p>} />
    </ThemeProvider>
  );
  const summary = screen.getByRole('button', { name: 'Additional details' });
  const chevron = screen.getByTestId('ExpandMoreIcon');
  await user.tab();
  expect(summary).toHaveFocus();
  expect(summary).toHaveAttribute('aria-expanded', 'false');
  await user.keyboard('{Enter}');
  expect(summary).toHaveAttribute('aria-expanded', 'true');
  expect(chevron.parentElement).toHaveClass('Mui-expanded');
  await user.keyboard(' ');
  expect(summary).toHaveAttribute('aria-expanded', 'false');
  expect(chevron.parentElement).not.toHaveClass('Mui-expanded');
  expect(summary).toHaveFocus();
});

it('allows independent header actions without toggling a custom summary', () => {
  render(<AccordionHarness custom />);
  fireEvent.click(screen.getByRole('button', { name: 'Toggle school details' }));
  fireEvent.click(screen.getByRole('button', { name: 'Edit heading' }));
  expect(screen.getByRole('button', { name: 'Toggle school details' })).toHaveAttribute(
    'aria-expanded',
    'true'
  );
  expect(screen.getByText('Edited school')).toBeInTheDocument();
  expect(screen.getByRole('region')).toHaveAttribute('id', 'school-content');
});
