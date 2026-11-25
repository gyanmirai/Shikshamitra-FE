import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { AdmissionPipelineRowActions } from './admission-pipeline-row-actions';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const row = {
  id: 'app-1',
  applicationNumber: 'APP-1',
  applicantName: 'Test student',
  stageType: 1,
};
const theme = createTheme(defaultSettings);
const applicationUrl = (id: string) => `/app/${id}`;

describe('Pipeline Registration printing', () => {
  it('offers one print action in the row menu without navigating the row', () => {
    const print = vi.fn();
    const open = vi.fn();
    const rowClick = vi.fn();
    render(
      <div role="presentation" onClick={rowClick}>
        <AdmissionPipelineRowActions
          row={row as never}
          applicationUrl={applicationUrl}
          onOpen={open}
          onPrint={print}
        />
      </div>,
      { wrapper: ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider> }
    );
    fireEvent.click(screen.getByRole('button', { name: 'More actions for APP-1' }));
    const menu = screen.getByRole('menu', { name: 'More actions for APP-1' });
    const printAction = within(menu).getByRole('menuitem', { name: 'Print form' });
    expect(within(menu).getAllByRole('menuitem', { name: /print/i })).toHaveLength(1);
    fireEvent.click(printAction);
    expect(print).toHaveBeenCalledExactlyOnceWith('app-1');
    expect(open).not.toHaveBeenCalled();
    expect(rowClick).not.toHaveBeenCalled();
  });

  it('does not expose print actions when the owning screen has not granted access', () => {
    render(<AdmissionPipelineRowActions row={row as never} applicationUrl={applicationUrl} />);
    expect(
      screen.queryByRole('button', { name: 'More actions for APP-1' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /complete form/i })).toHaveAttribute(
      'href',
      '/app/app-1'
    );
  });
});
