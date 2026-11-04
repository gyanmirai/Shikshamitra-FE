import type { PropsWithChildren } from 'react';

import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { SplashScreen } from './splash-screen';

const theme = createTheme({ cssVariables: true });

function Wrapper({ children }: PropsWithChildren) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

describe('application splash screen', () => {
  it('announces the workspace loading state without presenting a completion percentage', () => {
    render(<SplashScreen portal={false} />, { wrapper: Wrapper });

    expect(screen.getByRole('status', { name: 'Loading ShikshaMitra' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'A new day. A little step ahead.' })).toBeVisible();
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('preserves the option to render inside the caller instead of using a portal', () => {
    const { container } = render(<SplashScreen portal={false} data-testid="inline-splash" />, {
      wrapper: Wrapper,
    });

    expect(container).toContainElement(screen.getByTestId('inline-splash'));
  });

  it('keeps the default application overlay outside the caller container', () => {
    const { container } = render(<SplashScreen data-testid="portal-splash" />, {
      wrapper: Wrapper,
    });

    expect(document.body).toContainElement(screen.getByTestId('portal-splash'));
    expect(container).not.toContainElement(screen.getByTestId('portal-splash'));
  });
});
