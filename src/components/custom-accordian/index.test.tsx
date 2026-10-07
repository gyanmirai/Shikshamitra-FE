import { useState } from 'react';
import { it, expect } from 'vitest';
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
  expect(summary).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(summary);
  expect(summary).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(summary);
  expect(summary).toHaveAttribute('aria-expanded', 'false');
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
