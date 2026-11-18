import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AdmissionPipelineRowActions } from './admission-pipeline-row-actions';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const row = {
  id: 'app-1',
  applicationNumber: 'APP-1',
  applicantName: 'Test student',
  stageType: 1,
};
const theme = createTheme(defaultSettings);

describe('Pipeline Registration printing', () => {
  it('offers filled and blank copies without navigating to another case', () => {
    const print = vi.fn();
    const open = vi.fn();
    render(
      <AdmissionPipelineRowActions
        row={row as never}
        href="/app/app-1"
        onOpen={open}
        onPrint={print}
      />,
      { wrapper: ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider> }
    );
    fireEvent.click(screen.getByRole('button', { name: /print options/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /print filled form/i }));
    expect(print).toHaveBeenCalledWith('app-1', 'filled');
    expect(open).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /print options/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /print blank form/i }));
    expect(print).toHaveBeenLastCalledWith('app-1', 'blank');
  });

  it('does not expose print actions when the owning screen has not granted access', () => {
    render(<AdmissionPipelineRowActions row={row as never} href="/app/app-1" />);
    expect(screen.queryByRole('button', { name: /print options/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /complete form/i })).toHaveAttribute(
      'href',
      '/app/app-1'
    );
  });
});
