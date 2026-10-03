import { useState } from 'react';
import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, fireEvent } from '@testing-library/react';

import { RubricTagsField } from './RubricTagsField';

function renderTags(initial = '') {
  function Harness() {
    const [value, setValue] = useState(initial);
    return (
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <RubricTagsField value={value} onChange={setValue} />
        <output data-testid="tags-value">{value}</output>
        <button type="button">Next</button>
      </ThemeProvider>
    );
  }

  render(<Harness />);
  return { user: userEvent.setup(), input: screen.getByRole('combobox', { name: 'Tags' }) };
}

describe('RubricTagsField', () => {
  it('creates a tag only when a comma is typed and clears the input', async () => {
    const { user, input } = renderTags();
    await user.type(input, '  Project  ,');
    expect(screen.getByRole('button', { name: 'Remove tag Project' })).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(screen.getByTestId('tags-value')).toHaveTextContent('Project');
  });

  it('does not create tags on Enter, blur, Tab, or next-step navigation', async () => {
    const { user, input } = renderTags();
    await user.type(input, 'Unfinished{enter}');
    expect(screen.getByTestId('tags-value')).toBeEmptyDOMElement();
    fireEvent.blur(input);
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByTestId('tags-value')).toBeEmptyDOMElement();
  });

  it('splits pasted comma-separated text into trimmed tags', () => {
    const { input } = renderTags();
    fireEvent.paste(input, { clipboardData: { getData: () => ' Alpha, Beta , Gamma ' } });
    expect(screen.getByTestId('tags-value')).toHaveTextContent('Alpha, Beta, Gamma');
    expect(input).toHaveValue('');
  });

  it('blocks case-insensitive duplicates and highlights the existing chip', async () => {
    const { user, input } = renderTags('Alpha');
    const chip = screen.getByRole('button', { name: 'Remove tag Alpha' }).parentElement!;
    const originalClass = chip.className;
    await user.type(input, 'alpha,');
    expect(screen.getByTestId('tags-value')).toHaveTextContent('Alpha');
    expect(screen.getAllByRole('button', { name: /Remove tag/ })).toHaveLength(1);
    expect(input).toHaveValue('');
    expect(chip.className).not.toBe(originalClass);
  });

  it('ignores empty comma segments', async () => {
    const { user, input } = renderTags();
    await user.type(input, ',,,');
    expect(screen.getByTestId('tags-value')).toBeEmptyDOMElement();
    expect(input).toHaveValue('');
  });

  it('removes the last tag with Backspace on an empty input', async () => {
    const { user, input } = renderTags('Alpha, Beta');
    await user.click(input);
    await user.keyboard('{Backspace}');
    expect(screen.getByTestId('tags-value')).toHaveTextContent('Alpha');
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
  });

  it('removes a saved tag through its labelled chip control', async () => {
    const { user } = renderTags('Alpha, Beta');
    await user.click(screen.getByRole('button', { name: 'Remove tag Alpha' }));
    expect(screen.getByTestId('tags-value')).toHaveTextContent('Beta');
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  });
});
