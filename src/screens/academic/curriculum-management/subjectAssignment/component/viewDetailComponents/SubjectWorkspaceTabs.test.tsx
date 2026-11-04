import { Provider } from 'react-redux';
import { vi, it, expect, describe } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { SubjectWorkspaceTabs } from './SubjectWorkspaceTabs';

vi.mock('./subjectOverview', () => ({ default: () => <div>Saved overview</div> }));
vi.mock('./subjectSyllabus', () => ({ default: () => <div>Saved syllabus</div> }));
vi.mock('./subjectDocument', () => ({ default: () => <div>Saved documents</div> }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

function renderTabs(hasError = false, onRetry = vi.fn()) {
  const store = configureStore({ reducer: { confirmPopup: () => ({ isChanges: false }) } });
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <SubjectWorkspaceTabs subject={null} isLoading={false} hasError={hasError} onRetry={onRetry} />
      </ThemeProvider>
    </Provider>
  );
}

describe('subject workspace panels', () => {
  it('connects every tab to a stable panel and mounts only the selected content', async () => {
    const user = userEvent.setup();
    renderTabs();
    screen.getAllByRole('tab').forEach((tab) => {
      const panel = document.getElementById(tab.getAttribute('aria-controls')!);
      expect(panel).toHaveAttribute('aria-labelledby', tab.id);
    });
    expect(screen.getByText('Saved overview')).toBeVisible();
    expect(screen.queryByText('Saved syllabus')).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Syllabus' }));
    expect(screen.getByText('Saved syllabus')).toBeVisible();
    expect(screen.queryByText('Saved overview')).not.toBeInTheDocument();
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
  });

  it('shows an actionable error instead of fallback details after a failed read', async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    renderTabs(true, retry);
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load subject details');
    expect(screen.queryByText('Saved overview')).not.toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: 'Subject detail views' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
